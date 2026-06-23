import { getGroupSettings, updateGroupSetting, getWarnLimit } from '../../database/config.js';

export default async (context) => {
    const { client, m, args, isAdmin, isBotAdmin, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const fmt = (msg) => `╭─❏ 「 ANTILINK」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    if (!m.isGroup) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: fmt('Groups only, genius.') });
    }

    if (!isAdmin) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: fmt("Admins only. You're not special enough.") });
    }

    if (!isBotAdmin) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: fmt("Make me admin first. I can't enforce rules without power.") });
    }

    try {
        const groupSettings = await getGroupSettings(m.chat);
        const value = args.join(" ").toLowerCase();
        const validModes = ["off", "warn", "kick"];

        if (validModes.includes(value)) {
            const currentMode = String(groupSettings.antilink || "off").toLowerCase();
            if (currentMode === value) {
                await client.sendMessage(m.chat, { react: { text: '⚠️', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: fmt(`Antilink is already set to *${value.toUpperCase()}*. Pay attention.`) });
            }
            await updateGroupSetting(m.chat, 'antilink', value);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            const desc =
                value === 'off' ? "Links are now allowed. Hope you know what you're doing." :
                value === 'warn' ? `Links will be deleted and sender warned.\nAt the warn limit they're KICKED.` :
                'Links = Instant kick. No second chances.';
            return await client.sendMessage(m.chat, { text: fmt(`Antilink set to *${value.toUpperCase()}*.\n│ ${desc}`) });
        }

        const currentMode = String(groupSettings.antilink || "off").toUpperCase();
        const warnLimit = await getWarnLimit(m.chat);
        const bodyText = fmt(`Current mode: *${currentMode}*\n│ Warn limit: *${warnLimit}* warns before kick\n│ \n│ Usage: ${prefix}antilink off | warn | kick\n│ \n│ off — Allow links\n│ warn — Delete link + warn the sender. After *${warnLimit}* warns they're auto-kicked.\n│ kick — Delete link + instant kick\n│ \n│ To allow a specific link use: ${prefix}trustlink <link>\n│ This current group link is excluded always and will not be flagged by antilink!\n│ \n│ Change warn limit: ${prefix}setwarncount <number>\n│ Example: ${prefix}setwarncount 5`);

        await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
        return await client.sendMessage(m.chat, { text: bodyText });
    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        console.error("Antilink command error:", error);
        await client.sendMessage(m.chat, { text: fmt('Something broke. Try again.') });
    }
};