import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveNexrayDownload, mediaBuffer } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 SFILE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}sfile https://sfile.mobi/xxxxx`));
  }
  if (!text.includes('sfile')) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt("That's not an Sfile link."));
  }
  try {
    const media = await resolveNexrayDownload('/downloader/sfile', text.trim());
    const buf = await mediaBuffer(media);
    const name = (media.raw?.file_name || media.raw?.name || media.raw?.filename || media.title || 'sfile').slice(0, 80);
    await client.sendMessage(m.chat, { document: buf, fileName: name, mimetype: 'application/octet-stream', caption: fmt(`${name}${media.raw?.size ? `\n│ Size: ${media.raw.size}` : ''}`) });
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('sfile error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
