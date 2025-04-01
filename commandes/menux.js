const { zokou } = require("../framework/zokou");

module.exports = {
    nomCom: "menu",  // Make sure this matches exactly
    description: "Show command menu",
    categorie: "General",
    reaction: "📜",
    
    async execute(dest, zk, { repondre }) {
        try {
            // Simple text response with your formatted menu
            const menuText = `
乂 ⌜𝙏𝙤𝙭𝙞𝙘-𝙈𝘿⌟ 乂

《 ██████████▒▒》80%

❃ 𝐎𝐰𝐧𝐞𝐫 : 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
❃ 𝐌𝐨𝐝𝐞 : public
❃ 𝐓𝐢𝐦𝐞 : ${new Date().toLocaleTimeString()}
❃ 𝐑𝐀𝐌 : 34.74 GB/61.79 GB

[YOUR FULL MENU TEXT HERE...]
            `;
            
            await repondre(menuText);
            
        } catch (error) {
            console.error("⚠️ Menu error:", error);
            await repondre("❌ Failed to show menu");
        }
    }
};

// Register command
zokou(module.exports, module.exports.execute);