import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getDeviceMode } from '../../lib/deviceMode.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, args, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const jid = m.chat;

        const fmt = (msg) =>
            `╭───(    TOXIC-MD    )───\n├───≫ Gᴏᴏᴅʙʏᴇ ≪───\n├ \n├ ${msg}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            if (!jid.endsWith('@g.us')) {
                await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: fmt("Oi! This only works in groups. Not your personal DM, genius.") }, { quoted: fq });
            }

            const groupSettings = await getGroupSettings(jid);
            const isEnabled = groupSettings?.goodbye === true || groupSettings?.goodbye === 1;
            const value = args[0]?.toLowerCase();

            if (value === 'on' || value === 'off') {
                const action = value === 'on';
                if (isEnabled === action) {
                    await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
                    return await client.sendMessage(m.chat, { text: fmt(`Bruh Goodbye is already ${value.toUpperCase()} in this group.`) }, { quoted: fq });
                }
                await updateGroupSetting(jid, 'goodbye', action);
                await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });
                return await client.sendMessage(m.chat, {
                    text: fmt(`Goodbye messages ${value.toUpperCase()}! ${action ? "Leavers will get roasted on their way out" : "Let them leave in silence like the nobodies they are"}`)
                }, { quoted: fq });
            }

            const bodyText = fmt(`Goodbye messages are currently *${isEnabled ? 'ON' : 'OFF'}*\nUse: *${prefix}goodbye on/off* to toggle.`);
            const device = await getDeviceMode();

            if (device === 'ios') {
                await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });
                return await client.sendMessage(m.chat, { text: bodyText }, { quoted: fq });
            }

            const toggleMsg = generateWAMessageFromContent(
                m.chat,
                proto.Message.fromObject({
                    interactiveMessage: {
                        body: { text: bodyText },
                        footer: { text: '' },
                        carouselMessage: {
                            cards: [{
                                header: { title: 'Gᴏᴏᴅʙʏᴇ Settings', hasMediaAttachment: false },
                                body: { text: 'Toggle goodbye messages:' },
                                nativeFlowMessage: {
                                    buttons: [{
                                        name: 'single_select',
                                        buttonParamsJson: JSON.stringify({
                                            title: 'Choose Action',
                                            sections: [{
                                                title: 'Goodbye Messages',
                                                rows: [
                                                    { title: 'ON', description: 'Enable goodbye messages', id: `${prefix}goodbye on` },
                                                    { title: 'OFF', description: 'Disable goodbye messages', id: `${prefix}goodbye off` }
                                                ]
                                            }]
                                        })
                                    }]
                                }
                            }]
                        }
                    }
                }),
                { quoted: fq }
            );
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            await client.relayMessage(m.chat, toggleMsg.message, { messageId: toggleMsg.key.id });
            await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
            console.error('Toxic-MD: Error in goodbye.js:', error);
            await client.sendMessage(m.chat, { text: fmt(`Something crashed. Error: ${error.message}`) }, { quoted: fq });
        }
    });
};
