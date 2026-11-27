import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'claude',
  aliases: ['claudeai'],
  description: 'Claude AI chat',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('CLAUDE AI', 'Ask me anything.\n│ Example: .claude explain black holes simply'));
    }

    try {
      const res = await fetch(`https://api.nexray.eu.cc/ai/claude?text=${encodeURIComponent(text)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(90000)
      });
      const data = await res.json();
      if (!data?.status || !data?.result) throw new Error(data?.error || 'No response from Claude');

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('CLAUDE AI', data.result));
    } catch (e) {
      console.error('claude error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('CLAUDE AI', `Failed: ${e.message || e}`));
    }
  }
};
