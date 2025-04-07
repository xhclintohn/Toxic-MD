require("dotenv").config();
const { zokou } = require("../framework/zokou");
const yts = require("yt-search");
const BaseUrl = process.env.GITHUB_GIT;
const giftedapikey = process.env.BOT_OWNER;

// Validate configuration
if (!BaseUrl || !giftedapikey) {
  throw new Error("𝐂𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐭𝐢𝐨𝐧 𝐞𝐫𝐫𝐨𝐫: 𝐌𝐢𝐬𝐬𝐢𝐧𝐠 𝐁𝐚𝐬𝐞𝐔𝐫𝐥 𝐨𝐫 𝐀𝐏𝐈 𝐤𝐞𝐲.");
}

// PLAY COMMAND (OPTIMIZED TO WORK LIKE YOUR EXAMPLE)
zokou({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, command) => {
  const { ms: quotedMessage, repondre: reply, arg: args } = command;

  if (!args[0]) {
    return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞.");
  }

  try {
    const searchResults = await yts(args.join(" "));
    const videos = searchResults.videos;

    if (!videos || videos.length === 0) {
      return reply("𝐍𝐨 𝐬𝐨𝐧𝐠𝐬 𝐟𝐨𝐮𝐧𝐝!");
    }

    const videoUrl = videos[0].url;
    const videoTitle = videos[0].title;

    // Send "downloading" message
    await reply(`_𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 ${videoTitle}_`);

    // Fetch audio from your API
    const apiResponse = await fetch(`${BaseUrl}/api/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=${giftedapikey}`);
    const data = await apiResponse.json();

    if (data.status === 200 && data.success) {
      const audioUrl = data.result.download_url;

      // Send audio as a document (like your working example)
      await zk.sendMessage(
        dest,
        {
          document: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: `${videoTitle}.mp3`,
        },
        { quoted: quotedMessage }
      );

      // Optional: Send thumbnail with caption
      await zk.sendMessage(
        dest,
        {
          image: { url: videos[0].thumbnail },
          caption: `╭─────═━┈┈━═──━┈⊷\n┇ 『 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑* 』\n┇ *𝐁𝐨𝐭 𝐧𝐚𝐦𝐞 : Toxic-MD* \n┇ *𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧* \n╰─────═━┈┈━═──━┈⊷`
        },
        { quoted: quotedMessage }
      );
    } else {
      reply("𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝: 𝐀𝐏𝐈 𝐞𝐫𝐫𝐨𝐫.");
    }
  } catch (error) {
    console.error("𝐄𝐫𝐫𝐨𝐫:", error);
    reply("𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝\n" + error.message);
  }
});

// ... (Keep your other commands below, if needed)