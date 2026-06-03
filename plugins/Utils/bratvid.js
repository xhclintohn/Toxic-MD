import axios from 'axios';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { promises as fs } from 'fs';
import path from 'path';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'bratvid',
    aliases: ['bratvideo', 'bratanimated'],
    description: 'Makes animated brat stickers for your attention-seeking ass',
    run: async (context) => {
        const { client, m, prefix, packname, author } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const text = m.body.replace(new RegExp(`^${prefix}(bratvid|bratvideo|bratanimated)\\s*`, 'i'), '').trim();

        if (!text) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return m.reply('╭───(    TOXIC-MD    )───\n├───≫ BRAT VID ≪───\n├ \n├ What am i, a mind reader?\n├ @' + m.sender.split('@')[0] + '! you forgot the text, genius.\n├ Example: ' + prefix + 'bratvid i\'m a dumbass\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧', { mentions: [m.sender] });
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const apiUrl = `https://api.nexray.web.id/maker/bratvid?text=${encodeURIComponent(text)}`;
            
            const videoResponse = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!videoResponse.data || videoResponse.data.length < 1000) {
                throw new Error('API returned empty video');
            }

            const tempFile = path.join(__dirname, `temp-bratvid-${Date.now()}.mp4`);
            await fs.writeFile(tempFile, videoResponse.data);

            const sticker = new Sticker(tempFile, {
                pack: packname || 'p',
                author: author || '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 [dev]',
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
            console.error('Brat video command error:', error);

            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

            let errorMessage = 'your brat video failed. shocking.';

            if (error.message.includes('status')) {
                errorMessage = 'API died from cringe. Try again when your text is less stupid.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Your internet is as weak as your personality.';
            } else if (error.message.includes('empty')) {
                errorMessage = 'API returned empty video. Your text was too cringe even for the API.';
            } else {
                errorMessage = 'Failed to process. Try again later.';
            }

            await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ FAILED ≪───\n├ \n├ Brat video generation failed.\n├ ${errorMessage}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};