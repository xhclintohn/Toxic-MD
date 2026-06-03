import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import axios from 'axios';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
  name: 'stickersearch',
  aliases: ['ss', 'stick', 'stickers'],
  description: 'Fetches GIF stickers from Tenor with your search term',
  run: async (context) => {
    const { client, m, text, botname } = context;
    const fq = getFakeQuoted(m);

    if (!botname) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return m.reply(`╭───(    TOXIC-MD    )───\n├ \n├ Bot name not set. Check config.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return m.reply(`╭───(    TOXIC-MD    )───\n├ \n├ Give me a search term.\n├ Example: .s dancing cat\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    try {
      const tenorApiKey = 'AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c';
      const gifResponse = await axios.get(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(text)}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`
      );

      const results = gifResponse.data.results;
      if (!results || results.length === 0) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply(`╭───(    TOXIC-MD    )───\n├ \n├ No stickers found for "${text}".\n├ Try a different search term.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }

      for (let i = 0; i < Math.min(8, results.length); i++) {
        const gifUrl = results[i].media_formats.gif.url;
        const stickerMess = new Sticker(gifUrl, {
          pack: botname,
          author: '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧',
          type: StickerTypes.FULL,
          categories: ['🤩', '🎉'],
          id: `12345-${i}`,
          quality: 60,
          background: 'transparent'
        });
        const stickerBuffer = await stickerMess.toBuffer();
        await client.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: fq });
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

    } catch (error) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      console.error(`Stickersearch error: ${error.message}`);
      await m.reply(`╭───(    TOXIC-MD    )───\n├ \n├ Failed to fetch stickers.\n├ Service might be down. Try again.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
  }
};
