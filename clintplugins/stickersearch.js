const axios = require("axios");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const {zokou} = require("../framework/zokou");

zokou({
  nomCom: "stickersearch",
  categorie: 'Search',
  reaction: "🍁"
},
async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg, nomAuteurMessage } = commandeOptions;

  if (!arg[0]) {
    repondre("where is the request ? !");
    return;
  }

  const gifSearchTerm = arg.join(" ");
  const tenorApiKey = "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";

  try { for ( i = 0 ; i < 5 ; i++) {
    const gif = await axios.get(
      `https://tenor.googleapis.com/v2/search?q=${gifSearchTerm}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`
    );

    const gifUrl = gif.data.results[i].media_formats.gif.url;

    
   

   
    const packname = nomAuteurMessage;

    const stickerMess = new Sticker(gifUrl, {
      pack: packname,
      author: '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧',
      type: StickerTypes.FULL,
      categories: ["🤩", "🎉"],
      id: "12345",
      quality: 60,
      background: "transparent",
    });
    const stickerBuffer2 = await stickerMess.toBuffer();
    zk.sendMessage(dest, { sticker: stickerBuffer2 }, { quoted: ms }); }
  } catch (error) {
    console.error("Erreur lors de la recherche de stickers :", error);
    repondre("Erreur lors de la recherche de stickers.");
  }
});
