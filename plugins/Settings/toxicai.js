import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getSettings, updateSetting } from '../../database/config.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const DEV_NUMBER = '254114885159';

export default {
    name: 'toxicai',
    aliases: ['devai', 'toxicagent'],
    description: 'Toggle ToxicAgent GitHub AI (dev only)',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const senderNum = (m.sender || '').split('@')[0].split(':')[0];
        const fmt = (title, lines) => {
            const body = (Array.isArray(lines) ? lines : [lines]).map(l => `│ ${l}`).join('\n');
            return `╭─❏ 「 ${title}」
│
${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        };

        if (senderNum !== DEV_NUMBER) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return client.sendMessage(m.chat, {
                text: fmt('TOXICAGENT', ['Access denied.', 'Dev-only feature. Not your toy.'])
            });
        }

        try {
            const settings = await getSettings();
            const value = (args[0] || '').toLowerCase();

            if (value === 'on' || value === 'off') {
                const newState = value === 'on';
                await updateSetting('toxicagent', newState);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return client.sendMessage(m.chat, {
                    text: fmt('TOXICAGENT', newState
                        ? ['Status: ✅ ON', 'GitHub AI agent active. Just text me GitHub tasks.']
                        : ['Status: ❌ OFF', 'GitHub AI disabled.'])
                });
            }

            const isOn = settings.toxicagent === true || settings.toxicagent === 'true';

          await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 TOXICAI」
│ Status: ${settings.toxicai ? 'ON ✅' : 'OFF ❌'}\n│ \n│ Options:\n│ ${prefix}toxicai on\n│ ${prefix}toxicai off\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

        } catch {
            client.sendMessage(m.chat, { text: fmt('TOXICAGENT', 'something broke. try again.') });
        }
    }
};
