import { getFakeQuoted } from '../../lib/fakeQuoted.js';
  import axios from 'axios';
export default async (context) => {
  const { client, m, text } = context;
  const fq = getFakeQuoted(m);
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

  if (!text) {
    m.reply(
      "╭───(    TOXIC-MD    )───\n" +
      "├ ERROR\n" +
      "╭───(    TOXIC-MD    )───\n" +
      "│ 🚫 Please provide a search term!\n" +
      "├ Example: .google What is treason\n" +
      "╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧"
    );
    return;
  }

  try {
    let { data } = await axios.get(
      `https://www.googleapis.com/customsearch/v1?q=${text}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`
    );

    if (data.items.length == 0) {
      m.reply(
        "╭───(    TOXIC-MD    )───\n" +
        "├ ERROR\n" +
        "╭───(    TOXIC-MD    )───\n" +
        "│ ❌ Unable to find any results\n" +
        "╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧"
      );
      return;
    }

    let tex = "";
    tex += "╭───(    TOXIC-MD    )───\n";
    tex += "├ GOOGLE SEARCH\n";
    tex += "╭───(    TOXIC-MD    )───\n";
    tex += "│ 🔍 Search Term: " + text + "\n";
    tex += "╭───(    TOXIC-MD    )───\n";

    for (let i = 0; i < data.items.length; i++) {
      tex += "├ Result " + (i + 1) + "\n";
      tex += "│ 🪧 Title: " + data.items[i].title + "\n";
      tex += "│ 📝 Description: " + data.items[i].snippet + "\n";
      tex += "│ 🌐 Link: " + data.items[i].link + "\n";
      tex += "╭───(    TOXIC-MD    )───\n";
    }

    m.reply(tex);
  } catch (e) {
    m.reply(
      "╭───(    TOXIC-MD    )───\n" +
      "├ ERROR\n" +
      "╭───(    TOXIC-MD    )───\n" +
      "│ ❌ An error occurred: " + e.message + "\n" +
      "╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧"
    );
  }
};