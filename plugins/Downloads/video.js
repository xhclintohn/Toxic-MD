import yts from 'yt-search';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ryuuYoutube } from '../../lib/ryuuYt.js';

export default async (context) => {
  const { client, m, text } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

  const fmt = (msg) => `╭─❏ 「 VIDEO」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt('Type a title to search.\n│ Example: .video PIXY LEGACY'));
  }
  if (text.length > 100) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt('Title longer than your attention span. Under 100 chars!'));
  }

  try {
    const searchResult = await yts(`${text} official`);
    const video = searchResult?.videos?.[0];
    if (!video?.url) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, fmt(`Nothing found for "${text}".`));
    }

    const media = await ryuuYoutube(video.url, '720');
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    await client.sendMessage(m.chat, {
      video: { url: media.link },
      mimetype: 'video/mp4',
      fileName: `${(media.title || video.title || 'video').slice(0, 80)}.mp4`,
      caption: `*${media.title || video.title}*\n${media.channel || video.author?.name || ''} · ${media.duration || video.timestamp || ''}`.trim(),
      contextInfo: {
        externalAdReply: {
          title: media.title || video.title,
          body: 'Powered by Toxic-MD',
          thumbnailUrl: media.thumbnail || video.thumbnail || undefined,
          sourceUrl: video.url,
          mediaType: 2,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });
  } catch (error) {
    console.error('Video error:', error);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    await sendInteractive(client, m, fmt(`Download failed.\n│ ${error.message || error}`));
  }
};
