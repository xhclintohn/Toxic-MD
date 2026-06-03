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

    const fmtMsg = (msg) => `╭───(    TOXIC-MD    )───\n├ ${msg}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const settings = await getSettings();
      const newEmoji = args[0];
      const currentEmoji = settings.autolikeemoji || 'random';

      if (newEmoji) {
        if (newEmoji === 'random') {
          if (currentEmoji === 'random') {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: fmtMsg('Already using random emojis, you brain-dead fool!') }, { quoted: fq });
          }
          await updateSetting('autolikeemoji', 'random');
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          return await client.sendMessage(m.chat, { text: fmtMsg('Reaction emoji set to random! Happy now?') }, { quoted: fq });
        } else {
          if (currentEmoji === newEmoji) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: fmtMsg(`Already using ${newEmoji} emoji, moron!`) }, { quoted: fq });
          }
          await updateSetting('autolikeemoji', newEmoji);
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          return await client.sendMessage(m.chat, { text: fmtMsg(`Reaction emoji set to ${newEmoji}!`) }, { quoted: fq });
        }
      }

      const currentText = currentEmoji === 'random' ? 'Random emojis' : `${currentEmoji} emoji`;

            const _devMode = await getDeviceMode();
      if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { text: fmtMsg(`REACTION SETTINGS\n├ Current: ${currentText}\n├ \n├ Use "${prefix}reaction random" for random\n├ Use "${prefix}reaction <emoji>" for specific`) }, { quoted: fq });
      } else {
    const _msg = generateWAMessageFromContent(
            m.chat,
            {
              interactiveMessage: {
                body: { text: fmtMsg(`REACTION SETTINGS\n├ Current: ${currentText}\n├ \n├ Use "${prefix}reaction random" for random\n├ Use "${prefix}reaction <emoji>" for specific`) },
                footer: { text: '' },
                nativeFlowMessage: {
                  buttons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                      title: 'Choose reaction emoji',
                      sections: [{
                        rows: [
                          { title: 'RANDOM 🎲', id: `${prefix}reaction random` },
                          { title: 'LOVE ❤️', id: `${prefix}reaction ❤️` },
                          { title: 'FIRE 🔥', id: `${prefix}reaction 🔥` },
                          { title: 'LAUGH 😂', id: `${prefix}reaction 😂` }
                        ]
                      }]
                    })
                  }]
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
      console.error('Reaction command error:', error);
      await client.sendMessage(m.chat, { text: fmtMsg("Failed to update reaction settings. Something's broken.") }, { quoted: fq });
    }
  });
};
