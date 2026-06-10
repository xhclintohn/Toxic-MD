import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 MULTIPREFIX」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            const settings = await getSettings();
            const isEnabled = settings.multiprefix === 'true' || settings.multiprefix === true;
            const value = args[0]?.toLowerCase();

            if (value === 'on' || value === 'all') {
                if (isEnabled) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return await client.sendMessage(m.chat, { text: fmt('Multi-prefix already ON, clown. 🔥 All prefixes (. ! / #) work.') });
                }
                await updateSetting('multiprefix', true);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.sendMessage(m.chat, { text: fmt('Multi-prefix: *ON 🔥* — . ! / # all work now. Enjoy, you picky bastard.') });
            }

            if (value === 'off') {
                if (!isEnabled) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return await client.sendMessage(m.chat, { text: fmt(`Multi-prefix already OFF, clown. 🙄 Single prefix: *${settings.prefix || '.'}*`) });
                }
                await updateSetting('multiprefix', false);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.sendMessage(m.chat, { text: fmt(`Multi-prefix: *OFF 🧊* — single prefix only: *${settings.prefix || '.'}*`) });
            }

            const _devMode = await getDeviceMode();
            if (_devMode === 'ios') {
                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
                await sendInteractive(client, m, `╭─❏ 「 MULTIPREFIX」\n│ Status: ${isEnabled ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}multiprefix on\n│ ${prefix}multiprefix off\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            } else {
                const _multiprefixMsg = generateWAMessageFromContent(
                    m.chat,
                    proto.Message.fromObject({
                        interactiveMessage: {
                            body: { text: fmt(`Multi-prefix: *${isEnabled ? 'ON 🔥' : 'OFF 🧊'}*\n│ When ON: . ! / # all trigger commands.\n│ When OFF: only *${settings.prefix || '.'}* works.`) },
                            footer: { text: '' },
                            nativeFlowMessage: {
                                buttons: [{
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: 'Choose an option',
                                        sections: [{
                                            rows: [
                                                { title: 'ON 🔥', id: `${prefix}multiprefix on` },
                                                { title: 'OFF 🧊', id: `${prefix}multiprefix off` }
                                            ]
                                        }]
                                    })
                                }]
                            }
                        }
                    }),
                    { timestamp: new Date(), userJid: client.user?.id }
                );
                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
                await client.relayMessage(m.chat, _multiprefixMsg.message, { messageId: _multiprefixMsg.key.id });
            }
        } catch (err) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await client.sendMessage(m.chat, { text: fmt(`Exploded. 💀 Error: ${err.message}`) });
        }
    });
};
