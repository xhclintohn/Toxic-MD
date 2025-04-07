const { zokou } = require("../framework/zokou");

// Constants for easy maintenance
const BOT_RESPONSE = `
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃
╰───── • ─────╯

◄⏤͟͞𝐇𝐞𝐥𝐥𝐨! 𝐇𝐨𝐰 𝐜𝐚𝐧 𝐈 𝐡𝐞𝐥𝐩 𝐲𝐨𝐮 𝐭𝐨𝐝𝐚𝐲? 🙂🤚🏻

> ✗D:
> ✗𝗩𝗲𝗿𝘀𝗶𝗼𝗻: 2.0

`;

module.exports = {
    name: "bot",
    description: "Greets the user", 
    usage: ".bot", 
    enable: true,

    zokou({ 
        nomCom: "bot",
        categorie: "General",
        reaction: "🤖" 
    }, async (dest, zk, commandeOptions) => {
        const { repondre } = commandeOptions;
        await repondre(BOT_RESPONSE);
    })
};