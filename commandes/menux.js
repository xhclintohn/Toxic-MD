// Simplified menu command with zero stream dependencies
const { zokou } = require("../framework/zokou");

// Pre-formatted menu text
const MENU_TEXT = `
乂 ⌜𝙏𝙤𝙭𝙞𝙘-𝙈𝘿⌟ 乂

《 ██████████▒▒》80%

❃ 𝐎𝐰𝐧𝐞𝐫 : 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
❃ 𝐌𝐨𝐝𝐞 : public
❃ 𝐓𝐢𝐦𝐞 : ${new Date().toLocaleTimeString()}
❃ 𝐑𝐀𝐌 : 34.74 GB/61.79 GB

[YOUR FULL COMMAND LIST HERE...]
`.trim();

module.exports = {
    // Critical: Must EXACTLY match your framework's expected properties
    nomCom: "menu",
    categorie: "General",
    reaction: "📜",
    utilisation: "!menu",

    // Simplified execute function
    async execute(dest, zk, { repondre }) {
        try {
            // Direct text response - no media, no streams
            await repondre(MENU_TEXT);
        } catch (e) {
            console.error("🚨 ABSOLUTE MENU ERROR:", e);
            // Fallback response if even text fails
            await repondre("Toxic-MD Commands:\n- !help\n- !support");
        }
    }
};

// Alternative registration if needed
try {
    zokou(module.exports, module.exports.execute);
} catch (e) {
    console.error("COMMAND REGISTRATION ERROR:", e);
}