import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveTwitter, dlDownload } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, `╭─❏ 「 Twitter/X DL」\n│ Example: ${prefix}twitter https://x.com/user/status/xxxx\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
  if (!text.includes('twitter.com') && !text.includes('x.com') && !text.includes('t.co')) return sendInteractive(client, m, '╭─❏ 「 Twitter/X DL」\n│ That\'s not a Twitter/X link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
  try {
    const media = await resolveTwitter(text.trim());
    const buf = await dlDownload(media.link);
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    await client.sendMessage(m.chat, {
      video: buf, mimetype: 'video/mp4',
      caption: `╭─❏ 「 Twitter/X Video」\n│ ${(media.title || '').slice(0, 80)}\n│ Duration: ${media.duration || 'N/A'}\n│ Quality: ${media.quality || 'HD'}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
    });
  } catch (e) {
    console.error('twtdl error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, `╭─❏ 「 Twitter/X DL」\n│ Twitter/X download failed.\n│ The tweet might be private or deleted.\n│ Try again later.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  }
};
