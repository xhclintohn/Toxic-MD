import { sendInteractive } from '../../lib/sendInteractive.js';
import { searchWeb } from '../../lib/googleImages.js';

export default async (context) => {
  const { client, m, text } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m,
      "╭─❏ 「 USAGE 」\n│ 🚫 Please provide a search term!\n│ Example: .google What is treason\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧"
    );
  }

  try {
    const items = await searchWeb(text, 5);

    let tex = "";
    tex += "╭─❏ 「 GOOGLE SEARCH 」\n";
    tex += "│ 🔍 Search Term: " + text + "\n";

    for (let i = 0; i < items.length; i++) {
      tex += "│ Result " + (i + 1) + "\n";
      tex += "│ 🪧 Title: " + items[i].title + "\n";
      tex += "│ 📝 Description: " + (items[i].snippet || '-') + "\n";
      tex += "│ 🌐 Link: " + items[i].link + "\n";
    }
    tex += "╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧";

    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, tex);
  } catch (e) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m,
      "╭─❏ 「 ERROR 」\n│ ❌ An error occurred: " + e.message + "\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧"
    );
  }
};
