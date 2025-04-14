const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

zokou(
  { nomCom: "repo", categorie: "General", reaction: "📚" },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    const { cm } = require(__dirname + "/../framework/zokou");
    let coms = {};
    let mode = "public";

    // Check bot mode (public or private)
    if ((s.MODE).toLowerCase() !== "yes") {
      mode = "private";
    }

    // Map commands by category (though not used in the reply for .repo)
    cm.map((com) => {
      if (!coms[com.categorie]) coms[com.categorie] = [];
      coms[com.categorie].push(com.nomCom);
    });

    // Set timezone and get current time/date
    moment.tz.setDefault('Etc/GMT');
    const time = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    // Prepare the repo message with fancy font and realistic tone
    const infoMsg = `
     𝗧𝗢𝗫𝗜𝗖-𝗠𝗗 𝗥𝗘𝗣𝗢 𝗜𝗡𝗙𝗢 📦

◈━━━━━━━━━━━━━━━━◈

> 𝗚𝗜𝗧𝗛𝗨𝗕 𝗟𝗜𝗡𝗞  
https://github.com/xhclintohn/Toxic-MD/fork

> 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗚𝗥𝗢𝗨𝗣  
https://chat.whatsapp.com/GoXKLVJgTAAC3556FXkfFI

◈━━━━━━━━━━━━━━━━◈
> ❒ 𝗥𝗔𝗠 𝗨𝗦𝗔𝗚𝗘:  
${format(os.totalmem() - os.freemem())} / ${format(os.totalmem())}

> ❒ 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥:  
𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

◈━━━━━━━━━━━━━━━━◈
    `;

    const menuMsg = `
     𝗧𝗢𝗫𝗜𝗖-𝗠𝗗 𝟮𝟬𝟮𝟱™ 🔥

◈━━━━━━━━━━━━━━━━◈
    `;

    // Get the bot's profile picture URL
    const lien = mybotpic();

    // Send the message with a video if the URL is a video (mp4 or gif)
    if (lien.match(/\.(mp4|gif)$/i)) {
      try {
        await zk.sendMessage(
          dest,
          {
            video: { url: lien },
            caption: infoMsg + menuMsg,
            footer: "Hey there! I’m Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎",
            gifPlayback: true,
          },
          { quoted: ms }
        );
      } catch (e) {
        console.error("Video sending error:", e);
        repondre("𝗢𝗼𝗽𝘀, 𝗜 𝗰𝗼𝘂𝗹𝗱𝗻’𝘁 𝘀𝗲𝗻𝗱 𝘁𝗵𝗲 𝘃𝗶𝗱𝗲𝗼. 𝗦𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝘄𝗲𝗻𝘁 𝘄𝗿𝗼𝗻𝗴! 😓");
      }
    }
    // Send the message with an image if the URL is an image (jpeg, png, jpg)
    else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
      try {
        await zk.sendMessage(
          dest,
          {
            image: { url: lien },
            caption: infoMsg + menuMsg,
            footer: "Hey there! I’m Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎",
          },
          { quoted: ms }
        );
      } catch (e) {
        console.error("Image sending error:", e);
        repondre("𝗢𝗼𝗽𝘀, 𝗜 𝗰𝗼𝘂𝗹𝗱𝗻’𝘁 𝘀𝗲𝗻𝗱 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲. 𝗦𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝘄𝗲𝗻𝘁 𝘄𝗿𝗼𝗻𝗴! 😓");
      }
    }
    // Fallback to text-only message if no valid media is provided
    else {
      repondre(infoMsg + menuMsg + "\nHey there! I’m Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎");
    }
  }
);