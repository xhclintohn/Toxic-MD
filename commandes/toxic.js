require("dotenv").config();
const { zokou } = require("../framework/zokou");

// Consts
const BOT_NAME = "Toxic-MD";
const OWNER_NAME = "𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧";
const VERSION = "2.0";

zokou({
  nomCom: "bot",
  categorie: "General",
  reaction: "🤖"
}, async (dest, zk, command) => {
  const { ms: quotedMessage, repondre: reply } = command;

  const response = `╭─
  ${BOT_NAME}


◄⏤͟͞𝐇𝐞𝐥𝐥𝐨! 𝐈'𝐦 ${BOT_NAME}  
𝐀 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐛𝐨𝐭 𝐝𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐛𝐲 ${OWNER_NAME}

> ✗𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${VERSION}
> ✗𝐓𝐲𝐩𝐞 ".menu" 𝐟𝐨𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬
╰───── • ─────╯`;

  await reply(response);
});

// Export (like play command)
module.exports = {
  name: "bot",
  description: "Displays bot information",
  usage: ".bot",
  enable: true
};