import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path from 'path';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
    const { client, m, pushname } = context;

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    try {
        let mediaMsg = null;

        if (m.message?.imageMessage) {
            mediaMsg = m.message.imageMessage;
        } else if (m.message?.videoMessage) {
            mediaMsg = m.message.videoMessage;
        } else if (m.message?.stickerMessage) {
            mediaMsg = m.message.stickerMessage;
        } else if (m.quoted?.message?.imageMessage) {
            mediaMsg = m.quoted.message.imageMessage;
        } else if (m.quoted?.message?.videoMessage) {
            mediaMsg = m.quoted.message.videoMessage;
        } else if (m.quoted?.message?.stickerMessage) {
            mediaMsg = m.quoted.message.stickerMessage;
        } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            mediaMsg = m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
            mediaMsg = m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;
        } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
            mediaMsg = m.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage;
        }

        if (!mediaMsg) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return sendInteractive(client, m, '╭─❏ 「 TAKE 」\n│ \n│ Quote or send an image, short video,\n│ or sticker to steal the watermark.\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
        }

        const mime = mediaMsg.mimetype || '';

        if (!/image|video|webp/.test(mime)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return sendInteractive(client, m, '╭─❏ 「 TAKE 」\n│ \n│ That\'s not an image, video or sticker.\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
        }

        const videoSeconds = mediaMsg.seconds || 0;
        if (/video/.test(mime) && videoSeconds > 30) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return sendInteractive(client, m, '╭─❏ 「 TAKE 」\n│ \n│ Videos must be 30 seconds or shorter.\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
        }

        const buffer = await client.downloadMediaMessage(mediaMsg);

        if (!buffer || buffer.length === 0) {
            throw new Error('Failed to download media');
        }

        const ext = /webp/.test(mime) ? 'webp' : /video/.test(mime) ? 'mp4' : 'jpg';
        const tempFile = path.join(__dirname, `temp-take-${Date.now()}.${ext}`);
        await fs.writeFile(tempFile, buffer);

        const stickerResult = new Sticker(tempFile, {
            pack: pushname || 'ᅠᅠᅠᅠ',
            author: pushname || '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧',
            type: StickerTypes.FULL,
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 50,
            background: 'transparent'
        });

        const stickerBuffer = await stickerResult.toBuffer();
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await client.sendMessage(m.chat, { sticker: stickerBuffer });

        await fs.unlink(tempFile).catch(() => {});

    } catch (error) {
        console.error('WatermarkSticker error:', error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        await sendInteractive(client, m, '╭─❏ 「 ERROR 」\n│ \n│ Error while creating sticker.\n│ Try again, loser.\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
    }
};