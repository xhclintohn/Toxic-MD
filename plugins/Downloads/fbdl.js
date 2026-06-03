import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
  const NEXRAY = 'https://api.nexray.web.id/downloader/facebook?url=';

  export default async (context) => {
      const { client, m, text, prefix } = context;
      const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      if (!text) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply(`╭───(    TOXIC-MD    )───\n├ Example: ${prefix}fbdl https://fb.watch/xxxxx\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
      if (!text.includes('facebook.com') && !text.includes('fb.watch')) return m.reply('╭───(    TOXIC-MD    )───\n├ That\'s not a Facebook link.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      try {
          const r = await fetch(NEXRAY + encodeURIComponent(text.trim()), { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 });
          const d = await r.json();
          if (!d.status || !d.result) throw new Error('API failed');
          const { title, video_hd, video_sd } = d.result;
          const videoUrl = video_hd || video_sd;
          if (!videoUrl) throw new Error('No video URL found');
          const dlRes = await fetch(videoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 40000 });
          if (!dlRes.ok) throw new Error('Download failed: ' + dlRes.status);
          const buf = Buffer.from(await dlRes.arrayBuffer());
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          await client.sendMessage(m.chat, {
              video: buf, mimetype: 'video/mp4',
              caption: `╭───(    TOXIC-MD    )───\n├───≫ Facebook DL ≪───\n├ ${title || 'Facebook Video'}\n├ Quality: ${video_hd ? 'HD' : 'SD'}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
          }, { quoted: fq });
      } catch (e) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          m.reply(`╭───(    TOXIC-MD    )───\n├ Failed: ${e.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
  };
  