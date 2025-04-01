const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");

module.exports = {
    name: "menu",
    description: "Show command menu",
    category: "General",
    reaction: "📜",
    nomFichier: __filename,

    async execute(dest, zk, commandeOptions) {
        const { ms, repondre } = commandeOptions;
        
        try {
            // Get commands
            const { cm } = require("../framework/zokou");
            
            // Format time
            moment.tz.setDefault('Etc/GMT');
            const time = moment().format("HH:mm:ss");
            const date = moment().format("DD/MM/YYYY");

            // Group commands by category
            const categories = {};
            cm.forEach(cmd => {
                if (!categories[cmd.categorie]) {
                    categories[cmd.categorie] = [];
                }
                categories[cmd.categorie].push(cmd.nomCom);
            });

            // Build menu text
            let menuText = `
╔══════════════════════════╗
  𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐌𝐞𝐧𝐮
╚══════════════════════════╝

╔══════════════════════════╗
  𝐁𝐨𝐭 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧
╚══════════════════════════╝
┣✦ Prefix: ${s.PREFIXE || '!'}
┣✦ Owner: ${s.OWNER_NAME || 'Not set'}
┣✦ Mode: ${(s.MODE || 'public').toLowerCase() === 'yes' ? 'public' : 'private'}
┣✦ Commands: ${cm.length}
┣✦ Date: ${date}
┣✦ Time: ${time}
╰─────────────────────────╯

╔══════════════════════════╗
  𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬
╚══════════════════════════╝\n`;

            // Add commands by category
            for (const [category, commands] of Object.entries(categories)) {
                menuText += `\n╔════════════════╗
┃ ${category.toUpperCase()}
╚════════════════╝\n`;
                
                // Add commands in groups of 3
                for (let i = 0; i < commands.length; i += 3) {
                    menuText += `┣✦ ${commands.slice(i, i + 3).join(" • ")}\n`;
                }
            }

            menuText += `\n╔══════════════════════════╗
  𝐄𝐧𝐝 𝐨𝐟 𝐌𝐞𝐧𝐮
╚══════════════════════════╝
𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃`;

            // Send as simple text message first for testing
            await zk.sendMessage(dest, { 
                text: menuText 
            }, { quoted: ms });

            // If working, you can add image back later:
            // await zk.sendMessage(dest, {
            //     image: { url: "https://i.imgur.com/8K7fT5a.jpg" },
            //     caption: menuText
            // }, { quoted: ms });

        } catch (error) {
            console.error("Menu command error:", error);
            repondre("Error loading menu. Please try again.");
        }
    }
};
