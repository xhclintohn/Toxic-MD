const { zokou } = require("../framework/zokou");
const { format } = require("../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");
const fs = require("fs");
const path = require("path");

zokou({ 
    nomCom: "bot", 
    categorie: "General", 
    reaction: "🤖" 
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, mybotpic } = commandeOptions;

    // Get system info
    moment.tz.setDefault('EAT');
    const temps = moment().format('HH:mm:ss');
    const mode = (s.MODE).toLowerCase() === "yes" ? "public" : "private";
    const ramUsage = `${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}`;

    // Create bot info message
    const botInfo = `
◈━━━━━━━━━━━━━━━━◈
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐
◈━━━━━━━━━━━━━━━━◈

> ✦ 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
> ✦ 𝐌𝐨𝐝𝐞: ${mode}
> ✦ 𝐓𝐢𝐦𝐞: ${temps} (EAT)
> ✦ 𝐑𝐀𝐌: ${ramUsage}

◈━━━━━━━━━━━━━━━━◈
✦ Type *.help* for commands
✦ Bot developed by @254735342808
◈━━━━━━━━━━━━━━━━◈
    `;

    try {
        // Send bot info with media if available
        const lien = mybotpic();
        const mentionedJids = ['254735342808@s.whatsapp.net'];

        if (lien.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(
                dest,
                { 
                    video: { url: lien },
                    caption: botInfo,
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
                    caption: botInfo,
                    mentions: mentionedJids
                },
                { quoted: ms }
            );
        } else {
            await repondre(botInfo);
        }

        // Send Royalty.m4a audio
        const audioPath = path.join(__dirname, '../media/Royalty.m4a');
        if (fs.existsSync(audioPath)) {
            await zk.sendMessage(
                dest,
                {
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4',
                    ptt: false,
                    fileName: "Toxic-MD Theme.m4a",
                    caption: "🎧 Toxic-MD Official Theme"
                },
                { quoted: ms }
            );
        } else {
            console.warn("Royalty.m4a not found in media folder");
        }

    } catch (e) {
        console.error("Bot Command Error:", e);
        await repondre("⚠️ Failed to load bot information");
    }
});