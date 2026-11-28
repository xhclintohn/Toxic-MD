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
        `╭─❏ 「 Gʀᴏᴜᴘ Lɪɴᴋ」\n` +
        `│ \n` +
        `│ ${link}\n` +
        `│ \n` +
        `│ Here's your precious link.\n` +
        `│ Copy it and stop bugging me.\n` +
        `╰───────────────\n` +
        `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

      let sent = false;
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
          },
          { userJid: client.user?.id }
        );
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        sent = true;
      } catch {}
      if (!sent) {
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await sendInteractive(client, m, bodyText);
      }
    } catch {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」\n│ Couldn't fetch the link.\n│ Either make me admin or quit.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
  });
};
