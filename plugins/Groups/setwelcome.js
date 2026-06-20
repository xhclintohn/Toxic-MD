import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
    name: 'setwelcome',
    aliases: ['welcomemsg', 'customwelcome', 'setwelcomemsg'],
    description: 'Set a custom welcome message for this group. Use {user} for the new member\'s mention.',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, text, prefix, isGroup, isBotAdmin } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            if (!isGroup) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETWELCOME", "Group only command."));
            }

            if (!isBotAdmin) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETWELCOME", "Make me admin first."));
            }

            const gs = await getGroupSettings(m.chat);
            if (!gs.welcome) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETWELCOME", `Welcome is OFF for this group.\n│ Enable it first: ${prefix}welcome on`));
            }

            if (!text || text.trim() === '') {
                const current = gs.custom_welcome || '';
                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
                const preview = current ? `Current custom:\n│ ${current.slice(0, 120)}${current.length > 120 ? '...' : ''}` : 'No custom message set (using default).';
                return sendInteractive(client, m, fmt("SETWELCOME", `${preview}\n│ \n│ Usage: ${prefix}setwelcome <message>\n│ Use {user} = member mention\n│ Use {group} = group name\n│ Use {desc} = group description\n│ \n│ To reset to default: ${prefix}setwelcome reset`));
            }

            if (text.trim().toLowerCase() === 'reset') {
                await updateGroupSetting(m.chat, 'custom_welcome', '');
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("SETWELCOME", "Welcome message reset to default."));
            }

            await updateGroupSetting(m.chat, 'custom_welcome', text.trim());
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return sendInteractive(client, m, fmt("SETWELCOME", `Custom welcome message set!\n│ \n│ Preview:\n│ ${text.trim().slice(0, 120)}${text.trim().length > 120 ? '...' : ''}`));
        });
    }
};
