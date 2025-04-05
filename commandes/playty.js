require("dotenv").config();
const { zokou } = require("../framework/zokou");
const yts = require("yt-search");

zokou({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎵"
}, async (dest, zk, command) => {
  const { ms, repondre, arg } = command;

  if (!arg[0]) return repondre("Please provide a song name");

  try {
    // Search YouTube
    const search = await yts(arg.join(" "));
    if (!search.videos.length) return repondre("No songs found");

    const video = search.videos[0];
    const audioUrl = `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(video.url)}`;

    // Directly send audio from API URL
    await zk.sendMessage(dest, { 
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: ms });

  } catch (error) {
    console.error('Play Error:', error);
    repondre("Error: Failed to play audio");
  }
});