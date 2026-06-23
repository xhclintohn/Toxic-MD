import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 ANTISPAM」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const _ON   = new Set(['on','enable','enabled','activate','activated','true','1','yes','start','warn']);
const _OFF  = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);
const _KICK = new Set(['kick','remove','ban','hard','strict']);

export default {
    name: 'antispam',
    aliases: ['nospam', 'blockspam', 'spamblock', 'antiflood', 'nflood'],
    description: 'Toggle anti-spam for group: off / warn / kick. Usage: .antispam on|off|kick',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        if (!m.chat?.endsWith('@g.us')) {
            return sendInteractive(client, m, fmt('This command is for groups only.'));
        }
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const val = (args[0] || '').toLowerCase();
        const gs = await getGroupSettings(m.chat);
        const current = gs?.antispam || 'off';

        if (!val) {
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Status: *${current.toUpperCase()}*\n│ \n│ Threshold: 5 messages / 5 seconds\n│ \n│ Usage:\n│ *${prefix}antispam on*   → warn spammers\n│ *${prefix}antispam kick* → kick spammers\n│ *${prefix}antispam off*  → disable\n│ \n│ Aliases: on/enable/warn/kick/off/disable`));
        }

        let newVal;
        if (_KICK.has(val)) newVal = 'kick';
        else if (_ON.has(val)) newVal = 'warn';
        else if (_OFF.has(val)) newVal = 'off';
        else {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Invalid option: *${val}*\nUse: *on*, *off*, or *kick*`));
        }

        await updateGroupSetting(m.chat, 'antispam', newVal);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
        const desc = newVal === 'off' ? 'disabled ❌' : newVal === 'kick' ? 'enabled in KICK mode 🦾' : 'enabled in WARN mode ⚠️';
        return sendInteractive(client, m, fmt(`Anti-Spam ${desc}\n│ \n│ Spammers (5+ msgs in 5s) will be ${newVal === 'off' ? 'ignored' : newVal === 'kick' ? 'deleted + kicked' : 'deleted + warned'}`));
    }
};
