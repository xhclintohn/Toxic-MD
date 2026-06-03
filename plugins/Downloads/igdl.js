import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
  const NEXRAY = 'https://api.nexray.web.id/downloader/v2/instagram?url=';

  export default async (context) => {
      const { client, m, text } = context;
      const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      if (!text) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply('╭───(    TOXIC-MD    )───\n├ Give me an Instagram link.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
      }
      if (!text.includes('instagram.com')) return m.reply('╭───(    TOXIC-MD    )───\n├ That\'s not an Instagram link.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      try {
          const r = await fetch(NEXRAY + encodeURIComponent(text.trim()), { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 });
          const d = await r.json();
          if (!d.status || !d.result) throw new Error('API failed');
          const { title, likes, comment, username, media } = d.result;
          if (!media || !media.length) throw new Error('No media found');
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          for (const item of media.slice(0, 5)) {
              try {
                  const dlRes = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.instagram.com/' }, timeout: 35000 });
                  if (!dlRes.ok) continue;
                  const buf = Buffer.from(await dlRes.arrayBuffer());
                  const cap = `╭───(    TOXIC-MD    )───\n├───≫ Instagram DL ≪───\n├ ${title || 'Instagram Post'}\n├ 👤 @${username || 'unknown'}\n├ ❤️ ${likes ? likes.toLocaleString() : 'N/A'} likes | 💬 ${comment ? comment.toLocaleString() : 'N/A'} comments\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
                  if (item.type === 'mp4') {
                      await client.sendMessage(m.chat, { video: buf, caption: cap, mimetype: 'video/mp4' }, { quoted: fq });
                  } else {
                      await client.sendMessage(m.chat, { image: buf, caption: cap }, { quoted: fq });
                  }
              } catch {}
          }
      } catch (e) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          m.reply(`╭───(    TOXIC-MD    )───\n├ Failed: ${e.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
  };
  