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

      const _ON  = new Set(['on','enable','enabled','activate','activated','true','1','yes','start']);
          const _OFF = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);
        if (_ON.has(value) || _OFF.has(value)) {
        const action = _ON.has(value);
        if (settings.antidelete === action) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});

          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply("ANTIDELETE", `Antidelete's already ${value.toUpperCase()}, you brain-dead fool! Stop wasting my time.\n│ \n│ 📌 Usage: ${prefix}antidelete on | ${prefix}antidelete off`) },
            { ad: true }
          );
        }

        await updateSetting('antidelete', action);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("ANTIDELETE", `Antidelete ${value.toUpperCase()} activated! ${action ? 'No one\'s erasing shit on my watch, king!' : 'Deletions are free to slide, you\'re not worth catching.'}\n│ \n│ 📌 Usage: ${prefix}antidelete on | ${prefix}antidelete off`) },
          { ad: true }
        );
      }

          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 ANTIDELETE」
│ Status: ${settings.antidelete ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}antidelete on\n│ ${prefix}antidelete off\n╰───────────────`);

    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("ANTIDELETE", "Shit broke, couldn't mess with antidelete. Database or something's fucked. Try later.") },
        { ad: true }
      );
    }
  });
};
