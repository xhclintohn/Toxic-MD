import { sendInteractive } from '../../lib/sendInteractive.js';
import { groqChat } from '../../lib/groqChat.js';

export default async (context) => {
    const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (!text) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 Cᴏᴅᴇɢᴇɴ」
│ Example usage:\n│ .codegen Function to calculate triangle area|Python\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    let [prompt, language] = text.split("|").map(v => v.trim());

    if (!prompt || !language) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Invalid format!\n│ Use the format: .codegen <prompt>|<language>\n│ Example: .codegen Check for prime number|JavaScript\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
    try {
        const { reply: data } = await groqChat({
            messages: [
                { role: 'system', content: `You are a code generator. Reply with ONLY the ${language} code for the request, no explanation, no markdown fences.` },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2048
        });

        if (!data || typeof data !== "string") {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Failed to retrieve code from API.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        sendInteractive(client, m, `╭─❏ 「 Cᴏᴅᴇɢᴇɴ (${language})」
` + "```" + language.toLowerCase() + "\n" + data.trim() + "\n```" + `\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        console.error(error);
        sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ An error occurred while processing your request.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};