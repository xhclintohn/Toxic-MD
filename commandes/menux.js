const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");

module.exports = {
    name: "menu",
    description: "Show all commands",
    category: "General",
    reaction: "📜",

    async execute(dest, zk, { ms, repondre }) {
        try {
            const { cm } = require("../framework/zokou");
            
            // Get bot info
            moment.tz.setDefault('Etc/GMT');
            const time = moment().format("HH:mm:ss");
            const date = moment().format("DD/MM/YYYY");
            const mode = (s.MODE || 'public').toLowerCase() === 'yes' ? 'public' : 'private';

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
  🚀 TOXIC-MD COMMAND MENU 🚀
╚══════════════════════════╝

╔══════════════════════════╗
  📊 BOT INFORMATION
╚══════════════════════════╝
┣✦ Prefix: ${s.PREFIXE || '!'}
┣✦ Owner: ${s.OWNER_NAME || 'Not set'}
┣✦ Mode: ${mode}
┣✦ Commands: ${cm.length}
┣✦ Date: ${date}
┣✦ Time: ${time}
╰─────────────────────────╯

╔══════════════════════════╗
  📋 AVAILABLE COMMANDS
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
  🏁 END OF MENU
╚══════════════════════════╝
💻 Powered by Toxic-MD v2.0`;

            // Send as text message first for testing
            await zk.sendMessage(dest, { 
                text: menuText 
            }, { quoted: ms });

        } catch (error) {
            console.error("MENU ERROR:", error);
            await repondre("❌ Failed to load menu. Please try again.");
        }
    }
};

// Register the command
zokou(module.exports, module.exports.execute);