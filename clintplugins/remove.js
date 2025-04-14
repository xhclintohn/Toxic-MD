const { zokou } = require("../framework/zokou");

zokou(
    { nomCom: "remove", categorie: "Group", reaction: "👨🏿‍💼" },
    async (dest, zk, commandeOptions) => {
        const { repondre, verifGroupe, msgRepondu, verifAdmin, superUser, verifZokouAdmin } = commandeOptions;

        console.log(`[DEBUG] remove command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] remove: Not a group chat`);
            repondre("𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐨𝐧𝐥𝐲 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 🚫");
            return;
        }

        if (!verifAdmin && !superUser) {
            console.log(`[DEBUG] remove: User is not an admin or superuser`);
            repondre("𝐎𝐧𝐥𝐲 𝐚𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦�{m𝐚𝐧𝐝 🚫");
            return;
        }

        if (!verifZokouAdmin) {
            console.log(`[DEBUG] remove: Bot is not an admin`);
            repondre("𝐈 𝐧𝐞𝐞𝐝 𝐭𝐨 𝐛𝐞 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧 𝐭𝐨 𝐩𝐞𝐫𝐟𝐨𝐫𝐦 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧 🚫");
            return;
        }

        if (!msgRepondu) {
            console.log(`[DEBUG] remove: No replied message`);
            repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐭𝐡𝐞 𝐦𝐞𝐦𝐛𝐞𝐫 𝐭𝐨 𝐫𝐞𝐦𝐨𝐯𝐞 𝐛�{y 𝐫𝐞𝐩𝐥𝐲𝐢𝐧𝐠 𝐭𝐨 𝐭𝐡𝐞𝐢𝐫 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 📝");
            return;
        }

        let user = msgRepondu.sender;

        try {
            console.log(`[DEBUG] remove: Removing user: ${user}`);
            await zk.groupParticipantsUpdate(dest, [user], "remove");
            await repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗠𝗲𝗺𝗯𝗲𝗿 𝗥𝗲𝗺𝗼𝘃𝗲𝗱 👨🏿‍💼
│❒ 𝗨𝘀𝗲𝗿: @${user.split("@")[0]}
◈━━━━━━━━━━━━━━━━◈`, { mentions: [user] });
            console.log(`[DEBUG] remove: User removed successfully`);
        } catch (error) {
            console.log(`[DEBUG] remove: Error: ${error}`);
            repondre(`𝐄𝐫𝐫𝐨𝐫: ${error.message}`);
        }
    }
);