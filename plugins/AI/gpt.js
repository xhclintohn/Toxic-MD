import { sendInteractive } from '../../lib/sendInteractive.js';
import { groqChat } from '../../lib/groqChat.js';

export default {
    name: 'gpt',
    aliases: ['ai', 'chatgpt'],
    description: 'Chat with AI',
    run: async (context) => {
        const { client, m, text, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
        if (!text) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 GPT」
│ Example: ${prefix || '.'}gpt hello
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
        try {
            const { reply } = await groqChat({
                messages: [
                    { role: 'system', content: 'You are a helpful, smart AI assistant. Be clear and useful.' },
                    { role: 'user', content: text }
                ],
                temperature: 0.7,
                max_tokens: 1024
            });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, `╭─❏ 「 GPT」
│ ${reply}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch (error) {
            console.error('GPT error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, `╭─❏ 「 GPT」
│ ${error.message || error}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
