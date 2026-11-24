import { Sticker, StickerTypes } from '../../lib/stickerlite.js';
import asyncPkg from 'async';
const { queue } = asyncPkg;
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

const commandQueue = queue(async (task, callback) => {
    try {
        await task.run(task.context);
    } catch (error) {
        console.error(`Sticker queue error: ${error.message}`);
    }
    callback();
}, 1);

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

export default async (context) => {
    const { client, m, packname, args } = context;

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    commandQueue.push({
        context,
        run: async ({ client, m }) => {
            try {
                let mediaMsg = null;
                let mediaType = null;
                let fallback = null;

                if (m.message?.imageMessage) {
                    mediaMsg = m.message.imageMessage;
                    mediaType = 'image';
                    fallback = typeof m.download === 'function' ? () => m.download() : null;
                } else if (m.message?.videoMessage) {
                    mediaMsg = m.message.videoMessage;
                    mediaType = 'video';
                    fallback = typeof m.download === 'function' ? () => m.download() : null;
                } else if (m.message?.stickerMessage) {
                    mediaMsg = m.message.stickerMessage;
                    mediaType = 'sticker';
                    fallback = typeof m.download === 'function' ? () => m.download() : null;
                } else if (m.quoted) {
                    if (m.quoted.mtype === 'imageMessage') {
                        mediaMsg = m.quoted;
                        mediaType = 'image';
                    } else if (m.quoted.mtype === 'videoMessage') {
                        mediaMsg = m.quoted;
                        mediaType = 'video';
                    } else if (m.quoted.mtype === 'stickerMessage') {
                        mediaMsg = m.quoted;
                        mediaType = 'sticker';
                    }
                    if (mediaMsg && typeof m.quoted.download === 'function') fallback = () => m.quoted.download();
                }

                if (!mediaMsg) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    return sendInteractive(client, m, `╭─❏ 「 STICKER」
│ Where's the fvcking image or\n│ short video, idiot.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }

                if (mediaType === 'video') {
                    const sizeMB = Number(mediaMsg.fileLength || 0) / (1024 * 1024);
                    if (sizeMB > 8) {
                        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                        return sendInteractive(client, m, `╭─❏ 「 STICKER」
│ Video too large (${sizeMB.toFixed(1)} MB). Max is 8 MB.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                    }
                    if (mediaMsg.seconds > 30) {
                        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                        return sendInteractive(client, m, `╭─❏ 「 STICKER」
│ Videos must be 30 seconds or shorter.\n│ Learn to read, moron.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                    }
                }

                const dlType = mediaType === 'sticker' ? 'sticker' : mediaType;
                const buffer = await downloadBuffer(mediaMsg, dlType, fallback);

                const opt = String(Array.isArray(args) ? args.join(' ') : '').toLowerCase();
                const keepWhole = /\b(full|whole|fit|contain)\b/.test(opt);

                const sticker = new Sticker(buffer, {
                    pack: packname || 'Toxic-MD',
                    author: '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 [dev]',
                    type: keepWhole ? StickerTypes.FULL : StickerTypes.CROPPED,
                    categories: ['🤩', '🎉'],
                    id: '12345',
                    quality: mediaType === 'video' ? 40 : 90
                });

                const stickerBuffer = await sticker.toBuffer();
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await client.sendMessage(m.chat, { sticker: stickerBuffer });

            } catch (error) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                console.error(`Sticker error: ${error.message}`);
                await sendInteractive(client, m, `╭─❏ 「 ERROR」
│ Error while creating sticker.\n│ Try again, you failure.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
        }
    });
};
