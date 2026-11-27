import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 YOUTUBE CHANNEL」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}ytstalk username`));
  }
  try {
    const username = text.trim().replace(/^@/, '');
    const d = await nexrayGet('/stalker/youtube', { username });
    if (!d) throw new Error('channel not found');
    const ch = d.channel || d;
    const lines = [
      `📺 Name: ${ch.name || ch.username || '-'}`,
      `│ Username: ${ch.username || username}`,
      `│ Subscribers: ${ch.subscriberCount || '-'}`,
      `│ Videos: ${ch.videoCount || '-'}`,
      `│ Channel: ${ch.channelUrl || '-'}`,
      `│ Description: ${(ch.description || '-').slice(0, 200)}`
    ];
    const videos = Array.isArray(d.latest_videos) ? d.latest_videos.slice(0, 5) : [];
    if (videos.length) {
      lines.push('│', '│ Latest videos:');
      videos.forEach((v, i) => {
        lines.push(`│ ${i + 1}. ${(v.title || '').slice(0, 60)}`);
        if (v.url) lines.push(`│ ${v.url}`);
      });
    }
    const avatar = ch.avatar || ch.avatarUrl || ch.thumbnail;
    if (avatar) {
      await client.sendMessage(m.chat, { image: { url: avatar }, caption: fmt(lines.join('\n')) });
    } else {
      await sendInteractive(client, m, fmt(lines.join('\n')));
    }
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('ytstalk error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
