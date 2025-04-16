const { zokou } = require("../framework/zokou");
const { getytlink, ytdwn } = require("../framework/ytdl-core");
const yts = require("yt-search");
const ytdl = require('ytdl-core');
const fs = require('fs');

zokou({ nomCom: "yts1", categorie: "Search", reaction: "✋" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  const query = arg.join(" ");

  if (!query[0]) {
    repondre("𝐘𝐨, 𝐰𝐡𝐚𝐭 𝐝𝐨 𝐲𝐨𝐮 𝐰𝐚𝐧𝐧𝐚 𝐬𝐞𝐚𝐫𝐜𝐡 𝐟𝐨𝐫?");
    return;
  }

  try {
    const info = await yts(query);
    const resultat = info.videos;

    if (resultat.length === 0) {
      repondre("𝐍𝐨 𝐫𝐞𝐬𝐮𝐥𝐭𝐬 𝐟𝐨𝐮𝐧𝐝, 𝐭𝐫𝐲 𝐬𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐞𝐥𝐬𝐞!");
      return;
    }

    let captions = "";
    for (let i = 0; i < Math.min(10, resultat.length); i++) {
      captions += `----------------\n𝐓𝐢𝐭𝐥𝐞: ${resultat[i].title}\n𝐓𝐢𝐦𝐞: ${resultat[i].timestamp}\n𝐔𝐫𝐥: ${resultat[i].url}\n`;
    }
    captions += "\n======\n*𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃*";

    zk.sendMessage(dest, { image: { url: resultat[0].thumbnail }, caption: captions }, { quoted: ms });
  } catch (error) {
    repondre("𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠 𝐰𝐡𝐢𝐥𝐞 𝐬𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠: " + error);
  }
});

zokou({
  nomCom: "ytmp4",
  categorie: "Download",
  reaction: "🎥"
}, async (origineMessage, zk, commandeOptions) => {
  const { arg, ms, repondre } = commandeOptions;

  if (!arg[0]) {
    repondre("𝐃𝐫�{o𝐩 𝐚 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐥𝐢𝐧𝐤, 𝐟𝐚𝐦!");
    return;
  }

  const topo = arg.join(" ");
  try {
    const videoInfo = await ytdl.getInfo(topo);
    const format = ytdl.chooseFormat(videoInfo.formats, { quality: '18' });
    const videoStream = ytdl.downloadFromInfo(videoInfo, { format });

    const filename = `video_${Date.now()}.mp4`;
    const fileStream = fs.createWriteStream(filename);
    videoStream.pipe(fileStream);

    fileStream.on('finish', () => {
      zk.sendMessage(origineMessage, { video: { url: `./${filename}` }, caption: "𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 *𝐓𝐨𝐱𝐢𝐜-𝐌𝐃*", gifPlayback: false }, { quoted: ms });
      fs.unlink(`./${filename}`, (err) => {
        if (err) console.error('Cleanup failed:', err);
      });
    });

    fileStream.on('error', (error) => {
      console.error('Error writing video file:', error);
      repondre("𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠 𝐰𝐡𝐢𝐥𝐞 𝐬𝐚𝐯𝐢𝐧𝐠 𝐭𝐡𝐞 𝐯𝐢𝐝𝐞𝐨.");
    });

  } catch (error) {
    console.error('Error during video search or download:', error);
    repondre("𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐩𝐨𝐩𝐩𝐞𝐝 𝐮𝐩 𝐰𝐡𝐢𝐥�{e 𝐝𝐨𝐰𝐧𝐥𝐨𝐚�{d𝐢𝐧𝐠 𝐭𝐡𝐞 𝐯𝐢𝐝𝐞𝐨: " + error);
  }
});

zokou({
  nomCom: "ytmp3",
  categorie: "Download",
  reaction: "💿"
}, async (origineMessage, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  if (!arg[0]) {
    repondre("𝐆𝐢𝐦𝐦𝐞 𝐚 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐥𝐢𝐧𝐤, 𝐲𝐨!");
    return;
  }

  try {
    let topo = arg.join(" ");
    const audioStream = ytdl(topo, { filter: 'audioonly', quality: 'highestaudio' });

    const filename = `audio_${Date.now()}.mp3`;
    const fileStream = fs.createWriteStream(filename);
    audioStream.pipe(fileStream);

    fileStream.on('finish', () => {
      zk.sendMessage(origineMessage, { audio: { url: `./${filename}` }, mimetype: 'audio/mpeg' }, { quoted: ms, ptt: false });
      fs.unlink(`./${filename}`, (err) => {
        if (err) console.error('Cleanup failed:', err);
      });
      console.log("Audio file sent and cleaned up!");
    });

    fileStream.on('error', (error) => {
      console.error('Error writing audio file:', error);
      repondre("𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠 𝐰𝐡𝐢𝐥𝐞 𝐬𝐚𝐯𝐢𝐧𝐠 𝐭𝐡𝐞 𝐚𝐮𝐝𝐢𝐨.");
    });

  } catch (error) {
    console.error('Error during audio search or download:', error);
    repondre("𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐩𝐨𝐩𝐩𝐞𝐝 𝐮𝐩 𝐰𝐡𝐢𝐥𝐞 𝐝𝐨�{w𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐡𝐞 𝐚𝐮𝐝𝐢𝐨: " + error);
  }
});