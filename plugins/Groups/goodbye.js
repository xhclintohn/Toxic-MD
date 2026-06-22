import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
import middleware from '../../utils/botUtil/middleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { ButtonV2 } from '../../lib/WABuilder.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const jid = m.chat;

        const fmt = (msg) =>
            `╭─❏ 「 Gᴏᴏᴅʙʏᴇ」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            if (!jid.endsWith('@g.us')) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: fmt("Oi! This only works in groups. Not your personal DM, genius.") });
            }

            const groupSettings = await getGroupSettings(jid);
            const isEnabled = groupSettings?.goodbye === true || groupSettings?.goodbye === 1;
            const value = args[0]?.toLowerCase();

            if (value === 'on' || value === 'off') {
                const action = value === 'on';
                if (isEnabled === action) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return await client.sendMessage(m.chat, { text: fmt(`Bruh Goodbye is already ${value.toUpperCase()} in this group.`) });
                }
                await updateGroupSetting(jid, 'goodbye', action);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.sendMessage(m.chat, {
                    text: fmt(`Goodbye messages ${value.toUpperCase()}! ${action ? "Leavers will get roasted on their way out" : "Let them leave in silence like the nobodies they are"}`)
                });
            }

            const bodyText = fmt(`Goodbye messages are currently *${isEnabled ? 'ON' : 'OFF'}*\nUse: *${prefix}goodbye on/off* to toggle.`);
            const device = await getDeviceMode();

            if (device === 'ios') {
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.sendMessage(m.chat, { text: bodyText });
            }

            try {
                const btnV2 = new ButtonV2(client);
                btnV2.setBody(bodyText)

                    .addButton('𝐎𝐍', `${prefix}goodbye on`)
                    .addButton('𝐎𝐅𝐅', `${prefix}goodbye off`);
                await btnV2.send(m.chat, { userJid: client.user?.id || '' });
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            } catch {
                await client.sendMessage(m.chat, { text: bodyText });
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            }
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            console.error('Toxic-MD: Error in goodbye.js:', error);
            await client.sendMessage(m.chat, { text: fmt(`Something crashed. Error: ${error.message}`) });
        }
    });
};
