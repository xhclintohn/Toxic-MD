const util = require("util");
const fs = require("fs-extra");
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Help Command
zokou(
  {
    nomCom: "help",
    categorie: "General",
    reaction: "⚡",
  },
  async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    let { cm } = require(__dirname + "/../framework/zokou");

    // Initial loading message
    let loadingMsg = await zk.sendMessage(
      dest,
      {
        text: "𝐋𝐨𝐚𝐝𝐢𝐧𝐠......\n▰▱▱▱▱▱▱▱▱▱ 10%",
      },
      { quoted: ms }
    );

    // Function to update loading progress
    const updateProgress = async (percent) => {
      const filled = Math.floor(percent / 10);
      const empty = 10 - filled;
      const batteryBar = "▰".repeat(filled) + "▱".repeat(empty);
      await zk.sendMessage(
        dest,
        {
          text: `𝐋𝐨𝐚𝐝𝐢𝐧𝐠...\n${batteryBar} ${percent}%`,
          edit: loadingMsg.key,
        },
        { quoted: ms }
      );
    };

    // Custom loading steps with skips (10%, 30%, 50%, 70%, 100%)
    const loadingSteps = [10, 30, 50, 70, 100];
    for (let percent of loadingSteps) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await updateProgress(percent);
    }

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

    // Menu section
    let menuMsg = `
◈━━━━━━━━━━━━━━━━◈
  ⚡ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔 ⚡
  
  𝐔𝐬𝐞 ${prefixe}help <command>
  𝐟𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬
  
  ✦✦✦✦✦✦✦✦✦✦✦✦✦✦
`;

    // Updated category styles including new categories
    const categoryStyles = {
      General: { icon: "🌟", decor: "꧂" },
      Group: { icon: "👥", decor: "ᨖ" },
      Mods: { icon: "🛡️", decor: "࿇" },
      Fun: { icon: "🎭", decor: "᯼" },
      Search: { icon: "🔍", decor: "✧" },
      Logo: { icon: "🎨", decor: "✎" },
      Utilities: { icon: "🛠", decor: "⚙" },
    };

    // Build menu with all categories
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
  
  @254735342808 (𝐱𝐡_�{c𝐥𝐢�{n𝐭�{o�{n)
  @254799283147 (𝐓𝐎𝐗𝐈�{C-�{M�{D)
  
 ⃝⃪⃕🥀-〭⃛〬𓆩〭⃛〬❥
◈━━━━━━━━━━━━━━━━◈
`;

    try {
      const lien = mybotpic();
      const mentionedJids = [
        "254735342808@s.whatsapp.net",
        "254799283147@s.whatsapp.net",
      ];

      // Final loading confirmation
      await zk.sendMessage(
        dest,
        {
          text: "𝐌𝐄𝐍𝐔 𝐑𝐄𝐀𝐃𝐘!✅\n▰▰▰▰▰▰▰▰▰▰ 100%",
          edit: loadingMsg.key,
        },
        { quoted: ms }
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Send menu based on media type
      if (lien.match(/\.(mp4|gif)$/i)) {
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
      } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
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
      } else {
        await zk.sendMessage(
          dest,
          {
            text: infoMsg + menuMsg,
            mentions: mentionedJids,
          },
          { quoted: ms }
        );
      }

      // Send random audio as a voice note
      const audioFolder = __dirname + "/../xh_clinton/";
      console.log("Audio folder path:", audioFolder);

      // Check if folder exists
      if (!fs.existsSync(audioFolder)) {
        console.log("Audio folder does not exist:", audioFolder);
        repondre(`𝐀𝐮𝐝𝐢�{o 𝐟𝐨𝐥𝐝�{e𝐫 𝐧�{o𝐭 𝐟�{o𝐮�{n�{d: ${audioFolder}`);
        return;
      }

      // Get all MP3 files in the folder (e.g., help1.mp3 to help9.mp3)
      const audioFiles = fs.readdirSync(audioFolder).filter(f => f.endsWith(".mp3"));
      console.log("Available audio files:", audioFiles);

      if (audioFiles.length === 0) {
        console.log("No MP3 files found in folder");
        repondre(`�{N�{o 𝐚𝐮𝐝�{i�{o 𝐟�{i�{l�{e�{s 𝐟�{o𝐮�{n�{d �{i�{n �{x�{h_�{c�{l�{i�{n�{t�{o�{n �{f�{o�{l�{d�{e�{r`);
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
              fileName: `�{T�{O�{X�{I�{C �{V�{O�{I�{C�{E ✧`,
              caption: "✦⋆✗�{T�{O�{X�{I�{C",
            },
            { quoted: ms }
          );
          console.log("Audio sent successfully:", randomAudio);
          console.log("Audio message details:", audioMessage);
        } catch (audioError) {
          console.error("Error sending audio:", audioError);
          repondre(`�{E�{r�{r�{o�{r �{s�{e�{n�{d�{i�{n�{g �{v�{o�{i�{c�{e �{n�{o�{t�{e: ${audioError.message}`);
        }
      } else {
        console.log("Selected audio file not found at:", audioPath);
        repondre(`�{A�{u�{d�{i�{o �{f�{i�{l�{e �{n�{o�{t �{f�{o�{u�{n�{d: ${randomAudio}\n�{A�{v�{a�{i�{l�{a�{b�{l�{e �{f�{i�{l�{e�{s: ${audioFiles.join(", ")}`);
      }

    } catch (e) {
      console.error("◈ �{E�{R�{R�{O�{R ◈", e);
      await zk.sendMessage(
        dest,
        {
          text: "◈ �{F�{A�{I�{L�{E�{D �{T�{O �{L�{O�{A�{D �{M�{E�{N�{U ◈\n�{P�{l�{e�{a�{s�{e �{t�{r�{y �{a�{g�{a�{i�{n �{l�{a�{t�{e�{r",
          edit: loadingMsg.key,
        },
        { quoted: ms }
      );
    }
  }
);