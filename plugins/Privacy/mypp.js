import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getDeviceMode } from '../../lib/deviceMode.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭───(    TOXIC-MD    )───\n├───≫ PROFILE PIC ≪───\n├ \n├ ${msg}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        const options = ['all', 'contacts', 'contact_blacklist', 'none'];
        const value = (args[0] || '').toLowerCase();

        if (options.includes(value)) {
            try {
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                await client.updateProfilePicturePrivacy(value);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return m.reply(fmt(`Profile pic privacy updated to: *${value}*`));
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return m.reply(fmt(`Failed: ${e.message?.slice(0, 60)}`));
            }
        }

                const _devMode = await getDeviceMode();
        if (_devMode === 'ios') {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await client.sendMessage(m.chat, { text: fmt('Who can see your profile picture?\nSelect an option below.') }, { quoted: fq });
        } else {
    const _msg = generateWAMessageFromContent(m.chat, {
                interactiveMessage: {
                    body: { text: fmt('Who can see your profile picture?\nSelect an option below.') },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [{
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: 'Set Profile Pic Privacy',
                                sections: [{
                                    rows: [
                                        { title: 'All ✅', description: 'Everyone sees your pic', id: `${prefix}mypp all` },
                                        { title: 'Contacts 👥', description: 'Only contacts see it', id: `${prefix}mypp contacts` },
                                        { title: 'Blacklist 🚫', description: 'Contact blacklist only', id: `${prefix}mypp contact_blacklist` },
                                        { title: 'None ❌', description: 'Nobody sees your pic', id: `${prefix}mypp none` }
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
