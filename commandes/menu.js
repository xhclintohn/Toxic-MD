"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");

// Menu command with guaranteed response
zokou({ 
  nomCom: "menu", 
  reaction: "📜", 
  nomFichier: __filename 
}, async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    
    try {
        const menuText = `
乂 ⌜𝙏𝙤𝙭𝙞𝙘-𝙈𝘿⌟ 乂

《 ██████████▒▒》80%

❃ 𝐎𝐰𝐧𝐞𝐫 : 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
❃ 𝐌𝐨𝐝𝐞 : public
❃ 𝐓𝐢𝐦𝐞 : ${new Date().toLocaleTimeString()}
❃ 𝐑𝐀𝐌 : 34.74 GB/61.79 GB

[YOUR FULL COMMAND LIST HERE...]
        `.trim();

        await zk.sendMessage(dest, {
            text: menuText
        }, { quoted: ms });

    } catch (error) {
        console.error("🚨 MENU COMMAND CRASH:", error);
        // Ultimate fallback - will always respond
        await repondre("Toxic-MD Commands:\n!help\n!support");
    }
});

console.log("Menu command loaded");