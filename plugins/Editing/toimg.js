import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { tmpdir } from 'os';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'toimg',
    aliases: ['toimage', 'stickertoimg', 'sticker'],
    description: 'Converts stickers to images',
    run: async (context) => {
        const { client, m } = context;
        const fq = getFakeQuoted(m);
        let mediaPath = null;
        let outPath = null;
        
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            
            if (!m.quoted) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply('╭───(    TOXIC-MD    )───\n├───≫ TO IMAGE ≪───\n├ \n├ Are you illiterate? QUOTE A STICKER.\n├ The command is not a suggestion.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
            }
            
            const quotedMime = m.quoted.mimetype || '';
            if (!/webp/.test(quotedMime)) return m.reply('╭───(    TOXIC-MD    )───\n├───≫ TO IMAGE ≪───\n├ \n├ That is not a sticker. Do you need\n├ glasses? That is clearly not a .webp file.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
            
            mediaPath = await m.quoted.download();
            if (!mediaPath) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply('╭───(    TOXIC-MD    )───\n├───≫ FAILED ≪───\n├ \n├ Failed to download the sticker.\n├ Your phone is probably as useless\n├ as you are.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
            }
            
            const tempFile = path.join(tmpdir(), `sticker_${Date.now()}.webp`);
            outPath = path.join(tmpdir(), `sticker_${Date.now()}.png`);
            
            fs.writeFileSync(tempFile, mediaPath);
            
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${tempFile} ${outPath}`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            const imageBuffer = fs.readFileSync(outPath);
            
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            
            await client.sendMessage(m.chat, { 
                image: imageBuffer, 
                caption: '╭───(    TOXIC-MD    )───\n├───≫ TO IMAGE ≪───\n├ \n├ Your sticker is now an image.\n├ A miraculous achievement.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' 
            }, { quoted: fq });
            
            await client.sendMessage(m.chat, { 
                document: imageBuffer, 
                mimetype: 'image/png', 
                fileName: `sticker_${Date.now()}.png`, 
                caption: '╭───(    TOXIC-MD    )───\n├───≫ PNG FILE ≪───\n├ \n├ PNG version. Slightly less terrible.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' 
            }, { quoted: fq });
            
            try {
                fs.unlinkSync(tempFile);
                fs.unlinkSync(outPath);
            } catch (e) {}
            
        } catch (err) {
            console.error('ToImg error:', err);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            
            let userMessage = 'The conversion failed. Shocking.';
            if (err.message.includes('timeout')) userMessage = 'Took too long. Your sticker is probably as bloated as your ego.';
            if (err.message.includes('Network Error')) userMessage = 'Network error. Is your router powered by hopes and dreams?';
            
            await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ FAILED ≪───\n├ \n├ ${userMessage}\n├ Error: ${err.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            
            try {
                if (mediaPath) fs.unlinkSync(mediaPath);
                if (outPath) fs.unlinkSync(outPath);
            } catch (e) {}
        }
    }
};