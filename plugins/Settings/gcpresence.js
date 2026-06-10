import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (message) => `│ ${message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const value = args[0]?.toLowerCase();
        const jid = m.chat;

        let groupSettings = {};
        let isEnabled = false;

        if (jid.endsWith('@g.us')) {
            groupSettings = await getGroupSettings(jid);
            isEnabled = groupSettings.gcpresence === true;
        }

        if (value === 'on' || value === 'off') {
            const action = value === 'on';

            if (isEnabled === action) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: fmt(`GCPresence already ${value.toUpperCase()}`) });
            }

            if (jid.endsWith('@g.us')) {
                await updateGroupSetting(jid, 'gcpresence', action);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.sendMessage(m.chat, { text: fmt(`Group GCPresence: ${value.toUpperCase()}`) });
            } else {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: fmt('DMs: GCPresence always ON') });
            }
        }

        const status = jid.endsWith('@g.us') ? (isEnabled ? '✅ ON' : '❌ OFF') : '✅ ON (DMs always active)';

                const _devMode = await getDeviceMode();
        if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 GCPRESENCE」
│ Status: ${settings.gcpresence ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}gcpresence on\n│ ${prefix}gcpresence off\n╰───────────────\n> 🌐 hosting.toxicx.tech`);
      } else {
    const _msg = generateWAMessageFromContent(
                jid,
                {
                    interactiveMessage: {
                        body: { text: fmt(`GCPresence Settings\n│ Status: ${status}\n│ \n│ Group: Fake typing/recording indicator\n│ DMs: Always enabled`) },
                        footer: { text: '' },
                        nativeFlowMessage: {
                            buttons: [{
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Choose an option',
                                    sections: [{
                                        rows: [
                                            { title: 'ON ✅', id: `${prefix}gcpresence on` },
                                            { title: 'OFF ❌', id: `${prefix}gcpresence off` }
                                        ]
                                    }]
                                })
                            }]
                        }
                    }
                }
            );
            await client.relayMessage(jid, _msg.message, { messageId: _msg.key.id });
        }
    });
};
