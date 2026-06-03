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
          { text: formatStylishReply("ANTICALL", "Database is fucked, no settings found. Fix it, loser.") },
          { quoted: fq, ad: true }
        );
      }

      const value = args.join(" ").toLowerCase();
      const isEnabled = settings.anticall === true;

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (isEnabled === action) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});

          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply("ANTICALL", `Yo, genius! Anticall is already ${value.toUpperCase()}! Stop wasting my time, moron.\n├ \n├ 📌 Usage: ${prefix}anticall on | ${prefix}anticall off`) },
            { quoted: fq, ad: true }
          );
        }

        await updateSetting('anticall', action);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("ANTICALL", `Anticall ${value.toUpperCase()}! Callers will get wrecked!\n├ \n├ 📌 Usage: ${prefix}anticall on | ${prefix}anticall off`) },
          { quoted: fq, ad: true }
        );
      }

            const _devMode = await getDeviceMode();
      if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { text: formatStylishReply("ANTICALL", `Anticall Status: ${isEnabled ? 'ON' : 'OFF'}. Pick a vibe, noob!\n├ \n├ 📌 Usage: ${prefix}anticall on | ${prefix}anticall off`) }, { quoted: fq });
      } else {
    const _msg = generateWAMessageFromContent(
            m.chat,
            {
                interactiveMessage: {
                    body: { text: formatStylishReply("ANTICALL", `Anticall Status: ${isEnabled ? 'ON' : 'OFF'}. Pick a vibe, noob!\n├ \n├ 📌 Usage: ${prefix}anticall on | ${prefix}anticall off`) },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Choose an option',
                                    sections: [{
                                        rows: [
                                                                                                    { title: 'ON ✅', id: `${prefix}anticall on` },
                                                            { title: 'OFF ❌', id: `${prefix}anticall off` }
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
        { text: formatStylishReply("ANTICALL", "Shit broke, couldn't update anticall. Database or something's fucked. Try later.") },
        { quoted: fq, ad: true }
      );
    }
  });
};
