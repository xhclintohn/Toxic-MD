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
          { text: formatStylishReply('AUTOVIEW', 'Database is down, no settings found. Fix it, loser.') },
          { quoted: fq, ad: true }
        );
      }

      const value = args[0]?.toLowerCase();
      const validOptions = ['on', 'off'];

      if (validOptions.includes(value)) {
        const newState = value === 'on';
        if (settings.autoview === newState) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply('AUTOVIEW', `Autoview Status is already ${value.toUpperCase()}, you brainless fool! Stop wasting my time!\n├ \n├ 📌 Usage: ${prefix}autoview on | ${prefix}autoview off`) },
            { quoted: fq, ad: true }
          );
        }

        await updateSetting('autoview', newState);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply('AUTOVIEW', `Autoview Status ${value.toUpperCase()}! ${newState ? 'I\'ll view every status like a king!' : 'I\'m done with your boring statuses.'}\n├ \n├ 📌 Usage: ${prefix}autoview on | ${prefix}autoview off`) },
          { quoted: fq, ad: true }
        );
      }

            const _devMode = await getDeviceMode();
      if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { text: formatStylishReply('AUTOVIEW', `Autoview Status: ${settings.autoview ? 'ON ✅' : 'OFF ❌'}. Pick a vibe, noob!\n├ \n├ 📌 Usage: ${prefix}autoview on | ${prefix}autoview off`) }, { quoted: fq });
      } else {
    const _msg = generateWAMessageFromContent(
            m.chat,
            {
                interactiveMessage: {
                    body: { text: formatStylishReply('AUTOVIEW', `Autoview Status: ${settings.autoview ? 'ON ✅' : 'OFF ❌'}. Pick a vibe, noob!\n├ \n├ 📌 Usage: ${prefix}autoview on | ${prefix}autoview off`) },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Choose an option',
                                    sections: [{
                                        rows: [
                                                                                                    { title: 'ON ✅', id: `${prefix}autoview on` },
                                                            { title: 'OFF ❌', id: `${prefix}autoview off` }
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
        { text: formatStylishReply('AUTOVIEW', 'Something broke, couldn\'t update Autoview. Database is probably drunk. Try later.') },
        { quoted: fq, ad: true }
      );
    }
  });
};
