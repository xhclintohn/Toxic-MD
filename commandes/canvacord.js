const { zokou } = require("../framework/zokou");
const canvacord = require("canvacord");
const {uploadImageToImgur} = require("../framework/imgur")

// Generic function to create a canvacord order
function createCanvacordCommand(commandName, canvacordFunction) {
  zokou({
    nomCom: commandName,
    categorie: "𝐈𝐦𝐚𝐠𝐞-𝐄𝐝𝐢𝐭",
    reaction: "🎉"
  }, async (origineMessage, zk, commandeOptions) => {
    const { ms, msgRepondu, auteurMsgRepondu, repondre } = commandeOptions;
    const clientId = 'b40a1820d63cd4e';

    try {
      let img;
      if (msgRepondu) {
        if (msgRepondu.imageMessage) {
          const image = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
          img = await uploadImageToImgur(image, clientId);
        } else {
          img = await zk.profilePictureUrl(auteurMsgRepondu, 'image');
        }
      } else {
        repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐨𝐫 𝐮𝐬𝐞𝐫'𝐬 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐩𝐢𝐜𝐭𝐮𝐫𝐞");
        return;
      }

      const result = await canvacordFunction(img);

      await zk.sendMessage(origineMessage, { 
        image: result,
        caption: `╔════════════════╗\n┃ 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐈𝐦𝐚𝐠𝐞 ┃\n┃ 𝐄𝐝𝐢𝐭𝐨𝐫 🎨 ┃\n╚════════════════╝\n𝐂𝐫𝐞𝐚𝐭𝐞𝐝 𝐛𝐲 𝐱𝐡𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      }, { quoted: ms });
    } catch (error) {
      console.error(`𝐄𝐫𝐫𝐨𝐫 𝐢𝐧 ${commandName} 𝐜𝐨𝐦𝐦𝐚𝐧𝐝:`, error);
      repondre("⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.");
    }
  });
}

// Create commands with different canvacord functions
createCanvacordCommand("shit", canvacord.Canvacord.shit);
createCanvacordCommand("wasted", canvacord.Canvacord.wasted);
createCanvacordCommand("wanted", canvacord.Canvacord.wanted);
createCanvacordCommand("trigger", canvacord.Canvacord.trigger);
createCanvacordCommand("trash", canvacord.Canvacord.trash);
createCanvacordCommand("rip", canvacord.Canvacord.rip);
createCanvacordCommand("sepia", canvacord.Canvacord.sepia);
createCanvacordCommand("rainbow", canvacord.Canvacord.rainbow);
createCanvacordCommand("hitler", canvacord.Canvacord.hitler);
createCanvacordCommand("invert", canvacord.Canvacord.invert);
createCanvacordCommand("jail", canvacord.Canvacord.jail);
createCanvacordCommand("affect", canvacord.Canvacord.affect);
createCanvacordCommand("beautiful", canvacord.Canvacord.beautiful);
createCanvacordCommand("blur", canvacord.Canvacord.blur);
createCanvacordCommand("circle", canvacord.Canvacord.circle);
createCanvacordCommand("facepalm", canvacord.Canvacord.facepalm);
createCanvacordCommand("greyscale", canvacord.Canvacord.greyscale);
createCanvacordCommand("joke", canvacord.Canvacord.jokeOverHead);