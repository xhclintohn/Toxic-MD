const { zokou } = require('../framework/zokou');
const {addOrUpdateDataInAlive , getDataFromAlive} = require('../bdd/alive')
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

zokou(
    {
        nomCom: 'alive',
        categorie: 'General'
    }, async (dest, zk, commandeOptions) => {

        const {ms, arg, repondre, superUser} = commandeOptions;
        const data = await getDataFromAlive();

        if (!arg || !arg[0] || arg.join('') === '') {
            if (data) {
                const {message, lien} = data;
                var mode = "public";
                if ((s.MODE).toLocaleLowerCase() != "yes") {
                    mode = "private";
                }

                moment.tz.setDefault('Etc/GMT');
                const temps = moment().format('HH:mm:ss');
                const date = moment().format('DD/MM/YYYY');

                const alivemsg = `
╔══════════════════════════╗
  𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐁𝐨𝐭 𝐒𝐭𝐚𝐭𝐮𝐬
╚══════════════════════════╝

┣✦ 𝐎𝐰𝐧𝐞𝐫 : ${s.OWNER_NAME}
┣✦ 𝐌𝐨𝐝𝐞 : ${mode}
┣✦ 𝐃𝐚𝐭𝐞 : ${date}
┣✦ 𝐓𝐢𝐦𝐞 (GMT) : ${temps}

${message}

╔══════════════════════════╗
  𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭
╚══════════════════════════╝`;

                if (lien.match(/\.(mp4|gif)$/i)) {
                    try {
                        zk.sendMessage(dest, { video: { url: lien }, caption: alivemsg }, { quoted: ms });
                    }
                    catch (e) {
                        console.log("⚠️ 𝐌𝐞𝐧𝐮 𝐄𝐫𝐫𝐨𝐫 " + e);
                        repondre("⚠️ 𝐌𝐞𝐧𝐮 𝐄𝐫𝐫𝐨𝐫 " + e);
                    }
                } 
                else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                    try {
                        zk.sendMessage(dest, { image: { url: lien }, caption: alivemsg }, { quoted: ms });
                    }
                    catch (e) {
                        console.log("⚠️ 𝐌𝐞𝐧𝐮 𝐄𝐫𝐫𝐨𝐫 " + e);
                        repondre("⚠️ 𝐌𝐞𝐧𝐮 𝐄𝐫𝐫𝐨𝐫 " + e);
                    }
                } 
                else {
                    repondre(alivemsg);
                }
            } else {
                if (!superUser) { 
                    repondre("╔════════════════╗\n┃ 𝐓𝐨𝐱𝐢𝐜 𝐌𝐃 ┃\n┃ 𝐢𝐬 𝐀𝐥𝐢𝐯𝐞 ✅ ┃\n╚════════════════╝"); 
                    return;
                }
                repondre("╔════════════════╗\n┃ 𝐁𝐨𝐭 𝐈𝐧𝐟𝐨 ┃\n╚════════════════╝");
                repondre("┣✦ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐀𝐋𝐖𝐀𝐘𝐒 𝐀𝐋𝐈𝐕𝐄 🚀");
            }
        } else {
            if (!superUser) { 
                repondre("╔════════════════════╗\n┃ 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 ┃\n┃ 𝐃𝐞𝐧𝐢𝐞𝐝 ⚠️ ┃\n╚════════════════════╝\n𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐦𝐨𝐝𝐢𝐟𝐲 𝐭𝐡𝐞 𝐚𝐥𝐢𝐯𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞"); 
                return;
            }

            const texte = arg.join(' ').split(';')[0];
            const tlien = arg.join(' ').split(';')[1]; 

            await addOrUpdateDataInAlive(texte, tlien);
            repondre(`
╔══════════════════════════╗
  𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐁𝐨𝐭 𝐔𝐩𝐝𝐚𝐭𝐞
╚══════════════════════════╝

𝐓𝐨𝐱𝐢𝐜 𝐌𝐃 𝐁𝐨𝐭 𝐢𝐬 𝐚𝐥𝐢𝐯𝐞 𝐚𝐧𝐝 𝐫𝐞𝐚𝐝𝐲! 🚀
𝐉𝐮𝐬𝐭 𝐥𝐢𝐤𝐞 𝐲𝐨𝐮 𝐠𝐞𝐞! 😎`);
        }
    }
);