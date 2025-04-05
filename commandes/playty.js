require("dotenv").config();
const { zokou } = require("../framework/zokou");
const yts = require("yt-search");
const axios = require("axios");

const BaseUrl = "https://api.bwmxmd.online/api/download";
const giftedapikey = "ibraah-help";

// Validate configuration
function validateConfig() {
  if (!BaseUrl || !giftedapikey) {
    throw new Error("Configuration error: Missing BaseUrl or API key.");
  }
}
validateConfig();

king({
  nomCom: "play",
  categorie: "Search",
  reaction: "🎶"
}, async (dest, zk, command) => {
  const {
    ms: message,
    repondre: reply,
    arg: args,
    auteurMessage: sender
  } = command;
  
  if (!args[0]) {
    return reply("Please provide a song name or keyword.");
  }

  try {
    const searchQuery = args.join(" ");
    const searchResults = await yts(searchQuery);
    const videos = searchResults.videos;
    
    if (!videos || videos.length === 0) {
      return reply("No songs found for the given name.");
    }

    const selectedVideo = videos[0];
    const videoUrl = selectedVideo.url;

    // Send video info
    await zk.sendMessage(dest, {
      image: { url: selectedVideo.thumbnail },
      caption: `╭─────═━┈┈━═──━┈⊷\n┇ 『 *DOWLODER* 』\n┇ *Bot name : FLASH-MD* \n┇ *Owner: France King* \n╰─────═━┈┈━═──━┈⊷\n\n` +
               `*Title:* ${selectedVideo.title}\n` +
               `*Duration:* ${selectedVideo.timestamp}\n` +
               `*Views:* ${selectedVideo.views}\n` +
               `*Uploaded:* ${selectedVideo.ago}\n` +
               `*Channel:* ${selectedVideo.author.name}\n\n` +
               `*YouTube URL:* ${videoUrl}`
    }, { quoted: message });

    // Get download URL
    const apiUrl = `${BaseUrl}/ytmp3?apikey=${giftedapikey}&url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl);
    
    if (response.data && response.data.success) {
      const downloadUrl = response.data.result.download_url;
      
      // Send audio
      await zk.sendMessage(dest, {
        audio: { url: downloadUrl },
        mimetype: "audio/mpeg"
      }, { quoted: message });
      
      reply("Downloaded Successfully ✅");
    } else {
      reply("Failed to download the audio.");
    }
  } catch (error) {
    console.error("Error:", error);
    reply("An error occurred while processing your request.");
  }
});

king({
  nomCom: "video",
  categorie: "Search",
  reaction: "🎥"
}, async (dest, zk, command) => {
  const {
    ms: message,
    repondre: reply,
    arg: args
  } = command;
  
  if (!args[0]) {
    return reply("Please insert a video name.");
  }

  try {
    const searchQuery = args.join(" ");
    const searchResults = await yts(searchQuery);
    const videos = searchResults.videos;
    
    if (videos.length === 0) {
      return reply("No videos found.");
    }

    const selectedVideo = videos[0];
    const videoUrl = selectedVideo.url;

    // Get download URL
    const apiUrl = `${BaseUrl}/ytmp4?apikey=${giftedapikey}&url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl);
    
    if (response.data && response.data.success) {
      const downloadUrl = response.data.result.download_url;
      
      // Send video info
      await zk.sendMessage(dest, {
        image: { url: selectedVideo.thumbnail },
        caption: `╭─────═━┈┈━═──━┈⊷\n┇ 『 *DOWLODER* 』\n┇ *Bot name : FLASH-MD* \n┇ *Owner: France King* \n╰─────═━┈┈━═──━┈⊷`
      }, { quoted: message });
      
      // Send video
      await zk.sendMessage(dest, {
        video: { url: downloadUrl },
        mimetype: "video/mp4"
      }, { quoted: message });
      
      reply("Downloaded Successfully ✅");
    } else {
      reply("Failed to download the video.");
    }
  } catch (error) {
    console.error("Error:", error);
    reply("An error occurred while processing your request.");
  }
});
