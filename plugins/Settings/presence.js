import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const formatStylishReply = (message) => {
      return `│ ${message}\n╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Database is fucked, no settings found. Fix it, loser.") },
          { ad: true }
        );
      }

      const validPresenceValues = ['online', 'offline', 'recording', 'typing'];
      const value = args.join(" ").toLowerCase();

      if (validPresenceValues.includes(value)) {
        if (settings.presence === value) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Presence is already ${value.toUpperCase()}, genius. Stop wasting my time.`) },
            { ad: true }
          );
        }

        await updateSetting('presence', value);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Presence set to ${value.toUpperCase()}. Bot’s flexing that status now!`) },
          { ad: true }
        );
      }

            const _devMode = await getDeviceMode();
      if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 PRESENCE」
│ Status: ${settings.presence ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}presence online\n│ ${prefix}presence offline\n│ ${prefix}presence recording\n│ ${prefix}presence typing\n╰───────────────\n> 🌐 hosting.toxicx.tech`);
      } else {
    const _msg = generateWAMessageFromContent(
            m.chat,
            {
              interactiveMessage: {
                body: { text: formatStylishReply(`Presence is currently *${settings.presence ? settings.presence.toUpperCase() : 'NOT SET'}*`) },
                footer: { text: '' },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: 'single_select',
                      buttonParamsJson: JSON.stringify({
                        title: 'Choose an option',
                        sections: [{
                          rows: [
                            { title: 'ONLINE 🟢', id: `${prefix}presence online` },
                            { title: 'OFFLINE ⚫', id: `${prefix}presence offline` },
                            { title: 'RECORDING 🎙️', id: `${prefix}presence recording` },
                            { title: 'TYPING ⌨️', id: `${prefix}presence typing` }
                          ]
                        }]
                      })
                    }
                  ]
                }
              }
            }
          );
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

          await client.relayMessage(m.chat, _msg.message, { messageId: _msg.key.id });
      }
    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Shit broke, couldn’t update presence. Database or something’s fucked. Try later.") },
        { ad: true }
      );
    }
  });
};