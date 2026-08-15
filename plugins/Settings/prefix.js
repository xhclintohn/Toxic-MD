import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args } = context;
    const newPrefix = args[0];

    const settings = await getSettings();

    if (newPrefix === 'null') {
      if (!settings.prefix) {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await sendInteractive(client, m, 
          `` +
          `╭─❏ 「 PREFIX 」
│ Already prefixless, you clueless twit! 😈\n` +
          `╭─❏ 「 PREFIX 」
│ Stop wasting my time! 🖕\n` +
          `╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        );
      }
      await updateSetting('prefix', '');
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      await sendInteractive(client, m, 
        `` +
        `╭─❏ 「 PREFIX 」
│ Prefix obliterated! 🔥\n` +
        `╭─❏ 「 PREFIX 」
│ I’m prefixless now, bow down! 😈\n` +
        `╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      );
    } else if (newPrefix) {
      if (settings.prefix === newPrefix) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await sendInteractive(client, m, 
          `` +
          `╭─❏ 「 PREFIX 」
│ Prefix is already ${newPrefix}, moron! 😈\n` +
          `╭─❏ 「 PREFIX 」
│ Try something new, fool! 🥶\n` +
          `╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        );
      }
      await updateSetting('prefix', newPrefix);
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      await sendInteractive(client, m, 
        `` +
        `╭─❏ 「 PREFIX 」
│ New prefix set to ${newPrefix}! 🔥\n` +
        `╭─❏ 「 PREFIX 」
│ Obey the new order, king! 😈\n` +
        `╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      );
    } else {
      await sendInteractive(client, m, 
        `` +
        `╭─❏ 「 PREFIX 」
│ Current Prefix: ${settings.prefix || 'No prefix, peasant! 🥶'}\n` +
        `╭─❏ 「 PREFIX 」
│ Use "${settings.prefix || '.'}prefix null" to go prefixless or "${settings.prefix || '.'}prefix <symbol>" to set one, noob!\n` +
        `╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      );
    }
  });
};