import { sendInteractive } from '../../lib/sendInteractive.js';
import { ryuuYoutube, downloadBuffer } from '../../lib/ryuuYt.js';
import { sendAudioSafe } from '../../lib/sendAudioSafe.js';

function extractYtId(url) {
  const m = String(url || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default {
  name: 'ytmp3',
  aliases: ['yta', 'ytaudio'],
  description: 'Download YouTube audio as MP3',
  run: async (context) => {
    const { client, m, text, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
    const fmt = (msg) => `╭─❏ 「 YTMP3」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const raw = (text || '').trim();
      const id = extractYtId(raw);
      if (!raw || !id) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Example: ${prefix || '.'}ytmp3 https://youtu.be/Ps_6IcvAEm8`));
      }
      const fullUrl = `https://youtube.com/watch?v=${id}`;
      const media = await ryuuYoutube(fullUrl, 'mp3');
      const buf = await downloadBuffer(media.link);
      const title = (media.title || 'youtube-audio').slice(0, 80);
      const caption = `╭─❏ 「 YTMP3」\n│ 🎵 ${title}\n│ ⏱ ${media.duration || '-'}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

      await sendAudioSafe(client, m.chat, buf, {
        title,
        quoted: m,
        caption
      });

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    } catch (e) {
      console.error('ytmp3 error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, fmt(`Failed: ${e.message || e}`));
    }
  }
};
