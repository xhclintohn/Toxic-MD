const axios = require("axios");
const {zokou} = require("../framework/zokou");
const traduire = require("../framework/traduction");
const {Sticker ,StickerTypes}= require('wa-sticker-formatter');

zokou({
  nomCom: "ranime",
  categorie: "Fun",
  reaction: "📺"
},
async (origineMessage, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;

  const jsonURL = "https://api.jikan.moe/v4/random/anime";

  try {
    const response = await axios.get(jsonURL);
    const data = response.data.data;

    const title = data.title;
    const synopsis = data.synopsis;
    const imageUrl = data.images.jpg.image_url;
    const episodes = data.episodes;
    const status = data.status;

    const message = `
╔══════════════════════════╗
  𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐀𝐧𝐢𝐦𝐞 𝐈𝐧𝐟𝐨
╚══════════════════════════╝

┣✦ 𝐓𝐢𝐭𝐥𝐞: ${title}
┣✦ 𝐄𝐩𝐢𝐬𝐨𝐝𝐞𝐬: ${episodes}
┣✦ 𝐒𝐭𝐚𝐭𝐮𝐬: ${status}
┣✦ 𝐒𝐲𝐧𝐨𝐩𝐬𝐢𝐬: ${synopsis}
┣✦ 𝐔𝐑𝐋: ${data.url}`;

    zk.sendMessage(origineMessage, { image: { url: imageUrl }, caption: message }, { quoted: ms });
  } catch (error) {
    console.error('Error retrieving data:', error);
    repondre('⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐫𝐞𝐭𝐫𝐢𝐞𝐯𝐢𝐧𝐠 𝐚𝐧𝐢𝐦𝐞 𝐝𝐚𝐭𝐚.');
  }
});

zokou({
  nomCom: "google",
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre } = commandeOptions;

  if (!arg[0] || arg === "") {
    repondre("╔════════════════╗\n┃ 𝐈𝐧𝐩𝐮𝐭 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝 ┃\n╚════════════════╝\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐞𝐚𝐫𝐜𝐡 𝐪𝐮𝐞𝐫𝐲.\n𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .𝐠𝐨𝐨𝐠𝐥𝐞 𝐖𝐡𝐚𝐭 𝐢𝐬 𝐚 𝐛𝐨𝐭");
    return;
  }

  const google = require('google-it');
  try {
    const results = await google({ query: arg.join(" ") });
    let msg = `╔══════════════════════════╗\n  𝐆𝐨𝐨𝐠𝐥𝐞 𝐒𝐞𝐚𝐫𝐜𝐡: ${arg}\n╚══════════════════════════╝\n\n`;

    for (let result of results) {
      msg += `┣✦ 𝐓𝐢𝐭𝐥𝐞: ${result.title}\n`;
      msg += `┣✦ 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${result.snippet}\n`;
      msg += `┣✦ 𝐋𝐢𝐧𝐤: ${result.link}\n\n╰───────────────────────╯\n\n`;
    }

    repondre(msg);
  } catch (error) {
    repondre("⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐝𝐮𝐫𝐢𝐧𝐠 𝐆𝐨𝐨𝐠𝐥𝐞 𝐬𝐞𝐚𝐫𝐜𝐡.");
  }
});

zokou({
  nomCom: "imdb",
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms } = commandeOptions;

  if (!arg[0] || arg === "") {
    repondre("╔════════════════╗\n┃ 𝐈𝐧𝐩𝐮𝐭 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝 ┃\n╚════════════════╝\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐦𝐨𝐯𝐢𝐞/𝐬𝐞𝐫𝐢𝐞𝐬 𝐧𝐚𝐦𝐞");
    return;
  }

  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${arg}&plot=full`);
    const imdbData = response.data;

    let imdbInfo = "╔══════════════════════════╗\n  𝐈𝐌𝐃𝐁 𝐌𝐨𝐯𝐢𝐞 𝐈𝐧𝐟𝐨\n╚══════════════════════════╝\n\n";
    imdbInfo += "┣✦ 𝐓𝐢𝐭𝐥𝐞: " + imdbData.Title + "\n";
    imdbInfo += "┣✦ 𝐘𝐞𝐚𝐫: " + imdbData.Year + "\n";
    imdbInfo += "┣✦ 𝐑𝐚𝐭𝐢𝐧𝐠: " + imdbData.Rated + "\n";
    imdbInfo += "┣✦ 𝐑𝐞𝐥𝐞𝐚𝐬𝐞: " + imdbData.Released + "\n";
    imdbInfo += "┣✦ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞: " + imdbData.Runtime + "\n";
    imdbInfo += "┣✦ 𝐆𝐞𝐧𝐫𝐞: " + imdbData.Genre + "\n";
    imdbInfo += "┣✦ 𝐃𝐢𝐫𝐞𝐜𝐭𝐨𝐫: " + imdbData.Director + "\n";
    imdbInfo += "┣✦ 𝐖𝐫𝐢𝐭𝐞𝐫: " + imdbData.Writer + "\n";
    imdbInfo += "┣✦ 𝐀𝐜𝐭𝐨𝐫𝐬: " + imdbData.Actors + "\n";
    imdbInfo += "┣✦ 𝐏𝐥𝐨𝐭: " + imdbData.Plot + "\n";
    imdbInfo += "┣✦ 𝐋𝐚𝐧𝐠𝐮𝐚𝐠𝐞: " + imdbData.Language + "\n";
    imdbInfo += "┣✦ 𝐂𝐨𝐮𝐧𝐭𝐫𝐲: " + imdbData.Country + "\n";
    imdbInfo += "┣✦ 𝐀𝐰𝐚𝐫𝐝𝐬: " + imdbData.Awards + "\n";
    imdbInfo += "┣✦ 𝐁𝐨𝐱 𝐎𝐟𝐟𝐢𝐜𝐞: " + imdbData.BoxOffice + "\n";
    imdbInfo += "┣✦ 𝐏𝐫𝐨𝐝𝐮𝐜𝐭𝐢𝐨𝐧: " + imdbData.Production + "\n";
    imdbInfo += "┣✦ 𝐈𝐌𝐃𝐛 𝐑𝐚𝐭𝐢𝐧𝐠: " + imdbData.imdbRating + "\n";
    imdbInfo += "┣✦ 𝐈𝐌𝐃𝐛 𝐕𝐨𝐭𝐞𝐬: " + imdbData.imdbVotes + "\n";

    zk.sendMessage(dest, {
      image: { url: imdbData.Poster },
      caption: imdbInfo,
    }, { quoted: ms });
  } catch (error) {
    repondre("⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐝𝐮𝐫𝐢𝐧𝐠 𝐈𝐌𝐃𝐛 𝐬𝐞𝐚𝐫𝐜𝐡.");
  }
});

zokou({
  nomCom: "movie",
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms } = commandeOptions;

  if (!arg[0] || arg === "") {
    repondre("╔════════════════╗\n┃ 𝐈𝐧𝐩𝐮𝐭 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝 ┃\n╚════════════════╝\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐦𝐨𝐯𝐢𝐞/𝐬𝐞𝐫𝐢𝐞𝐬 𝐧𝐚𝐦𝐞");
    return;
  }

  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${arg}&plot=full`);
    const imdbData = response.data;

    let imdbInfo = "╔══════════════════════════╗\n  𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐌𝐨𝐯𝐢𝐞 𝐈𝐧𝐟𝐨\n╚══════════���═══════════════╝\n\n";
    imdbInfo += "┣✦ 𝐓𝐢𝐭𝐥𝐞: " + imdbData.Title + "\n";
    imdbInfo += "┣✦ 𝐘𝐞𝐚𝐫: " + imdbData.Year + "\n";
    imdbInfo += "┣✦ 𝐑𝐚𝐭𝐢𝐧𝐠: " + imdbData.Rated + "\n";
    imdbInfo += "┣✦ 𝐑𝐞𝐥𝐞𝐚𝐬𝐞: " + imdbData.Released + "\n";
    imdbInfo += "┣✦ 𝐑𝐮𝐧𝐭𝐢𝐦𝐞: " + imdbData.Runtime + "\n";
    imdbInfo += "┣✦ 𝐆𝐞𝐧𝐫𝐞: " + imdbData.Genre + "\n";
    imdbInfo += "┣✦ 𝐃𝐢𝐫𝐞𝐜𝐭𝐨𝐫: " + imdbData.Director + "\n";
    imdbInfo += "┣✦ 𝐖𝐫𝐢𝐭𝐞𝐫: " + imdbData.Writer + "\n";
    imdbInfo += "┣✦ 𝐀𝐜𝐭𝐨𝐫𝐬: " + imdbData.Actors + "\n";
    imdbInfo += "┣✦ 𝐏𝐥𝐨𝐭: " + imdbData.Plot + "\n";
    imdbInfo += "┣✦ 𝐋𝐚𝐧𝐠𝐮𝐚𝐠𝐞: " + imdbData.Language + "\n";
    imdbInfo += "┣✦ 𝐂𝐨𝐮𝐧𝐭𝐫𝐲: " + imdbData.Country + "\n";
    imdbInfo += "┣✦ 𝐀𝐰𝐚𝐫𝐝𝐬: " + imdbData.Awards + "\n";
    imdbInfo += "┣✦ 𝐁𝐨𝐱 𝐎𝐟𝐟𝐢𝐜𝐞: " + imdbData.BoxOffice + "\n";
    imdbInfo += "┣✦ 𝐏𝐫𝐨𝐝𝐮𝐜𝐭𝐢𝐨𝐧: " + imdbData.Production + "\n";
    imdbInfo += "┣✦ 𝐈𝐌𝐃𝐛 𝐑𝐚𝐭𝐢𝐧𝐠: " + imdbData.imdbRating + "\n";
    imdbInfo += "┣✦ 𝐈𝐌𝐃𝐛 𝐕𝐨𝐭𝐞𝐬: " + imdbData.imdbVotes + "\n\n";
    imdbInfo += "╔══════════════════════════╗\n  𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐌𝐨𝐯𝐢𝐞𝐬\n╚══════════════════════════╝\n";
    imdbInfo += "┣✦ 𝐓.𝐦𝐞/𝐢𝐛𝐫𝐚𝐡𝐢𝐦𝐭𝐞𝐜𝐡𝐚𝐢\n";

    zk.sendMessage(dest, {
      image: { url: imdbData.Poster },
      caption: imdbInfo,
    }, { quoted: ms });
  } catch (error) {
    repondre("⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐝𝐮𝐫𝐢𝐧𝐠 𝐦𝐨𝐯𝐢𝐞 𝐬𝐞𝐚𝐫𝐜𝐡.");
  }
});

zokou({
  nomCom: "emomix",
  categorie: "Conversion"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms, nomAuteurMessage } = commandeOptions;

  if (!arg[0] || arg.length !== 1) {
    repondre("╔════════════════╗\n┃ 𝐈𝐧𝐜𝐨𝐫𝐫𝐞𝐜𝐭 𝐔𝐬𝐚𝐠𝐞 ┃\n╚════════════════╝\n𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .𝐞𝐦𝐨𝐣𝐢𝐦𝐢𝐱 😀;🥰");
    return;
  }

  const emojis = arg.join(' ').split(';');

  if (emojis.length !== 2) {
    repondre("╔════════════════╗\n┃ 𝐈𝐧𝐩𝐮𝐭 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝 ┃\n╚════════════════╝\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐬𝐩𝐞𝐜𝐢𝐟𝐲 𝐭𝐰𝐨 𝐞𝐦𝐨𝐣𝐢𝐬 𝐬𝐞𝐩𝐚𝐫𝐚𝐭𝐞𝐝 𝐛𝐲 ';'");
    return;
  }

  const emoji1 = emojis[0].trim();
  const emoji2 = emojis[1].trim();

  try {
    const response = await axios.get(`https://levanter.onrender.com/emix?q=${emoji1}${emoji2}`);

    if (response.data.status === true) {
      let stickerMess = new Sticker(response.data.result, {
        pack: nomAuteurMessage,
        type: StickerTypes.CROPPED,
        categories: ["🤩", "🎉"],
        id: "12345",
        quality: 70,
        background: "transparent",
      });
      const stickerBuffer2 = await stickerMess.toBuffer();
      zk.sendMessage(dest, { sticker: stickerBuffer2 }, { quoted: ms });
    } else {
      repondre("⚠️ 𝐔𝐧𝐚𝐛𝐥𝐞 𝐭𝐨 𝐜𝐫𝐞𝐚𝐭𝐞 𝐞𝐦𝐨𝐣𝐢 𝐦𝐢𝐱.");
    }
  } catch (error) {
    repondre("⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐜𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐞𝐦𝐨𝐣𝐢 𝐦𝐢𝐱: " + error);
  }
});