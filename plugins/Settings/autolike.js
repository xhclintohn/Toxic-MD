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

    const fmtMsg = (msg) =>
      `╭───(    TOXIC-MD    )───\n├───≫ AUTOLIKE ≪───\n├ \n├ ${msg}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const settings = await getSettings();
      const value = args[0]?.toLowerCase();

      if (value === 'on' || value === 'off') {
        const newValue = value === 'on';

        if (settings.autolike === newValue) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return await client.sendMessage(m.chat, { text: fmtMsg(`Autolike is already ${value.toUpperCase()}, you brain-dead fool!`) }, { quoted: fq });
        }

        await updateSetting('autolike', newValue);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(m.chat, {
          text: fmtMsg(`Autolike ${value.toUpperCase()}! ${value === 'on' ? 'Bot will now like statuses!' : 'Bot will ignore statuses like they ignore you.'}`)
        }, { quoted: fq });
      }

      const isAutolikeOn = settings.autolike === true;
      const currentEmoji = settings.autolikeemoji || 'random';
      const statusText = isAutolikeOn
        ? `ON (${currentEmoji === 'random' ? 'Random emojis' : currentEmoji + ' emoji'})`
        : 'OFF';

            const _devMode = await getDeviceMode();
      if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { text: fmtMsg(`Current: ${statusText}\n├ \n├ Use "${prefix}reaction <emoji>" to change emoji`) }, { quoted: fq });
      } else {
    const _msg = generateWAMessageFromContent(
            m.chat,
            {
              interactiveMessage: {
                body: { text: fmtMsg(`Current: ${statusText}\n├ \n├ Use "${prefix}reaction <emoji>" to change emoji`) },
                footer: { text: '' },
                nativeFlowMessage: {
                  buttons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                      title: 'Choose an option',
                      sections: [{
                        rows: [
                          { title: 'ON ✅', id: `${prefix}autolike on` },
                          { title: 'OFF ❌', id: `${prefix}autolike off` }
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
      console.error('Autolike command error:', error);
      await client.sendMessage(m.chat, {
        text: fmtMsg('Failed to update autolike. Database might be drunk.')
      }, { quoted: fq });
    }
  });
};
