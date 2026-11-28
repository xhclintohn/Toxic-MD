import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import { createRequire } from 'module';
import sharp from 'sharp';
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

async function webpToMp4(buffer) {
    const stamp = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const input = path.join(os.tmpdir(), `tomp4_${stamp}.webp`);
    const output = path.join(os.tmpdir(), `tomp4_${stamp}.mp4`);
    try {
        await fs.promises.writeFile(input, buffer);
        let animated = false;
        try {
            const meta = await sharp(buffer, { animated: true }).metadata();
            animated = (meta.pages || 1) > 1;
        } catch {}
        const args = ['-y'];
        if (!animated) args.push('-loop', '1', '-framerate', '30', '-t', '3');
        args.push(
            '-i', input,
            '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            output
        );
        await execFileAsync(ffmpegBin(), args, { maxBuffer: 20 * 1024 * 1024, timeout: 60000 });
        return await fs.promises.readFile(output);
    } finally {
        await fs.promises.unlink(input).catch(() => {});
        await fs.promises.unlink(output).catch(() => {});
    }
}

export default {
    name: 'tomp4',
    aliases: ['tovideo', 'stickertomp4', 'sticker2video'],
    description: 'Converts stickers to MP4 videos',
    run: async (context) => {
        const { client, m } = context;
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            if (!m.quoted) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 TO VIDEO」
│ The command requires a STICKER.\n│ Your empty reply suggests you\n│ cannot read.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
            const quotedMime = m.quoted.mimetype || '';
            if (!/webp/.test(quotedMime)) return sendInteractive(client, m, `╭─❏ 「 TO VIDEO」
│ That is a file, not a sticker.\n│ The .webp extension is a clue\n│ you seem to have missed.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            const statusMsg = await sendInteractive(client, m, `╭─❏ 「 TO VIDEO」
│ Forcing your sticker into\n│ a video. A pointless endeavor.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            const stickerBuffer = await m.quoted.download();
            if (!stickerBuffer) {
                await client.sendMessage(m.chat, { delete: statusMsg.key });
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 FAILED」
│ Failed to download. Your sticker is\n│ as inaccessible as common sense.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
            const videoBuffer = await webpToMp4(stickerBuffer);
            await client.sendMessage(m.chat, { delete: statusMsg.key });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.sendMessage(m.chat, { video: videoBuffer, caption: `╭─❏ 「 TO VIDEO」
│ Behold, your "video".\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
            await client.sendMessage(m.chat, { document: videoBuffer, mimetype: 'video/mp4', fileName: `sticker_${Date.now()}.mp4`, caption: `╭─❏ 「 MP4 FILE」
│ Document version. Marginally\n│ more useful.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
        } catch (err) {
            console.error('ToMP4 error:', err.message);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            let userMessage = 'The conversion failed utterly. What did you expect?';
            if (/timed out|timeout/i.test(err.message)) userMessage = 'The process timed out. Your sticker is likely more complex than your thoughts.';
            if (/ffmpeg/i.test(err.message)) userMessage = 'The converter refused to process this. Try a simpler sticker.';
            await sendInteractive(client, m, `╭─❏ 「 FAILED」
│ ${userMessage}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
