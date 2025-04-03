require("dotenv").config();
const { zokou } = require("../framework/zokou");
const yts = require("yt-search");

// Configuration
const BaseUrl = process.env.GITHUB_GIT;
const apiKey = process.env.BOT_OWNER;

function validateConfig() {
  if (!BaseUrl || !apiKey) {
    throw new Error("Configuration error: Missing BaseUrl or API key.");
  }
}
validateConfig();

// Video Download Command
zokou({
  nomCom: "video",
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, command) => {
  const { ms, repondre, arg } = command;
  
  if (!arg[0]) {
    return repondre("🎥 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐯𝐢𝐝𝐞𝐨 𝐧𝐚𝐦𝐞 𝐭𝐨 𝐬𝐞𝐚𝐫𝐜𝐡");
  }

  try {
    const search = await yts(arg.join(" "));
    const videos = search.videos;
    
    if (videos.length === 0) {
      return repondre("🔍 𝐍𝐨 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐲𝐨𝐮𝐫 𝐬𝐞𝐚𝐫𝐜𝐡");
    }

    const videoUrl = videos[0].url;
    const response = await fetch(`${BaseUrl}/api/download/ytmp4?url=${encodeURIComponent(videoUrl)}&apikey=${apiKey}`);
    const data = await response.json();

    if (data.status === 200 && data.success) {
      const downloadUrl = data.result.download_url;
      
      // Stylish caption with your requested font
      const caption = `
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝐈𝐃𝐄𝐎
╰───── • ─────╯

🎬 𝐓𝐢𝐭𝐥𝐞: ${videos[0].title}
⏳ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${videos[0].duration.timestamp}
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`;

      await zk.sendMessage(dest, {
        image: { url: videos[0].thumbnail },
        caption: caption
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: downloadUrl },
        mimetype: "video/mp4"
      }, { quoted: ms });

      repondre("✅ 𝐕𝐢𝐝𝐞𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲");
    } else {
      repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐯𝐢𝐝𝐞𝐨");
    }
  } catch (error) {
    console.error("Error:", error);
    repondre("⚠️ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝");
  }
});

// Audio Download Command
zokou({
  nomCom: ["play", "song"],
  categorie: "Download",
  reaction: "🎵"
}, async (dest, zk, command) => {
  const { ms, repondre, arg } = command;
  
  if (!arg[0]) {
    return repondre("🎵 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞");
  }

  try {
    const search = await yts(arg.join(" "));
    const videos = search.videos;
    
    if (videos.length === 0) {
      return repondre("🔍 𝐍𝐨 𝐬𝐨𝐧𝐠𝐬 𝐟𝐨𝐮𝐧𝐝");
    }

    const videoUrl = videos[0].url;
    const response = await fetch(`${BaseUrl}/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=${apiKey}`);
    const data = await response.json();

    if (data.status === 200 && data.success) {
      const downloadUrl = data.result.download_url;
      
      // Stylish audio caption
      const audioCaption = `
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐔𝐒𝐈𝐂
╰───── • ─────╯

🎶 𝐓𝐢𝐭𝐥𝐞: ${videos[0].title}
🎤 𝐀𝐫𝐭𝐢𝐬𝐭: ${videos[0].author.name}
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`;

      await zk.sendMessage(dest, {
        image: { url: videos[0].thumbnail },
        caption: audioCaption
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        audio: { url: downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${videos[0].title}.mp3`
      }, { quoted: ms });

      repondre("✅ 𝐒𝐨𝐧𝐠 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 🎶");
    } else {
      repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐬𝐨𝐧𝐠");
    }
  } catch (error) {
    console.error("Error:", error);
    repondre("⚠️ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝");
  }
});