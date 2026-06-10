import fetch from 'node-fetch';
import { sendInteractive } from '../../lib/sendInteractive.js';
  const NEXRAY = 'https://api.nexray.web.id/downloader/threads?url=';

  export default {
      name: 'threads',
      alias: ['threadsdl', 'tdl'],
      run: async (context) => {
          const { client, m, text, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
          if (!text) {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
              return sendInteractive(client, m, `│ Example: ${prefix}threads https://www.threads.net/@user/post/xxx\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
          }
          if (!text.includes('threads.net')) return sendInteractive(client, m, '│ That\'s not a Threads link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
          await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
          try {
              const r = await fetch(NEXRAY + encodeURIComponent(text.trim()), { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000 });
              const d = await r.json();
              if (!d.status || !d.result) throw new Error('Could not fetch Threads media');
              const res = d.result;
              await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
              if (res.video) {
                  await client.sendMessage(m.chat, {
                      video: { url: res.video },
                      caption: `╭─❏ 「 Threads Video」
│ ${res.author || ''}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                      mimetype: 'video/mp4'
                  });
              } else if (res.image) {
                  const imgs = Array.isArray(res.image) ? res.image : [res.image];
                  for (const img of imgs.slice(0, 5)) {
                      await client.sendMessage(m.chat, {
                          image: { url: img },
                          caption: `╭─❏ 「 Threads Image」
│ ${res.author || ''}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                      });
                  }
              } else throw new Error('No media found in this Threads post');
          } catch (e) {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
              sendInteractive(client, m, `│ Failed: ${e.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
          }
      }
  };
  