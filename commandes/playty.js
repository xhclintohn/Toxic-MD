require("dotenv").config();
const { zokou } = require("../framework/zokou");
const yts = require("yt-search");
const axios = require("axios");

zokou({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎵"
}, async (dest, zk, command) => {
  const { ms, repondre, arg } = command;

  if (!arg[0]) {
    return repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐔𝐒𝐈𝐂
╰───── • ─────╯

🎵 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞 𝐨𝐫 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐔𝐑𝐋
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);
  }

  try {
    // Search YouTube
    const search = await yts(arg.join(" "));
    if (!search.videos.length) {
      return repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐔𝐒𝐈𝐂
╰───── • ─────╯

🔍 𝐍𝐨 𝐬𝐨𝐧𝐠𝐬 𝐟𝐨𝐮𝐧𝐝
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);
    }

    const video = search.videos[0];
    const apiUrl = `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(video.url)}`;

    // Create stylish caption
    const caption = `
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐔𝐒𝐈𝐂
╰───── • ─────╯

🎶 𝐓𝐢𝐭𝐥𝐞: ${video.title}
🎤 𝐀𝐫𝐭𝐢𝐬𝐭: ${video.author.name}
⏳ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${video.duration.timestamp}
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`;

    // Send audio immediately with caption
    await zk.sendMessage(dest, {
      audio: { url: apiUrl },
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${video.title.replace(/[^\w\s]/gi, '')}.mp3`,
      caption: caption
    }, { quoted: ms });

  } catch (error) {
    console.error('Play Error:', error);
    await repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐔𝐒𝐈𝐂
╰───── • ─────╯

⚠️ 𝐄𝐫𝐫𝐨𝐫: ${error.message.includes('timeout') ? 'Request timed out' : 'Failed to process audio'}
💡 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);
  }
});