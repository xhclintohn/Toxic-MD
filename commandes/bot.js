const { zokou } = require("../framework/zokou");
const { format } = require("../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "bot",
    description: "Displays bot information",
    usage: ".bot",
    enable: true,

    zokou({ 
        nomCom: "bot", 
        categorie: "General", 
        reaction: "🤖" 
    }, async (dest, zk, commandeOptions) => {
        const { repondre, ms, mybotpic } = commandeOptions;

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
            // Send bot info
            await repondre(botInfo);

            // Send Royalty.m4a audio
            const audioPath = path.join(__dirname, '../../media/Royalty.m4a');
            if (fs.existsSync(audioPath)) {
                await zk.sendMessage(
                    dest,
                    {
                        audio: { url: audioPath },
                        mimetype: 'audio/mp4',
                        ptt: false,
                        fileName: "Toxic-MD Theme.m4a"
                    },
                    { quoted: ms }
                );
            } else {
                console.warn("Audio file not found at path:", audioPath);
            }

        } catch (e) {
            console.error("Bot Command Error:", e);
            await repondre("⚠️ Failed to load bot information");
        }
    })
};