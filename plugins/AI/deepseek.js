import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'deepseek',
  aliases: ['deepseekai', 'r1'],
  description: 'DeepSeek AI chat',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('DEEPSEEK AI', 'Ask me anything.\n│ Example: .deepseek write a haiku about rain'));
    }

    try {
      const res = await fetch(`https://apiii-xrina.my.id/ai/deepseek?text=${encodeURIComponent(text)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(90000)
      });
      const data = await res.json();
      if (!data?.status || !data?.data?.response) throw new Error(data?.message || 'No response from DeepSeek');

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('DEEPSEEK AI', data.data.response));
    } catch (e) {
      console.error('deepseek error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('DEEPSEEK AI', `Failed: ${e.message || e}`));
    }
  }
};
