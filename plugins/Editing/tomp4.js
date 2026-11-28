import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import { createRequire } from 'module';
import sharp from 'sharp';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);

let cachedFfmpeg = null;
function ffmpegBin() {
    if (cachedFfmpeg) return cachedFfmpeg;
    const candidates = [
        () => { try { const b = require('@ffmpeg-installer/ffmpeg').path; return b && fs.existsSync(b) ? b : null; } catch { return null; } },
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

async function downloadMedia(mediaMsg, type, fallback) {
    try {
        const stream = await downloadContentFromMessage(mediaMsg, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        if (buffer.length) return buffer;
    } catch {}
    if (typeof fallback === 'function') {
        const buffer = await fallback();
        if (buffer && buffer.length) return buffer;
    }
    return null;
}

async function webpToMp4(buffer) {
    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const dir = path.join(os.tmpdir(), `tomp4_${stamp}`);
    await fs.promises.mkdir(dir, { recursive: true });
    try {
        let animated = false, pages = 1, pageHeight = 0, width = 0, delay = null;
        try {
            const meta = await sharp(buffer, { animated: true }).metadata();
            pages = meta.pages || 1;
            pageHeight = meta.pageHeight || Math.round((meta.height || 0) / pages);
            width = meta.width || 0;
            delay = meta.delay || null;
            animated = pages > 1 && pageHeight > 0 && width > 0;
        } catch {}
        const output = path.join(dir, 'out.mp4');
        if (!animated) {
            const input = path.join(dir, 'in.webp');
            await fs.promises.writeFile(input, buffer);
            await execFileAsync(ffmpegBin(), [
                '-y', '-loop', '1', '-framerate', '30', '-t', '3',
                '-i', input,
                '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30',
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart',
                output
            ], { maxBuffer: 20 * 1024 * 1024, timeout: 60000 });
            return await fs.promises.readFile(output);
        }
        for (let i = 0; i < pages; i++) {
            const frame = await sharp(buffer, { page: i }).png().toBuffer();
            await fs.promises.writeFile(path.join(dir, `frame${String(i).padStart(4, '0')}.png`), frame);
        }
        const avgDelay = delay && delay.length ? delay.reduce((a, b) => a + b, 0) / delay.length : 100;
        const fps = Math.max(1, Math.min(30, Math.round(1000 / Math.max(avgDelay, 20))));
        await execFileAsync(ffmpegBin(), [
            '-y', '-framerate', String(fps),
            '-i', path.join(dir, 'frame%04d.png'),
            '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            output
        ], { maxBuffer: 20 * 1024 * 1024, timeout: 60000 });
        return await fs.promises.readFile(output);
    } finally {
        await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
    }
}

async function muxAudio(videoBuffer, audioBuffer) {
    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const vIn = path.join(os.tmpdir(), `tomp4_${stamp}_v.mp4`);
    const aIn = path.join(os.tmpdir(), `tomp4_${stamp}_a.ogg`);
    const output = path.join(os.tmpdir(), `tomp4_${stamp}_mux.mp4`);
    try {
        await fs.promises.writeFile(vIn, videoBuffer);
        await fs.promises.writeFile(aIn, audioBuffer);
        await execFileAsync(ffmpegBin(), [
            '-y',
            '-i', vIn,
            '-i', aIn,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest',
            '-movflags', '+faststart',
            output
        ], { maxBuffer: 20 * 1024 * 1024, timeout: 60000 });
        return await fs.promises.readFile(output);
    } finally {
        await fs.promises.unlink(vIn).catch(() => {});
        await fs.promises.unlink(aIn).catch(() => {});
        await fs.promises.unlink(output).catch(() => {});
    }
}

async function videoToMp4(buffer) {
    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const input = path.join(os.tmpdir(), `tomp4_${stamp}_in`);
    const output = path.join(os.tmpdir(), `tomp4_${stamp}_out.mp4`);
    try {
        await fs.promises.writeFile(input, buffer);
        await execFileAsync(ffmpegBin(), [
            '-y',
            '-i', input,
            '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-movflags', '+faststart',
            output
        ], { maxBuffer: 20 * 1024 * 1024, timeout: 120000 });
        return await fs.promises.readFile(output);
    } finally {
        await fs.promises.unlink(input).catch(() => {});
        await fs.promises.unlink(output).catch(() => {});
    }
}

export default {
    name: 'tomp4',
    aliases: ['tovideo', 'stickertomp4', 'sticker2video'],
    description: 'Converts stickers (including audio stickers) and videos to MP4',
    run: async (context) => {
        const { client, m } = context;
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            if (!m.quoted) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 TO VIDEO」
│ The command requires a STICKER or VIDEO.\n│ Your empty reply suggests you\n│ cannot read.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const quoted = m.quoted;
            let stickerMsg = null, soundAudioMsg = null, videoMsg = null;
            if (quoted.mtype === 'audioStickerMessage' && quoted.message?.stickerMessage) {
                stickerMsg = quoted.message.stickerMessage;
                soundAudioMsg = stickerMsg.audioMessage || null;
            } else if (quoted.mtype === 'stickerMessage' || /webp/.test(quoted.mimetype || '')) {
                stickerMsg = quoted;
            } else if (quoted.mtype === 'videoMessage') {
                videoMsg = quoted;
            }

            if (!stickerMsg && !videoMsg) return sendInteractive(client, m, `╭─❏ 「 TO VIDEO」
│ That is a file, not a sticker or video.\n│ The .webp extension is a clue\n│ you seem to have missed.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

            const statusMsg = await sendInteractive(client, m, `╭─❏ 「 TO VIDEO」
│ Forcing your ${videoMsg ? 'video' : 'sticker'} into\n│ an MP4. A pointless endeavor.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

            const quotedDl = typeof quoted.download === 'function' ? () => quoted.download() : null;
            let videoBuffer = null;

            if (videoMsg) {
                const rawVideo = await downloadMedia(videoMsg, 'video', quotedDl);
                if (rawVideo) videoBuffer = await videoToMp4(rawVideo);
            } else {
                const stickerBuffer = await downloadMedia(stickerMsg, 'sticker', quotedDl);
                if (stickerBuffer) {
                    videoBuffer = await webpToMp4(stickerBuffer);
                    if (soundAudioMsg) {
                        const audioBuffer = await downloadMedia(soundAudioMsg, 'audio', null).catch(() => null);
                        if (audioBuffer) videoBuffer = await muxAudio(videoBuffer, audioBuffer).catch(() => videoBuffer);
                    }
                }
            }

            if (!videoBuffer) {
                await client.sendMessage(m.chat, { delete: statusMsg.key });
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 FAILED」
│ Failed to download. Your media is\n│ as inaccessible as common sense.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            await client.sendMessage(m.chat, { delete: statusMsg.key });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.sendMessage(m.chat, { video: videoBuffer, caption: `╭─❏ 「 TO VIDEO」
│ Behold, your "video".\n╰───────────────\n> ©𝐏𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
            await client.sendMessage(m.chat, { document: videoBuffer, mimetype: 'video/mp4', fileName: `sticker_${Date.now()}.mp4`, caption: `╭─❏ 「 MP4 FILE」
│ Document version. Marginally\n│ more useful.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
        } catch (err) {
            console.error('ToMP4 error:', err.message);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            let userMessage = 'The conversion failed utterly. What did you expect?';
            if (/timed out|timeout/i.test(err.message)) userMessage = 'The process timed out. Your sticker is likely more complex than your thoughts.';
            if (/ffmpeg/i.test(err.message)) userMessage = 'The converter refused to process this. Try a simpler sticker.';
            await sendInteractive(client, m, `╭─❏ 「 FAILED」
│ ${userMessage}\n╰───────────────\n> ©𝐏𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
