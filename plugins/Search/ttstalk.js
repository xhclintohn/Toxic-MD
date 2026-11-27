import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 TIKTOK PROFILE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}ttstalk username`));
  }
  try {
    const username = text.trim().replace(/^@/, '');
    const d = await nexrayGet('/stalker/tiktok', { username });
    if (!d) throw new Error('profile not found');
    const lines = [
      `👤 Name: ${d.name || d.title || '-'}`,
      `│ @${d.username || username}`,
      `│ Bio: ${(d.bio || d.description || '-').slice(0, 200)}`,
      `│ Verified: ${d.verified ? 'Yes' : 'No'}`,
      `│ Followers: ${d.stats?.followers ?? '-'}`,
      `│ Following: ${d.stats?.following ?? '-'}`,
      `│ Likes: ${d.stats?.likes ?? '-'}`,
      `│ Videos: ${d.stats?.videos ?? '-'}`,
      `│ Region: ${d.region || '-'}`,
      `│ Link: ${d.link || `https://www.tiktok.com/@${username}`}`
    ].join('\n');
    const avatar = d.avatar || d.avatarUrl || d.thumbnail;
    if (avatar) {
      await client.sendMessage(m.chat, { image: { url: avatar }, caption: fmt(lines) });
    } else {
      await sendInteractive(client, m, fmt(lines));
    }
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('ttstalk error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
