import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
    name: 'setgoodbye',
    aliases: ['goodbyemsg', 'customgoodbye', 'setgoodbyemsg'],
    description: 'Set a custom goodbye message for this group. Use {user} for the leaving member\'s mention.',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, text, prefix, isGroup, isBotAdmin } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            if (!isGroup) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETGOODBYE", "Group only command."));
            }

            if (!isBotAdmin) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETGOODBYE", "Make me admin first."));
            }

            const gs = await getGroupSettings(m.chat);
            if (!gs.goodbye) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETGOODBYE", `Goodbye is OFF for this group.\n│ Enable it first: ${prefix}goodbye on`));
            }

            if (!text || text.trim() === '') {
                const current = gs.custom_goodbye || '';
                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
                const preview = current ? `Current custom:\n│ ${current.slice(0, 120)}${current.length > 120 ? '...' : ''}` : 'No custom message set (using default).';
                return sendInteractive(client, m, fmt("SETGOODBYE", `${preview}\n│ \n│ Usage: ${prefix}setgoodbye <message>\n│ Use {user} = member mention\n│ Use {group} = group name\n│ To reset to default: ${prefix}setgoodbye reset`));
            }

            if (text.trim().toLowerCase() === 'reset') {
                await updateGroupSetting(m.chat, 'custom_goodbye', '');
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("SETGOODBYE", "Goodbye message reset to default."));
            }

            await updateGroupSetting(m.chat, 'custom_goodbye', text.trim());
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return sendInteractive(client, m, fmt("SETGOODBYE", `Custom goodbye message set!\n│ \n│ Preview:\n│ ${text.trim().slice(0, 120)}${text.trim().length > 120 ? '...' : ''}`));
        });
    }
};
