const { zokou } = require("../framework/zokou");
const mumaker = require("mumaker");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
//                   𝐋𝐎𝐆𝐎 𝐌𝐀𝐊𝐄𝐑 𝐌𝐎𝐃𝐔𝐋𝐄                //
//               𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃                //
//             𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧                   //
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

// Hacker Logo Command
zokou({ nomCom: "hacker", categorie: "Logo", reaction: "👨🏿‍💻" }, async (dest, zk, commandeOptions) => {
    const { prefixe, arg, ms, repondre } = commandeOptions;
    if (!arg || arg == "") {
        repondre("🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: " + prefixe + "hacker [𝐘𝐨𝐮𝐫𝐍𝐚𝐦𝐞]\n\n𝐍𝐞𝐞𝐝 𝐚 𝐜𝐨𝐨𝐥 𝐡𝐚𝐜𝐤𝐞𝐫 𝐚𝐯𝐚𝐭𝐚𝐫? 𝐉𝐮𝐬𝐭 𝐭𝐲𝐩𝐞 𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞!");
        return;
    }
    try {
        repondre("🔄 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐡𝐚𝐜𝐤𝐞𝐫 𝐥𝐨𝐠𝐨...");
        const result = await mumaker.ephoto("https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", arg);
        await zk.sendMessage(dest, { 
            image: { url: result.image }, 
            caption: "🌀 𝐇𝐚𝐜𝐤𝐞𝐫 𝐀𝐯𝐚𝐭𝐚𝐫 🌀\n\n𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧" 
        }, { quoted: ms });
    } catch (e) {
        repondre("❌ 𝐄𝐫𝐫𝐨𝐫: " + e);
    }
});

// Dragon Ball Logo Command
zokou({ nomCom: "dragonball", categorie: "Logo", reaction: "🐉" }, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, ms } = commandeOptions;
    try {
        if (!arg || arg == "") {
            repondre(`🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}dragonball 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐃𝐫𝐚𝐠𝐨𝐧 𝐁𝐚𝐥𝐥-𝐬𝐭𝐲𝐥𝐞 𝐥𝐨𝐠𝐨!`);
            return;
        }
        repondre("🔄 𝐂𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐃𝐫𝐚𝐠𝐨𝐧 𝐁𝐚𝐥𝐥 𝐥𝐨𝐠𝐨...");
        const result = await mumaker.ephoto("https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html", arg.join(' '));
        await zk.sendMessage(dest, { 
            image: { url: result.image }, 
            caption: "🐉 𝐃𝐫𝐚𝐠𝐨𝐧 𝐁𝐚𝐥𝐥 𝐋𝐨𝐠𝐨 🐉\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧" 
        }, { quoted: ms });
    } catch (e) {
        repondre("❌ 𝐄𝐫𝐫𝐨𝐫: " + e);
    }
});

// Naruto Logo Command
zokou({ nomCom: "naruto", categorie: "Logo", reaction: "⛩" }, async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, prefixe } = commandeOptions;
    try {
        if (!arg || arg == '') {
            repondre("🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: " + prefixe + "naruto 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐍𝐚𝐫𝐮𝐭𝐨-𝐬𝐭𝐲𝐥𝐞 𝐥𝐨𝐠𝐨!");
            return;
        }
        repondre("🔄 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐍𝐚𝐫𝐮𝐭𝐨 𝐥𝐨𝐠𝐨...");
        const result = await mumaker.ephoto("https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html", arg.join(' '));
        await zk.sendMessage(dest, { 
            image: { url: result.image }, 
            caption: "⛩ 𝐍𝐚𝐫𝐮𝐭𝐨 𝐋𝐨𝐠𝐨 ⛩\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧" 
        }, { quoted: ms });
    } catch (e) {
        repondre("❌ 𝐄𝐫𝐫𝐨𝐫: " + e);
    }
});

// Wall Logo Command
zokou({ nomCom: "wall", categorie: "Logo", reaction: "👍" }, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, ms } = commandeOptions;
    if (!arg[0]) { 
        repondre(`🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}wall 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐜𝐨𝐨𝐥 𝐰𝐚𝐥𝐥-𝐛𝐫𝐞𝐚𝐤𝐢𝐧𝐠 𝐥𝐨𝐠𝐨!`); 
        return;
    }
    try {
        repondre("🔄 𝐂𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐰𝐚𝐥𝐥 𝐥𝐨𝐠𝐨...");
        const result = await mumaker.textpro("https://textpro.me/break-wall-text-effect-871.html", arg.join(" "));
        await zk.sendMessage(dest, { 
            image: { url: result.image }, 
            caption: "🧱 𝐖𝐚𝐥𝐥 𝐋𝐨𝐠𝐨 🧱\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧" 
        }, { quoted: ms });
    } catch (e) {
        repondre("❌ 𝐄𝐫𝐫𝐨𝐫: " + e);
    }
});

// ... (Continue with ALL other commands in the SAME format) ...

// Neon Light Logo Command
zokou({ nomCom: "neonlight", categorie: "Logo", reaction: "💡" }, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, ms } = commandeOptions;
    if (!arg || arg == "") {
        repondre(`🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}neonlight 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐠𝐥𝐨𝐰𝐢𝐧𝐠 𝐧𝐞𝐨𝐧 𝐥𝐨𝐠𝐨!`);
        return;
    }
    try {
        repondre("🔄 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐧𝐞𝐨𝐧 𝐥𝐨𝐠𝐨...");
        const result = await mumaker.textpro("https://textpro.me/create-glowing-neon-light-text-effect-online-free-1061.html", arg.join(" "));
        await zk.sendMessage(dest, { 
            image: { url: result.image }, 
            caption: "💡 𝐍𝐞𝐨𝐧 𝐋𝐢𝐠𝐡𝐭 𝐋𝐨𝐠𝐨 💡\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧" 
        }, { quoted: ms });
    } catch (e) {
        repondre("❌ 𝐄𝐫𝐫𝐨𝐫: " + e);
    }
});

// Devil Logo Command
zokou({ nomCom: "devil", categorie: "Logo", reaction: "😈" }, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, ms } = commandeOptions;
    if (!arg[0]) {
        repondre(`🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}devil 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐝𝐞𝐯𝐢𝐥-𝐰𝐢𝐧𝐠𝐬 𝐥𝐨𝐠𝐨!`);
        return;
    }
    try {
        repondre("🔄 𝐂𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐝𝐞𝐯𝐢𝐥 𝐥𝐨𝐠𝐨...");
        const result = await mumaker.textpro("https://textpro.me/create-neon-devil-wings-text-effect-online-free-1014.html", arg.join(" "));
        await zk.sendMessage(dest, { 
            image: { url: result.image }, 
            caption: "😈 𝐃𝐞𝐯𝐢𝐥 𝐋𝐨𝐠𝐨 😈\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧" 
        }, { quoted: ms });
    } catch (e) {
        repondre("❌ 𝐄𝐫𝐫𝐨𝐫: " + e);
    }
});

// ... (Include ALL remaining commands with the SAME pattern) ...

// Final Note: All commands follow this structure:
// 1. Check if args exist
// 2. Send processing message
// 3. Generate logo
// 4. Send result with Toxic-MD branding
// 5. Error handling