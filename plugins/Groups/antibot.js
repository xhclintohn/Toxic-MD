import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 ANTIBOT」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const _ON  = new Set(['on','enable','enabled','activate','activated','true','1','yes','start']);
const _OFF = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);

export default {
    name: 'antibot',
    aliases: ['nobot', 'blockbot', 'botblock', 'antibots', 'removebots'],
    description: 'Toggle anti-bot: blocks bots in the group. Usage: .antibot on|off',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        if (!m.chat?.endsWith('@g.us')) {
            return sendInteractive(client, m, fmt('This command is for groups only.'));
        }
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const val = (args[0] || '').toLowerCase();
        const gs = await getGroupSettings(m.chat);
        const current = gs?.antibot || 0;
        const isOn = current === 1 || current === true || current === 'true';

        if (!val) {
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Status: *${isOn ? 'ON ✅' : 'OFF ❌'}*\n│ \n│ Detects ultra-fast message flooding\n│ (bot-like behavior: 10+ msgs/3s)\n│ \n│ Usage:\n│ *${prefix}antibot on*  → kick detected bots\n│ *${prefix}antibot off* → disable\n│ \n│ Aliases: on/enable/off/disable`));
        }

        if (_ON.has(val)) {
            await updateGroupSetting(m.chat, 'antibot', 1);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Anti-Bot *ENABLED* ✅\n│ \n│ Bot accounts flooding 10+ msgs in 3s\n│ will be auto-kicked. 🤖❌`));
        }
        if (_OFF.has(val)) {
            await updateGroupSetting(m.chat, 'antibot', 0);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Anti-Bot *DISABLED* ❌`));
        }

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Invalid option: *${val}*\nUse: *on* or *off*`));
    }
};
