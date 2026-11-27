import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveYoutubeAudio, resolveYoutubeVideo, mediaBuffer, extractYtId } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, `╭─❏ 「 YT」\n│ Example: ${prefix}yt https://youtu.be/xxxx [mp3/mp4]\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
  const parts = text.trim().split(/\s+/);
  const ytUrl = parts[0];
  const format = (parts[1] || 'mp3').toLowerCase();
  const id = extractYtId(ytUrl);
  if (!id) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, '╭─❏ 「 YT」\n│ Invalid YouTube link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
  }
  try {
    const fullUrl = `https://youtube.com/watch?v=${id}`;
    if (format === 'mp4') {
      await sendInteractive(client, m, '⏳ Fetching video (720p)... May take up to 60s.');
      const media = await resolveYoutubeVideo(fullUrl, '720');
      const buf = await mediaBuffer(media);
      await client.sendMessage(m.chat, {
        video: buf, mimetype: 'video/mp4',
        caption: `╭─❏ 「 YT 」\n│ 🎬 ${(media.title || 'YouTube Video').slice(0, 80)}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      });
    } else {
      const media = await resolveYoutubeAudio(fullUrl);
      const buf = await mediaBuffer(media);
      await client.sendMessage(m.chat, {
        audio: buf, mimetype: 'audio/mpeg', ptt: false,
        fileName: `${(media.title || 'yt-audio').slice(0, 60)}.mp3`
      });
    }
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('yt error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, `╭─❏ 「 ERROR 」\n│ Failed: ${e.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
};
