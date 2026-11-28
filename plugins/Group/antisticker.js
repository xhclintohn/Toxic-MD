import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 ANTISTICKER」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const _ON  = new Set(['on','enable','enabled','activate','activated','true','1','yes','start','delete']);
const _WARN = new Set(['warn']);
const _OFF = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);
const _KICK = new Set(['kick','remove','ban','hard','strict']);

export default {
    name: 'antisticker',
    aliases: ['nosticker', 'blocksticker', 'stickerblock', 'antissticker', 'nsticker'],
    description: 'Toggle anti-sticker: off / warn / kick. Usage: .antisticker on|off|kick',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        if (!m.chat?.endsWith('@g.us')) {
            return sendInteractive(client, m, fmt('This command is for groups only.'));
        }
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const val = (args[0] || '').toLowerCase();
        const gs = await getGroupSettings(m.chat);
        const current = gs?.antisticker || 'off';

        if (!val) {
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Status: *${current.toUpperCase()}*\n│ \n│ Usage:\n│ *${prefix}antisticker on*  → warn on sticker\n│ *${prefix}antisticker kick* → kick on sticker\n│ *${prefix}antisticker off* → disable\n│ \n│ Aliases: on/enable/warn/kick/off/disable`));
        }

        let newVal;
        if (_KICK.has(val)) newVal = 'kick';
        else if (_WARN.has(val)) newVal = 'warn';
        else if (_ON.has(val)) newVal = 'delete';
        else if (_OFF.has(val)) newVal = 'off';
        else {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Invalid option: *${val}*\nUse: *on*, *delete*, *warn*, *kick*, or *off*`));
        }

        await updateGroupSetting(m.chat, 'antisticker', newVal);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
        const desc = newVal === 'off' ? 'disabled ❌' : newVal === 'kick' ? 'enabled in KICK mode 🦾' : 'enabled in WARN mode ⚠️';
        return sendInteractive(client, m, fmt(`Anti-Sticker ${desc}\n│ \n│ Stickers will be ${newVal === 'off' ? 'allowed' : newVal === 'kick' ? 'deleted + sender kicked' : 'deleted + sender warned'}`));
    }
};
