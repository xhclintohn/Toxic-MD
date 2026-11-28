import { translate } from '@vitalets/google-translate-api';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'translate',
    aliases: ['tr', 'trans'],
    description: 'Translates text to different languages',
    run: async (context) => {
        const { client, m, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fullText = m.body.replace(new RegExp(`^[^a-zA-Z]*(translate|tr|trans)\\s*`, 'i'), '').trim();

        if (!fullText && !m.quoted?.text) {
            return sendInteractive(client, m, `╭─❏ 「 Tʀᴀɴsʟᴀᴛᴇ」
│ Usage:\n│ ${prefix}tr ja Hello\n│ ${prefix}tr es How are you?\n│ Or reply to msg: ${prefix}tr en\n│ \n│ Codes: ja es fr de zh ar hi sw ko ru\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        let lang, text;

        if (m.quoted?.text) {
            lang = fullText || 'en';
            text = m.quoted.text;
        } else {
            const parts = fullText.split(' ');
            if (parts.length >= 2 && parts[0].length <= 3 && /^[a-z]{2,3}$/.test(parts[0])) {
                lang = parts[0];
                text = parts.slice(1).join(' ');
            } else {
                lang = 'en';
                text = fullText;
            }
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            const result = await translate(text, { to: lang });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await sendInteractive(client, m, `╭─❏ 「 Tʀᴀɴsʟᴀᴛɪᴏɴ」
│ ${result.text}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            let errorMessage = 'Translation failed. Try again.';
            if (error.message && error.message.includes('Invalid target language')) {
                errorMessage = `Invalid language code "${lang}". Use: ja, es, fr, de, zh, ar, hi, ko, ru, etc.`;
            }
            return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ ${errorMessage}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
