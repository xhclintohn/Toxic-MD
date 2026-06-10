import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'base64',
    aliases: ['tobase64', 'b64encode', 'encode64'],
    description: 'Encodes text to Base64. Reply to text or provide it after the command.',
    run: async (context) => {
        const { client, m, text } = context;
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
            return sendInteractive(client, m, `╭─❏ 「 Bᴀsᴇ64 Eɴᴄᴏᴅᴇ」
│ You gave me nothing. Brilliant.\n│ Usage: .base64 Hello World\n│        .tobase64 [reply to text]\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const encoded = Buffer.from(input, 'utf8').toString('base64');
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

        const resultText = `╭─❏ 「 Bᴀsᴇ64 Eɴᴄᴏᴅᴇ」
│ 📥 Input:\n│ ${input.slice(0, 80)}${input.length > 80 ? '...' : ''}\n│ \n│ 📤 Encoded:\n│ \n${encoded}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            const msg = await generateWAMessageFromContent(m.chat, proto.Message.fromObject({
                interactiveMessage: {
                    body: { text: resultText },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [{
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({ display_text: '📋 Copy Encoded', copy_code: encoded })
                        }],
                        messageParamsJson: ''
                    }
                }
            }), { userJid: client.user.id });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        } catch {
            await sendInteractive(client, m, resultText);
        }
    }
};
