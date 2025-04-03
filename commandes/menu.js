const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Add help as an alias for menu
zokou({ 
    nomCom: ["menu", "help"], 
    categorie: "General", 
    reaction: "🔥" 
}, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    let { cm } = require(__dirname + "/../framework/zokou");

    // Stylish loading animation with manual fancy font
    let loadingMsg = await zk.sendMessage(dest, { 
        text: "🔄 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐎𝐀𝐃𝐈𝐍𝐆...\n▰▱▱▱▱▱▱▱▱ 10%"
    }, { quoted: ms });

    // Update progress with stylish bars and manual fancy font
    const updateProgress = async (percent) => {
        const filled = Math.round(percent/10);
        const empty = 10 - filled;
        const progressBar = '▰'.repeat(filled) + '▱'.repeat(empty);
        await zk.sendMessage(dest, {
            text: `🔄 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐌𝐄𝐍𝐔 𝐋𝐎𝐀𝐃𝐈𝐍𝐆...\n${progressBar} ${percent}%`,
            edit: loadingMsg.key
        });
    };

    // Simulate loading process with smooth transitions
    for (let i = 20; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 400));
        await updateProgress(i);
    }

    // Prepare menu content
    var coms = {};
    var mode = "public";
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }

    cm.map(async (com, index) => {
        if (!coms[com.categorie]) {
            coms[com.categorie] = [];
        }
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault('EAT');
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    // Stylish header with manual fancy font
    let infoMsg = `
╔═════◇ 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐 ◇═════╗
║
║  🔥 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐓𝐎𝐗𝐈𝐂 𝐃𝐄𝐕 🔥
║
╠════◇ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎 ◇════╣
║
║ 👑 𝐎𝐰𝐧𝐞𝐫: @254735342808
║ ⚡ 𝐌𝐨𝐝𝐞: ${mode}
║ ⏰ 𝐓𝐢𝐦𝐞: ${temps} (𝐄𝐀𝐓)
║ 💾 𝐑𝐀𝐌: ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
║
╚════◇ 𝐒𝐓𝐀𝐓𝐔𝐒 ◇════╝
`;

    let menuMsg = `
╔═════◇ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔 ◇═════╗
║
║ 📌 𝐔𝐬𝐚𝐠𝐞: ${prefixe}𝐡𝐞𝐥𝐩 <𝐜𝐨𝐦𝐦𝐚𝐧𝐝>
║ 𝐟𝐨𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐝𝐞𝐭𝐚𝐢𝐥𝐬
║
╠════◇ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄𝐒 ◇════╣
`;

    // Enhanced category styling with emojis
    const categoryStyles = {
        "General": { icon: "📌" },
        "Group": { icon: "👥" },
        "Mods": { icon: "🛡️" },
        "Fun": { icon: "🎭" },
        "Search": { icon: "🔍" }
    };

    for (const cat in coms) {
        const style = categoryStyles[cat] || { icon: "✨" };
        menuMsg += `║\n║ ${style.icon} 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘: ${cat.toUpperCase()} ${style.icon}\n║\n`;

        // Split commands into chunks of 3 for better layout
        const chunkSize = 3;
        for (let i = 0; i < coms[cat].length; i += chunkSize) {
            const chunk = coms[cat].slice(i, i + chunkSize);
            menuMsg += `║ ➤ ${chunk.map(c => `𝐂𝐌𝐃: ${c}`).join(" • ")}\n`;
        }
    }

    menuMsg += `
╠════◇ 𝐂𝐑𝐄𝐃𝐈𝐓𝐒 ◇════╣
║
║ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐛𝐲:
║ @254735342808 (𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧)
║ @254799283147 (𝐓𝐎𝐗𝐈𝐂-𝐌𝐃)
║
╚════◇ 𝐄𝐍𝐃 ◇════╝
`;

    try {
        const lien = mybotpic();
        const mentionedJids = [
            '254735342808@s.whatsapp.net', 
            '254799283147@s.whatsapp.net'
        ];

        // Remove the loading message completely
        await zk.sendMessage(dest, {
            text: "",
            edit: loadingMsg.key
        });

        // Small delay before showing menu
        await new Promise(resolve => setTimeout(resolve, 300));

        if (lien.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(
                dest,
                { 
                    video: { url: lien }, 
                    caption: infoMsg + menuMsg,
                    footer: "🔥 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 - 𝐓𝐡𝐞 𝐌𝐨𝐬𝐭 𝐏𝐨𝐰𝐞𝐫𝐟𝐮𝐥 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭",
                    mentions: mentionedJids,
                    gifPlayback: true
                },
                { quoted: ms }
            );
        } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(
                dest,
                { 
                    image: { url: lien }, 
                    caption: infoMsg + menuMsg,
                    footer: "🔥 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 - 𝐓𝐡𝐞 𝐌𝐨𝐬𝐭 𝐏𝐨𝐰𝐞𝐫𝐟𝐮𝐥 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭",
                    mentions: mentionedJids
                },
                { quoted: ms }
            );
        } else {
            await zk.sendMessage(
                dest,
                { 
                    text: infoMsg + menuMsg,
                    mentions: mentionedJids
                },
                { quoted: ms }
            );
        }
    } catch (e) {
        console.error("❌ 𝐄𝐫𝐫𝐨𝐫:", e);
        await zk.sendMessage(dest, {
            text: "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐦𝐞𝐧𝐮. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.",
            edit: loadingMsg.key
        });
    }
});