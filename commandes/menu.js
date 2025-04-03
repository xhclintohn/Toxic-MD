const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

zokou({ 
    nomCom: "menu", 
    categorie: "General", 
    reaction: "🔥" 
}, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    let { cm } = require(__dirname + "/../framework/zokou");

    // Premium loading animation
    const loadingFrames = [
        "🟥⬜⬜⬜⬜⬜⬜⬜⬜⬜ 10%",
        "🟥🟧⬜⬜⬜⬜⬜⬜⬜⬜ 20%",
        "🟥🟧🟨⬜⬜⬜⬜⬜⬜⬜ 30%",
        "🟥🟧🟨🟩⬜⬜⬜⬜⬜⬜ 40%",
        "🟥🟧🟨🟩🟦⬜⬜⬜⬜⬜ 50%",
        "🟥🟧🟨🟩🟦🟪⬜⬜⬜⬜ 60%",
        "🟥🟧🟨🟩🟦🟪🟫⬜⬜⬜ 70%",
        "🟥🟧🟨🟩🟦🟪🟫⬛⬜⬜ 80%",
        "🟥🟧🟨🟩🟦🟪🟫⬛🔳⬜ 90%",
        "🟥🟧🟨🟩🟦🟪🟫⬛🔳🔲 100%"
    ];

    let loadingMsg = await zk.sendMessage(dest, { 
        text: `🎭 *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐* 𝐢𝐬 𝐥𝐨𝐚𝐝𝐢𝐧𝐠...\n${loadingFrames[0]}`
    }, { quoted: ms });

    // Smooth loading animation
    for (let i = 0; i < loadingFrames.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        await zk.sendMessage(dest, {
            text: `🎭 *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐* 𝐢𝐬 𝐥𝐨𝐚𝐝𝐢𝐧𝐠...\n${loadingFrames[i]}`,
            edit: loadingMsg.key
        });
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

    // Premium header with stylish font
    const header = `
╔══════════════════════════╗
  🌟 *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐* 🌟
  🔥 𝐓𝐡𝐞 𝐌𝐨𝐬𝐭 𝐏𝐨𝐰𝐞𝐫𝐟𝐮𝐥 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭
╠══════════════════════════╣
`;

    let infoMsg = `
│🎭 *𝐎𝐰𝐧𝐞𝐫*: @254735342808
│⚡ *𝐌𝐨𝐝𝐞*: ${mode}
│⏳ *𝐔𝐩𝐭𝐢𝐦𝐞*: ${process.uptime().toFixed(2)}s
│📅 *𝐃𝐚𝐭𝐞*: ${date}
│⏰ *𝐓𝐢𝐦𝐞*: ${temps} (EAT)
│💾 *𝐑𝐀𝐌*: ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
│📊 *𝐂𝐏𝐔*: ${os.cpus()[0].model.split('@')[0]}
╚══════════════════════════╝
`;

    // Command menu with stylish fonts
    let menuMsg = `
╔═══◇ *𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔* ◇═══╗
│
│ *𝐔𝐬𝐞 ${prefixe}𝐡𝐞𝐥𝐩 <𝐜𝐨𝐦𝐦𝐚𝐧𝐝>*
│ *𝐟𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬*
│
╠════◇ *𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄𝐒* ◇════╣
`;

    // Enhanced category styling
    const categoryStyles = {
        "General": { icon: "📌", color: "#FF5733", style: "𝐆𝐞𝐧𝐞𝐫𝐚𝐥" },
        "Group": { icon: "👥", color: "#3498DB", style: "𝐆𝐫𝐨𝐮𝐩" },
        "Mods": { icon: "🛡️", color: "#F1C40F", style: "𝐌𝐨𝐝𝐬" },
        "Fun": { icon: "🎭", color: "#9B59B6", style: "𝐅𝐮𝐧" },
        "Search": { icon: "🔍", color: "#2ECC71", style: "𝐒𝐞𝐚𝐫𝐜𝐡" }
    };

    for (const cat in coms) {
        const style = categoryStyles[cat] || { icon: "✨", color: "#FFFFFF", style: cat };
        menuMsg += `│\n│ ${style.icon} *${style.style}* ${style.icon}\n│\n`;

        // Format commands with stylish font
        const commands = coms[cat].map(cmd => `𝐱𝐡_${cmd.toLowerCase()}`).join(" • ");
        menuMsg += `│ ➤ ${commands}\n`;
    }

    menuMsg += `
╠════◇ *𝐂𝐑𝐄𝐃𝐈𝐓𝐒* ◇════╣
│
│ *𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐛𝐲:*
│ @254735342808 (𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧)
│ @254799283147 (𝐓𝐎𝐗𝐈𝐂-𝐌𝐃)
│
╚════◇ *𝐄𝐍𝐃* ◇════╝
`;

    try {
        // Use the image URL you provided
        const menuImage = 'https://i.ibb.co/QvzCRjHQ/1c5d0e2ade058b6b.jpg';
        const mentionedJids = [
            '254735342808@s.whatsapp.net', 
            '254799283147@s.whatsapp.net'
        ];

        // Final loading message
        await zk.sendMessage(dest, {
            text: "✅ *𝐌𝐞𝐧𝐮 𝐑𝐞𝐚𝐝𝐲!*",
            edit: loadingMsg.key
        });

        // Small delay before showing menu
        await new Promise(resolve => setTimeout(resolve, 300));

        // Send menu with your image
        await zk.sendMessage(
            dest,
            { 
                image: { url: menuImage }, 
                caption: header + infoMsg + menuMsg,
                footer: "🔥 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 - 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
                mentions: mentionedJids
            },
            { quoted: ms }
        );

    } catch (e) {
        console.error("❌ 𝐄𝐫𝐫𝐨𝐫:", e);
        await zk.sendMessage(dest, {
            text: "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐦𝐞𝐧𝐮. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.",
            edit: loadingMsg.key
        });
    }
});