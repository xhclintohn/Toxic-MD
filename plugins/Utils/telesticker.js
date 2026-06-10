import fetch from 'node-fetch';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { promises as fs } from 'fs';
import path from 'path';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
    const { client, m, text, prefix, packname, author } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    try {
        if (!text) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 Tᴇʟᴇɢʀᴀᴍ Sᴛɪᴄᴋᴇʀ」
│ Give me a Telegram sticker pack name or link!\n│ \n│ Example: ${prefix}ts itzel39\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        let packName = text.trim();
        if (packName.includes('t.me/addstickers/')) {
            const match = packName.match(/t\.me\/addstickers\/([a-zA-Z0-9_]+)/);
            if (match) packName = match[1];
        }

        const apiUrl = `https://t.me/addstickers/${packName}`;
        const encodedUrl = encodeURIComponent(apiUrl);
        const apiEndpoint = `https://api.nexray.web.id/tools/telegram-sticker?url=${encodedUrl}`;

        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!response.ok) throw new Error(`API request failed: ${response.status}`);

        const data = await response.json();

        if (!data?.status || !data?.result?.sticker || data.result.sticker.length === 0) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 Tᴇʟᴇɢʀᴀᴍ Sᴛɪᴄᴋᴇʀ」
│ That sticker pack doesn't exist or\n│ your internet is worse than your face.\n│ \n│ Pack: ${packName}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const stickers = data.result.sticker;
        const packTitle = data.result.title || packName;
        const stickerPack = packname || 'Telegram Sticker';
        const stickerAuthor = author || '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧';

        await client.sendMessage(m.chat, { react: { text: '🔃', key: m.reactKey } });
        await sendInteractive(client, m, `╭─❏ 「 Tᴇʟᴇɢʀᴀᴍ Sᴛɪᴄᴋᴇʀ」
│ Pack: ${packTitle}\n│ Total: ${stickers.length} stickers\n│ Converting to WhatsApp stickers...\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

        let sentCount = 0;
        let failedCount = 0;
        let tgsSkipped = 0;

        for (let i = 0; i < stickers.length; i++) {
            let tempFile = null;
            try {
                const sticker = stickers[i];
                const stickerUrl = sticker.url;

                if (stickerUrl.endsWith('.tgs')) { tgsSkipped++; continue; }

                const isVideo = stickerUrl.endsWith('.webm');
                const ext = isVideo ? 'webm' : 'webp';
                tempFile = path.join('/tmp', `ts-${Date.now()}-${i}.${ext}`);

                const stickerResponse = await fetch(stickerUrl);
                if (!stickerResponse.ok) throw new Error(`Download failed: ${stickerResponse.status}`);

                const stickerBuffer = Buffer.from(await stickerResponse.arrayBuffer());
                await fs.writeFile(tempFile, stickerBuffer);

                const waSticker = new Sticker(tempFile, {
                    pack: stickerPack,
                    author: stickerAuthor,
                    type: isVideo ? StickerTypes.CROPPED : StickerTypes.FULL,
                    categories: sticker.emoji ? [sticker.emoji] : ['🤔'],
                    quality: 50 });

                const stickerBufferFinal = await waSticker.toBuffer();
                await client.sendMessage(m.chat, { sticker: stickerBufferFinal });
                sentCount++;

                if ((i + 1) % 3 === 0) await new Promise(r => setTimeout(r, 800));

            } catch { failedCount++; }
            finally {
                if (tempFile) await fs.unlink(tempFile).catch(() => {});
            }
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

        const extraNote = tgsSkipped > 0 ? `\n│ Skipped ${tgsSkipped} .tgs (Lottie, unsupported)` : '';
        await sendInteractive(client, m, `╭─❏ 「 Tᴇʟᴇɢʀᴀᴍ Sᴛɪᴄᴋᴇʀ」
│ Success: ${sentCount} stickers\n│ Failed: ${failedCount} stickers${extraNote}\n│ Pack: ${packTitle}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Something broke!\n│ Either the API is dead or\n│ your sticker pack name is trash.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞ᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};
