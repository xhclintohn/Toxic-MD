const { zokou } = require("../framework/zokou");
const yts = require("yt-search");
const axios = require("axios");

zokou({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre("𝗣𝗹𝗲𝗮𝘀𝗲 𝗶𝗻𝘀𝗲𝗿𝘁 𝗮 𝘀𝗼𝗻𝗴 𝗻𝗮𝗺𝗲.");
  }

  try {
    const searchQuery = arg.join(" ");
    repondre("𝗧𝗼𝘅𝗶𝗰-𝗠𝗗 𝘀𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗳𝗼𝗿 𝘁𝗵𝗲 𝘀𝗼𝗻𝗴 🎵");

    const searchResults = await yts(searchQuery);
    const videos = searchResults.videos;

    if (videos.length === 0) {
      return repondre("𝗡𝗼 𝗮𝘂𝗱𝗶𝗼 𝗳𝗼𝘂𝗻𝗱. 𝗧𝗿𝘆 𝗮 𝗱𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝘁 𝘀𝗼𝗻𝗴! 😕");
    }

    const video = videos[0];
    const videoUrl = video.url;

    const apiUrl = `https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.status === 200 && data.success) {
      const downloadUrl = data.result.download_url;

      // Send the audio file
      await zk.sendMessage(dest, {
        audio: { url: downloadUrl },
        mimetype: "audio/mp4"
      }, { quoted: ms });

      // Send the follow-up message with the link
      await zk.sendMessage(dest, {
        text: "𝗝𝗼𝗶𝗻 𝗳𝗼𝗿 𝘂𝗽𝗱𝗮𝘁𝗲𝘀 📢\nhttps://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI"
      }, { quoted: ms });
    } else {
      repondre("𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗱𝗼𝘄𝗻𝗹𝗼𝗮𝗱 𝗮𝘂𝗱𝗶𝗼. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿. 😓");
    }
  } catch (error) {
    console.error("Error:", error);
    repondre("𝗔𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱 𝘄𝗵𝗶𝗹𝗲 𝗽𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗿𝗲𝗾𝘂𝗲𝘀𝘁. 😵");
  }
});