import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet, mediaBuffer } from '../../lib/downloaderChain.js';

export default {
  name: 'threads',
  alias: ['threadsdl', 'tdl'],
  run: async (context) => {
    const { client, m, text, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
    const fmt = (msg) => `╭─❏ 「 THREADS」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, fmt(`Example: ${prefix}threads https://www.threads.net/@user/post/xxx`));
    }
    if (!text.includes('threads.net') && !text.includes('threads.com')) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, fmt("That's not a Threads link."));
    }
    try {
      const res = await nexrayGet('/downloader/threads', { url: text.trim() }, 60000);
      if (!res) throw new Error('Could not fetch Threads media');
      const video = res.video || res.video_url || '';
      const images = res.image ? (Array.isArray(res.image) ? res.image : [res.image]) : (Array.isArray(res.images) ? res.images : []);
      if (video) {
        const buf = await mediaBuffer({ link: video });
        await client.sendMessage(m.chat, { video: buf, caption: fmt(`${res.author || 'Threads Video'}`), mimetype: 'video/mp4' });
      } else if (images.length) {
        for (const img of images.slice(0, 5)) {
          await client.sendMessage(m.chat, { image: { url: img }, caption: fmt(`${res.author || 'Threads Image'}`) }).catch(() => {});
        }
      } else {
        throw new Error('No media found in this Threads post');
      }
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    } catch (e) {
      console.error('threads error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      sendInteractive(client, m, fmt(`Failed: ${e.message}`));
    }
  }
};
