const {zokou} = require("../framework/zokou");

zokou({
    nomCom: "restart",
    categorie: "Mods",
    reaction: "📴"
}, async (dest, z, com) => {
    const {repondre, ms, dev, superUser} = com;

    if (!superUser) {
        return repondre("𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐟𝐨𝐫 𝐨𝐰𝐧𝐞𝐫 𝐨𝐧𝐥𝐲 ⚠️");
    }

    const {exec} = require("child_process");
    
    repondre(`
╔════════════════════╗
  𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐛𝐨𝐭
  𝐑𝐞𝐬𝐭𝐚𝐫𝐭𝐢𝐧𝐠... ☣️
╚════════════════════╝
`);
    
    exec("pm2 restart all");
});