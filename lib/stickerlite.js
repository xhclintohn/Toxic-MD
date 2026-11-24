import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import { createRequire } from 'module';
import fetch from 'node-fetch';

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);

const StickerTypes = { DEFAULT: 'default', FULL: 'full', CROPPED: 'crop', CIRCLE: 'circle' };
const MAX_ANIMATED = 900 * 1024;

let cachedFfmpeg = null;
function ffmpegBin() {
    if (cachedFfmpeg) return cachedFfmpeg;
    const candidates = [
        () => { try { const b = require('@ffmpeg-installer/ffmpeg').path; return b && fs.existsSync(b) ? b : null; } catch { return null; } },
        () => { try { const b = require('ffmpeg-static'); return b && fs.existsSync(b) ? b : null; } catch { return null; } },
        () => { try { return execSync('which ffmpeg', { encoding: 'utf8' }).trim() || null; } catch { return null; } },
        () => '/usr/bin/ffmpeg',
        () => '/usr/local/bin/ffmpeg'
    ];
    for (const c of candidates) {
        const p = c();
        if (p && fs.existsSync(p)) { cachedFfmpeg = p; return p; }
    }
    cachedFfmpeg = 'ffmpeg';
    return cachedFfmpeg;
}

async function runFfmpeg(args) {
    try {
        await execFileAsync(ffmpegBin(), args, { maxBuffer: 20 * 1024 * 1024, timeout: 60000 });
    } catch (e) {
        const detail = String(e.stderr || e.message || '').trim().split('\n').slice(-3).join(' ');
        throw new Error('FFmpeg failed: ' + detail);
    }
}

function tmp(name) {
    return path.join(os.tmpdir(), `sl_${Date.now()}_${Math.random().toString(36).slice(2)}_${name}`);
}
function rm(f) { try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch {} }

const isWebp = b => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
function isAnimatedWebp(b) {
    return isWebp(b) && b.toString('ascii', 12, 16) === 'VP8X' && (b[20] & 0x02) !== 0;
}
function isVideoLike(b) {
    if (b.length < 12) return false;
    if (b.toString('ascii', 4, 8) === 'ftyp') return true;
    if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return true;
    if (b.toString('ascii', 0, 4) === 'GIF8') return true;
    return false;
}

function buildExif(pack, author, categories, id) {
    const json = {
        'sticker-pack-id': id || crypto.randomBytes(16).toString('hex'),
        'sticker-pack-name': pack || '',
        'sticker-pack-publisher': author || '',
        emojis: Array.isArray(categories) && categories.length ? categories : ['']
    };
    const header = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
        0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([header, jsonBuf]);
    exif.writeUIntLE(jsonBuf.length, 14, 4);
    return exif;
}

function makeChunk(fourcc, data) {
    const h = Buffer.alloc(8);
    h.write(fourcc, 0, 4, 'ascii');
    h.writeUInt32LE(data.length, 4);
    return Buffer.concat([h, data, data.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)]);
}

function injectExif(webp, exif) {
    if (!isWebp(webp)) throw new Error('Output is not a valid WebP');
    const body = webp.subarray(12);
    const exifChunk = makeChunk('EXIF', exif);
    let chunks;

    if (body.toString('ascii', 0, 4) === 'VP8X') {
        const parts = [];
        let off = 0;
        while (off + 8 <= body.length) {
            const id = body.toString('ascii', off, off + 4);
            const size = body.readUInt32LE(off + 4);
            const total = 8 + size + (size % 2);
            if (id !== 'EXIF') parts.push(Buffer.from(body.subarray(off, Math.min(off + total, body.length))));
            off += total;
        }
        parts[0][8] |= 0x08;
        chunks = Buffer.concat([...parts, exifChunk]);
    } else {
        const vp8x = Buffer.alloc(10);
        vp8x[0] = 0x08 | 0x10;
        vp8x.writeUIntLE(511, 4, 3);
        vp8x.writeUIntLE(511, 7, 3);
        chunks = Buffer.concat([makeChunk('VP8X', vp8x), body, exifChunk]);
    }

    const out = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), chunks]);
    out.writeUInt32LE(out.length - 8, 4);
    return out;
}

function filterFor(type) {
    if (type === StickerTypes.CROPPED || type === StickerTypes.CIRCLE) {
        return 'scale=512:512:force_original_aspect_ratio=increase,crop=512:512,format=rgba';
    }
    return 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000';
}

async function loadInput(data) {
    if (Buffer.isBuffer(data)) return data;
    if (typeof data === 'string') {
        if (/^https?:\/\//i.test(data)) {
            const res = await fetch(data);
            if (!res.ok) throw new Error('Could not download sticker source');
            return Buffer.from(await res.arrayBuffer());
        }
        if (fs.existsSync(data)) return fs.readFileSync(data);
    }
    throw new Error('Unsupported sticker input');
}

class Sticker {
    constructor(data, options = {}) {
        this.data = data;
        this.options = options;
    }

    async toBuffer() {
        const { pack = '', author = '', type = StickerTypes.DEFAULT, categories, id } = this.options;
        const quality = Math.min(100, Math.max(5, Number(this.options.quality) || 50));
        const input = await loadInput(this.data);
        const exif = buildExif(pack, author, categories, id);

        if (isAnimatedWebp(input)) return injectExif(input, exif);

        const inPath = tmp('in');
        const outPath = tmp('out.webp');
        fs.writeFileSync(inPath, input);

        try {
            const vf = filterFor(type);
            let webp;

            if (isVideoLike(input)) {
                const attempts = [
                    { fps: 15, q: quality, t: 6 },
                    { fps: 12, q: Math.max(10, quality - 15), t: 5 },
                    { fps: 10, q: Math.max(10, quality - 25), t: 4 },
                    { fps: 8, q: 15, t: 3 }
                ];
                for (const a of attempts) {
                    rm(outPath);
                    await runFfmpeg([
                        '-y', '-i', inPath, '-t', String(a.t),
                        '-vf', `fps=${a.fps},${vf}`,
                        '-c:v', 'libwebp', '-lossless', '0', '-q:v', String(a.q),
                        '-compression_level', '4', '-loop', '0', '-preset', 'default', '-an',
                        outPath
                    ]);
                    webp = fs.readFileSync(outPath);
                    if (webp.length <= MAX_ANIMATED) break;
                }
            } else {
                await runFfmpeg([
                    '-y', '-i', inPath, '-frames:v', '1',
                    '-vf', vf,
                    '-c:v', 'libwebp', '-lossless', '0', '-q:v', String(Math.max(quality, 60)),
                    '-compression_level', '6',
                    outPath
                ]);
                webp = fs.readFileSync(outPath);
            }

            if (!webp || !webp.length) throw new Error('FFmpeg produced an empty sticker');
            return injectExif(webp, exif);
        } finally {
            rm(inPath);
            rm(outPath);
        }
    }
}

async function toPng(input) {
    const inPath = tmp('in');
    const outPath = tmp('out.png');
    fs.writeFileSync(inPath, input);
    try {
        await runFfmpeg(['-y', '-i', inPath, '-frames:v', '1', outPath]);
        return fs.readFileSync(outPath);
    } finally {
        rm(inPath);
        rm(outPath);
    }
}

export { Sticker, StickerTypes, toPng, ffmpegBin };
