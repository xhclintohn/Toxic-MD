import yts from 'yt-search';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveYoutubeVideo, mediaBuffer, isYoutubeUrl } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 VIDEO」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt('Type a title or YouTube link.\n│ Example: .video PIXY LEGACY'));
  }
  try {
    let url = text.trim();
    let video = null;
    if (!isYoutubeUrl(url)) {
      const searchResult = await yts(`${text} official`);
      video = searchResult?.videos?.[0];
      if (!video?.url) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Nothing found for "${text}".`));
      }
      url = video.url;
    }
    const media = await resolveYoutubeVideo(url, '720');
    const buf = await mediaBuffer(media);
    const title = (media.title || video?.title || 'video').slice(0, 80);
    await client.sendMessage(m.chat, {
      video: buf,
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption: `*${title}*\n${media.channel || video?.author?.name || ''} · ${media.duration || video?.timestamp || ''}`.trim()
    }, { quoted: m });
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (error) {
    console.error('Video error:', error);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    await sendInteractive(client, m, fmt(`Download failed.\n│ ${error.message || error}`));
  }
};
