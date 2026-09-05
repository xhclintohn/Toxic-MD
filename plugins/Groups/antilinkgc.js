import { getGroupSettings, updateGroupSetting, getWarnLimit } from '../../database/config.js';

export default async (context) => {
    const { client, m, args, isAdmin, isBotAdmin, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const fmt = (msg) => `╭─❏ 「 ANTILINKGC」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    if (!m.isGroup) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: fmt('Groups only.') });
    }

    if (!isAdmin) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: fmt("Admins only.") });
    }

    if (!isBotAdmin) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: fmt("Make me admin first.") });
    }

    try {
        const groupSettings = await getGroupSettings(m.chat);
        let value = (args.join(" ") || "").toLowerCase().trim();
        if (value === 'on' || value === 'enable' || value === 'enabled' || value === 'true' || value === '1' || value === 'yes') value = 'delete';
        if (value === 'disable' || value === 'disabled' || value === 'false' || value === '0' || value === 'no' || value === 'stop') value = 'off';
        const validModes = ["off", "warn", "kick", "delete"];

        if (validModes.includes(value)) {
            const currentMode = String(groupSettings.antilinkgc || "off").toLowerCase();
            if (currentMode === value) {
                await client.sendMessage(m.chat, { react: { text: '⚠️', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: fmt(`Antilinkgc is already *${value.toUpperCase()}*.`) });
            }
            await updateGroupSetting(m.chat, 'antilinkgc', value);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            const desc =
                value === 'off' ? "WhatsApp group/channel links allowed." :
                value === 'warn' ? "Delete + warn. Kick at warn limit." :
                value === 'delete' ? "Delete only. No warn/kick." :
                "Instant kick on WA group/channel links.";
            return await client.sendMessage(m.chat, { text: fmt(`Antilinkgc set to *${value.toUpperCase()}*.\n│ ${desc}`) });
        }

        const currentMode = String(groupSettings.antilinkgc || "off").toUpperCase();
        const warnLimit = await getWarnLimit(m.chat);
        const bodyText = fmt(`Current mode: *${currentMode}*\n│ Warn limit: *${warnLimit}*\n│ \n│ Usage: ${prefix}antilinkgc off | on | delete | warn | kick\n│ \n│ Only flags chat.whatsapp.com and whatsapp.com/channel links.`);
        await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
        return await client.sendMessage(m.chat, { text: bodyText });
    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        await client.sendMessage(m.chat, { text: fmt('Something broke. Try again.') });
    }
};
