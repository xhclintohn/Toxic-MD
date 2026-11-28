import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveInstagram, dlDownload } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, '╭─❏ 「 IGDL」\n│ Give me an Instagram link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
  }
  if (!text.includes('instagram.com')) return sendInteractive(client, m, '╭─❏ 「 IGDL」\n│ That\'s not an Instagram link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
  try {
    const { media, title, username, likes, comment } = await resolveInstagram(text.trim());
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    for (const item of media.slice(0, 5)) {
      try {
        const buf = await dlDownload(item.url, { headers: { Referer: 'https://www.instagram.com/' }, minBytes: 1000 });
        const cap = `╭─❏ 「 Instagram DL」\n│ ${(title || 'Instagram Post').slice(0, 100)}\n│ 👤 @${username || 'unknown'}\n│ ❤️ ${likes ? Number(likes).toLocaleString() : 'N/A'} likes | 💬 ${comment ? Number(comment).toLocaleString() : 'N/A'} comments\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        if (item.type === 'mp4') {
          await client.sendMessage(m.chat, { video: buf, caption: cap, mimetype: 'video/mp4' });
        } else {
          await client.sendMessage(m.chat, { image: buf, caption: cap });
        }
      } catch {}
    }
  } catch (e) {
    console.error('igdl error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, `╭─❏ 「 IGDL」\n│ Failed: ${e.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
};
