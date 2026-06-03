import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getSettings, getGroupSettings, updateGroupSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getDeviceMode } from '../../lib/deviceMode.js';

export default async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
    const jid = m.chat;

    const formatStylishReply = (message) => {
      return `╭───(    TOXIC-MD    )───\n├ ${message}\n╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    };

    try {
      if (!jid.endsWith('@g.us')) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Yo, dumbass! 😈 This command only works in groups, not your sad DMs. 🖕") },
          { quoted: fq, ad: true }
        );
      }

      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Database is fucked, no settings found. Fix it, loser. 💀") },
          { quoted: fq, ad: true }
        );
      }

      const value = args[0]?.toLowerCase();
      let groupSettings = await getGroupSettings(jid);
      console.log('Toxic-MD: Group settings for', jid, ':', groupSettings);
      let isEnabled = groupSettings?.events === true || groupSettings?.events === 1;

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (isEnabled === action) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});

          return await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `Yo, genius! 😈 Events are already ${value.toUpperCase()} in this group! Stop wasting my time, moron. 🖕`
              ),
            },
            { quoted: fq, ad: true }
          );
        }

        await updateGroupSetting(jid, 'events', action);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Events ${value.toUpperCase()}! 🔥 ${action ? 'Group events are live, let’s make some chaos! 💥' : 'Events off, you boring loser. 😴'}`
            ),
          },
          { quoted: fq, ad: true }
        );
      }

            const _devMode = await getDeviceMode();
      if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { text: formatStylishReply(
            `Events Status: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}. Pick a vibe, noob! 😈`
          ) }, { quoted: fq });
      } else {
    const _msg = generateWAMessageFromContent(
            m.chat,
            {
                interactiveMessage: {
                    body: { text: formatStylishReply(
                `Events Status: ${isEnabled ? 'ON 🥶' : 'OFF 😴'}. Pick a vibe, noob! 😈`
              ) },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Choose an option',
                                    sections: [{
                                        rows: [
                                                                                                    { title: 'ON ✅', id: `${prefix}events on` },
                                                            { title: 'OFF ❌', id: `${prefix}events off` }
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
      console.error('Toxic-MD: Error in events.js:', error.stack);
      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Shit broke, couldn’t update events. Database error: ${error.message}. Try later, moron. 💀`
          ),
        },
        { quoted: fq, ad: true }
      );
    }
  });
};