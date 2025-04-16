const util = require("util");
const fs = require("fs-extra");
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

zokou(
  {
    nomCom: "menu",
    categorie: "General",
    reaction: "⚡",
  },
  async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    let { cm } = require(__dirname + "/../framework/zokou");

    console.log(`[DEBUG] menu command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

    // Command categorization
    var coms = {};
    var mode = "public";
    if (s.MODE.toLocaleLowerCase() !== "yes") {
      mode = "private";
    }

    cm.map(async (com) => {
      if (!coms[com.categorie]) {
        coms[com.categorie] = [];
      }
      coms[com.categorie].push(com.nomCom);
    });

    // Set timezone and get current time
    moment.tz.setDefault("EAT");
    const temps = moment().format("HH:mm:ss");

    // Info section
    let infoMsg = `
◈━━━━━━━━━━━━━━━━◈
  
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐
  
> ✦ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: 
@254735342808

> ✦ 𝐌𝐨𝐝𝐞: 
${mode}

> ✦ 𝐓𝐢𝐦𝐞: 
${temps} (EAT)

> ✦ 𝐑𝐀𝐌: 
${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}

◈━━━━━━━━━━━━━━━━◈
`;

    // Menu section
    let menuMsg = `
◈━━━━━━━━━━━━━━━━◈
  ⚡ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔 ⚡
  
  𝐔𝐬𝐞 ${prefixe}help <command>
  𝐟𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬
  
  ✦✦✦✦✦✦✦✦✦✦✦✦✦✦
`;

    // Category styles with mature, realistic decor
    const categoryStyles = {
      General: { icon: "🌟", decor: "┃" },
      Group: { icon: "👥", decor: "┃" },
      Mods: { icon: "🛡️", decor: "┃" },
      Fun: { icon: "🎭", decor: "┃" },
      Search: { icon: "🔍", decor: "┃" },
      Logo: { icon: "🎨", decor: "┃" },
      Utilities: { icon: "🛠", decor: "┃" },
      Adult: { icon: "🔞", decor: "┃" },      // Added for .xxxvideo
      Download: { icon: "📥", decor: "┃" },   // Added for .apk, .twitterdl
    };

    // Build menu with all categories and vertical command listing
    for (const cat in coms) {
      const style = categoryStyles[cat] || { icon: "✨", decor: "⋯" };
      menuMsg += `\n  ${style.decor} ${style.icon} *${cat.toUpperCase()}* ${style.icon} ${style.decor}\n`;

      // List commands vertically with a bullet point
      coms[cat].forEach((cmd) => {
        menuMsg += `  • ${cmd}\n`;
      });
    }

    menuMsg += `
◈━━━━━━━━━━━━━━━━◈
> 𝑨𝒍𝒍 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑵𝒖𝒎𝒃𝒆𝒓𝒔 
  
  @254735342808 (𝐌𝐚𝐢𝐧)
  @254799283147 (𝐓𝐨𝐱𝐢𝐜)
  
 ⃝⃪⃕🥀-〭⃛〬𓆩〭⃛〬❥
◈━━━━━━━━━━━━━━━━◈
`;

    try {
      const lien = mybotpic();
      const mentionedJids = [
        "254735342808@s.whatsapp.net",
        "254799283147@s.whatsapp.net",
      ];

      // Send menu based on media type
      if (lien.match(/\.(mp4|gif)$/i)) {
        console.log(`[DEBUG] menu: Sending video menu`);
        await zk.sendMessage(
          dest,
          {
            video: { url: lien },
            caption: infoMsg + menuMsg,
            footer: "◄⏤͟͞ꭙͯ͢³➤⃝ ⃝⃪⃕𝚣⃪ꙴ-〭⃛〬𓆩〭⃛〬❥",
            mentions: mentionedJids,
            gifPlayback: true,
          },
          { quoted: ms }
        );
        console.log(`[DEBUG] menu: Video menu sent successfully`);
      } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
        console.log(`[DEBUG] menu: Sending image menu`);
        await zk.sendMessage(
          dest,
          {
            image: { url: lien },
            caption: infoMsg + menuMsg,
            footer: "◄⏤͟͞ꭙͯ͢³➤⃝ ⃝⃪⃕𝚣⃪ꙴ-〭⃛〬𓆩〭⃛〬❥",
            mentions: mentionedJids,
          },
          { quoted: ms }
        );
        console.log(`[DEBUG] menu: Image menu sent successfully`);
      } else {
        console.log(`[DEBUG] menu: Sending text menu`);
        await zk.sendMessage(
          dest,
          {
            text: infoMsg + menuMsg,
            mentions: mentionedJids,
          },
          { quoted: ms }
        );
        console.log(`[DEBUG] menu: Text menu sent successfully`);
      }

      // Send random audio as a voice note
      const audioFolder = __dirname + "/../xh_clinton/";
      console.log(`[DEBUG] menu: Audio folder path: ${audioFolder}`);

      // Check if folder exists
      if (!fs.existsSync(audioFolder)) {
        console.log(`[DEBUG] menu: Audio folder does not exist: ${audioFolder}`);
        repondre(`𝐀𝐮𝐝𝐢𝐨 𝐟𝐨𝐥𝐝𝐞𝐫 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝: ${audioFolder}`);
        return;
      }

      // Get all MP3 files in the folder
      const audioFiles = fs.readdirSync(audioFolder).filter(f => f.endsWith(".mp3"));
      console.log(`[DEBUG] menu: Available audio files: ${audioFiles}`);

      if (audioFiles.length === 0) {
        console.log(`[DEBUG] menu: No MP3 files found in folder`);
        repondre(`𝐍𝐨 𝐚𝐮𝐝𝐢𝐨 𝐟𝐢𝐥𝐞𝐬 𝐟𝐨𝐮𝐧𝐝 𝐢𝐧 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 𝐟𝐨𝐥𝐝𝐞𝐫`);
        return;
      }

      // Randomly select an audio file
      const randomAudio = audioFiles[Math.floor(Math.random() * audioFiles.length)];
      const audioPath = audioFolder + randomAudio;

      console.log(`[DEBUG] menu: Randomly selected audio: ${randomAudio}`);
      console.log(`[DEBUG] menu: Full audio path: ${audioPath}`);

      // Verify file exists
      if (fs.existsSync(audioPath)) {
        console.log(`[DEBUG] menu: Audio file exists, sending as voice note`);
        try {
          const audioMessage = await zk.sendMessage(
            dest,
            {
              audio: { url: audioPath },
              mimetype: "audio/mpeg",
              ptt: true,
              fileName: `𝐓𝐎𝐗𝐈𝐂 𝐕𝐎𝐈𝐂𝐄 ✧`,
              caption: "✦⋆✗𝐓𝐎𝐗𝐈𝐂",
            },
            { quoted: ms }
          );
          console.log(`[DEBUG] menu: Audio sent successfully: ${randomAudio}`);
          console.log(`[DEBUG] menu: Audio message details: ${JSON.stringify(audioMessage)}`);
        } catch (audioError) {
          console.error(`[DEBUG] menu: Error sending audio: ${audioError}`);
          repondre(`𝐄𝐫𝐫𝐨𝐫 𝐬𝐞𝐧𝐝𝐢𝐧𝐠 𝐯𝐨𝐢𝐜𝐞 𝐧𝐨𝐭𝐞: ${audioError.message}`);
        }
      } else {
        console.log(`[DEBUG] menu: Selected audio file not found at: ${audioPath}`);
        repondre(`𝐀𝐮𝐝𝐢𝐨 𝐟𝐢𝐥𝐞 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝: ${randomAudio}\n𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐟𝐢𝐥𝐞𝐬: ${audioFiles.join(", ")}`);
      }
    } catch (e) {
      console.error(`[DEBUG] menu: Error: ${e}`);
      repondre(`◈ 𝐅𝐀𝐈𝐋𝐄𝐃 𝐓𝐎 𝐋𝐎𝐀𝐃 𝐌𝐄𝐍𝐔 ◈\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫: ${e.message}`);
    }
  }
);