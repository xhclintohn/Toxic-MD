const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");
const { format, police } = require("../framework/mesfonctions");

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

            // Build menu message with stylish fonts
            let menuMsg = police(`
╔══════════════════════════╗
  TOXIC-MD COMMAND MENU
╚══════════════════════════╝`, 5) + "\n\n";

            menuMsg += police(`
╔══════════════════════════╗
  BOT INFORMATION
╚══════════════════════════╝`, 3) + "\n";
            
            menuMsg += `┣✦ ${police("Prefix:", 3)} ${s.PREFIXE || '!'}\n`;
            menuMsg += `┣✦ ${police("Owner:", 3)} ${s.OWNER_NAME || 'Not set'}\n`;
            menuMsg += `┣✦ ${police("Mode:", 3)} ${(s.MODE || 'public').toLowerCase() === 'yes' ? 'public' : 'private'}\n`;
            menuMsg += `┣✦ ${police("Commands:", 3)} ${cm.length}\n`;
            menuMsg += `┣✦ ${police("Date:", 3)} ${date}\n`;
            menuMsg += `┣✦ ${police("Time:", 3)} ${temps}\n`;
            menuMsg += `┣✦ ${police("Memory:", 3)} ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}\n`;
            menuMsg += `╰─────────────────────────╯\n\n`;

            menuMsg += police(`
╔══════════════════════════╗
  AVAILABLE COMMANDS
╚══════════════════════════╝`, 4) + "\n";

            // Add commands by category
            for (const cat in coms) {
                const categoryEmoji = emoji[cat] || "✨";
                menuMsg += `\n${police(`╔════════════════╗
┃ ${categoryEmoji} ${cat} ${categoryEmoji}
╚════════════════╝`, 2)}\n`;
                
                // Display commands
                for (let i = 0; i < coms[cat].length; i += 3) {
                    const chunk = coms[cat].slice(i, i + 3);
                    menuMsg += `┣✦ ${chunk.join(" • ")}\n`;
                }
            }

            menuMsg += `\n${police(`
╔══════════════════════════╗
  END OF MENU
╚══════════════════════════╝
Powered by Toxic-MD | ©2024`, 1)}`;

            // Send menu with image
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