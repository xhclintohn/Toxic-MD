import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'blackbox',
  aliases: ['blackboxai', 'bbai'],
  description: 'Blackbox AI coding assistant',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('BLACKBOX AI', 'Ask me anything or give me a coding task.\n│ Example: .blackbox write a javascript function to sum an array'));
    }

    try {
      const res = await fetch(`https://apiii-xrina.my.id/ai/blackbox-ai?text=${encodeURIComponent(text)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(90000)
      });
      const data = await res.json();
      if (!data?.status || !data?.data?.response) throw new Error(data?.message || 'No response from Blackbox AI');

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('BLACKBOX AI', data.data.response));
    } catch (e) {
      console.error('blackbox error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('BLACKBOX AI', `Failed: ${e.message || e}`));
    }
  }
};
