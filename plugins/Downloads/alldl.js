import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
  const NEXRAY = 'https://api.nexray.web.id/downloader';

  function extractYtId(url) {
      const m = url.match(new RegExp('(?:youtu\\.be/|youtube\\.com/(?:watch\\?v=|shorts/|embed/|v/))([A-Za-z0-9_-]{11})'));
      return m ? m[1] : null;
  }

  export default async (context) => {
      const { client, m, text } = context;
      const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      if (!text) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply('╭───(    TOXIC-MD    )───\n├ Supports: YouTube, TikTok, Instagram, Twitter/X, Facebook\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
      }
      const url = text.trim();
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      try {
          const isYT = /youtube\.com|youtu\.be/.test(url);
          const isTT = /tiktok\.com/.test(url);
          const isIG = /instagram\.com/.test(url);
          const isTW = /twitter\.com|x\.com|t\.co/.test(url);
          const isFB = /facebook\.com|fb\.watch/.test(url);

          let sendBuf = null, sendAsVideo = true, caption = '';

          if (isYT) {
              const id = extractYtId(url);
              if (!id) throw new Error('Invalid YouTube URL');
              const r = await fetch(`${NEXRAY}/ytmp4?url=${encodeURIComponent('https://youtube.com/watch?v='+id)}&resolusi=720`, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 90000 });
              const d = await r.json();
              if (!d.status || !d.result?.url) throw new Error('YouTube API failed');
              await client.sendMessage(m.chat, {
                  video: { url: d.result.url },
                  mimetype: 'video/mp4',
                  caption: `╭───(    TOXIC-MD    )───\n├ 🎬 ${d.result.title || 'YouTube Video'}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
              }, { quoted: fq });
              return await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

          } else if (isTT) {
              const r = await fetch(`${NEXRAY}/tiktok?url=${encodeURIComponent(url)}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 });
              const d = await r.json();
              if (!d.status || !d.result?.data) throw new Error('TikTok API failed');
              const dlRes = await fetch(d.result.data, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 40000 });
              sendBuf = Buffer.from(await dlRes.arrayBuffer());
              caption = `╭───(    TOXIC-MD    )───\n├ 🎵 ${d.result.title || 'TikTok Video'}\n├ 👤 ${d.result.author?.nickname || ''}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

          } else if (isIG) {
              const r = await fetch(`${NEXRAY}/v2/instagram?url=${encodeURIComponent(url)}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 });
              const d = await r.json();
              if (!d.status || !d.result?.media?.length) throw new Error('Instagram API failed');
              const first = d.result.media[0];
              const dlRes = await fetch(first.url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.instagram.com/' }, timeout: 35000 });
              sendBuf = Buffer.from(await dlRes.arrayBuffer());
              sendAsVideo = first.type === 'mp4';
              caption = `╭───(    TOXIC-MD    )───\n├ 📷 ${d.result.title || 'Instagram Post'}\n├ 👤 @${d.result.username || ''}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

          } else if (isTW) {
              const r = await fetch(`${NEXRAY}/twitter?url=${encodeURIComponent(url)}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 });
              const d = await r.json();
              if (!d.status || !d.result?.download_url?.length) throw new Error('Twitter API failed');
              const best = d.result.download_url.find(u => u.type === 'mp4') || d.result.download_url[0];
              const dlRes = await fetch(best.url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 40000 });
              sendBuf = Buffer.from(await dlRes.arrayBuffer());
              caption = `╭───(    TOXIC-MD    )───\n├ 🐦 ${(d.result.title || 'X/Twitter Video').slice(0,80)}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

          } else if (isFB) {
              const r = await fetch(`${NEXRAY}/facebook?url=${encodeURIComponent(url)}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 });
              const d = await r.json();
              if (!d.status || !d.result) throw new Error('Facebook API failed');
              const videoUrl = d.result.video_hd || d.result.video_sd;
              if (!videoUrl) throw new Error('No FB video URL');
              const dlRes = await fetch(videoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 40000 });
              sendBuf = Buffer.from(await dlRes.arrayBuffer());
              caption = `╭───(    TOXIC-MD    )───\n├ 📘 ${d.result.title || 'Facebook Video'}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

          } else {
              throw new Error('Unsupported link. Use YouTube, TikTok, Instagram, Twitter/X, or Facebook.');
          }

          if (sendBuf) {
              await client.sendMessage(m.chat, sendAsVideo
                  ? { video: sendBuf, caption, mimetype: 'video/mp4', gifPlayback: false }
                  : { image: sendBuf, caption }
              , { quoted: fq });
          }
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      } catch (e) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          m.reply(`╭───(    TOXIC-MD    )───\n├ Failed: ${e.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
  };
  