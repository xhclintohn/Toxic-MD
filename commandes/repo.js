const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)

zokou({ nomCom: "repo", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre ,prefixe,nomAuteurMessage,mybotpic} = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    var coms = {};
    var mode = "public";
    
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }

    cm.map(async (com, index) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault('Etc/GMT');
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    let infoMsg =  `
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃-𝐑𝐄𝐏𝐎

◈━━━━━━━━━━━━━━━━◈

> GITHUB LINK
 https://github.com/xhclintohn/Toxic-MD/fork

> WHATSAPP CHANNEL
 https://whatsapp.com/channel/0029VajJTJp2f3ELCm8FN50D
⁠
◈━━━━━━━━━━━━━━━━◈
> ❒⁠⁠⁠⁠ RAM : 
${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}

> ❒⁠⁠⁠⁠ DEV : 
𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
⁠⁠⁠⁠◈━━━━━━━━━━━━━━━━◈
  `;
    
    let menuMsg = `
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 2025™

◈━━━━━━━━━━━━━━━━◈`;

    var lien = mybotpic();

    if (lien.match(/\.(mp4|gif)$/i)) {
        try {
            zk.sendMessage(dest, { video: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *Beltahmd*, déveloper Beltah Tech" , gifPlayback : true }, { quoted: ms });
        }
        catch (e) {
            console.log(" error erreur " + e);
            repondre(" error " + e);
        }
    } 
    else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
        try {
            zk.sendMessage(dest, { image: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *Beltahmd*, déveloper Beltah Tech" }, { quoted: ms });
        }
        catch (e) {
            console.log(" error " + e);
            repondre(" error " + e);
        }
    } 
    else {
        repondre(infoMsg + menuMsg);
    }
});