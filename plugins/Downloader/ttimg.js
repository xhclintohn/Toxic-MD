import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'ttimg',
  aliases: ['tiktokimg', 'ttslide'],
  description: 'Download TikTok slideshow/photo post images',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    if (!text || !/tiktok\.com/i.test(text)) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('TIKTOK IMAGES', 'Give me a TikTok photo/slideshow link.\n│ Example: .ttimg https://vt.tiktok.com/xxxx/'));
    }

    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(text.trim())}&hd=1`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(45000)
      });
      const data = await res.json();
      if (data.code !== 0 || !data.data) throw new Error(data.msg || 'TikTok fetch failed');

      const images = Array.isArray(data.data.images) ? data.data.images : [];
      if (!images.length) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, box('TIKTOK IMAGES', 'That post has no photos. Use .tiktok for videos.'));
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      for (let i = 0; i < images.length; i++) {
        await client.sendMessage(m.chat, {
          image: { url: images[i] },
          caption: i === 0 ? box('TIKTOK IMAGES', `Total photos: ${images.length}\n│ Author: @${data.data.author?.unique_id || 'unknown'}`) : undefined
        });
        if (i < images.length - 1) await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e) {
      console.error('ttimg error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('TIKTOK IMAGES', `Failed: ${e.message || e}`));
    }
  }
};
