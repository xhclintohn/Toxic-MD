import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
  const NEXRAY_MP3 = 'https://api.nexray.web.id/downloader/ytmp3?url=';

  function extractYtId(url) {
      const m = url.match(new RegExp('(?:youtu\\.be/|youtube\\.com/(?:watch\\?v=|shorts/|embed/|v/))([A-Za-z0-9_-]{11})'));
      return m ? m[1] : null;
  }

  export default async (context) => {
      const { client, m, text, prefix } = context;
      const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      if (!text) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply(`╭───(    TOXIC-MD    )───\n├ Example: ${prefix}ytmp3 https://youtu.be/xxxx\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
      const ytUrl = text.trim();
      const id = extractYtId(ytUrl);
      if (!id) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply('╭───(    TOXIC-MD    )───\n├ Invalid YouTube link.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
      }
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      try {
          const fullUrl = `https://youtube.com/watch?v=${id}`;
          const r = await fetch(NEXRAY_MP3 + encodeURIComponent(fullUrl), { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 30000 });
          const d = await r.json();
          if (!d.status || !d.result?.url) throw new Error('API failed or no audio URL');
          const { title, quality, url: audioUrl } = d.result;
          const dlRes = await fetch(audioUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 40000 });
          if (!dlRes.ok) throw new Error('Download failed: ' + dlRes.status);
          const buf = Buffer.from(await dlRes.arrayBuffer());
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          await client.sendMessage(m.chat, {
              audio: buf,
              mimetype: 'audio/mpeg',
              ptt: false,
              fileName: `${title || 'youtube-audio'}.mp3`
          }, { quoted: fq });
          await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ YouTube MP3 ≪───\n├ 🎵 ${title || 'Unknown'}\n├ 🔊 Quality: ${quality || '320'}kbps\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      } catch (e) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          m.reply(`╭───(    TOXIC-MD    )───\n├ Failed: ${e.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
  };
  