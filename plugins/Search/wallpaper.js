import axios from 'axios';
import * as cheerio from 'cheerio';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
  const { client, m, text } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

  const raw = (text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '').trim();

  if (!raw) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, "│ You forgot the query, dumbass.\n│ Try: .wallpaper anime girl, 5\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
  }

  let query, count;
  const commaIdx = raw.lastIndexOf(',');
  if (commaIdx !== -1) {
    const possibleCount = raw.slice(commaIdx + 1).trim();
    const parsed = parseInt(possibleCount);
    if (!isNaN(parsed)) {
      query = raw.slice(0, commaIdx).trim();
      count = parsed;
    } else {
      query = raw.trim();
      count = 5;
    }
  } else {
    query = raw.trim();
    count = 5;
  }

  if (count > 20) count = 20;
  if (count < 1) count = 1;

  try {
    const results = await fetchWallpapers(query);

    if (results.length === 0) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      return sendInteractive(client, m, `│ No wallpapers found for "${query}". Your taste sucks.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    const toSend = results.slice(0, count);

    for (let i = 0; i < toSend.length; i++) {
      const wp = toSend[i];
      const caption = `╭─❏ 「 WALLPAPER ${i + 1}/${toSend.length}」
` +
                      `│ Title: ${wp.title || 'Untitled'}\n` +
                      `│ Resolution: ${wp.resolution || 'Unknown'}\n` +
                      `│ Desc: ${wp.description || 'No description'}\n` +
                      `│ Link: ${wp.link || 'N/A'}\n` +
                      `╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

      await client.sendMessage(m.chat, {
        image: { url: wp.image },
        caption });

      if (i < toSend.length - 1) await new Promise(res => setTimeout(res, 1500));
    }

    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
  } catch (err) {
    console.error('Wallpaper error:', err);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
    sendInteractive(client, m, `╭─❏ 「 WALLPAPER ERROR」
│ Failed to fetch wallpapers. Site's probably dead.\n│ ${err.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
};

async function fetchWallpapers(query) {
  const searchUrl = `https://www.uhdpaper.com/search?q=${encodeURIComponent(query)}&by-date=true`;

  const { data } = await axios.get(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
    },
    timeout: 30000
  });

  const $ = cheerio.load(data);
  const results = [];

  $('.post-outer').each((_, el) => {
    const title = $(el).find('h2').text().trim() || null;
    const resolution = $(el).find('b').text().trim() || null;
    let image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
    if (image && image.startsWith('//')) image = 'https:' + image;
    const description = $(el).find('p').text().trim() || null;
    const link = $(el).find('a').attr('href');
    if (image) {
      results.push({ title, resolution, image, description, source: 'uhdpaper.com', link: link ? 'https://www.uhdpaper.com' + link : null });
    }
  });

  return results;
}
