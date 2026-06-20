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

      const value = args.join(" ").toLowerCase();

      if (value === 'on' || value === 'off') {
        const action = value === 'on';
        if (settings.autoread === action) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});

          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply("AUTOREAD", `Autoread message already ${value.toUpperCase()}, genius. Stop wasting my time.\n│ \n│ 📌 Usage: ${prefix}autoread on | ${prefix}autoread off`) },
            { ad: true }
          );
        }

        await updateSetting('autoread', action);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("AUTOREAD", `Autoread ${value.toUpperCase()} activated! ${action ? 'Bot\'s reading every message like a creep.' : 'No more spying on your trash messages.'}\n│ \n│ 📌 Usage: ${prefix}autoread on | ${prefix}autoread off`) },
          { ad: true }
        );
      }

          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 AUTOREAD」
│ Status: ${settings.autoread ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}autoread on\n│ ${prefix}autoread off\n╰───────────────`);

    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("AUTOREAD", "Shit broke, couldn't mess with autoread. Database or something's fucked. Try later.") },
        { ad: true }
      );
    }
  });
};
