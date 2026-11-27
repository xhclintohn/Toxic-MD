import { sendInteractive } from '../../lib/sendInteractive.js';
import { sendAmLink } from '../../lib/alightmotion.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'amsend',
  aliases: ['amlink'],
  description: 'Send Alight Motion magic sign-in link to an email',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    const email = (text || '').trim();
    if (!email || !email.includes('@')) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('ALIGHT MOTION', 'Give me an email address.\n│ Example: .amsend user@example.com'));
    }

    try {
      const res = await sendAmLink(email);
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('ALIGHT MOTION', `Link sent!\n│ Email: ${email}\n│ Status: Success\n│ Message: ${res?.message || 'Check your inbox/spam for the verification link.'}`));
    } catch (e) {
      console.error('amsend error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('ALIGHT MOTION', `Failed: ${e.response?.data?.message || e.message || e}`));
    }
  }
};
