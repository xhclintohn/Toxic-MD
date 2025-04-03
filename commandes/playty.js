require("dotenv").config();
const { zokou } = require("../framework/zokou");
const yts = require("yt-search");

// Audio Download Command
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
    let videoUrl;
    let videoInfo;
    
    // Check if input is YouTube URL
    if (arg[0].includes("youtube.com") || arg[0].includes("youtu.be")) {
      videoUrl = arg[0];
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      const searchResult = await yts({ videoId });
      videoInfo = searchResult.videos[0];
    } else {
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
      videoInfo = search.videos[0];
      videoUrl = videoInfo.url;
    }

    // Fetch audio directly from API
    const apiUrl = `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio (Status: ${response.status})`);
    }

    // Create stylish caption
    const caption = `
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐔𝐒𝐈𝐂
╰───── • ─────╯

🎶 𝐓𝐢𝐭𝐥𝐞: ${videoInfo.title}
🎤 𝐀𝐫𝐭𝐢𝐬𝐭: ${videoInfo.author.name}
⏳ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${videoInfo.duration.timestamp}
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`;

    // Send audio with caption in one message
    await zk.sendMessage(dest, {
      audio: { url: apiUrl }, // Stream directly from URL
      mimetype: 'audio/mpeg',
      ptt: false,
      caption: caption
    }, { quoted: ms });

  } catch (error) {
    console.error('Play Command Error:', error);
    await repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐔𝐒𝐈𝐂
╰───── • ─────╯

⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐩𝐫𝐨𝐜𝐞𝐬𝐬 𝐚𝐮𝐝𝐢𝐨: ${error.message}
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);
  }
});