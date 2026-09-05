import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { setLanguage, getLanguage, getSupportedLanguages } from '../../lib/language.js';

export default {
    name: 'language',
    aliases: ['lang', 'setlang', 'setlanguage'],
    description: 'Change the bot reply language. Owner only.',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, text, prefix } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const fmt = (msg) => `╭─❏ 「 LANGUAGE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            const langs = getSupportedLanguages();

            if (!text || !text.trim()) {
                const current = getLanguage();
                const list = Object.entries(langs).map(([code, name]) => `│ ${code.toUpperCase().padEnd(5)} — ${name}${code === current ? ' *[current]*' : ''}`).join('\n');
                await client.sendMessage(m.chat, { react: { text: '🌐', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt(`Current: *${langs[current] || current}* (${current.toUpperCase()})\n│ \n│ Supported languages:\n${list}\n│ \n│ Usage: ${prefix}language <code>\n│ Example: ${prefix}language sw`));
            }

            const code = text.trim().toLowerCase();
            if (code === 'list' || code === 'help') {
                const current = getLanguage();
                const list = Object.entries(langs).map(([c, name]) => `│ ${c.toUpperCase().padEnd(5)} — ${name}${c === current ? ' *[current]*' : ''}`).join('\n');
                return sendInteractive(client, m, fmt(`Current: *${langs[current] || current}* (${current.toUpperCase()})\n│ \n│ ${list}`));
            }

            if (!langs[code]) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt(`Language "${code}" is not supported.\n│ Use ${prefix}language to see all supported languages.`));
            }

            const ok = setLanguage(code);
            if (ok) {
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt(`Language set to *${langs[code]}* (${code.toUpperCase()})!`));
            } else {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt(`Failed to set language. Try again.`));
            }
        });
    }
};
