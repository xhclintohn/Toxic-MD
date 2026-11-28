import { sendInteractive } from '../../lib/sendInteractive.js';
import { verifyAmAccount } from '../../lib/alightmotion.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'amverify',
  aliases: ['amverif'],
  description: 'Verify an Alight Motion account with email + magic link',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    const parts = (text || '').trim().split(/\s+/);
    const email = parts[0];
    const link = parts.slice(1).join(' ');
    if (!email || !link || !email.includes('@') || !link.startsWith('http')) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('ALIGHT MOTION', 'Format: .amverify <email> <verification link>\n│ Example: .amverify user@example.com https://alightcreative.com/signin?oobCode=xxxx'));
    }

    try {
      const res = await verifyAmAccount(email, link);
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('ALIGHT MOTION', `Verified!\n│ Email: ${email}\n│ Order ID: ${res?.orderId || '-'}\n│ UID: ${res?.uid || '-'}\n│ Status: Successfully verified`));
    } catch (e) {
      console.error('amverify error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('ALIGHT MOTION', `Failed: ${e.response?.data?.message || e.message || e}`));
    }
  }
};
