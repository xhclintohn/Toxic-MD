require("dotenv").config();
const { zokou } = require("../framework/zokou");
const yts = require("yt-search");

// Configuration
const API_BASE_URL = "https://api.dreaded.site/api/ytdl/audio"; // Updated API base URL

// Audio Download Command (only 'play' command)
zokou({
  nomCom: "play", // Only one command now
  categorie: "Download",
  reaction: "🎵"
}, async (dest, zk, command) => {
  const { ms, repondre, arg } = command;
  
  if (!arg[0]) {
    return repondre("🎵 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞 𝐨𝐫 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐔𝐑𝐋");
  }

  try {
    let videoUrl;
    let videoInfo;
    
    // Check if the input is a YouTube URL
    if (arg[0].includes("youtube.com") || arg[0].includes("youtu.be")) {
      videoUrl = arg[0];
      const searchResult = await yts({ videoId: videoUrl.split('v=')[1]?.split('&')[0] });
      videoInfo = searchResult.videos[0];
    } else {
      // Search for the song
      const search = await yts(arg.join(" "));
      const videos = search.videos;
      
      if (videos.length === 0) {
        return repondre("🔍 𝐍𝐨 𝐬𝐨𝐧𝐠𝐬 𝐟𝐨𝐮𝐧𝐝");
      }
      videoInfo = videos[0];
      videoUrl = videoInfo.url;
    }

    // Fetch audio from the specified API
    const response = await fetch(`${API_BASE_URL}/audio?url=${encodeURIComponent(videoUrl)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const audioData = await response.arrayBuffer();
    
    // Stylish caption with original font style
    const caption = `
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐔𝐒𝐈𝐂
╰───── • ─────╯

🎶 𝐓𝐢𝐭𝐥𝐞: ${videoInfo.title}
🎤 𝐀𝐫𝐭𝐢𝐬𝐭: ${videoInfo.author.name}
⏳ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${videoInfo.duration.timestamp}
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`;

    await zk.sendMessage(dest, {
      audio: audioData,
      mimetype: "audio/mpeg",
      ptt: false
    }, { quoted: ms });

    repondre(caption);

  } catch (error) {
    console.error("Error:", error);
    repondre("⚠️ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐫𝐞𝐪𝐮𝐞𝐬𝐭");
  }
});