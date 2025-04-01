const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");

// Make sure this matches your actual path
const { format } = require("../framework/mesfonctions"); 

module.exports = {
    // REQUIRED properties
    nomCom: "menu",  // This is the critical field that was missing
    description: "Show all available commands",
    categorie: "General",
    reaction: "📜",

    // Optional but recommended
    nomFichier: __filename,
    utilisation: "Just type !menu",

    async execute(dest, zk, commandeOptions) {
        const { ms, repondre } = commandeOptions;

        try {
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

            // Build menu message
            let menuMsg = `
╔══════════════════════════╗
  🚀 TOXIC-MD COMMAND MENU 🚀
╚══════════════════════════╝

╔══════════════════════════╗
  📊 BOT INFORMATION
╚══════════════════════════╝
┣✦ Prefix: ${s.PREFIXE || '!'}
┣✦ Owner: ${s.OWNER_NAME || 'Not set'}    
┣✦ Mode: ${(s.MODE || 'public').toLowerCase() === 'yes' ? 'public' : 'private'}
┣✦ Commands: ${cm.length}
┣✦ Date: ${date}
┣✦ Time: ${temps}
╰─────────────────────────╯

╔══════════════════════════╗
  📋 AVAILABLE COMMANDS
╚══════════════════════════╝\n`;

            // Add commands by category
            for (const cat in coms) {
                menuMsg += `\n╔════════════════╗
┃ ${cat.toUpperCase()}
╚════════════════╝\n`;
                
                // Display commands in groups of 3
                for (let i = 0; i < coms[cat].length; i += 3) {
                    menuMsg += `┣✦ ${coms[cat].slice(i, i + 3).join(" • ")}\n`;
                }
            }

            menuMsg += `\n╔══════════════════════════╗
  🏁 END OF MENU
╚══════════════════════════╝
💻 Powered by Toxic-MD v2.0`;

            // Send as text message
            await zk.sendMessage(dest, { 
                text: menuMsg 
            }, { quoted: ms });

        } catch (error) {
            console.error("⚠️ Menu command error:", error);
            await repondre("❌ Failed to load menu. Please try again later.");
        }
    }
};

// Register the command
zokou(module.exports, module.exports.execute);