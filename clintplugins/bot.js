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

zokou(
  { nomCom: "bot", categorie: "General" },
  async (dest, zk, commandeOptions) => {
    let { ms, repondre, mybotpic } = commandeOptions;
    var mode = "public";

    if (s.MODE.toLocaleLowerCase() !== "yes") {
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
        await zk.sendMessage(
          dest,
          {
            video: { url: lien },
            caption: infoMsg + menuMsg,
            footer: "Toxic-MD WhatsApp Bot",
            gifPlayback: true,
          },
          { quoted: ms }
        );
      } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
        await zk.sendMessage(
          dest,
          {
            image: { url: lien },
            caption: infoMsg + menuMsg,
            footer: "Toxic-MD WhatsApp Bot",
          },
          { quoted: ms }
        );
      } else {
        await repondre(infoMsg + menuMsg);
      }

      // Send random audio as a voice note
      const audioFolder = __dirname + "/../xh_clinton/";
      console.log("Audio folder path:", audioFolder);

      // Check if folder exists
      if (!fs.existsSync(audioFolder)) {
        console.log("Audio folder does not exist:", audioFolder);
        repondre(`𝐀𝐮𝐝𝐢𝐨 𝐟𝐨𝐥𝐝𝐞𝐫 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝: ${audioFolder}`);
        return;
      }

      // Get all MP3 files in the folder (e.g., bot1.mp3 to bot9.mp3)
      const audioFiles = fs.readdirSync(audioFolder).filter(f => f.endsWith(".mp3"));
      console.log("Available audio files:", audioFiles);

      if (audioFiles.length === 0) {
        console.log("No MP3 files found in folder");
        repondre(`𝐍𝐨 𝐚𝐮𝐝𝐢𝐨 𝐟𝐢𝐥𝐞𝐬 𝐟𝐨𝐮𝐧𝐝 𝐢𝐧 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 𝐟�{o𝐥𝐝𝐞𝐫`);
        return;
      }

      // Randomly select an audio file
      const randomAudio = audioFiles[Math.floor(Math.random() * audioFiles.length)];
      const audioPath = audioFolder + randomAudio;

      console.log("Randomly selected audio:", randomAudio);
      console.log("Full audio path:", audioPath);

      // Verify file exists
      if (fs.existsSync(audioPath)) {
        console.log("Audio file exists, sending as voice note...");
        try {
          const audioMessage = await zk.sendMessage(
            dest,
            {
              audio: { url: audioPath },
              mimetype: "audio/mpeg", // MP3 files use audio/mpeg
              ptt: true, // Voice note appearance (waveform, duration)
              fileName: `𝐓𝐎𝐗𝐈𝐂 𝐕𝐎𝐈𝐂𝐄 ✧`,
              caption: "✦⋆✗𝐓𝐎𝐗𝐈𝐂",
            },
            { quoted: ms }
          );
          console.log("Audio sent successfully:", randomAudio);
          console.log("Audio message details:", audioMessage);
        } catch (audioError) {
          console.error("Error sending audio:", audioError);
          repondre(`𝐄𝐫𝐫𝐨𝐫 𝐬𝐞𝐧𝐝𝐢𝐧𝐠 𝐯𝐨𝐢𝐜𝐞 𝐧𝐨𝐭𝐞: ${audioError.message}`);
        }
      } else {
        console.log("Selected audio file not found at:", audioPath);
        repondre(`𝐀𝐮𝐝𝐢�{o 𝐟𝐢𝐥𝐞 𝐧�{o𝐭 𝐟�{o𝐮𝐧𝐝: ${randomAudio}\n𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐟𝐢𝐥𝐞𝐬: ${audioFiles.join(", ")}`);
      }

    } catch (e) {
      console.log("Bot command error:", e);
      repondre(`𝐁�{o𝐭 𝐜�{o𝐦𝐦𝐚𝐧𝐝 𝐞𝐫𝐫�{o𝐫: ${e.message}`);
    }
  }
);