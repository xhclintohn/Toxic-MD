const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");
const { format } = require("../framework/mesfonctions");

module.exports = {
    name: "menu",
    description: "Show all available commands",
    category: "General",
    reaction: "📜",
    nomFichier: __filename,

    async execute(dest, zk, commandeOptions) {
        const { ms, repondre } = commandeOptions;
        
        try {
            // Get commands from zokou
            const { cm } = require("../framework/zokou");
            
            // Set timezone and format
            moment.tz.setDefault('Etc/GMT');
            const temps = moment().format("HH:mm:ss");
            const date = moment().format("DD/MM/YYYY");

            // Group commands by category
            const coms = {};
            cm.forEach((com) => {
                if (!coms[com.categorie]) {
                    coms[com.categorie] = [];
                }
                coms[com.categorie].push(com.nomCom);
            });

            // Category emojis
            const emoji = {
                "General": "🌐",
                "Search": "🔍",
                "Fun": "🎭",
                "Mods": "🛠️",
                "Conversion": "🔄",
                "Group": "👥",
                "Media": "🎬"
            };

            // Build menu message
            let menuMsg = `
╔══════════════════════════╗
  𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐌𝐞𝐧𝐮
╚══════════════════════════╝

╔══════════════════════════╗
  𝐁𝐨𝐭 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧
╚══════════════════════════╝
┣✦ 𝐏𝐫𝐞𝐟𝐢𝐱: ${s.PREFIXE || '!'}
┣✦ 𝐎𝐰𝐧𝐞𝐫: ${s.OWNER_NAME || 'Not set'}    
┣✦ 𝐌𝐨𝐝𝐞: ${(s.MODE || 'public').toLowerCase() === 'yes' ? 'public' : 'private'}
┣✦ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${cm.length}
┣✦ 𝐃𝐚𝐭𝐞: ${date}
┣✦ 𝐓𝐢𝐦𝐞: ${temps}
┣✦ 𝐌𝐞𝐦𝐨𝐫𝐲: ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
╰─────────────────────────╯

╔══════════════════════════╗
  𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬
╚══════════════════════════╝\n`;

            // Add commands by category
            for (const cat in coms) {
                const categoryEmoji = emoji[cat] || "✨";
                menuMsg += `\n╔════════════════╗
┃ ${categoryEmoji} ${cat} ${categoryEmoji}
╚════════════════╝\n`;
                
                // Display commands
                for (let i = 0; i < coms[cat].length; i += 3) {
                    const chunk = coms[cat].slice(i, i + 3);
                    menuMsg += `┣✦ ${chunk.join(" • ")}\n`;
                }
            }

            menuMsg += `\n╔══════════════════════════╗
  𝐄𝐧𝐝 𝐨𝐟 𝐌𝐞𝐧𝐮
╚══════════════════════════╝
𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 | ©𝟐𝟎𝟐𝟒`;

            // Send menu with image (using simple URL instead of streams)
            const imageUrl = s.IMAGE_MENU || "https://i.imgur.com/8K7fT5a.jpg";
            await zk.sendMessage(dest, {
                image: { url: imageUrl },
                caption: menuMsg,
                footer: "Type 'help <command>' for more info"
            }, { quoted: ms });

        } catch (error) {
            console.error("⚠️ Menu command error:", error);
            repondre("⚠️ Failed to load menu. Please try again later.");
        }
    }
};