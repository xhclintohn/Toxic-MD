import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getDeviceMode } from '../../lib/deviceMode.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (title, msg) =>
            `╭───(    TOXIC-MD    )───\n├───≫ ${title} ≪───\n├ \n├ ${msg}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            const settings = await getSettings();
            if (!settings || Object.keys(settings).length === 0) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return await client.sendMessage(m.chat, { text: fmt('ANTIVIEWONCE', 'Database is fucked, no settings found. Fix it.') }, { quoted: fq });
            }

            const value = args.join(' ').toLowerCase();

            if (value === 'on' || value === 'off') {
                const action = value === 'on';
                if (settings.antiviewonce === action) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return await client.sendMessage(m.chat, { text: fmt('ANTIVIEWONCE', `Antiviewonce is already ${value.toUpperCase()}, genius. Stop wasting my time.\n├ \n├ 📌 Usage: ${prefix}antiviewonce on | ${prefix}antiviewonce off`) }, { quoted: fq });
                }

                await updateSetting('antiviewonce', action);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.sendMessage(m.chat, { text: fmt('ANTIVIEWONCE', `Antiviewonce ${value.toUpperCase()}! ${action ? 'Every view-once gets saved to my DM. Nothing gets past me. 😈' : 'View-once messages are free to vanish now.'}\n├ \n├ 📌 Usage: ${prefix}antiviewonce on | ${prefix}antiviewonce off`) }, { quoted: fq });
            }

            const _devMode = await getDeviceMode();
            if (_devMode === 'ios') {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                await client.sendMessage(m.chat, { text: fmt('ANTIVIEWONCE', `Antiviewonce is ${settings.antiviewonce ? 'ON' : 'OFF'}. Pick a vibe.\n├ \n├ 📌 Usage: ${prefix}antiviewonce on | ${prefix}antiviewonce off`) }, { quoted: fq });
            } else {
                const _msg = generateWAMessageFromContent(
                    m.chat,
                    {
                        interactiveMessage: {
                            body: { text: fmt('ANTIVIEWONCE', `Antiviewonce is ${settings.antiviewonce ? 'ON' : 'OFF'}. Pick a vibe.\n├ \n├ 📌 Usage: ${prefix}antiviewonce on | ${prefix}antiviewonce off`) },
                            footer: { text: '' },
                            nativeFlowMessage: {
                                buttons: [{
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: 'Choose an option',
                                        sections: [{
                                            rows: [
                                                { title: 'ON ✅', id: `${prefix}antiviewonce on` },
                                                { title: 'OFF ❌', id: `${prefix}antiviewonce off` }
                                            ]
                                        }]
                                    })
                                }]
                            }
                        }
                    },
                    { quoted: fq }
                );
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                await client.relayMessage(m.chat, _msg.message, { messageId: _msg.key.id });
            }
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await client.sendMessage(m.chat, { text: fmt('ANTIVIEWONCE', "Something broke. Try again later.") }, { quoted: fq });
        }
    });
};
