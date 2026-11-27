import fetch from 'node-fetch';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default async (context) => {
  const { client, m, text } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

  if (!text) {
    return sendInteractive(client, m, box('LYRICS', '│ Tell me a song name!\n│ Example: .lyrics Alone ft ava max'));
  }

  try {
    let songTitle = 'Unknown';
    let artistName = 'Unknown Artist';
    let cleanLyrics = '';

    try {
      const res = await fetch(`https://api.nexray.eu.cc/search/lyrics?q=${encodeURIComponent(text)}`, { timeout: 30000 });
      const data = await res.json();
      const r = data?.result;
      if (data?.status && r?.lyrics?.plain_lyrics) {
        songTitle = r.title || r.lyrics.track_name || 'Unknown';
        artistName = r.artist || r.lyrics.artist_name || 'Unknown Artist';
        cleanLyrics = r.lyrics.plain_lyrics;
      }
    } catch {}

    if (!cleanLyrics) {
      const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(text)}`, { timeout: 30000 });
      const list = await res.json();
      const song = Array.isArray(list) ? list.find(s => s.plainLyrics) : null;
      if (song) {
        songTitle = song.trackName || song.name || 'Unknown';
        artistName = song.artistName || 'Unknown Artist';
        cleanLyrics = song.plainLyrics;
      }
    }

    if (!cleanLyrics) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('LYRICS', `│ No lyrics found for "${text}".`));
    }

    const bodyText = box('LYRICS', `│ ${songTitle} - ${artistName}\n│ \n${cleanLyrics}`);
    const copyCode = `${songTitle} - ${artistName}\n\n${cleanLyrics}`.slice(0, 4096);

    try {
      const msg = generateWAMessageFromContent(
        m.chat,
        {
          interactiveMessage: {
            body: { text: bodyText },
            footer: { text: '' },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📋 Copy Lyrics',
                    copy_code: copyCode
                  })
                }
              ]
            }
          }
        }
      );
      await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    } catch {
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      await client.sendMessage(m.chat, { text: bodyText });
    }
  } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    await sendInteractive(client, m, box('LYRICS ERROR', `│ Can't get lyrics for "${text}".`));
  }
};
