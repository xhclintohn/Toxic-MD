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

    const formatStylishReply = (message) => {
      return `╭───(    TOXIC-MD    )───\n├ ${message}\n╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Database is fucked, no settings found. Fix it, loser.") },
          { quoted: fq, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (settings.startmessage === action) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});

          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`Start message is already ${value.toUpperCase()}, you brain-dead fool! Stop wasting my time. 😈`) },
            { quoted: fq, ad: true }
          );
        }

        await updateSetting('startmessage', action);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Start message ${value.toUpperCase()} activated! 🔥 ${action ? 'Welcome messages will be sent on connection! 🎉' : 'No more annoying welcome messages, you antisocial prick! 🚫'}`) },
          { quoted: fq, ad: true }
        );
      }

            const _devMode = await getDeviceMode();
      if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { text: formatStylishReply(`Start message is ${settings.startmessage ? 'ON 🎉' : 'OFF 🚫'}, dumbass. Pick a vibe, noob! 😈`) }, { quoted: fq });
      } else {
    const _msg = generateWAMessageFromContent(
            m.chat,
            {
                interactiveMessage: {
                    body: { text: formatStylishReply(`Start message is ${settings.startmessage ? 'ON 🎉' : 'OFF 🚫'}, dumbass. Pick a vibe, noob! 😈`) },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Choose an option',
                                    sections: [{
                                        rows: [
                                                                                                    { title: 'ON ✅', id: `${prefix}startmessage on` },
                                                            { title: 'OFF ❌', id: `${prefix}startmessage off` }
                                        ]
                                    }]
                                })
                            }
                        ]
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
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Shit broke, couldn't mess with start message. Database or something's fucked. Try later.") },
        { quoted: fq, ad: true }
      );
    }
  });
};