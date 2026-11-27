import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveFacebook, dlDownload } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

  const fmt = (msg) => `╭─❏ 「 Facebook DL」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}fbdl https://fb.watch/xxxxx`));
  }
  if (!text.includes('facebook.com') && !text.includes('fb.watch')) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt("That's not a Facebook link."));
  }

  try {
    const media = await resolveFacebook(text.trim());
    const buf = await dlDownload(media.link);
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    await client.sendMessage(m.chat, {
      video: buf,
      mimetype: 'video/mp4',
      caption: fmt(`${(media.title || 'Facebook Video').slice(0, 100)}`)
    });
  } catch (e) {
    console.error('fbdl error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
