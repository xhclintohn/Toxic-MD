import { getGroupSettings, updateGroupSetting, getGroupSettingsFresh, getWarnLimit, getBadWords, addBadWord, removeBadWord } from '../../database/config.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 ANTIBADWORD」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const validModes = ['off', 'warn', 'kick', 'delete'];

export default {
    name: 'antibadword',
    aliases: ['badword', 'nobadword', 'antiswear', 'antiprofanity'],
    description: 'Toggle anti-bad-word protection. Usage: .antibadword warn|kick|delete|off',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        if (!m.chat?.endsWith('@g.us')) {
            return sendInteractive(client, m, fmt('This command is for groups only.'));
        }
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const val = (args[0] || '').toLowerCase();
        const gs = await getGroupSettings(m.chat);
        const current = gs?.antibadword || 'off';

        const normalised =
            val === 'on' || val === 'enable' || val === 'enabled' || val === 'activate' ? 'warn' :
            val === 'disable' || val === 'disabled' || val === 'deactivate' || val === 'false' || val === '0' || val === 'no' || val === 'stop' ? 'off' :
            val;

        if (!normalised) {
            const modeLabel =
                current === 'warn'   ? 'WARN ⚠️'   :
                current === 'kick'   ? 'KICK 🚫'   :
                current === 'delete' ? 'DELETE 🗑️' : 'OFF ❌';
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(
                `Status: *${modeLabel}*\n│ \n│ Detects a preset list of bad words plus\n│ any words your group has added.\n│ \n│ Usage:\n│ *${prefix}antibadword warn*   → warn first, kick on repeat\n│ *${prefix}antibadword kick*   → delete + instant kick\n│ *${prefix}antibadword delete* → delete only, no punishment\n│ *${prefix}antibadword off*    → disable\n│ \n│ *${prefix}addbadword <word>* → add a custom bad word\n│ *${prefix}removebadword <word>* → remove a custom bad word\n│ *${prefix}badwordlist* → show custom bad words`
            ));
        }

        if (!validModes.includes(normalised)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Invalid option: *${val}*\n│ Use: *warn*, *kick*, *delete*, or *off*`));
        }

        if (current === normalised) {
            await client.sendMessage(m.chat, { react: { text: '⚠️', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Antibadword is already *${normalised.toUpperCase()}*. Pay attention.`));
        }

        await updateGroupSetting(m.chat, 'antibadword', normalised);
        await getGroupSettingsFresh(m.chat);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});

        const warnLimit = await getWarnLimit(m.chat);
        const desc =
            normalised === 'off'    ? 'Anti-Bad Word *DISABLED ❌*\n│ Bad words are now allowed in this group.' :
            normalised === 'warn'   ? `Anti-Bad Word set to *WARN ⚠️*\n│ Message deleted + sender warned.\n│ At *${warnLimit}* warns they're auto-kicked.` :
            normalised === 'kick'   ? 'Anti-Bad Word set to *KICK 🚫*\n│ Bad words = Instant kick. No second chances.' :
                                     'Anti-Bad Word set to *DELETE 🗑️*\n│ Message deleted, no warning or kick.';
        return sendInteractive(client, m, fmt(desc));
    }
};

export const badwordManage = async (context, action) => {
    const { client, m, args, prefix } = context;
    if (!m.chat?.endsWith('@g.us')) {
        return sendInteractive(client, m, fmt('This command is for groups only.'));
    }
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (action === 'list') {
        const words = await getBadWords(m.chat);
        await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
        if (!words.length) return sendInteractive(client, m, fmt('No custom bad words added yet.'));
        return sendInteractive(client, m, fmt(`Custom bad words:\n│ ${words.join('\n│ ')}`));
    }

    const word = args.join(' ').toLowerCase().trim();
    if (!word) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Usage: ${prefix}${action === 'add' ? 'addbadword' : 'removebadword'} <word>`));
    }

    if (action === 'add') {
        await addBadWord(m.chat, word);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Added *${word}* to this group's bad word list.`));
    }

    await removeBadWord(m.chat, word);
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Removed *${word}* from this group's bad word list.`));
};
