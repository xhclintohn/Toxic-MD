import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 PHISH CHECK」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}phishcheck https://example.com`));
  }
  try {
    const d = await nexrayGet('/tools/webphishing', { url: text.trim() }, 60000);
    if (!d) throw new Error('scan failed');
    const flag = (v) => (v ? '⚠️ Yes' : '✅ No');
    const lines = [
      `🔗 URL: ${d.scanned_url || text.trim()}`,
      `│ Status: ${d.status_description || '-'}`,
      `│ Phishing: ${flag(d.is_phishing)}`,
      `│ Malware: ${flag(d.contains_malware)}`,
      `│ Harmful sites: ${flag(d.sends_to_harmful_sites)}`,
      `│ Installs bad software: ${flag(d.installs_malicious_software)}`,
      `│ Suspicious downloads: ${flag(d.uncommon_downloads)}`
    ].join('\n');
    await sendInteractive(client, m, fmt(lines));
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('phishcheck error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
