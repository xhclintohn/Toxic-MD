require("dotenv").config();
const { zokou } = require("../framework/zokou");
const yts = require("yt-search");
const BaseUrl = process.env.GITHUB_GIT;
const toxicapikey = process.env.BOT_OWNER;

// Validate configuration
if (!BaseUrl || !toxicapikey) {
  throw new Error("Configuration error: Missing BaseUrl or API key.");
}

zokou({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  
  if (!arg[0]) {
    return repondre("🎵 *Please provide a song name to search*");
  }

  try {
    // Search for the song
    const searchResults = await yts(arg.join(" "));
    const videos = searchResults.videos;
    
    if (videos.length === 0) {
      return repondre("🔍 *No audio found for your search*");
    }

    // Get the first video result
    const videoUrl = videos[0].url;
    
    // Fetch audio download link
    const response = await fetch(`${BaseUrl}/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=${toxicapikey}`);
    const data = await response.json();

    if (data.status === 200 && data.success) {
      // Send only the audio file
      await zk.sendMessage(dest, {
        audio: { 
          url: data.result.download_url 
        },
        mimetype: "audio/mpeg",
        ptt: false
      }, { 
        quoted: ms 
      });
      
      // No additional reply message will be sent
    } else {
      repondre("❌ *Failed to download audio. Please try again later.*");
    }
  } catch (error) {
    console.error("Error:", error);
    repondre("⚠️ *An error occurred while processing your request*");
  }
});

// Alias for the play command
zokou({
  nomCom: "song",
  categorie: "Download",
  reaction: "🎸"
}, async (dest, zk, commandeOptions) => {
  // This will automatically trigger the same functionality as 'play'
  await zk.commands.get('play').execute(dest, zk, commandeOptions);
});