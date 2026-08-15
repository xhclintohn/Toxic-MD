import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'dice',
    aliases: ['roll', 'rolldice', 'd6'],
    description: 'Roll one or more dice',
    run: async (context) => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const count = Math.min(parseInt(text || '1') || 1, 10);
        const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
        const total = rolls.reduce((a, b) => a + b, 0);
        const diceDisplay = rolls.map(r => ['⚀','⚁','⚂','⚃','⚄','⚅'][r-1]).join(' ');
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        return sendInteractive(client, m, `╭─❏ 「 Dɪᴄᴇ Rᴏʟʟ」
│
│ 🎲 ${diceDisplay}\n│ 🔢 Rolls: [${rolls.join(', ')}]\n│ ➕ Total: ${total}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};
