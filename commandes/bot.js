const { zokou } = require("../framework/zokou");
const { format } = require("../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");

module.exports = {
    name: "bot",
    description: "Display Toxic-MD bot information",
    usage: ".bot",
    enable: true,

    zokou({ 
        nomCom: "bot", 
        categorie: "General", 
        reaction: "🤖" 
    }, async (dest, zk, commandeOptions) => {
        const { repondre, ms, mybotpic } = commandeOptions;

        // System information
        moment.tz.setDefault('Etc/GMT');
        const time = moment().format('HH:mm:ss');
        const mode = (s.MODE.toLowerCase() === "yes") ? "public" : "private";

        // Modern ASCII art styling
        const botInfo = `
╔════════════════════════╗
║      ✦ 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 ✦      ║
╠════════════════════════╣
║ • Version: V2.0        ║
║ • Status: ${mode.padEnd(15)}║
║ • Uptime: ${time} GMT ║
╠════════════════════════╣
║ • RAM: ${format(os.totalmem() - os.freemem()).padEnd(6)}/${format(os.totalmem())} ║
║ • Developer: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 ║
╚════════════════════════╝
`.trim();

        try {
            // Send bot info
            const lien = mybotpic();
            if (lien.match(/\.(mp4|gif)$/i)) {
                await zk.sendMessage(
                    dest,
                    { 
                        video: { url: lien }, 
                        caption: botInfo,
                        gifPlayback: true 
                    },
                    { quoted: ms }
                );
            } 
            else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                await zk.sendMessage(
                    dest,
                    { 
                        image: { url: lien }, 
                        caption: botInfo
                    },
                    { quoted: ms }
                );
            } 
            else {
                await repondre(botInfo);
            }

        } catch (e) {
            console.error("BOT COMMAND ERROR:", e);
            await repondre("❌ Failed to load bot information");
        }
    })
};