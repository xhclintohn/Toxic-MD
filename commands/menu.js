const { zokou } = require("../framework/zokou");
const fs = require('fs-extra');
const { createSafeStream } = require('../framework/zokou');

module.exports = {
    name: "menu",
    description: "Show command menu",
    category: "General",
    reaction: "📜",
    nomFichier: __filename,

    async execute(dest, zk, options) {
        const { ms, repondre } = options;
        
        try {
            // Example safe file handling
            const menuText = "Your menu content here";
            
            // Option 1: Send as text
            await zk.sendMessage(dest, { text: menuText }, { quoted: ms });
            
            // Option 2: Safe image sending
            /*
            const imagePath = './assets/menu.jpg';
            const imageBuffer = await fs.readFile(imagePath);
            const safeStream = createSafeStream(imageBuffer);
            
            await zk.sendMessage(dest, { 
                image: { stream: () => safeStream },
                caption: menuText 
            }, { quoted: ms });
            */
            
        } catch (error) {
            console.error("Menu error:", error);
            await repondre("⚠️ Menu unavailable. Try again later.");
        }
    }
};

// Register command
zokou(module.exports, module.exports.execute);