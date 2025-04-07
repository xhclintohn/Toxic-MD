const { zokou } = require("../framework/zokou");

module.exports = {
    name: "bot", // Command name
    description: "Greets the user", // Command description
    usage: ".bot", // Command usage
    enable: true, // Enable the command

    zokou({ 
        nomCom: "bot", // cmd
        categorie: "General",
        reaction: "🤖" 
    }, async (dest, zk, commandeOptions) => {
        const { repondre } = commandeOptions;
        
        
        const fancyResponse = `
◄⏤͟͞𝐇𝐞𝐥𝐥𝐨! 𝐇𝐨𝐰 𝐜𝐚𝐧 𝐈 𝐡𝐞𝐥𝐩🙂🤚🏻

> ✗𝗗
        `;
        
        await repondre(fancyResponse);
    })
};