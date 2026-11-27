import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 FONT SEARCH」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}fontsearch anime`));
  }
  try {
    const d = await nexrayGet('/search/8font', { q: text.trim(), page: 1 }, 60000);
    const list = Array.isArray(d) ? d : [];
    if (!list.length) throw new Error('no fonts found');
    const lines = [`🔤 Query: ${text.trim()}`, `│ Results: ${list.length}`];
    list.slice(0, 10).forEach((item, i) => {
      lines.push(`│ ${i + 1}. ${item.title || '-'}`);
      const cats = Array.isArray(item.categories) ? item.categories.join(', ') : item.categories;
      if (cats) lines.push(`│    Category: ${cats}`);
      if (item.link && item.link !== '-') lines.push(`│    Link: ${item.link}`);
    });
    await sendInteractive(client, m, fmt(lines.join('\n')));
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('fontsearch error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
