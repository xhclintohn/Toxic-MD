import axios from 'axios';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default async (context) => {
    const { client, m, text } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (!text) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Cᴏᴅᴇɢᴇɴ ≪───\n├ \n├ Example usage:\n├ .codegen Function to calculate triangle area|Python\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    let [prompt, language] = text.split("|").map(v => v.trim());

    if (!prompt || !language) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ Invalid format!\n├ Use the format: .codegen <prompt>|<language>\n├ Example: .codegen Check for prime number|JavaScript\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
    try {
        const payload = {
            customInstructions: prompt,
            outputLang: language
        };

        const { data } = await axios.post("https://www.codeconvert.ai/api/generate-code", payload);

        if (!data || typeof data !== "string") {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ Failed to retrieve code from API.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Cᴏᴅᴇɢᴇɴ (${language}) ≪───\n├ \n` + "```" + language.toLowerCase() + "\n" + data.trim() + "\n```" + `\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        console.error(error);
        m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ An error occurred while processing your request.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};