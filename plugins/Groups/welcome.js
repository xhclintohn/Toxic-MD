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
            `╭───(    TOXIC-MD    )───\n├ ${msg}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            if (!jid.endsWith('@g.us')) {
                await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: fmt("Oi! This only works in groups. Not your personal DM, genius.") }, { quoted: fq });
            }

            const groupSettings = await getGroupSettings(jid);
            const isEnabled = groupSettings?.welcome === true || groupSettings?.welcome === 1;
            const value = args[0]?.toLowerCase();

            if (value === 'on' || value === 'off') {
                const action = value === 'on';
                if (isEnabled === action) {
                    await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
                    return await client.sendMessage(m.chat, { text: fmt(`Bruh Welcome is already ${value.toUpperCase()} in this group. Pay attention!`) }, { quoted: fq });
                }
                await updateGroupSetting(jid, 'welcome', action);
                await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });
                return await client.sendMessage(m.chat, {
                    text: fmt(`Welcome messages ${value.toUpperCase()}! ${action ? "New members better brace themselves" : "No more warm welcomes. Cold group energy"}`)
                }, { quoted: fq });
            }

            const bodyText = fmt(`Welcome messages are currently *${isEnabled ? 'ON' : 'OFF'}*\nUse: *${prefix}welcome on/off* to toggle.`);
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
                                header: { title: 'Wᴇʟᴄᴏᴍᴇ Settings', hasMediaAttachment: false },
                                body: { text: 'Toggle welcome messages:' },
                                nativeFlowMessage: {
                                    buttons: [{
                                        name: 'single_select',
                                        buttonParamsJson: JSON.stringify({
                                            title: 'Choose Action',
                                            sections: [{
                                                title: 'Welcome Messages',
                                                rows: [
                                                    { title: 'ON', description: 'Enable welcome messages', id: `${prefix}welcome on` },
                                                    { title: 'OFF', description: 'Disable welcome messages', id: `${prefix}welcome off` }
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
            console.error('Toxic-MD: Error in welcome.js:', error);
            await client.sendMessage(m.chat, { text: fmt(`Something crashed. Error: ${error.message}`) }, { quoted: fq });
        }
    });
};
