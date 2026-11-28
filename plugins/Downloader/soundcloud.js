import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveNexrayDownload, mediaBuffer } from '../../lib/downloaderChain.js';

export default {
  name: 'soundcloud',
  alias: ['scloud', 'scdl'],
  run: async (context) => {
    const { client, m, text, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
    const fmt = (msg) => `╭─❏ 「 SOUNDCLOUD」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, fmt(`Example: ${prefix}soundcloud https://soundcloud.com/user/track`));
    }
    if (!text.includes('soundcloud.com')) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, fmt("That's not a SoundCloud link."));
    }
    try {
      const media = await resolveNexrayDownload('/downloader/soundcloud', text.trim(), { prefer: 'audio' });
      const buf = await mediaBuffer(media);
      const title = media.title || media.raw?.title || 'soundcloud-track';
      if (media.raw?.thumbnail) {
        await client.sendMessage(m.chat, { image: { url: media.raw.thumbnail }, caption: `🎵 ${title}` }).catch(() => {});
      }
      await client.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg', ptt: false, fileName: `${title.slice(0, 60)}.mp3` });
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    } catch (e) {
      console.error('soundcloud error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      sendInteractive(client, m, fmt(`Failed: ${e.message}`));
    }
  }
};
