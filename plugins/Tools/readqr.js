import { sendInteractive } from '../../lib/sendInteractive.js';
import { uploadToUrl } from '../../lib/toUrl.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'readqr',
  aliases: ['qrdecode', 'scanqr'],
  description: 'Decode a QR code from an image',
  run: async (context) => {
    const { client, m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    const quoted = m.quoted ? m.quoted : m;
    const mime = quoted.mimetype || m.mimetype || '';
    if (!/image/.test(mime)) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('READ QR', 'Reply to an image containing a QR code.'));
    }

    try {
      const media = await quoted.download();
      const imgUrl = await uploadToUrl(media);
      const res = await fetch(`https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(imgUrl)}`, {
        signal: AbortSignal.timeout(30000)
      });
      const data = await res.json();
      const decoded = data?.[0]?.symbol?.[0]?.data;
      if (!decoded) throw new Error('No QR code found in that image');

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('READ QR', `Decoded:\n│ ${decoded}`));
    } catch (e) {
      console.error('readqr error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('READ QR', `Failed: ${e.message || e}`));
    }
  }
};
