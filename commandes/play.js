require("dotenv").config();
const { zokou } = require("../framework/zokou");
const yts = require("yt-search");

// Consts
const AUDIO_API = "https://api.dreaded.site/api/ytdl/audio?url=";
const VIDEO_API = "https://api.dreaded.site/api/ytdl/video?url=";

// PLAY CMD
zokou({
  nomCom: "play",
  categorie: "Download",
  reaction: "🎧"
}, async (dest, zk, command) => {
  const { ms: quotedMessage, repondre: reply, arg: args } = command;

  if (!args[0]) return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞.");

  try {
    const { videos } = await yts(args.join(" "));
    if (!videos?.length) return reply("𝐍𝐨 𝐬𝐨𝐧𝐠𝐬 𝐟𝐨𝐮𝐧𝐝!");

    const video = videos[0];
    await reply(`_𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠: ${video.title}_`);

    // Fetch audio
    const audioData = await fetch(`${AUDIO_API}${encodeURIComponent(video.url)}`);
    const { result } = await audioData.json();

    await zk.sendMessage(
      dest,
      {
        document: { url: result.url },
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`
      },
      { quoted: quotedMessage }
    );

    // Send thumbnail
    await zk.sendMessage(
      dest,
      {
        image: { url: video.thumbnail },
        caption: `╭─────═━┈┈━═──━┈⊷\n┇ 『 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑* 』\n┇ *𝐁𝐨𝐭 𝐧𝐚𝐦𝐞 : Toxic-MD* \n┇ *𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧* \n╰─────═━┈┈━═──━┈⊷`
      },
      { quoted: quotedMessage }
    );

  } catch (error) {
    console.error("𝐀𝐮𝐝𝐢𝐨 𝐄𝐫𝐫𝐨𝐫:", error);
    reply("𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝: " + error.message);
  }
});

// VIDEO COMMAND
zokou({
  nomCom: "video",
  categorie: "Download",
  reaction: "🎥"
}, async (dest, zk, command) => {
  const { ms: quotedMessage, repondre: reply, arg: args } = command;

  if (!args[0]) return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐢𝐝𝐞𝐨 𝐧𝐚𝐦𝐞.");

  try {
    const { videos } = await yts(args.join(" "));
    if (!videos?.length) return reply("𝐍𝐨 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐨𝐮𝐧𝐝!");

    const video = videos[0];
    await reply(`_𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠: ${video.title}_`);

    // Fetch video
    const videoData = await fetch(`${VIDEO_API}${encodeURIComponent(video.url)}`);
    const { result } = await videoData.json();

    await zk.sendMessage(
      dest,
      {
        video: { url: result.url },
        mimetype: "video/mp4",
        caption: `╭─────═━┈┈━═──━┈⊷\n┇ 『 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑* 』\n┇ *𝐁𝐨𝐭 𝐧𝐚𝐦𝐞 : Toxic-MD* \n┇ *𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧* \n╰─────═━┈┈━═──━┈⊷`
      },
      { quoted: quotedMessage }
    );

  } catch (error) {
    console.error("𝐕𝐢𝐝𝐞𝐨 𝐄𝐫𝐫𝐨𝐫:", error);
    reply("𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝: " + error.message);
  }
});

// SONG COMMAND (ALIAS FOR PLAY)
zokou({
  nomCom: "song",
  categorie: "Download",
  reaction: "🎸"
}, async (dest, zk, command) => {
  // Reuse play command logic
  const { ms: quotedMessage, repondre: reply, arg: args } = command;

  if (!args[0]) return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞.");

  try {
    const { videos } = await yts(args.join(" "));
    if (!videos?.length) return reply("𝐍𝐨 𝐬𝐨𝐧𝐠𝐬 𝐟𝐨𝐮𝐧𝐝!");

    const video = videos[0];
    await reply(`_𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠: ${video.title}_`);

    const audioData = await fetch(`${AUDIO_API}${encodeURIComponent(video.url)}`);
    const { result } = await audioData.json();

    await zk.sendMessage(
      dest,
      {
        document: { url: result.url },
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`
      },
      { quoted: quotedMessage }
    );

    await zk.sendMessage(
      dest,
      {
        image: { url: video.thumbnail },
        caption: `╭─────═━┈┈━═──━┈⊷\n┇ 『 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑* 』\n┇ *𝐁𝐨𝐭 𝐧𝐚𝐦𝐞 : Toxic-MD* \n┇ *𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧* \n╰─────═━┈┈━═──━┈⊷`
      },
      { quoted: quotedMessage }
    );

  } catch (error) {
    console.error("𝐒𝐨𝐧𝐠 𝐄𝐫𝐫𝐨𝐫:", error);
    reply("𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝: " + error.message);
  }
});