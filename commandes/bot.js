const { zokou } = require("../framework/zokou");

module.exports = {
    name: "bot",
    description: "Shows bot info",
    usage: ".bot",
    enable: true,

    zokou({ 
        nomCom: "bot",
        categorie: "General",
        reaction: "🤖" 
    }, async (dest, zk, commandeOptions) => {
        const { repondre } = commandeOptions;

        await repondre(`
🤖 *Toxic-MD Bot*

Hello! I'm a WhatsApp bot created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

Type *.help* to see my commands
        `);
    })
};