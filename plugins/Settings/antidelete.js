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

    const formatStylishReply = (title, message) => {
      return `╭───(    TOXIC-MD    )───\n├───≫ ${title} ≪───\n├ \n├ ${message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("ANTIDELETE", "Database is fucked, no settings found. Fix it, loser.") },
          { quoted: fq, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (settings.antidelete === action) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});

          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply("ANTIDELETE", `Antidelete's already ${value.toUpperCase()}, you brain-dead fool! Stop wasting my time.\n├ \n├ 📌 Usage: ${prefix}antidelete on | ${prefix}antidelete off`) },
            { quoted: fq, ad: true }
          );
        }

        await updateSetting('antidelete', action);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("ANTIDELETE", `Antidelete ${value.toUpperCase()} activated! ${action ? 'No one\'s erasing shit on my watch, king!' : 'Deletions are free to slide, you\'re not worth catching.'}\n├ \n├ 📌 Usage: ${prefix}antidelete on | ${prefix}antidelete off`) },
          { quoted: fq, ad: true }
        );
      }

            const _devMode = await getDeviceMode();
      if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { text: formatStylishReply("ANTIDELETE", `Antidelete's ${settings.antidelete ? 'ON' : 'OFF'}, dumbass. Pick a vibe, noob!\n├ \n├ 📌 Usage: ${prefix}antidelete on | ${prefix}antidelete off`) }, { quoted: fq });
      } else {
    const _msg = generateWAMessageFromContent(
            m.chat,
            {
                interactiveMessage: {
                    body: { text: formatStylishReply("ANTIDELETE", `Antidelete's ${settings.antidelete ? 'ON' : 'OFF'}, dumbass. Pick a vibe, noob!\n├ \n├ 📌 Usage: ${prefix}antidelete on | ${prefix}antidelete off`) },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Choose an option',
                                    sections: [{
                                        rows: [
                                                                                                    { title: 'ON ✅', id: `${prefix}antidelete on` },
                                                            { title: 'OFF ❌', id: `${prefix}antidelete off` }
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
        { text: formatStylishReply("ANTIDELETE", "Shit broke, couldn't mess with antidelete. Database or something's fucked. Try later.") },
        { quoted: fq, ad: true }
      );
    }
  });
};
