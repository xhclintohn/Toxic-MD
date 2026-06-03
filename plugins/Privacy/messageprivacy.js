import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getDeviceMode } from '../../lib/deviceMode.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭───(    TOXIC-MD    )───\n├───≫ MESSAGE PRIVACY ≪───\n├ \n├ ${msg}\n╰──────────────────☉\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        const options = ['all', 'contacts', 'contact_blacklist', 'none'];
        const value = (args[0] || '').toLowerCase();

        if (options.includes(value)) {
            try {
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                await client.updateMessagesPrivacy(value);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return m.reply(fmt(`Message privacy updated to: *${value}*`));
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return m.reply(fmt(`Failed: ${e.message?.slice(0, 60)}`));
            }
        }

                const _devMode = await getDeviceMode();
        if (_devMode === 'ios') {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await client.sendMessage(m.chat, { text: fmt('Who can message you?\nSelect an option below.') }, { quoted: fq });
        } else {
    const _msg = generateWAMessageFromContent(m.chat, {
                interactiveMessage: {
                    body: { text: fmt('Who can message you?\nSelect an option below.') },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [{
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: 'Set Message Privacy',
                                sections: [{
                                    rows: [
                                        { title: 'All ✅', description: 'Anyone can message you', id: `${prefix}messageprivacy all` },
                                        { title: 'Contacts 👥', description: 'Only contacts can message', id: `${prefix}messageprivacy contacts` },
                                        { title: 'Blacklist 🚫', description: 'Contact blacklist only', id: `${prefix}messageprivacy contact_blacklist` },
                                        { title: 'None ❌', description: 'Nobody can message you', id: `${prefix}messageprivacy none` }
                                    ]
                                }]
                            })
                        }]
                    }
                }
            }, { quoted: fq });
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

            await client.relayMessage(m.chat, _msg.message, { messageId: _msg.key.id });
        }
    });
};
