import { sendInteractive } from '../../lib/sendInteractive.js';
import { dlDownload } from '../../lib/downloaderChain.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'videy',
  aliases: ['videydl'],
  description: 'Download a Videy.co video',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    const idMatch = String(text || '').match(/[?&]id=([A-Za-z0-9]+)/) || String(text || '').match(/videy\.co\/v\/([A-Za-z0-9]+)/);
    const id = idMatch ? idMatch[1] : (/^[A-Za-z0-9]{5,}$/.test(String(text || '').trim()) ? text.trim() : null);
    if (!id) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('VIDEY', 'Give me a Videy link.\n│ Example: .videy https://videy.co/v?id=4F2uO7k21'));
    }

    try {
      const buf = await dlDownload(`https://cdn.videy.co/${id}.mp4`, { timeout: 120000 });
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      await client.sendMessage(m.chat, {
        video: buf,
        mimetype: 'video/mp4',
        fileName: `videy_${id}.mp4`,
        caption: box('VIDEY', `Downloaded: ${id}`)
      });
    } catch (e) {
      console.error('videy error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('VIDEY', `Failed: ${e.message || e}`));
    }
  }
};
