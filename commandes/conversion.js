const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { zokou } = require("../framework/zokou");
const traduire = require("../framework/traduction");
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const axios = require('axios');
const FormData = require('form-data');
const { exec } = require("child_process");

async function uploadToTelegraph(Path) {
  if (!fs.existsSync(Path)) {
    throw new Error("𝐅𝐢𝐥𝐞 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝");
  }

  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(Path));

    const { data } = await axios.post("https://telegra.ph/upload", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (data && data[0] && data[0].src) {
      return "https://telegra.ph" + data[0].src;
    } else {
      throw new Error("𝐄𝐫𝐫𝐨𝐫 𝐠𝐞𝐭𝐭𝐢𝐧𝐠 𝐯𝐢𝐝𝐞𝐨 𝐥𝐢𝐧𝐤");
    }
  } catch (err) {
    throw new Error(String(err));
  }
}

zokou({
  nomCom: "sticker",
  categorie: "𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧",
  reaction: "👨🏿‍💻"
}, async (origineMessage, zk, commandeOptions) => {
  let { ms, mtype, arg, repondre, nomAuteurMessage } = commandeOptions;
  var txt = JSON.stringify(ms.message);

  var mime = mtype === "imageMessage" || mtype === "videoMessage";
  var tagImage = mtype === "extendedTextMessage" && txt.includes("imageMessage");
  var tagVideo = mtype === "extendedTextMessage" && txt.includes("videoMessage");

  const alea = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
  };

  const stickerFileName = alea(".webp");

  if (mtype === "imageMessage" || tagImage) {
    let downloadFilePath;
    if (ms.message.imageMessage) {
      downloadFilePath = ms.message.imageMessage;
    } else {
      downloadFilePath = ms.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    }

    const media = await downloadContentFromMessage(downloadFilePath, "image");
    let buffer = Buffer.from([]);
    for await (const elm of media) {
      buffer = Buffer.concat([buffer, elm]);
    }

    sticker = new Sticker(buffer, {
      pack: "𝐓𝐨𝐱𝐢𝐜-𝐌𝐃",
      author: nomAuteurMessage,
      type: arg.includes("crop") || arg.includes("c") ? StickerTypes.CROPPED : StickerTypes.FULL,
      quality: 100,
    });
  } else if (mtype === "videoMessage" || tagVideo) {
    let downloadFilePath;
    if (ms.message.videoMessage) {
      downloadFilePath = ms.message.videoMessage;
    } else {
      downloadFilePath = ms.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;
    }
    const stream = await downloadContentFromMessage(downloadFilePath, "video");
    let buffer = Buffer.from([]);
    for await (const elm of stream) {
      buffer = Buffer.concat([buffer, elm]);
    }

    sticker = new Sticker(buffer, {
      pack: "𝐓𝐨𝐱𝐢𝐜-𝐌𝐃",
      author: nomAuteurMessage,
      type: arg.includes("-r") || arg.includes("-c") ? StickerTypes.CROPPED : StickerTypes.FULL,
      quality: 40,
    });
  } else {
    repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐨𝐫 𝐯𝐢𝐝𝐞𝐨!");
    return;
  }

  await sticker.toFile(stickerFileName);
  await zk.sendMessage(
    origineMessage,
    {
      sticker: fs.readFileSync(stickerFileName),
      caption: "╔════════════════╗\n┃ 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 ┃\n┃ 𝐒𝐭𝐢𝐜𝐤𝐞𝐫 𝐌𝐚𝐝𝐞 ┃\n╚════════════════╝"
    },
    { quoted: ms }
  );

  try {
    fs.unlinkSync(stickerFileName);
  } catch (e) { console.log(e) }
});

zokou({
  nomCom: "scrop",
  categorie: "𝐂𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧",
  reaction: "👨🏿‍💻"
}, async (origineMessage, zk, commandeOptions) => {
  const { ms, msgRepondu, arg, repondre, nomAuteurMessage } = commandeOptions;

  if (!msgRepondu) {
    repondre("╔════════════════╗\n┃ 𝐌𝐞𝐝𝐢𝐚 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝 ┃\n╚════════════════╝\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐚 𝐦𝐞𝐝𝐢𝐚");
    return;
  }

  if (!(arg[0])) {
    pack = nomAuteurMessage;
  } else {
    pack = arg.join(' ');
  }

  if (msgRepondu.imageMessage) {
    mediamsg = msgRepondu.imageMessage;
  } else if (msgRepondu.videoMessage) {
    mediamsg = msgRepondu.videoMessage;
  } else if (msgRepondu.stickerMessage) {
    mediamsg = msgRepondu.stickerMessage;
  } else {
    repondre("𝐔𝐡 𝐦𝐞𝐝𝐢𝐚 𝐩𝐥𝐞𝐚𝐬𝐞");
    return;
  }

  var stick = await zk.downloadAndSaveMediaMessage(mediamsg);

  let stickerMess = new Sticker(stick, {
    pack: pack,
    type: StickerTypes.CROPPED,
    categories: ["🤩", "🎉"],
    id: "12345",
    quality: 70,
    background: "transparent",
  });
  const stickerBuffer2 = await stickerMess.toBuffer();
  zk.sendMessage(origineMessage, { sticker: stickerBuffer2 }, { quoted: ms });
});

// [Rest of the commands follow the same pattern with updated styling...]