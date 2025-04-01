const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format, styletext } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

zokou({ 
  nomCom: "menu", 
  categorie: "General",
  reaction: "📜" 
}, async (dest, zk, commandeOptions) => {
    let { ms, repondre } = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    var coms = {};
    var mode = "public";
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }

    var emoji = { 
        "General": "🌐", 
        "Logo": "🎨", 
        "Hentai": "🔞", 
        "Weeb": "🌸", 
        "Search": "🔍", 
        "Conversion": "🔄", 
        "Group": "👥", 
        "Other": "✨",
        "Fun": "🎭",
        "Mods": "🛠️"
    };

    cm.map(async (com, index) => { 
        if (!coms[com.categorie])
            coms[com.categorie] = []; 
        coms[com.categorie].push(com.nomCom); 
    });

    moment.tz.setDefault('Etc/GMT');
    const temps = moment().format("HH:mm:ss");
    const date = moment().format("DD/MM/YYYY");

    let menuMsg = `
╔══════════════════════════╗
  𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐌𝐞𝐧𝐮
╚══════════════════════════╝

╔══════════════════════════╗
  𝐁𝐨𝐭 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧
╚══════════════════════════╝
┣✦ 𝐏𝐫𝐞𝐟𝐢𝐱: ${s.PREFIXE}
┣✦ 𝐎𝐰𝐧𝐞𝐫: ${s.OWNER_NAME}    
┣✦ 𝐌𝐨𝐝𝐞: ${mode}
┣✦ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${cm.length}
┣✦ 𝐃𝐚𝐭𝐞: ${date}
┣✦ 𝐓𝐢𝐦𝐞: ${temps}
┣✦ 𝐌𝐞𝐦𝐨𝐫𝐲: ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┣✦ 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${os.platform()}
┣✦ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: 𝐱𝐡𝐜𝐥𝐢𝐧𝐭𝐨𝐧
╰─────────────────────────╯

╔══════════════════════════╗
  𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬
╚══════════════════════════╝\n`;

    for (const cat in coms) {
        if (!emoji[cat]) {
            emoji[cat] = "✨";
        }
        menuMsg += `\n╔════════════════╗
┃ ${emoji[cat]} 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${cat} ${emoji[cat]}
╚════════════════╝\n`;
        
        // Split commands into chunks of 3 for better display
        const chunkSize = 3;
        for (let i = 0; i < coms[cat].length; i += chunkSize) {
            const chunk = coms[cat].slice(i, i + chunkSize);
            menuMsg += "┣✦ " + chunk.join("  •  ") + "\n";
        }
    }

    menuMsg += `\n╔══════════════════════════╗
  𝐄𝐧𝐝 𝐨𝐟 𝐌𝐞𝐧𝐮
╚══════════════════════════╝
𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 | 𝐂𝐫𝐞𝐚𝐭𝐞𝐝 𝐛𝐲 𝐱𝐡𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    var link = s.IMAGE_MENU || "https://i.imgur.com/8K7fT5a.jpg";
    try {
        zk.sendMessage(dest, { 
            image: { url: link }, 
            caption: menuMsg, 
            footer: "𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐯𝟏.𝟎 | ©𝟐𝟎𝟐𝟒" 
        }, { quoted: ms });
    }
    catch (e) {
        console.log("⚠️ 𝐌𝐞𝐧𝐮 𝐞𝐫𝐫𝐨𝐫 " + e);
        repondre("⚠️ 𝐌𝐞𝐧𝐮 𝐞𝐫𝐫𝐨𝐫 " + e);
    }
});