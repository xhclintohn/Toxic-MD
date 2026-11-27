import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 WEB TO ZIP」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}web2zip https://example.com`));
  }
  try {
    await sendInteractive(client, m, fmt('Copying website... this can take a while.'));
    const d = await nexrayGet('/tools/webtozip', { url: text.trim() }, 120000);
    if (!d?.downloadUrl) throw new Error('no download link returned');
    const lines = [
      `🌐 URL: ${d.url || text.trim()}`,
      `│ Files copied: ${d.copiedFilesAmount || '-'}`,
      `│ Download: ${d.downloadUrl}`
    ].join('\n');
    await sendInteractive(client, m, fmt(lines));
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('web2zip error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
