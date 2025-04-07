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
    reaction: "⚡" 
}, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    let { cm } = require(__dirname + "/../framework/zokou");

    // Stylish loading animation
    let loadingMsg = await zk.sendMessage(dest, { 
        text: "◄⏤͟͞ꭙͯ͢³➤⃝ 𝐋𝐎𝐀𝐃𝐈𝐍𝐆...\n▰▱▱▱▱▱▱▱▱▱ 10%"
    }, { quoted: ms });

    const updateProgress = async (percent) => {
        const filled = Math.floor(percent/10);
        const empty = 10 - filled;
        const batteryBar = '▰'.repeat(filled) + '▱'.repeat(empty);
        await zk.sendMessage(dest, {
            text: `◄⏤͟͞ꭙͯ͢³➤⃝ 𝐋𝐎𝐀𝐃𝐈𝐍𝐆...\n${batteryBar} ${percent}%`,
            edit: loadingMsg.key
        });
    };

    for (let i = 10; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
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

    // Premium menu design with your fancy font
    let infoMsg = `
◈━━━━━━━━━━━━━━━━◈
  
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐
  
> ✦ 𝐎𝐰𝐧𝐞𝐫: 
@254735342808

> ✦ 𝐌𝐨𝐝𝐞: 
${mode}

> ✦ 𝐓𝐢𝐦𝐞: 
${temps} (EAT)

> ✦ 𝐑𝐀𝐌: 
${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}

◈━━━━━━━━━━━━━━━━◈
`;

    let menuMsg = `
◈━━━━━━━━━━━━━━━━◈
  ⚡ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔 ⚡
  
  𝐔𝐬𝐞 ${prefixe}help <command>
  𝐟𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬
  
  ✦✦✦✦✦✦✦✦✦✦✦✦✦✦
`;

    // Enhanced category styling with your preferred emojis
    const categoryStyles = {
        "General": { icon: "🌟", decor: "꧂" },
        "Group": { icon: "👥", decor: "ᨖ" },
        "Mods": { icon: "🛡️", decor: "࿇" },
        "Fun": { icon: "🎭", decor: "᯼" },
        "Search": { icon: "🔍", decor: "✧" }
    };

    for (const cat in coms) {
        const style = categoryStyles[cat] || { icon: "✨", decor: "⳺" };
        menuMsg += `\n  ${style.decor} ${style.icon} *${cat.toUpperCase()}* ${style.icon} ${style.decor}\n`;

        // Organized commands with stylish bullets
        const chunkSize = 3;
        for (let i = 0; i < coms[cat].length; i += chunkSize) {
            const chunk = coms[cat].slice(i, i + chunkSize);
            menuMsg += `  ➺ ${chunk.join("  ✦  ")}\n`;
        }
    }

    menuMsg += `
◈━━━━━━━━━━━━━━━━◈
> 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑𝐒
  
  @254735342808 (𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧)
  @254799283147 (𝐓𝐎𝐗𝐈𝐂-𝐌𝐃)
  
 ⃝⃪⃕🥀-〭⃛〬𓆩〭⃛〬❥
◈━━━━━━━━━━━━━━━━◈
`;

    try {
        const lien = mybotpic();
        const mentionedJids = [
            '254735342808@s.whatsapp.net', 
            '254799283147@s.whatsapp.net'
        ];

        // Final loading animation
        await zk.sendMessage(dest, {
            text: "◄⏤͟͞ꭙͯ͢³➤⃝ 𝐌𝐄𝐍𝐔 𝐑𝐄𝐀𝐃𝐘!\n▰▰▰▰▰▰▰▰▰▰ 100%",
            edit: loadingMsg.key
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        if (lien.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(
                dest,
                { 
                    video: { url: lien }, 
                    caption: infoMsg + menuMsg,
                    footer: "◄⏤͟͞ꭙͯ͢³➤⃝ ⃝⃪⃕𝚣⃪ꙴ-〭⃛〬𓆩〭⃛〬❥",
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
                    footer: "◄⏤͟͞ꭙͯ͢³➤⃝ ⃝⃪⃕𝚣⃪ꙴ-〭⃛〬𓆩〭⃛〬❥",
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

        // Send audio with stylish caption
        const audioPath = __dirname + "/../MIDDLE OF THE NIGHT.m4a";
        if (fs.existsSync(audioPath)) {
            await zk.sendMessage(
                dest,
                {
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4',
                    ptt: false,
                    fileName: "⃝⃪⃕🥀 𝐓𝐎𝐗𝐈𝐂 𝐓𝐇𝐄𝐌𝐄 ✧.mp3",
                    caption: "✦⋆✗𝗗"
                },
                { quoted: ms }
            );
        }

    } catch (e) {
        console.error("◈ 𝐄𝐑𝐑𝐎𝐑 ◈", e);
        await zk.sendMessage(dest, {
            text: "◈ 𝐅𝐀𝐈𝐋𝐄𝐃 𝐓𝐎 𝐋𝐎𝐀𝐃 𝐌𝐄𝐍𝐔 ◈\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫",
            edit: loadingMsg.key
        });
    }
});