import { sendInteractive } from '../../lib/sendInteractive.js';
import { dlFetchJson, pickDownload, mediaBuffer, verifyLink } from '../../lib/downloaderChain.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function faaAio(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`https://api-faa.my.id/faa/aio?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(60000)
    });
    const data = await res.json().catch(() => null);
    if (res.status === 429 || data?.retryAfter) {
      await sleep(((data?.retryAfter || 1) + 1) * 1000);
      continue;
    }
    if (!data?.status) throw new Error(data?.error || data?.message || `aio HTTP ${res.status}`);
    return data.result || data.data || {};
  }
  throw new Error('aio rate limited, try again in a bit');
}

export default {
  name: 'aio',
  aliases: ['aio2', 'allinone'],
  description: 'All-in-one downloader for any supported link',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    if (!text || !/^https?:\/\//i.test(text.trim())) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('ALL IN ONE', 'Give me any media link (TikTok, IG, FB, X, YouTube...).\n│ Example: .aio https://vt.tiktok.com/xxxx/'));
    }

    try {
      const r = await faaAio(text.trim());
      const link = pickDownload(r, 'video') || pickDownload(r, 'audio');
      if (!link) throw new Error('No downloadable media found for that link');
      await verifyLink(link);

      const buf = await mediaBuffer({ link });
      const isVideo = /\.mp4|video/i.test(link) || r.type === 'video';
      const title = r.title || r.caption || 'All In One';

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      if (isVideo) {
        await client.sendMessage(m.chat, { video: buf, mimetype: 'video/mp4', caption: box('ALL IN ONE', String(title).slice(0, 100)) });
      } else {
        await client.sendMessage(m.chat, { image: buf, caption: box('ALL IN ONE', String(title).slice(0, 100)) });
      }
    } catch (e) {
      console.error('aio error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('ALL IN ONE', `Failed: ${e.message || e}`));
    }
  }
};
