const { zokou } = require("../framework/zokou");
const yts = require("yt-search");
const axios = require("axios"); // Replaced node-fetch with axios

zokou({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐢𝐧𝐬𝐞𝐫𝐭 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞.");
  }

  try {
    const searchQuery = arg.join(" ");
    repondre("𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐬𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐬𝐨𝐧𝐠");

    const searchResults = await yts(searchQuery);
    const videos = searchResults.videos;

    if (videos.length === 0) {
      return repondre("𝐍𝐨 𝐚𝐮𝐝𝐢𝐨 𝐟𝐨𝐮𝐧𝐝.");
    }

    const video = videos[0];
    const videoUrl = video.url;

    const apiUrl = `https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl); // Use axios instead of fetch
    const data = response.data; // axios uses .data instead of .json()

    if (data.status === 200 && data.success) {
      const downloadUrl = data.result.download_url;

      // Send the audio file
      await zk.sendMessage(dest, {
        audio: { url: downloadUrl },
        mimetype: "audio/mp4"
      }, { quoted: ms });
    } else {
      repondre("𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐚𝐮𝐝𝐢𝐨. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞�(r.");
    }
  } catch (error) {
    console.error("Error:", error);
    repondre("𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫�(e𝐝 𝐰𝐡𝐢𝐥𝐞 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐫𝐞𝐪𝐮𝐞𝐬�(t.");
  }
});