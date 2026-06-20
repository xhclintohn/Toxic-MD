import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
  name: 'autoai',
  aliases: ['groqai', 'aibot', 'autogpt'],
  description: 'Toggle Auto AI replies — responds to all DMs and when mentioned or replied to in groups',
  run: async (context) => {
    await ownerMiddleware(context, async () => {
      const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      const fmt = (title, lines) => {
        const body = (Array.isArray(lines) ? lines : [lines]).map(l => `│ ${l}`).join('\n');
        return `╭─❏ 「 ${title}」
│
${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
      };

      try {
        const settings = await getSettings();
        const value = (args[0] || '').toLowerCase();

        if (value === 'on' || value === 'off') {
          const newState = value === 'on';
          if (settings.autoai === newState) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return client.sendMessage(m.chat, { text: fmt('AUTO AI', `already ${value.toUpperCase()} 🙄 stop pressing buttons`) });
          }
          await updateSetting('autoai', newState);
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          return client.sendMessage(m.chat, {
            text: fmt('AUTO AI', newState
              ? ['Status: ✅ ON', 'Replies to all DMs + @mentions in groups.', 'God help them 😒']
              : ['Status: ❌ OFF', 'Silent mode. Finally.'])
          });
        }

        const isOn = settings.autoai === true || settings.autoai === 'true';

          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 AUTOAI」
│ Status: ${settings.autoai ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}autoai on\n│ ${prefix}autoai off\n╰───────────────\n> 🌐 hosting.toxicx.tech`);

      } catch {
        client.sendMessage(m.chat, { text: fmt('AUTO AI', 'something broke. try again.') });
      }
    });
  }
};
