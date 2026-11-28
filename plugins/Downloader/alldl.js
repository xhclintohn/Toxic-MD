import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveYoutubeVideo, resolveTiktok, resolveInstagram, resolveTwitter, resolveFacebook, dlDownload, mediaBuffer, extractYtId } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, `╭─❏ 「 ALLDL 」\n│ Supports: YouTube, TikTok, Instagram, Twitter/X, Facebook\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
  const url = text.trim();
  try {
    const isYT = /youtube\.com|youtu\.be/.test(url);
    const isTT = /tiktok\.com/.test(url);
    const isIG = /instagram\.com/.test(url);
    const isTW = /twitter\.com|x\.com|t\.co/.test(url);
    const isFB = /facebook\.com|fb\.watch/.test(url);

    let sendBuf = null, sendAsVideo = true, caption = '';

    if (isYT) {
      const id = extractYtId(url);
      if (!id) throw new Error('Invalid YouTube URL');
      const media = await resolveYoutubeVideo(`https://youtube.com/watch?v=${id}`, '720');
      sendBuf = await mediaBuffer(media);
      caption = `╭─❏ 「 ALLDL 」\n│ 🎬 ${(media.title || 'YouTube Video').slice(0, 80)}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    } else if (isTT) {
      const media = await resolveTiktok(url);
      sendBuf = await dlDownload(media.link, { headers: media.referer ? { Referer: media.referer } : {} });
      caption = `╭─❏ 「 ALLDL 」\n│ 🎵 ${(media.title || 'TikTok Video').slice(0, 80)}\n│ 👤 ${media.author || ''}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    } else if (isIG) {
      const { media, title, username } = await resolveInstagram(url);
      const first = media[0];
      sendBuf = await dlDownload(first.url, { headers: { Referer: 'https://www.instagram.com/' }, minBytes: 1000 });
      sendAsVideo = first.type === 'mp4';
      caption = `╭─❏ 「 ALLDL 」\n│ 📷 ${(title || 'Instagram Post').slice(0, 80)}\n│ 👤 @${username || ''}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    } else if (isTW) {
      const media = await resolveTwitter(url);
      sendBuf = await dlDownload(media.link);
      caption = `╭─❏ 「 ALLDL 」\n│ 🐦 ${(media.title || 'X/Twitter Video').slice(0, 80)}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    } else if (isFB) {
      const media = await resolveFacebook(url);
      sendBuf = await dlDownload(media.link);
      caption = `╭─❏ 「 ALLDL 」\n│ 📘 ${(media.title || 'Facebook Video').slice(0, 80)}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    } else {
      throw new Error('Unsupported link. Use YouTube, TikTok, Instagram, Twitter/X, or Facebook.');
    }

    if (sendBuf) {
      await client.sendMessage(m.chat, sendAsVideo
        ? { video: sendBuf, caption, mimetype: 'video/mp4', gifPlayback: false }
        : { image: sendBuf, caption }
      );
    }
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('alldl error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, `╭─❏ 「 ERROR 」\n│ Failed: ${e.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
};
