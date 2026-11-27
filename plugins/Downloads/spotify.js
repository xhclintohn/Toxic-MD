import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveSpotify, mediaBuffer } from '../../lib/downloaderChain.js';

export default {
  name: 'spotify',
  aliases: ['spotifydl', 'spoti', 'spt'],
  description: 'Downloads songs from Spotify',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    try {
      const query = (text || '').trim();
      if (!query) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, "╭─❏ 「 SPOTIFY」\n│ Give me a song name or a Spotify link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
      }

      if (query.length > 200) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, "╭─❏ 「 SPOTIFY」\n│ Song title longer than my patience. 200 chars MAX!\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
      }

      const song = await resolveSpotify(query);
      const buf = await mediaBuffer(song);
      const filename = song.title || 'Unknown Song';
      const artist = song.artist || song.channel || 'Unknown Artist';

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});

      await client.sendMessage(m.chat, {
        audio: buf,
        mimetype: 'audio/mpeg',
        fileName: `${filename}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: filename.substring(0, 30),
            body: artist.substring(0, 30),
            thumbnailUrl: song.thumbnail || '',
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      });

      await client.sendMessage(m.chat, {
        document: buf,
        mimetype: 'audio/mpeg',
        fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
        caption: `╭─❏ 「 SPOTIFY」\n│ ${filename} - ${artist}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      });

    } catch (error) {
      console.error('Spotify error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, `╭─❏ 「 SPOTIFY ERROR」\n│ Download failed.\n│ ${error.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
  }
};
