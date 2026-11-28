import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveNexrayDownload, mediaBuffer, tryChain, dlFetchJson, pickDownload, verifyLink } from '../../lib/downloaderChain.js';

export default {
  name: 'capcut',
  alias: ['cc', 'capcutdl'],
  description: 'Download CapCut videos',
  run: async (context) => {
    const { client, m, text, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
    const fmt = (msg) => `╭─❏ 「 CAPCUT DL」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, fmt(`Usage: ${prefix}capcut <url>`));
    }
    if (!/capcut\.com/i.test(text)) return sendInteractive(client, m, fmt("That doesn't look like a CapCut link."));
    try {
      const media = await tryChain('CapCut', [
        () => resolveNexrayDownload('/downloader/v1/capcut', text.trim()),
        async () => {
          const d = await dlFetchJson(`https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(text.trim())}`, { timeout: 60000 });
          const r = d.data || d.result || {};
          const link = pickDownload(r, 'video');
          if (!link) throw new Error('siputzx capcut: no link');
          await verifyLink(link);
          return { link, raw: r, title: r.title || 'CapCut Video' };
        }
      ]);
      const buf = await mediaBuffer(media);
      await client.sendMessage(m.chat, {
        video: buf,
        mimetype: 'video/mp4',
        caption: fmt(`Title: ${(media.title || 'Unknown').slice(0, 80)}\n│ Author: ${media.raw?.author?.name || media.raw?.author || 'Unknown'}`)
      });
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    } catch (e) {
      console.error('capcut error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      sendInteractive(client, m, fmt('Failed to download. Check the link and try again.'));
    }
  }
};
