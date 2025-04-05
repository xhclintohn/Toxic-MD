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
    return repondre("Please provide a song name or YouTube URL");
  }

  try {
    // Search YouTube
    const search = await yts(arg.join(" "));
    if (!search.videos.length) {
      return repondre("No songs found");
    }

    const video = search.videos[0];
    const apiUrl = `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(video.url)}`;

    // Download audio as buffer
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    });
    
    const audioBuffer = Buffer.from(response.data);

    // Send only audio without caption
    await zk.sendMessage(dest, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: ms });

  } catch (error) {
    console.error('Play Error:', error);
    await repondre("Error: Failed to process audio");
  }
});