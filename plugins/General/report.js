import { getFakeQuoted } from '../../lib/fakeQuoted.js';
const DEV_JID = '254114885159@s.whatsapp.net';

export default {
    name: 'report',
    aliases: ['bug', 'feedback'],
    description: 'Report a bug or issue directly to the developer',
    run: async (context) => {
        const { client, m, text, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const box = (lines) => {
            const body = (Array.isArray(lines) ? lines : [lines]).map(l => `├ ${l}`).join('\n');
            return `╭───(    TOXIC-MD    )───\n├───≫ Rᴇᴘᴏʀᴛ ≪───\n├\n${body}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        };

        const reportText = text || (m.quoted ? (m.quoted.text || m.quoted.body || '') : '');

        if (!reportText || !reportText.trim()) {
            return client.sendMessage(m.chat, {
                text: box([
                    `Usage: *${prefix}report <your message>*`,
                    `Or reply to a message and type *${prefix}report*`,
                    ``,
                    `Example: *${prefix}report play cmd not working*`
                ])
            }, { quoted: fq });
        }

        const senderNum = m.sender.replace(/@s\.whatsapp\.net$/, '').split(':')[0];
        const chatType = m.isGroup ? `Group: ${m.chat}` : 'DM';
        const now = new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });

        const devMsg = `╭───(    TOXIC-MD    )───\n├───≫ 🐛 Bᴜɢ Rᴇᴘᴏʀᴛ ≪───\n├\n├ From: @${senderNum}\n├ Name: ${m.pushName || 'Unknown'}\n├ Chat: ${chatType}\n├ Time: ${now}\n├\n├ Report:\n├ ${reportText.split('\n').join('\n├ ')}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            await client.sendMessage(DEV_JID, {
                text: devMsg,
                mentions: [m.sender]
            }, { quoted: fq });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                text: box([
                    `Your report has been sent to the developer.`,
                    ``,
                    `*Report:* ${reportText.slice(0, 120)}${reportText.length > 120 ? '...' : ''}`,
                    ``,
                    `The dev will look into it. Thanks for reporting.`
                ])
            }, { quoted: fq });
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                text: box([`Failed to send report. Try again later.`])
            }, { quoted: fq });
        }
    }
};
