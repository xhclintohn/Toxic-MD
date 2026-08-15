import axios from 'axios';
import { sendInteractive } from '../../lib/sendInteractive.js';
export default async (context) => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });


  const link = "https://api.jikan.moe/v4/random/anime";

  try {
    const response = await axios.get(link);
    const data = response.data.data;

    const title = data.title;
    const synopsis = data.synopsis;
    const imageUrl = data.images.jpg.image_url;
    const episodes = data.episodes;
    const status = data.status;

    const message = `╭─❏ 「 Rᴀɴᴅᴏᴍ Aɴɪᴍᴇ」
│ Title: ${title}
│ Episodes: ${episodes}
│ Status: ${status}
│ Synopsis: ${synopsis}
│ URL: ${data.url}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
    await client.sendMessage(m.chat, { image: { url: imageUrl }, caption: message });
  } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
   sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ An error occurred fetching anime.\n│ Try again, weeb.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }

}
