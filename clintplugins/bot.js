const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const path = require('path');
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

zokou({ nomCom: "bot", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, mybotpic } = commandeOptions;
    var mode = "public";
    
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }

    moment.tz.setDefault('Etc/GMT');
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    let infoMsg = `
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 

VERSION
> 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 V2.0

STATUS
> ${mode.toUpperCase()} MODE
⁠
◈━━━━━━━━━━━━━━━━◈
│❒⁠⁠⁠⁠ RAM : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
│❒⁠⁠⁠⁠ DEV : 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
⁠⁠⁠⁠◈━━━━━━━━━━━━━━━━◈
  `;
    
    let menuMsg = `
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 2025™

◈━━━━━━━━━━━━━━━━◈`;

    try {
        // Send bot info
        var lien = mybotpic();
        if (lien.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(dest, { 
                video: { url: lien }, 
                caption: infoMsg + menuMsg, 
                footer: "Toxic-MD WhatsApp Bot",
                gifPlayback: true 
            }, { quoted: ms });
        } 
        else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, { 
                image: { url: lien }, 
                caption: infoMsg + menuMsg,
                footer: "Toxic-MD WhatsApp Bot"
            }, { quoted: ms });
        } 
        else {
            await repondre(infoMsg + menuMsg);
        }

        // Send audio file from root directory
        const audioPath = __dirname + "/../𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧/bot.mp3"; // Changed path
        if (fs.existsSync(audioPath)) {
            await zk.sendMessage(dest, {
                audio: { url: audioPath },
                mimetype: 'audio/mp4',
                ptt: false,
                fileName: "Toxic-MD Theme.m4a"
            }, { quoted: ms });
        } else {
            console.log("Audio file not found at path:", audioPath);
            repondre("Audio file not found"); // Notify user if audio is missing
        }

    } catch (e) {
        console.log("Bot command error " + e);
        repondre("Bot command error " + e);
    }
});