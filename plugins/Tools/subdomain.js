import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 SUBDOMAIN FINDER」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}subdomain google.com`));
  }
  try {
    const domain = text.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    const d = await nexrayGet('/tools/subdomainfinder', { domain }, 90000);
    const list = Array.isArray(d) ? d : [];
    if (!list.length) throw new Error('no subdomains found');
    const lines = [`🔎 Domain: ${domain}`, `│ Found: ${list.length}`];
    list.slice(0, 30).forEach((item, i) => {
      lines.push(`│ ${i + 1}. ${item.subdomain || item}`);
      if (item.ip) lines.push(`│    IP: ${item.ip} | Cloudflare: ${item.cloudflare ? 'Yes' : 'No'}`);
    });
    if (list.length > 30) lines.push(`│ ...and ${list.length - 30} more`);
    await sendInteractive(client, m, fmt(lines.join('\n')));
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('subdomain error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
