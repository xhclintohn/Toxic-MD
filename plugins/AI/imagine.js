import fetch from 'node-fetch';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'imagine',
    aliases: ['aiimage', 'dream', 'generate'],
    description: 'Generates AI images from text prompts using Pollinations.ai',
    run: async (context) => {
        const { client, m, prefix, botname } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const prompt = m.body.replace(new RegExp(`^${prefix}(imagine|aiimage|dream|generate)\\s*`, 'i'), '').trim();

        if (!prompt) {
            return client.sendMessage(m.chat, {
                text: `╭─❏ 「 Eʀʀᴏʀ」
│ Forgot the prompt? Typical.\n│ Example: ${prefix}imagine a cat playing football\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                mentions: [m.sender]
            });
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&model=flux&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;

            const imgRes = await fetch(imageUrl, { timeout: 60000 });
            if (!imgRes.ok) throw new Error(`Image generation failed: ${imgRes.status}`);

            const buffer = Buffer.from(await imgRes.arrayBuffer());

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            await client.sendMessage(
                m.chat,
                {
                    image: buffer,
                    caption: `╭─❏ 「 Aɪ Iᴍᴀɢᴇ」
│ Prompt: ${prompt}\n│ Powered by ${botname}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                }
            );

        } catch (error) {
            console.error('Imagine command error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await sendInteractive(client, m, `╭─❏ 「 Fᴀɪʟᴇᴅ」
│ Image generation failed.\n│ ${error.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
