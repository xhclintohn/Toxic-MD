import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
  name: 'dev',
  aliases: ['developer', 'contact', 'owner', 'creator', 'devcontact'],
  description: 'Shows developer info with interactive contact card',
  run: async (context) => {
    const { client, m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const devPhone = '254114885159';
    const devName = 'xh_clinton | Toxic Dev';
    const devOrg = 'Toxic-MD Bot';
    const githubUrl = 'https://github.com/xhclintohn/Toxic-MD';
    const waUrl = `https://wa.me/${devPhone}`;

    const bodyText = `╭─❏ 「 DEVELOPER INFO」\n│ 👤 Name: ${devName}\n│ 🏢 Project: ${devOrg}\n│ 📞 Contact: +${devPhone}\n│ \n│ Don't spam the dev or you'll regret your existence.\n│ Serious bugs only — no "how do I use this" questions.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const interactiveMsg = generateWAMessageFromContent(
        m.chat,
        {
          interactiveMessage: {
            body: { text: bodyText },
            footer: { text: '' },
            nativeFlowMessage: {
              messageVersion: 1,
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: '⭐ Star on GitHub',
                    url: githubUrl,
                    merchant_url: githubUrl
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📞 WhatsApp Dev',
                    url: waUrl,
                    merchant_url: waUrl
                  })
                },
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📋 Copy Number',
                    copy_code: '+' + devPhone
                  })
                }
              ]
            }
          }
        },
        { userJid: client.user.id }
      );

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      await client.relayMessage(m.chat, interactiveMsg.message, { messageId: interactiveMsg.key.id });

      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${devName}\nORG:${devOrg};\nTEL;type=CELL;type=VOICE;waid=${devPhone}:+${devPhone}\nEND:VCARD`;
      await client.sendMessage(m.chat, {
        contacts: {
          displayName: devName,
          contacts: [{ vcard }]
        }
      });

    } catch (error) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${devName}\nORG:${devOrg};\nTEL;type=CELL;type=VOICE;waid=${devPhone}:+${devPhone}\nEND:VCARD`;
      await sendInteractive(client, m, bodyText);
      await client.sendMessage(m.chat, { contacts: { displayName: devName, contacts: [{ vcard }] } });
    }
  }
};
