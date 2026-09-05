import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const formatStylishReply = (title, message) => {
      return `╭─❏ 「 ${title}」
│ ${message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    };

    try {
      const settings = await getSettings();

      const value = args[0]?.toLowerCase();
      const _ON = new Set(['on','enable','enabled','activate','activated','true','1','yes','start']);
          const _OFF = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);

        if (_ON.has(value) || _OFF.has(value)) {
        const newState = _ON.has(value);
        if (settings.autoview === newState) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply('AUTOVIEW', `Autoview Status is already ${value.toUpperCase()}, you brainless fool! Stop wasting my time!\n│ \n│ 📌 Usage: ${prefix}autoview on | ${prefix}autoview off`) },
            { ad: true }
          );
        }

        await updateSetting('autoview', newState);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply('AUTOVIEW', `Autoview Status ${value.toUpperCase()}! ${newState ? 'I\'ll view every status like a king!' : 'I\'m done with your boring statuses.'}\n│ \n│ 📌 Usage: ${prefix}autoview on | ${prefix}autoview off`) },
          { ad: true }
        );
      }

          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 AUTOVIEW」
│ Status: ${settings.autoview ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}autoview on\n│ ${prefix}autoview off\n╰───────────────`);

    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply('AUTOVIEW', 'Something broke, couldn\'t update Autoview. Database is probably drunk. Try later.') },
        { ad: true }
      );
    }
  });
};
