import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { getGroupSettings, updateGroupSetting, getWarnLimit } from '../../database/config.js';
import { getDeviceMode } from '../../lib/deviceMode.js';

export default async (context) => {
    const { client, m, args, isAdmin, isBotAdmin, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const fmt = (msg) => `╭─❏ 「 ANTILINK」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    if (!m.isGroup) {
        await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: fmt('Groups only, genius.') });
    }

    if (!isAdmin) {
        await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: fmt("Admins only. You're not special enough.") });
    }

    if (!isBotAdmin) {
        await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: fmt("Make me admin first. I can't enforce rules without power.") });
    }

    try {
        const groupSettings = await getGroupSettings(m.chat);
        const value = args.join(" ").toLowerCase();
        const validModes = ["off", "warn", "kick"];

        if (validModes.includes(value)) {
            const currentMode = String(groupSettings.antilink || "off").toLowerCase();
            if (currentMode === value) {
                await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: fmt(`Antilink is already set to *${value.toUpperCase()}*. Pay attention.`) });
            }
            await updateGroupSetting(m.chat, 'antilink', value);
            await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });
            const desc =
                value === 'off' ? "Links are now allowed. Hope you know what you're doing." :
                value === 'warn' ? `Links will be deleted and sender warned.\nAt the warn limit they're KICKED.` :
                'Links = Instant kick. No second chances.';
            await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: fmt(`Antilink set to *${value.toUpperCase()}*.\n│ ${desc}`) });
        }

        const currentMode = String(groupSettings.antilink || "off").toUpperCase();
        const warnLimit = await getWarnLimit(m.chat);
        const bodyText = fmt(`Current mode: *${currentMode}*\n│ Warn limit: *${warnLimit}* (set with ${prefix}setwarncount)\n│ \n│ off — Allow links\n│ warn — Delete + warn user\n│ kick — Delete + instant kick`);

        const device = await getDeviceMode();
        if (device === 'ios') {
            await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });
            return await client.sendMessage(m.chat, { text: bodyText });
        }

        const _msg = generateWAMessageFromContent(
            m.chat,
            proto.Message.fromObject({
                interactiveMessage: {
                    body: { text: bodyText },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [{
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: 'Choose mode',
                                sections: [{
                                    rows: [
                                        { title: 'OFF', description: 'Links allowed', id: `${prefix}antilink off` },
                                        { title: 'WARN', description: 'Delete + warn sender', id: `${prefix}antilink warn` },
                                        { title: 'KICK', description: 'Delete + instant kick', id: `${prefix}antilink kick` }
                                    ]
                                }]
                            })
                        }]
                    }
                }
            }),
            { timestamp: new Date(), userJid: client.user?.id }
        );
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await client.relayMessage(m.chat, _msg.message, { messageId: _msg.key.id });
    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
        console.error("Antilink command error:", error);
        await client.sendMessage(m.chat, { text: fmt('Something broke. Try again.') });
    }
};
