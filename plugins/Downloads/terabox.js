import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveNexrayDownload, mediaBuffer } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 TERABOX」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}terabox https://terabox.com/s/xxxxx`));
  }
  if (!/terabox|1024tera|mirrobox|freeterabox/i.test(text)) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt("That's not a Terabox link."));
  }
  try {
    const media = await resolveNexrayDownload('/downloader/terabox', text.trim(), { timeout: 90000 });
    const buf = await mediaBuffer(media);
    const name = (media.raw?.name || media.raw?.filename || media.raw?.file_name || media.title || 'terabox-file').slice(0, 80);
    await client.sendMessage(m.chat, { document: buf, fileName: name, mimetype: 'application/octet-stream', caption: fmt(`${name}${media.raw?.size || media.raw?.filesize ? `\n│ Size: ${media.raw.size || media.raw.filesize}` : ''}`) });
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('terabox error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
