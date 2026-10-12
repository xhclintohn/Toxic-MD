import yts from 'yt-search';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
  const { client, m, text } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

  const fmt = (message) =>
`╭─❏ 「 YTS 」
│ ${message}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt("Drop a search term. Ex: .yts Alan Walker Alone"));
  }

  try {
    const searchResult = await yts(text);
    if (!searchResult?.videos?.length) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, fmt("No YouTube results found. Try another search."));
    }

    const videos = searchResult.videos.slice(0, 5);
    let lines = [`Search: *${text}*`, ''];
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      lines.push(`*${i + 1}. ${v.title}*`);
      lines.push(`📎 ${v.url}`);
      lines.push(`👤 ${v.author?.name || 'Unknown'} · 👁 ${(v.views || 0).toLocaleString?.() || v.views} · ⏳ ${v.timestamp || ''}`);
      lines.push('');
    }
    const body = lines.join('\n').trim();
    await sendInteractive(client, m, fmt(body));

    const first = videos[0];
    await client.sendMessage(m.chat, {
      image: { url: first.thumbnail },
      caption: fmt(`🎬 First result: *${first.title}*\n📎 ${first.url}`)
    });
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    await sendInteractive(client, m, fmt(`Error: ${error.message}`));
  }
};
