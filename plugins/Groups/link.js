import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import linkMiddleware from '../../utils/botUtil/linkMiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
  await linkMiddleware(context, async () => {
    const { client, m } = context;

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
    try {
      const code = await client.groupInviteCode(m.chat);
      const link = `https://chat.whatsapp.com/${code}`;

      const bodyText =
        `` +
        `╭─❏ 「 Gʀᴏᴜᴘ Lɪɴᴋ」
` +
        `│ \n` +
        `│ ${link}\n` +
        `│ \n` +
        `│ Here's your precious link.\n` +
        `│ Copy it and stop bugging me.\n` +
        `╰───────────────\n` +
        `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

      try {
        const msg = generateWAMessageFromContent(
          m.chat,
          {
            interactiveMessage: {
              body: { text: bodyText },
              footer: { text: '' },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                      display_text: 'Copy Link',
                      copy_code: link
                    })
                  }
                ]
              }
            }
          }
        );
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      } catch {
        await sendInteractive(client, m, bodyText);
      }

      await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });
    } catch {
      await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });
      await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Couldn't fetch the link.\n│ Either make me admin or quit.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫᠊ᴇᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
  });
};
