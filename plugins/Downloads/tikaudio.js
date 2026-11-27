import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveTiktok, dlDownload } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, `╭─❏ 「 TikTok Audio」\n│ Example: ${prefix}tikaudio https://vt.tiktok.com/xxx\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
  if (!text.includes('tiktok.com')) return sendInteractive(client, m, '╭─❏ 「 TikTok Audio」\n│ That\'s not a TikTok link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
  try {
    const media = await resolveTiktok(text.trim());
    if (!media.music) throw new Error('No audio URL found');
    const buf = await dlDownload(media.music, { headers: media.referer ? { Referer: media.referer } : {} });
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    await client.sendMessage(m.chat, {
      audio: buf,
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${(media.musicTitle || media.title || 'tiktok-audio').slice(0, 60)}.mp3`
    });
    await sendInteractive(client, m, `╭─❏ 「 TikTok Audio」\n│ 🎵 ${(media.musicTitle || media.title || 'N/A').slice(0, 80)}\n│ 👤 ${media.author || 'N/A'}\n│ ⏱ ${media.duration || 'N/A'}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  } catch (e) {
    console.error('tikaudio error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, `╭─❏ 「 TikTok Audio」\n│ Failed: ${e.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
};
