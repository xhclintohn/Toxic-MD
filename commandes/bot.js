const { zokou } = require("../framework/zokou");
const { format } = require("../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "bot",
    description: "Show Toxic-MD bot information", 
    usage: ".bot",
    enable: true,

    zokou({ nomCom: "bot", categorie: "General", reaction: "🤖" }, async (dest, zk, commandeOptions) => {
        let { ms, repondre, mybotpic } = commandeOptions;
        
        moment.tz.setDefault('EAT');
        const temps = moment().format('HH:mm:ss');
        const mode = (s.MODE.toLowerCase() === "yes") ? "public" : "private";

        let infoMsg = `
     *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎* 
❒───────────────────❒
*𝐕𝐄𝐑𝐒𝐈𝐎𝐍*
> 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐.𝟎

*𝐒𝐓𝐀𝐓𝐔𝐒*
> ${mode.toUpperCase()} 𝐌𝐎𝐃𝐄
⁠
╭───────────────────❒
│❒⁠⁠⁠⁠ *𝐑𝐀𝐌* : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
│❒⁠⁠⁠⁠ *𝐔𝐏𝐓𝐈𝐌𝐄* : ${temps} (EAT)
│❒⁠⁠⁠⁠ *𝐂𝐑𝐄𝐀𝐓𝐎𝐑* : *𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*
⁠⁠⁠⁠╰───────────────────❒
`.trim();

        try {
            // Send bot info
            var lien = mybotpic();
            const mentionedJids = ['254735342808@s.whatsapp.net'];

            if (lien.match(/\.(mp4|gif)$/i)) {
                await zk.sendMessage(dest, { 
                    video: { url: lien }, 
                    caption: infoMsg,
                    footer: "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 | 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭",
                    mentions: mentionedJids,
                    gifPlayback: true 
                }, { quoted: ms });
            } 
            else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                await zk.sendMessage(dest, { 
                    image: { url: lien }, 
                    caption: infoMsg,
                    footer: "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 | 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭",
                    mentions: mentionedJids
                }, { quoted: ms });
            } 
            else {
                await repondre(infoMsg, { mentions: mentionedJids });
            }

            // Send audio
            const audioPath = path.join(__dirname, '../../media/Royalty.m4a');
            if (fs.existsSync(audioPath)) {
                await zk.sendMessage(dest, {
                    audio: { url: audioPath },
                    mimetype: 'audio/mp4',
                    ptt: false,
                    fileName: "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐓𝐡𝐞𝐦𝐞.𝐦𝐩𝟑"
                }, { quoted: ms });
            }

        } catch (e) {
            console.error("❌ 𝐁𝐎𝐓 𝐄𝐑𝐑𝐎𝐑:", e);
            await repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐛𝐨𝐭 𝐢𝐧𝐟𝐨");
        }
    })
};