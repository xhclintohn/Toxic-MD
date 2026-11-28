import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveTiktok, dlDownload } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, `╭─❏ 「 TikTok DL」\n│ Example: ${prefix}tiktok https://vt.tiktok.com/xxx\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
  if (!text.includes('tiktok.com')) return sendInteractive(client, m, '╭─❏ 「 TikTok DL」\n│ That\'s not a TikTok link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
  try {
    const media = await resolveTiktok(text.trim());
    const buf = await dlDownload(media.link, { headers: media.referer ? { Referer: media.referer } : {} });
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    const cap = `╭─❏ 「 TikTok DL」\n│ ${(media.title || 'TikTok Video').slice(0, 100)}\n│ 👤 ${media.author || 'Unknown'}\n│ ⏱ ${media.duration || 'N/A'}\n│ 👁 ${media.views} views | ❤️ ${media.likes} likes\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    await client.sendMessage(m.chat, { video: buf, caption: cap, mimetype: 'video/mp4', gifPlayback: false });
  } catch (e) {
    console.error('tikdl error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, `╭─❏ 「 TikTok DL」\n│ TikTok download failed.\n│ The video might be private or the\n│ service is down. Try again later.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
};
