import axios from 'axios';
import { sendInteractive } from '../../lib/sendInteractive.js';

if (!globalThis.stickerlySession) globalThis.stickerlySession = {};

async function searchStickerly(keyword) {
  try {
    const { data } = await axios.post(
      'https://api.sticker.ly/v4/stickerPack/smartSearch',
      {
        keyword,
        enabledKeywordSearch: true,
        filter: {
          extendSearchResult: false,
          sortBy: 'RECOMMENDED',
          languages: ['ALL'],
          minStickerCount: 5,
          searchBy: 'ALL',
          stickerType: 'ALL'
        }
      },
      {
        headers: {
          'User-Agent': 'androidapp.stickerly/3.31.0 (M2006C3LG; U; Android 29; in-ID; id;)',
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const packs = data?.result?.stickerPacks || data?.stickerPacks || data?.data || [];
    return packs.map(v => ({
      id: v.packId,
      name: v.name,
      author: v.authorName || 'Unknown',
      count: v.resourceFiles?.length || 0,
      animated: v.isAnimated,
      prefix: v.resourceUrlPrefix,
      files: v.resourceFiles || [],
      url: v.shareUrl || `https://sticker.ly/s/${v.packId}`
    }));
  } catch (e) {
    console.log('Stickerly Search Error:', e.message);
    return [];
  }
}

export default {
  name: 'stickersearch',
  aliases: ['stickersearch', 'stick', 'stickers', 'stickerly'],
  description: 'Search Sticker.ly packs and send one as a native WhatsApp sticker pack',
  run: async (context) => {
    const { client, m, text } = context;

    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, `╭─❏ 「 STICKERSEARCH 」
│\n│ Give me a search term.\n│ Example: .stickersearch patrick\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const packs = await searchStickerly(text);
    if (!packs.length) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, `╭─❏ 「 STICKERSEARCH 」
│\n│ No sticker packs found for "${text}".\n│ Try a different search term.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    const top = packs.slice(0, 10);
    globalThis.stickerlySession[m.sender] = { chat: m.chat, packs: top, expiresAt: Date.now() + 5 * 60 * 1000 };

    let list = `╭─❏ 「 STICKERSEARCH 」\n│\n`;
    top.forEach((v, i) => {
      list += `│ ${i + 1}. ${v.name}\n│    Author: ${v.author} • Stickers: ${v.count}\n`;
    });
    list += `│\n│ Reply with a number (1-${top.length}) to send that pack.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    await sendInteractive(client, m, list);
  }
};
