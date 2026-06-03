import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
  const NEXRAY = 'https://api.nexray.web.id/downloader/soundcloud?url=';

  export default {
      name: 'soundcloud',
      alias: ['scloud', 'scdl'],
      run: async (context) => {
          const { client, m, text, prefix } = context;
          const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
          if (!text) {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
              return m.reply(`╭───(    TOXIC-MD    )───\n├ Example: ${prefix}soundcloud https://soundcloud.com/user/track\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
          }
          if (!text.includes('soundcloud.com')) return m.reply('╭───(    TOXIC-MD    )───\n├ That\'s not a SoundCloud link.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
          await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
          try {
              const r = await fetch(NEXRAY + encodeURIComponent(text.trim()), { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 25000 });
              const d = await r.json();
              if (!d.status || !d.result) throw new Error('SoundCloud API failed');
              const { title, thumbnail, audio } = d.result;
              const audioUrl = audio || d.result.url || d.result.download;
              if (!audioUrl) throw new Error('No audio URL returned');
              if (thumbnail) {
                  await client.sendMessage(m.chat, { image: { url: thumbnail }, caption: `🎵 ${title || 'SoundCloud Track'}` }, { quoted: fq });
              }
              const dlRes = await fetch(audioUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 35000 });
              const buf = Buffer.from(await dlRes.arrayBuffer());
              await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
              await client.sendMessage(m.chat, {
                  audio: buf, mimetype: 'audio/mpeg', ptt: false,
                  fileName: `${title || 'soundcloud-track'}.mp3`
              }, { quoted: fq });
          } catch (e) {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
              m.reply(`╭───(    TOXIC-MD    )───\n├ Failed: ${e.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
          }
      }
  };
  