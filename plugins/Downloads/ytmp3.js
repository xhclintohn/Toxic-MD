import { sendInteractive } from '../../lib/sendInteractive.js';
import { ryuuYoutube } from '../../lib/ryuuYt.js';

export default {
  name: 'ytmp3',
  aliases: ['yta', 'ytaudio'],
  description: 'Download YouTube audio as MP3',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const fmt = (msg) => `╭─❏ 「 YTMP3」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const url = (text || '').trim();
      if (!url || !/(youtube\.com|youtu\.be)/i.test(url)) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('Provide a YouTube URL.\n│ Example: .ytmp3 https://youtu.be/Ps_6IcvAEm8'));
      }

      const media = await ryuuYoutube(url, 'mp3');
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      await client.sendMessage(m.chat, {
        audio: { url: media.link },
        mimetype: 'audio/mpeg',
        fileName: `${(media.title || 'audio').slice(0, 80)}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: media.title || 'YouTube Audio',
            body: [media.channel, media.duration].filter(Boolean).join(' · ') || 'Toxic-MD',
            thumbnailUrl: media.thumbnail || undefined,
            sourceUrl: url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    } catch (error) {
      console.error('ytmp3 error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, fmt(`Failed: ${error.message || error}`));
    }
  }
};
