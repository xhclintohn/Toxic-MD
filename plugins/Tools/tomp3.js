import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { tmpdir } from 'os';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'tomp3',
    aliases: ['toaudio', 'mp3', 'extractaudio', 'vid2mp3', 'videotomp3'],
    description: 'Converts a replied video to MP3 voice note',
    run: async (context) => {
        const { client, m } = context;
        let tempInput = null;
        let tempOutput = null;

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            if (!m.quoted) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 TO MP3」\n│ Reply to a video with .tomp3\n│ No video was quoted.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const quotedMime = m.quoted.mimetype || '';

            if (!/video/.test(quotedMime)) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 TO MP3」\n│ That is not a video.\n│ Quote a video message and try again.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const videoBuffer = await m.quoted.download();
            if (!videoBuffer || !videoBuffer.length) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 FAILED」\n│ Could not download the video.\n│ Try again or resend the video.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const ts = Date.now();
            tempInput = path.join(tmpdir(), `tomp3_in_${ts}.mp4`);
            tempOutput = path.join(tmpdir(), `tomp3_out_${ts}.ogg`);
            fs.writeFileSync(tempInput, videoBuffer);

            const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
            await new Promise((resolve, reject) => {
                exec(
                    `"${ffmpegPath}" -y -i "${tempInput}" -vn -c:a libopus -b:a 128k -ar 48000 -ac 1 "${tempOutput}"`,
                    { timeout: 120000 },
                    (err) => {
                        if (err) return reject(new Error(err.message));
                        resolve();
                    }
                );
            });

            const oggBuffer = fs.readFileSync(tempOutput);
            if (!oggBuffer || oggBuffer.length === 0) {
                throw new Error('empty file');
            }

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            await client.sendMessage(m.chat, {
                audio: oggBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            });

        } catch (err) {
            console.error('tomp3 error:', err);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});

            let userMessage = 'Conversion failed. Please try again.';
            if (err.message.includes('empty file')) {
                userMessage = 'That video has no audio track. Nothing to extract.';
            } else if (err.message.includes('timeout')) {
                userMessage = 'Conversion timed out. The video is too long or too large.';
            } else if (err.message.includes('download') || err.message.includes('Download')) {
                userMessage = 'Failed to download the video. Try sending it again.';
            }

            await sendInteractive(client, m, `╭─❏ 「 FAILED」\n│ ${userMessage}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

        } finally {
            try { if (tempInput) fs.unlinkSync(tempInput); } catch (_) {}
            try { if (tempOutput) fs.unlinkSync(tempOutput); } catch (_) {}
        }
    }
};
