import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolvePinterestSearch, resolvePinterestPin } from '../../lib/downloaderChain.js';

function isPinterestUrl(t) {
  return /pinterest\.com|pin\.it/i.test(String(t || ''));
}

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 PINTEREST 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Usage:\n│ ${prefix}pinterest Spider man\n│ ${prefix}pinterest https://pin.it/...`));
  }

  try {
    if (isPinterestUrl(text.trim())) {
      const pin = await resolvePinterestPin(text.trim());
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      if (pin.video) {
        await client.sendMessage(m.chat, {
          video: { url: pin.video },
          caption: fmt(`*${pin.title}*`)
        });
      } else {
        await client.sendMessage(m.chat, {
          image: { url: pin.image },
          caption: fmt(`*${pin.title}*`)
        });
      }
      return;
    }

    const results = await resolvePinterestSearch(text.trim());
    const picks = results.slice(0, 5);
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    for (const item of picks) {
      await client.sendMessage(m.chat, {
        image: { url: item.image },
        caption: fmt(`Search: *${text}*`)
      }).catch(() => {});
    }
  } catch (e) {
    console.error('pinterest error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
