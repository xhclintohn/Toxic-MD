import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
  const NEXRAY_MP3 = 'https://api.nexray.web.id/downloader/ytmp3?url=';
  const NEXRAY_MP4 = 'https://api.nexray.web.id/downloader/ytmp4?url=';

  function extractYtId(url) {
      const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/))([A-Za-z0-9_-]{11})/);
      return m ? m[1] : null;
  }

  export default async (context) => {
      const { client, m, text, prefix, args } = context;
      const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      if (!text) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply(`╭───(    TOXIC-MD    )───\n├ Example: ${prefix}yt https://youtu.be/xxxx [mp3/mp4]\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
      const parts = text.trim().split(/\s+/);
      const ytUrl = parts[0];
      const format = (parts[1] || 'mp3').toLowerCase();
      const id = extractYtId(ytUrl);
      if (!id) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply('╭───(    TOXIC-MD    )───\n├ Invalid YouTube link.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
      }
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      try {
          const fullUrl = `https://youtube.com/watch?v=${id}`;
          if (format === 'mp4') {
              await m.reply('⏳ Fetching video (720p)... May take up to 60s.');
              const r = await fetch(NEXRAY_MP4 + encodeURIComponent(fullUrl) + '&resolusi=720', { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 90000 });
              const d = await r.json();
              if (!d.status || !d.result?.url) throw new Error('Video API failed');
              await client.sendMessage(m.chat, {
                  video: { url: d.result.url }, mimetype: 'video/mp4',
                  caption: `╭───(    TOXIC-MD    )───\n├ 🎬 ${d.result.title || 'YouTube Video'}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
              }, { quoted: fq });
          } else {
              const r = await fetch(NEXRAY_MP3 + encodeURIComponent(fullUrl), { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 30000 });
              const d = await r.json();
              if (!d.status || !d.result?.url) throw new Error('Audio API failed');
              const { title, quality, url: audioUrl } = d.result;
              const dlRes = await fetch(audioUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 40000 });
              const buf = Buffer.from(await dlRes.arrayBuffer());
              await client.sendMessage(m.chat, {
                  audio: buf, mimetype: 'audio/mpeg', ptt: false,
                  fileName: `${title || 'yt-audio'}.mp3`
              }, { quoted: fq });
          }
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      } catch (e) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          m.reply(`╭───(    TOXIC-MD    )───\n├ Failed: ${e.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
  };
  