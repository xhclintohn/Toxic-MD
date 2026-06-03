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

        const fmt = (msg) => `╭───(    TOXIC-MD    )───\n├ ${msg}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            const settings = await getSettings();
            const isEnabled = settings.multiprefix === 'true' || settings.multiprefix === true;
            const value = args[0]?.toLowerCase();

            if (value === 'on' || value === 'all') {
                if (isEnabled) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return await client.sendMessage(m.chat, { text: fmt('Multi-prefix already ON, clown. 🔥 All prefixes (. ! / #) work.') }, { quoted: fq });
                }
                await updateSetting('multiprefix', true);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.sendMessage(m.chat, { text: fmt('Multi-prefix: *ON 🔥* — . ! / # all work now. Enjoy, you picky bastard.') }, { quoted: fq });
            }

            if (value === 'off') {
                if (!isEnabled) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return await client.sendMessage(m.chat, { text: fmt(`Multi-prefix already OFF, clown. 🙄 Single prefix: *${settings.prefix || '.'}*`) }, { quoted: fq });
                }
                await updateSetting('multiprefix', false);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.sendMessage(m.chat, { text: fmt(`Multi-prefix: *OFF 🧊* — single prefix only: *${settings.prefix || '.'}*`) }, { quoted: fq });
            }

                        const _devMode = await getDeviceMode();
            if (_devMode === 'ios') {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                await client.sendMessage(m.chat, { text: fmt(`Multi-prefix: *${isEnabled ? 'ON 🔥' : 'OFF 🧊'}*\n├ When ON: . ! / # all trigger commands.\n├ When OFF: only *${settings.prefix || '.'}* works.`) }, { quoted: fq });
            } else {
    const _multiprefixMsg = generateWAMessageFromContent(
                    m.chat,
                    {
                        interactiveMessage: {
                            body: { text: fmt(`Multi-prefix: *${isEnabled ? 'ON 🔥' : 'OFF 🧊'}*\n├ When ON: . ! / # all trigger commands.\n├ When OFF: only *${settings.prefix || '.'}* works.`) },
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
                    },
                    { quoted: fq }
                );
                await client.relayMessage(m.chat, _multiprefixMsg.message, { messageId: _multiprefixMsg.key.id });
            }
        } catch (err) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await client.sendMessage(m.chat, { text: fmt(`Exploded. 💀 Error: ${err.message}`) }, { quoted: fq });
        }
    });
};
