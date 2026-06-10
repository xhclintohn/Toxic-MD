import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 CALL PRIVACY」
│ ${msg}\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        const options = ['all', 'known', 'none'];
        const value = (args[0] || '').toLowerCase();

        if (options.includes(value)) {
            try {
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                await client.updateCallPrivacy(value);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return m.reply(fmt(`Call privacy set to: *${value}*`));
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return m.reply(fmt(`Failed: ${e.message?.slice(0, 60)}`));
            }
        }

                const _devMode = await getDeviceMode();
        if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 CALLPRIVACY」
│ Status: ${isEnabled !== undefined ? (isEnabled ? 'ON ✅' : 'OFF ❌') : settings.callprivacy !== undefined ? (settings.callprivacy ? 'ON ✅' : 'OFF ❌') : 'See settings'}\n│ \n│ Options:\n│ ${prefix}callprivacy all\n│ ${prefix}callprivacy known\n│ ${prefix}callprivacy none\n╰───────────────\n> 🌐 hosting.toxicx.tech`);
      } else {
    const _msg = generateWAMessageFromContent(m.chat, {
                interactiveMessage: {
                    body: { text: fmt('Who can call you?\nSelect an option below.') },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [{
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: 'Set Call Privacy',
                                sections: [{
                                    rows: [
                                        { title: 'All ✅', description: 'Anyone can call you', id: `${prefix}callprivacy all` },
                                        { title: 'Known 👥', description: 'Only contacts can call', id: `${prefix}callprivacy known` },
                                        { title: 'None 🚫', description: 'Nobody can call you', id: `${prefix}callprivacy none` }
                                    ]
                                }]
                            })
                        }]
                    }
                }
            });
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

            await client.relayMessage(m.chat, _msg.message, { messageId: _msg.key.id });
        }
    });
};
