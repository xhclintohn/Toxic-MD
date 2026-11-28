import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 TRACK IP」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}trackip 8.8.8.8`));
  }
  try {
    const d = await nexrayGet('/tools/trackip', { target: text.trim() });
    if (!d) throw new Error('no data found');
    const lines = [
      `🌐 IP: ${d.ip || text.trim()}`,
      `│ Country: ${d.country || '-'} (${d.country_code || '-'})`,
      `│ Region: ${d.region_name || d.region || '-'}`,
      `│ City: ${d.city || '-'}`,
      `│ ZIP: ${d.zip || '-'}`,
      `│ Timezone: ${d.timezone || '-'}`,
      `│ ISP: ${d.isp || '-'}`,
      `│ Org: ${d.org || '-'}`,
      `│ AS: ${d.as || '-'}`,
      `│ Coordinates: ${d.latitude || '-'}, ${d.longitude || '-'}`
    ].join('\n');
    await sendInteractive(client, m, fmt(lines));
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('trackip error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
