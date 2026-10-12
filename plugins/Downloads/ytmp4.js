import { sendInteractive } from '../../lib/sendInteractive.js';
import { ryuuYoutube, downloadBuffer } from '../../lib/ryuuYt.js';

function extractYtId(url) {
  const m = String(url || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default {
  name: 'ytmp4',
  aliases: ['ytv', 'ytvideo'],
  description: 'Download YouTube video as MP4',
  run: async (context) => {
    const { client, m, text, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
    const fmt = (msg) => `╭─❏ 「 YTMP4」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const parts = String(text || '').trim().split(/\s+/).filter(Boolean);
      const urlPart = parts[0] || '';
      const quality = parts[1] && /^(360|480|720|1080)$/.test(parts[1]) ? parts[1] : '720';
      const id = extractYtId(urlPart);
      if (!id) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Example: ${prefix || '.'}ytmp4 https://youtu.be/Ps_6IcvAEm8 [720]`));
      }

      const fullUrl = `https://youtube.com/watch?v=${id}`;
      await sendInteractive(client, m, fmt(`Processing ${quality}p…`));

      const media = await ryuuYoutube(fullUrl, quality);
      const buf = await downloadBuffer(media.link, 120000);
      const title = (media.title || 'youtube-video').slice(0, 80);

      await client.sendMessage(m.chat, {
        video: buf,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `╭─❏ 「 YouTube MP4」\n│ 🎬 ${title}\n│ ⏱ ${media.duration || '-'}\n│ 📺 ${quality}p\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      }, { quoted: m });

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    } catch (e) {
      console.error('ytmp4 error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, fmt(`YouTube MP4 download failed.\n│ ${e.message || e}`));
    }
  }
};
