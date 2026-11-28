import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'tthashtag',
  aliases: ['tiktokhashtag', 'hashtag'],
  description: 'Find trending TikTok hashtags for a keyword',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('TIKTOK HASHTAGS', 'Give me a keyword or hashtag.\n│ Example: .tthashtag cat'));
    }

    try {
      const hashtag = text.trim().startsWith('#') ? text.trim() : `#${text.trim()}`;
      const res = await fetch(`https://api.nexray.eu.cc/tools/tiktokhashtags?hashtags=${encodeURIComponent(hashtag)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(30000)
      });
      const data = await res.json();
      if (!data?.status || !data?.result) throw new Error(data?.error || 'No hashtags found');

      const r = data.result;
      const lines = [];
      const push = (label, list) => {
        if (Array.isArray(list) && list.length) {
          lines.push(`*${label}:*`);
          lines.push(list.map(h => typeof h === 'string' ? h : (h.hashtag || h.name || '')).filter(Boolean).join(' '));
        }
      };
      push('Most Popular', r.most_popular);
      push('Top', r.top);
      push('Related', r.related);
      push('Suggestions', r.suggestions || r.hashtags);
      if (!lines.length) lines.push(JSON.stringify(r).slice(0, 500));

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('TIKTOK HASHTAGS', `Hashtag: ${hashtag}\n│ ${lines.join('\n│ ')}`));
    } catch (e) {
      console.error('tthashtag error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('TIKTOK HASHTAGS', `Failed: ${e.message || e}`));
    }
  }
};
