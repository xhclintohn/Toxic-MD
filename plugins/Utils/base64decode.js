import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'base64decode',
    aliases: ['unbase64', 'debase64', 'frombase64', 'decode64', 'b64decode'],
    description: 'Decodes Base64 text back to plain text. Reply to a message or provide base64 after the command.',
    run: async (context) => {
        const { client, m, text } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let input = (text || '').trim();
        if (!input && m.quoted) {
            input = (
                m.quoted.text || m.quoted.body ||
                m.quoted.message?.conversation ||
                m.quoted.message?.extendedTextMessage?.text || ''
            ).trim();
        }

        if (!input) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return m.reply('╭───(    TOXIC-MD    )───\n├───≫ Bᴀsᴇ64 Dᴇᴄᴏᴅᴇ ≪───\n├ \n├ You gave me nothing. Classic.\n├ Usage: .unbase64 SGVsbG8gV29ybGQ=\n├        .debase64 [reply to base64]\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
        }

        let decoded = '';
        try {
            const buf = Buffer.from(input.replace(/\s/g, ''), 'base64');
            decoded = buf.toString('utf8');
            if (!decoded || !decoded.trim()) throw new Error('empty result');
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return m.reply('╭───(    TOXIC-MD    )───\n├───≫ Bᴀsᴇ64 Dᴇᴄᴏᴅᴇ ≪───\n├ \n├ That\'s not valid Base64.\n├ Learn what Base64 is first.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

        const resultText = `╭───(    TOXIC-MD    )───\n├───≫ Bᴀsᴇ64 Dᴇᴄᴏᴅᴇ ≪───\n├ \n├ 📥 Input (Base64):\n├ ${input.slice(0, 60)}${input.length > 60 ? '...' : ''}\n├ \n├ 📤 Decoded:\n├ \n${decoded}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            const msg = await generateWAMessageFromContent(m.chat, proto.Message.fromObject({
                interactiveMessage: {
                    body: { text: resultText },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [{
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({ display_text: '📋 Copy Decoded', copy_code: decoded })
                        }],
                        messageParamsJson: ''
                    }
                }
            }), { quoted: fq, userJid: client.user.id });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        } catch {
            await m.reply(resultText);
        }
    }
};
