import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 TWITTER/X PROFILE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}twstalk username`));
  }
  try {
    const username = text.trim().replace(/^@/, '');
    const d = await nexrayGet('/stalker/twitter', { username });
    if (!d) throw new Error('profile not found');
    const num = (v) => (v === undefined || v === null ? '-' : Number(v).toLocaleString('en-US'));
    const lines = [
      `👤 Name: ${d.name || '-'}`,
      `│ @${d.username || username}`,
      `│ Verified: ${d.verified ? 'Yes' : 'No'}`,
      `│ Bio: ${(d.description || '-').slice(0, 200)}`,
      `│ Location: ${d.location || '-'}`,
      `│ Joined: ${d.created_at || '-'}`,
      `│ Tweets: ${num(d.stats?.tweets)}`,
      `│ Following: ${num(d.stats?.following)}`,
      `│ Followers: ${num(d.stats?.followers)}`,
      `│ Likes: ${num(d.stats?.likes)}`
    ].join('\n');
    const avatar = d.avatar || d.avatarUrl || d.profile_image_url || d.thumbnail;
    if (avatar) {
      await client.sendMessage(m.chat, { image: { url: avatar }, caption: fmt(lines) });
    } else {
      await sendInteractive(client, m, fmt(lines));
    }
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('twstalk error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
