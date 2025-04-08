const { zokou } = require("../framework/zokou");
const { format } = require("../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require("../set");

module.exports = {
    name: "repo",
    description: "Show Toxic-MD repository info",
    usage: ".repo",
    enable: true,

    zokou({ nomCom: "repo", categorie: "General", reaction: "❤️" }, async (dest, zk, commandeOptions) => {
        let { ms, repondre, mybotpic } = commandeOptions;
        var mode = "public";
        
        if ((s.MODE).toLocaleLowerCase() != "yes") {
            mode = "private";
        }

        moment.tz.setDefault('Etc/GMT');
        const temps = moment().format('HH:mm:ss');
        const date = moment().format('DD/MM/YYYY');

        let infoMsg = `
     *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐈𝐌𝐏𝐎𝐑𝐓𝐀𝐍𝐓 𝐈𝐍𝐅𝐎* 
❒───────────────────❒
*𝐆𝐈𝐓𝐇𝐔𝐁 𝐋𝐈𝐍𝐊*
> https://github.com/xhclinton/Toxic-MD

*𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐂𝐇𝐀𝐍𝐍𝐄𝐋*
> https://whatsapp.com/channel/0029Va9jJTJp2f3ELCm8FN50D
⁠
╭───────────────────❒
│❒⁠⁠⁠⁠ *𝐑𝐀𝐌* : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
│❒⁠⁠⁠⁠ *𝐃𝐄𝐕* : *𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*
│❒⁠⁠⁠⁠ *𝐁𝐎𝐓* : *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃*
⁠⁠⁠⁠╰───────────────────❒
`.trim();

        let menuMsg = `
     *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐌𝐄𝐍𝐓*
❒────────────────────❒`.trim();

        try {
            var lien = mybotpic();
            const mentionedJids = ['254735342808@s.whatsapp.net'];

            if (lien.match(/\.(mp4|gif)$/i)) {
                await zk.sendMessage(dest, { 
                    video: { url: lien }, 
                    caption: infoMsg + menuMsg, 
                    footer: "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 | 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭",
                    mentions: mentionedJids,
                    gifPlayback: true 
                }, { quoted: ms });
            } 
            else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                await zk.sendMessage(dest, { 
                    image: { url: lien }, 
                    caption: infoMsg + menuMsg,
                    footer: "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 | 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭",
                    mentions: mentionedJids
                }, { quoted: ms });
            } 
            else {
                await repondre(infoMsg + menuMsg, { mentions: mentionedJids });
            }

        } catch (e) {
            console.error("❌ 𝐑𝐄𝐏𝐎 𝐄𝐑𝐑𝐎𝐑:", e);
            await repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐫𝐞𝐩𝐨𝐬𝐢𝐭𝐨𝐫𝐲 𝐢𝐧𝐟𝐨");
        }
    })
};