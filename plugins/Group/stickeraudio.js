import { proto, downloadContentFromMessage } from '@whiskeysockets/baileys';
import { randomBytes, createCipheriv, createHmac, createHash, hkdfSync } from 'node:crypto';
import { writeFile, unlink, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => {
    const lines = String(body).split('\n').map(l => l.startsWith('│') ? l : `│ ${l}`).join('\n');
    return `╭─❏ 「 ${title} 」\n${lines}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const RAW = Symbol('rawFields');

const varint = n => {
    const o = [];
    while (n > 127) {
        o.push((n % 128) | 128);
        n = Math.floor(n / 128);
    }
    o.push(n);
    return Buffer.from(o);
};

const ld = (f, body) => Buffer.concat([varint(f * 8 + 2), varint(body.length), body]);

const runFFmpeg = (args, input) => new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, args);
    const out = [];
    let err = '';
    p.stdout.on('data', d => out.push(d));
    p.stderr.on('data', d => err += d);
    p.on('error', reject);
    p.on('close', code => {
        if (code !== 0) return reject(new Error(err.slice(-500) || `ffmpeg exited ${code}`));
        resolve(Buffer.concat(out));
    });
    p.stdin.on('error', () => {});
    p.stdin.end(input);
});

const downloadBuffer = async (mediaMsg, dlType, fallback) => {
    try {
        const stream = await downloadContentFromMessage(mediaMsg, dlType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        if (buffer.length) return buffer;
    } catch {}
    if (typeof fallback === 'function') {
        const buffer = await fallback();
        if (buffer && buffer.length) return buffer;
    }
    throw new Error('downloaded media was empty');
};

const toOpus = async input => {
    const buf = await runFFmpeg([
        '-v', 'info',
        '-i', 'pipe:0',
        '-t', '25',
        '-vn',
        '-map_metadata', '-1',
        '-c:a', 'libopus',
        '-b:a', '64k',
        '-ar', '48000',
        '-ac', '1',
        '-f', 'ogg',
        'pipe:1'
    ], input);
    return { buf, mimetype: 'audio/ogg; codecs=opus' };
};

const toWebp = input => runFFmpeg([
    '-v', 'error',
    '-i', 'pipe:0',
    '-frames:v', '1',
    '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2',
    '-c:v', 'libwebp',
    '-f', 'webp',
    'pipe:1'
], input);

const parseWebp = b => {
    if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') {
        throw new Error('Invalid WebP');
    }
    const c = b.toString('ascii', 12, 16);
    if (c === 'VP8 ') {
        return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff, isAnimated: false };
    }
    if (c === 'VP8L') {
        return {
            width: 1 + (b[21] | ((b[22] & 0x3f) << 8)),
            height: 1 + ((b[22] >> 6) | (b[23] << 2) | ((b[24] & 0x0f) << 10)),
            isAnimated: false
        };
    }
    if (c === 'VP8X') {
        return {
            width: 1 + b.readUIntLE(24, 3),
            height: 1 + b.readUIntLE(27, 3),
            isAnimated: (b[20] & 2) !== 0
        };
    }
    throw new Error('Unsupported WebP chunk');
};

const HKDF = {
    audio: 'WhatsApp Audio Keys',
    sticker: 'WhatsApp Image Keys'
};

export default {
    name: 'stickeraudio',
    alias: ['sa', 'audiosticker'],
    description: 'Send an audio sticker: reply to audio, or send audio with this caption',
    run: async (context) => {
        const { client, m } = context;
        const log = (...a) => console.error('[STICKERAUDIO]', ...a);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const fail = async (text) => {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, box('STICKER AUDIO', text));
        };

        try {
            if (typeof client.waUploadToServer !== 'function' || typeof client.relayMessage !== 'function') {
                return await fail('Audio stickers need a newer Baileys build.\n│ Update the bot and try again.');
            }

            const quotedCtx = context.quoted || m.quoted || null;
            let audioMsg = null, videoMsg = null, imageMsg = null;
            let audioFallback = null, videoFallback = null, imageFallback = null;

            if (m.mtype === 'audioMessage' || m.message?.audioMessage) {
                audioMsg = m.message?.audioMessage || m.msg;
                audioFallback = typeof m.download === 'function' ? () => m.download() : null;
            } else if (m.mtype === 'videoMessage' || m.message?.videoMessage) {
                videoMsg = m.message?.videoMessage || m.msg;
                videoFallback = typeof m.download === 'function' ? () => m.download() : null;
            } else if (m.mtype === 'imageMessage' || m.message?.imageMessage) {
                imageMsg = m.message?.imageMessage || m.msg;
                imageFallback = typeof m.download === 'function' ? () => m.download() : null;
            }

            if (!audioMsg && !videoMsg && quotedCtx) {
                if (quotedCtx.mtype === 'audioMessage') {
                    audioMsg = quotedCtx;
                    audioFallback = typeof quotedCtx.download === 'function' ? () => quotedCtx.download() : null;
                } else if (quotedCtx.mtype === 'videoMessage') {
                    videoMsg = quotedCtx;
                    videoFallback = typeof quotedCtx.download === 'function' ? () => quotedCtx.download() : null;
                } else if (quotedCtx.mtype === 'imageMessage') {
                    imageMsg = quotedCtx;
                    imageFallback = typeof quotedCtx.download === 'function' ? () => quotedCtx.download() : null;
                }
            }

            const audioContent = audioMsg;
            const videoContent = videoMsg;
            if (!audioContent && !videoContent) {
                return await fail('Reply to an audio or video message first,\n│ or send one with .stickeraudio\n│ as the caption.');
            }

            const rawAudio = await downloadBuffer(audioContent || videoContent, audioContent ? 'audio' : 'video', audioContent ? audioFallback : videoFallback).catch(() => null);
            if (!rawAudio || !rawAudio.length) {
                return await fail("I couldn't download that audio.\n│ Try again or send it as a file.");
            }
            const audioInput = Buffer.from(rawAudio);
            const opus = audioInput.subarray(0, 4).toString('ascii') === 'OggS'
                ? { buf: audioInput, mimetype: 'audio/ogg; codecs=opus' }
                : await toOpus(audioInput);

            let imageInput = null;
            const imageContent = imageMsg;
            if (imageContent) {
                try {
                    imageInput = await downloadBuffer(imageContent, 'image', imageFallback);
                } catch (e) {
                    log('attached image download failed, using fallback:', e?.message || e);
                }
            }
            if ((!imageInput || !imageInput.length) && videoContent && !audioContent) {
                imageInput = audioInput;
            }
            if (!imageInput || !imageInput.length) {
                const fallbackPath = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'toxic.jpg');
                try {
                    imageInput = await readFile(fallbackPath);
                } catch (e) {
                    log('fallback sticker image missing:', e?.message || e);
                    return await fail('No sticker image found.\n│ Send an image with the command,\n│ or reply to one, and try again.');
                }
            }

            const stickerBuf = await toWebp(Buffer.from(imageInput));
            const webp = parseWebp(stickerBuf);

            const upload = async (plain, kind) => {
                const mediaKey = randomBytes(32);
                const k = Buffer.from(hkdfSync('sha256', mediaKey, Buffer.alloc(32), HKDF[kind], 112));
                const iv = k.subarray(0, 16);
                const cipher = createCipheriv('aes-256-cbc', k.subarray(16, 48), iv);
                const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
                const mac = createHmac('sha256', k.subarray(48, 80)).update(iv).update(enc).digest().subarray(0, 10);
                const file = Buffer.concat([enc, mac]);
                const fileEncSha256 = createHash('sha256').update(file).digest();
                const tmp = join(tmpdir(), `as-${kind}-${randomBytes(8).toString('hex')}.enc`);
                await writeFile(tmp, file);
                try {
                    const res = await client.waUploadToServer(tmp, {
                        fileEncSha256B64: fileEncSha256.toString('base64'),
                        mediaType: kind
                    });
                    if (!res?.directPath) throw new Error(`${kind} upload returned no directPath`);
                    return {
                        url: res.mediaUrl || `https://mmg.whatsapp.net${res.directPath}`,
                        directPath: res.directPath,
                        mediaKey,
                        fileEncSha256,
                        fileSha256: createHash('sha256').update(plain).digest(),
                        fileLength: plain.length,
                        mediaKeyTimestamp: Math.floor(Date.now() / 1000)
                    };
                } finally {
                    unlink(tmp).catch(() => {});
                }
            };

            const [a, s] = await Promise.all([
                upload(opus.buf, 'audio'),
                upload(stickerBuf, 'sticker')
            ]);

            const mediaDomainInfo = key => ld(74, Buffer.concat([
                Buffer.from([0x08, 0x01]),
                ld(2, key)
            ]));

            const audioBytes = Buffer.concat([
                Buffer.from(proto.Message.AudioMessage.encode(
                    proto.Message.AudioMessage.create({
                        url: a.url,
                        mimetype: opus.mimetype,
                        fileSha256: a.fileSha256,
                        fileEncSha256: a.fileEncSha256,
                        fileLength: a.fileLength,
                        mediaKey: a.mediaKey,
                        directPath: a.directPath,
                        mediaKeyTimestamp: a.mediaKeyTimestamp
                    })
                ).finish()),
                ld(17, mediaDomainInfo(a.mediaKey))
            ]);

            const stickerBase = Buffer.concat([
                Buffer.from(proto.Message.StickerMessage.encode(
                    proto.Message.StickerMessage.create({
                        url: s.url,
                        fileSha256: s.fileSha256,
                        fileEncSha256: s.fileEncSha256,
                        mediaKey: s.mediaKey,
                        mimetype: 'image/webp',
                        height: webp.height,
                        width: webp.width,
                        directPath: s.directPath,
                        fileLength: s.fileLength,
                        mediaKeyTimestamp: s.mediaKeyTimestamp,
                        isAnimated: webp.isAnimated,
                        stickerSentTs: Date.now()
                    })
                ).finish()),
                ld(17, Buffer.concat([
                    mediaDomainInfo(s.mediaKey),
                    ld(82, varint(13001))
                ]))
            ]);

            const futureProofBody = ld(1, ld(26, Buffer.concat([
                stickerBase,
                ld(26, audioBytes)
            ])));

            const payload = proto.Message.create({
                messageContextInfo: { messageSecret: randomBytes(32) }
            });
            payload[RAW] = [[134, futureProofBody]];

            const originalEncode = proto.Message.encode;
            proto.Message.encode = function (msg, w) {
                const out = originalEncode.call(this, msg, w);
                if (msg && msg[RAW]) {
                    for (const [f, body] of msg[RAW]) {
                        out.uint32(f * 8 + 2).bytes(body);
                    }
                }
                return out;
            };

            try {
                await client.relayMessage(m.chat, payload, {});
            } finally {
                proto.Message.encode = originalEncode;
            }

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return sendInteractive(client, m, box('STICKER AUDIO', `Audio sticker sent 🎵\n│ Sticker: ${webp.width}x${webp.height} webp\n│ Audio: ${(opus.buf.length / 1024).toFixed(1)} KB opus`));
        } catch (error) {
            log('failed:', error?.message || error);
            return await fail(`Couldn't make the audio sticker.\n│ ${String(error?.message || error).slice(0, 80)}`);
        }
    }
};
