const { zokou } = require('../framework/zokou');
const { addOrUpdateDataInAlive, getDataFromAlive } = require('../bdd/alive');
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

zokou(
    {
        nomCom: 'alive',
        categorie: 'General',
        reaction: "⚡"
    },
    async (dest, zk, { ms, arg, repondre, superUser }) => {
        const data = await getDataFromAlive();

        if (!arg || !arg[0]) {
            if (data) {
                const { message, lien } = data;
                const mode = (s.MODE.toLowerCase() === "yes") ? "public" : "private";
                const time = moment().tz('Etc/GMT').format('HH:mm:ss');
                const date = moment().format('DD/MM/YYYY');

                const aliveMsg = `
╔═════◇◆◆◇═════╗
   *🔥 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐢𝐬 𝐀𝐋𝐈𝐕𝐄 🔥*  
╚═════◇◆◆◇═════╝

*👑 𝐎𝐰𝐧𝐞𝐫* : ${s.OWNER_NAME}
*🌐 𝐌𝐨𝐝𝐞* : ${mode}
*📅 𝐃𝐚𝐭𝐞* : ${date}
*⏰ 𝐓𝐢𝐦𝐞 (GMT)* : ${time}

${message || "𝐔𝐬𝐞 *𝐚𝐥𝐢𝐯𝐞 [𝐦𝐞𝐬𝐬𝐚𝐠𝐞];[𝐥𝐢𝐧𝐤]* 𝐭𝐨 𝐜𝐮𝐬𝐭𝐨𝐦𝐢𝐳𝐞."}

*🤖 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*`;

                try {
                    if (lien) {
                        if (lien.match(/\.(mp4|gif)$/i)) {
                            await zk.sendMessage(dest, { 
                                video: { url: lien }, 
                                caption: aliveMsg 
                            }, { quoted: ms });
                        } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                            await zk.sendMessage(dest, { 
                                image: { url: lien }, 
                                caption: aliveMsg 
                            }, { quoted: ms });
                        } else {
                            repondre(aliveMsg);
                        }
                    } else {
                        repondre(aliveMsg);
                    }
                } catch (e) {
                    console.error("Error:", e);
                    repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐬𝐞𝐧𝐝 𝐚𝐥𝐢𝐯𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞.");
                }
            } else {
                if (!superUser) { 
                    repondre("🚀 *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃* 𝐢𝐬 𝐫𝐮𝐧𝐧𝐢𝐧𝐠 𝐬𝐦𝐨𝐨𝐭𝐡𝐥𝐲!"); 
                    return;
                }
                repondre("⚡ 𝐔𝐬𝐞: *𝐚𝐥𝐢𝐯𝐞 [𝐦𝐞𝐬𝐬𝐚𝐠𝐞];[𝐦𝐞𝐝𝐢𝐚 𝐥𝐢𝐧𝐤]* 𝐭𝐨 𝐬𝐞𝐭 𝐮𝐩.");
            }
        } else {
            if (!superUser) { 
                repondre("🛑 *𝐎𝐧𝐥𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 𝐜𝐚𝐧 𝐦𝐨𝐝𝐢𝐟𝐲 𝐭𝐡𝐢𝐬!*"); 
                return;
            }

            const [texte, tlien] = arg.join(' ').split(';');
            await addOrUpdateDataInAlive(texte, tlien);
            repondre('✅ *𝐀𝐥𝐢𝐯𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐮𝐩𝐝𝐚𝐭𝐞𝐝!*');
        }
    }
);