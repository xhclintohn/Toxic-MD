import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const fmtMsg = (msg) =>
      `╭─❏ 「 AUTOLIKE」
│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const settings = await getSettings();
      const value = args[0]?.toLowerCase();

      const _ON  = new Set(['on','enable','enabled','activate','activated','true','1','yes','start']);
          const _OFF = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);
        if (_ON.has(value) || _OFF.has(value)) {
        const newValue = value === 'on';

        if (settings.autolike === newValue) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return await client.sendMessage(m.chat, { text: fmtMsg(`Autolike is already ${value.toUpperCase()}, you brain-dead fool!`) });
        }

        await updateSetting('autolike', newValue);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(m.chat, {
          text: fmtMsg(`Autolike ${value.toUpperCase()}! ${value === 'on' ? 'Bot will now like statuses!' : 'Bot will ignore statuses like they ignore you.'}`)
        });
      }

      const isAutolikeOn = settings.autolike === true;
      const currentEmoji = settings.autolikeemoji || 'random';
      const statusText = isAutolikeOn
        ? `ON (${currentEmoji === 'random' ? 'Random emojis' : currentEmoji + ' emoji'})`
        : 'OFF';

          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 AUTOLIKE」
│ Status: ${settings.autolike ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}autolike on\n│ ${prefix}autolike off\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      console.error('Autolike command error:', error);
      await client.sendMessage(m.chat, {
        text: fmtMsg('Failed to update autolike. Database might be drunk.')
      });
    }
  });
};
