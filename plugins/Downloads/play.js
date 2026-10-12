import yts from 'yt-search';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ryuuYoutube } from '../../lib/ryuuYt.js';

export default {
  name: 'play',
  aliases: ['ply', 'playy', 'pl'],
  description: 'Downloads songs from YouTube and sends audio',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const fmt = (msg) => `╭─❏ 「 PLAY」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const query = text ? text.trim() : '';
      if (!query) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('Give me a song name OR a YouTube link.\n│ Example: .play harlem shake'));
      }

      const isYoutubeLink = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/))/i.test(query);

      let ytUrl = query;
      let titleHint = query;

      if (!isYoutubeLink) {
        const search = await yts(query);
        const video = search?.videos?.[0];
        if (!video?.url) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt(`Nothing found for "${query}".`));
        }
        ytUrl = video.url;
        titleHint = video.title || query;
      }

      const media = await ryuuYoutube(ytUrl, 'mp3');
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      await client.sendMessage(m.chat, {
        audio: { url: media.link },
        mimetype: 'audio/mpeg',
        fileName: `${(media.title || titleHint).slice(0, 80)}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: media.title || titleHint,
            body: media.channel ? `${media.channel} · ${media.duration || ''}`.trim() : 'Toxic-MD Play',
            thumbnailUrl: media.thumbnail || undefined,
            sourceUrl: ytUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    } catch (error) {
      console.error('play error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, fmt(`Play failed: ${error.message || error}`));
    }
  }
};
