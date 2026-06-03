import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path from 'path';
import asyncPkg from 'async';
const { queue } = asyncPkg;
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const commandQueue = queue(async (task, callback) => {
    try {
        await task.run(task.context);
    } catch (error) {
        console.error(`Sticker queue error: ${error.message}`);
    }
    callback();
}, 1);

export default async (context) => {
    const { client, m, packname } = context;
    const fq = getFakeQuoted(m);

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    commandQueue.push({
        context,
        run: async ({ client, m }) => {
            const fq = getFakeQuoted(m);
            try {
                let mediaMsg = null;
                let mediaType = null;

                if (m.message?.imageMessage) {
                    mediaMsg = m.message.imageMessage;
                    mediaType = 'image';
                } else if (m.message?.videoMessage) {
                    mediaMsg = m.message.videoMessage;
                    mediaType = 'video';
                } else if (m.message?.stickerMessage) {
                    mediaMsg = m.message.stickerMessage;
                    mediaType = 'sticker';
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
                }

                if (!mediaMsg) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    return m.reply('╭───(    TOXIC-MD    )───\n├───≫ STICKER ≪───\n├ \n├ Where\'s the fvcking image or\n├ short video, idiot.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
                }

                if (mediaType === 'video' && mediaMsg.seconds > 30) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    return m.reply('╭───(    TOXIC-MD    )───\n├───≫ STICKER ≪───\n├ \n├ Videos must be 30 seconds or shorter.\n├ Learn to read, moron.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
                }

                const dlType = mediaType === 'sticker' ? 'sticker' : mediaType;
                const stream = await downloadContentFromMessage(mediaMsg, dlType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                const ext = mediaType === 'video' ? 'mp4' : 'jpg';
                const tempFile = path.join(__dirname, `temp-sticker-${Date.now()}.${ext}`);
                await fs.writeFile(tempFile, buffer);

                const sticker = new Sticker(tempFile, {
                    pack: packname || 'Toxic-MD',
                    author: '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 [dev]',
                    type: StickerTypes.FULL,
                    categories: ['🤩', '🎉'],
                    id: '12345',
                    quality: 50,
                    background: 'transparent'
                });

                const stickerBuffer = await sticker.toBuffer();
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await client.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: fq });
                await fs.unlink(tempFile).catch(() => {});

            } catch (error) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                console.error(`Sticker error: ${error.message}`);
                await m.reply('╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Error while creating sticker.\n├ Try again, you failure.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
            }
        }
    });
};
