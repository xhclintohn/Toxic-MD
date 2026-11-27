import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 PINTEREST PROFILE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}pinstalk username`));
  }
  try {
    const username = text.trim().replace(/^@/, '');
    const d = await nexrayGet('/stalker/pinterest', { username });
    if (!d) throw new Error('profile not found');
    const num = (v) => (v === undefined || v === null ? '-' : Number(v).toLocaleString('en-US'));
    const lines = [
      `📌 Name: ${d.full_name || '-'}`,
      `│ @${d.username || username}`,
      `│ Bio: ${(d.bio || '-').slice(0, 200)}`,
      `│ Followers: ${num(d.stats?.followers)}`,
      `│ Following: ${num(d.stats?.following)}`,
      `│ Pins: ${num(d.stats?.pins)}`,
      `│ Boards: ${num(d.stats?.boards)}`,
      `│ Website: ${d.website || '-'}`,
      `│ Profile: ${d.profile_url || '-'}`
    ].join('\n');
    const avatar = d.avatar || d.avatarUrl || d.image || d.thumbnail;
    if (avatar) {
      await client.sendMessage(m.chat, { image: { url: avatar }, caption: fmt(lines) });
    } else {
      await sendInteractive(client, m, fmt(lines));
    }
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('pinstalk error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
