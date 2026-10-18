import { sendInteractive } from '../../lib/sendInteractive.js';
import { playSearchDownload, ryuuYoutube, downloadBuffer } from '../../lib/ryuuYt.js';

export default {
  name: 'play',
  aliases: ['ply', 'playy', 'pl'],
  description: 'Downloads songs from YouTube and sends audio',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
    const fmt = (msg) => `╭─❏ 「 PLAY」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const query = (text || '').trim();
      if (!query) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('Give a song name OR a YouTube link.\n│ Example: .play harlem shake'));
      }

      const isYoutubeLink = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/)/i.test(query);
      let media;
      if (isYoutubeLink) {
        media = await ryuuYoutube(query, 'mp3');
      } else {
        media = await playSearchDownload(query);
      }

      const buf = await downloadBuffer(media.link);
      const title = (media.title || query || 'audio').slice(0, 80);

      await client.sendMessage(
        m.chat,
        {
          audio: buf,
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          contextInfo: {
            externalAdReply: {
              title,
              body: [media.channel, media.duration].filter(Boolean).join(' · ') || 'Toxic-MD',
              thumbnailUrl: media.thumbnail || undefined,
              sourceUrl: media.videoUrl || (isYoutubeLink ? query : undefined),
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        },
        { quoted: m }
      );

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    } catch (error) {
      console.error('play error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, fmt(`Play failed: ${error.message || error}`));
    }
  }
};
