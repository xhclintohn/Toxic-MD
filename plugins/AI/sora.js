import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'sora',
    aliases: ['soraai', 'genvideo', 'aifilm'],
    description: 'Generate an AI cinematic image scene from a text prompt',
    run: async (context) => {
        const { client, m, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const prompt = m.body.replace(new RegExp(`^${prefix}(sora|soraai|genvideo|aifilm)\\s*`, 'i'), '').trim();

        if (!prompt) {
            return client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├───≫ Sᴏʀᴀ AI ≪───\n├ \n├ Describe a scene to generate.\n├ Example: ${prefix}sora a dragon flying over Tokyo\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const cinemaPrompt = `cinematic film scene, ultra detailed, 8k, ${prompt}, dramatic lighting, movie quality, epic composition`;
            const seed = Math.floor(Math.random() * 999999);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cinemaPrompt)}?width=1280&height=720&model=flux&nologo=true&seed=${seed}`;

            const imgRes = await fetch(imageUrl, { timeout: 60000 });
            if (!imgRes.ok) throw new Error('Scene generation failed');
            const buffer = Buffer.from(await imgRes.arrayBuffer());

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                image: buffer,
                caption: `╭───(    TOXIC-MD    )───\n├───≫ Sᴏʀᴀ AI Sᴄᴇɴᴇ ≪───\n├ \n├ Prompt: ${prompt}\n├ Resolution: 1280×720\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });

        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├───≫ Fᴀɪʟᴇᴅ ≪───\n├ \n├ Could not generate scene.\n├ Try a different prompt.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        }
    }
};
