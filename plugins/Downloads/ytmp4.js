import { sendInteractive } from '../../lib/sendInteractive.js';
import { ryuuYoutube } from '../../lib/ryuuYt.js';

export default {
  name: 'ytmp4',
  aliases: ['ytv', 'ytvideo'],
  description: 'Download YouTube video as MP4',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const fmt = (msg) => `╭─❏ 「 YTMP4」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const url = (text || '').trim();
      if (!url || !/(youtube\.com|youtu\.be)/i.test(url)) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('Provide a YouTube URL.\n│ Example: .ytmp4 https://youtu.be/Ps_6IcvAEm8'));
      }

      const media = await ryuuYoutube(url, '720');
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      await client.sendMessage(m.chat, {
        video: { url: media.link },
        mimetype: 'video/mp4',
        fileName: `${(media.title || 'video').slice(0, 80)}.mp4`,
        caption: `*${media.title || 'YouTube'}*\n${media.channel || ''} · ${media.duration || ''}`.trim(),
        contextInfo: {
          externalAdReply: {
            title: media.title || 'YouTube Video',
            body: [media.channel, media.duration].filter(Boolean).join(' · ') || 'Toxic-MD',
            thumbnailUrl: media.thumbnail || undefined,
            sourceUrl: url,
            mediaType: 2,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    } catch (error) {
      console.error('ytmp4 error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, fmt(`YouTube MP4 download failed.\n│ ${error.message || error}`));
    }
  }
};
