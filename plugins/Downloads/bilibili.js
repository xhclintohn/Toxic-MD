import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveNexrayDownload, mediaBuffer } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 BILIBILI」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}bilibili https://www.bilibili.com/video/BVxxxxxx`));
  }
  if (!text.includes('bilibili.com') && !text.includes('b23.tv')) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt("That's not a Bilibili link."));
  }
  try {
    const media = await resolveNexrayDownload('/downloader/bilibili', text.trim());
    const buf = await mediaBuffer(media);
    await client.sendMessage(m.chat, { video: buf, caption: fmt(`🎬 ${(media.title || 'Bilibili Video').slice(0, 100)}`), mimetype: 'video/mp4' });
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('bilibili error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
