import yts from 'yt-search';
import fetch from 'node-fetch';
import { sendInteractive } from '../../lib/sendInteractive.js';

const RYUU_KEY = 'ryuu-apis-9c049100c28fc39e1791732697814';
const RYUU_YT = 'https://api.ryuu-dev.my.id/downloader/youtube';

async function ryuuMp3(url) {
    const r = await fetch(RYUU_YT + '?url=' + encodeURIComponent(url) + '&format=mp3', {
        headers: { 'X-RYUU-APIKEY': RYUU_KEY, 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000
    });
    const d = await r.json();
    const res = d.result || d.data || d;
    const link = res.link || res.downloadUrl || res.url || res.cdn;
    if (!link) throw new Error(d?.message || 'Ryuu yt mp3 failed');
    return {
        audioUrl: link,
        filename: res.title || res.filename || 'audio',
        thumbnail: res.thumbnail || '',
        sourceUrl: url,
        channel: res.channel || '',
        duration: res.duration || '',
        views: res.views || ''
    };
}

export default {
  name: 'play',
  aliases: ['ply', 'playy', 'pl'],
  description: 'Downloads songs from YouTube and sends audio',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    const fmt = (msg) => `╭─❏ 「 PLAY」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    try {
      const query = text ? text.trim() : '';
      if (!query) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('Give a song name OR a YouTube link.\n│ Example: .play harlem shake'));
      }

      const isYoutubeLink = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/)/i.test(query);
      let audioUrl, filename, thumbnail, sourceUrl;

      if (isYoutubeLink) {
        try {
          const got = await ryuuMp3(query);
          audioUrl = got.audioUrl; filename = got.filename; thumbnail = got.thumbnail; sourceUrl = got.sourceUrl;
        } catch {
          const response = await fetch(`https://api.sidycoders.xyz/api/ytdl?url=${encodeURIComponent(query)}&format=mp3&apikey=memberdycoders`);
          const data = await response.json();
          if (!data.status || !data.cdn) throw new Error('Cannot download that YouTube link');
          audioUrl = data.cdn; filename = data.title || 'YouTube Song'; thumbnail = ''; sourceUrl = query;
        }
      } else {
        let ytUrl = null;
        try {
          const search = await yts(query);
          ytUrl = search?.videos?.[0]?.url || null;
          if (search?.videos?.[0]?.title) filename = search.videos[0].title;
          if (search?.videos?.[0]?.thumbnail) thumbnail = search.videos[0].thumbnail;
        } catch {}

        if (ytUrl) {
          try {
            const got = await ryuuMp3(ytUrl);
            audioUrl = got.audioUrl;
            filename = got.filename || filename || 'Song';
            thumbnail = got.thumbnail || thumbnail || '';
            sourceUrl = ytUrl;
          } catch {}
        }

        if (!audioUrl) {
          const response = await fetch(`https://apiziaul.vercel.app/api/downloader/ytplaymp3?query=${encodeURIComponent(query)}`);
          const data = await response.json();
          if (!data.status || !data.result?.downloadUrl) throw new Error(`No song found for "${query}"`);
          audioUrl = data.result.downloadUrl;
          filename = data.result.title || filename || 'Song';
          thumbnail = data.result.thumbnail || thumbnail || '';
          sourceUrl = data.result.videoUrl || ytUrl || '';
        }
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      await client.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${filename}.mp3`,
        contextInfo: thumbnail ? {
          externalAdReply: {
            title: String(filename).substring(0, 30),
            body: 'Toxic-MD',
            thumbnailUrl: thumbnail,
            sourceUrl: sourceUrl || undefined,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        } : undefined
      });
      await client.sendMessage(m.chat, {
        document: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${String(filename).replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
        caption: fmt(String(filename))
      });
    } catch (error) {
      console.error('Play error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, fmt(`Play failed: ${error.message || 'unknown error'}`));
    }
  }
};
