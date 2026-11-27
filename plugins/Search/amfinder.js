import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
  name: 'amfinder',
  aliases: ['presetam', 'ampreset', 'caripreset'],
  description: 'Find Alight Motion preset links in a TikTok video\'s comments',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    if (!text || !/tiktok\.com/i.test(text)) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('AM FINDER', 'Give me a TikTok video link.\n│ Example: .amfinder https://vt.tiktok.com/ZSpqmFP7H/'));
    }

    try {
      const res = await fetch(`https://apiii-xrina.my.id/search/amfinder?url=${encodeURIComponent(text.trim())}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(90000)
      });
      const json = await res.json();
      if (!json?.status || !json?.data) throw new Error(json?.message || 'Failed to process that TikTok');

      const { author, avatar, video, presetLinks } = json.data;
      let caption = `Author: @${author || 'unknown'}\n│ Video: ${video?.url || text.trim()}`;

      if (!presetLinks || !presetLinks.length) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, box('AM FINDER', `${caption}\n│ No Alight Motion preset links found in that video.`));
      }

      caption += `\n│ Total Presets: ${presetLinks.length} found\n│ `;
      presetLinks.forEach((p, i) => {
        const link = p.link || p.url || p.preset || '';
        caption += `\n│ ${i + 1}. ${link}`;
      });

      const banner = presetLinks[0]?.thumb || avatar || video?.cover || null;
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      if (banner) {
        await client.sendMessage(m.chat, { image: { url: banner }, caption: box('AM FINDER', caption) });
      } else {
        return sendInteractive(client, m, box('AM FINDER', caption));
      }
    } catch (e) {
      console.error('amfinder error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('AM FINDER', `Failed: ${e.message || e}`));
    }
  }
};
