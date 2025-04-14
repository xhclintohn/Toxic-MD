const { zokou } = require("../framework/zokou");

zokou(
    { nomCom: "promote", categorie: "Group", reaction: "👨🏿‍💼" },
    async (dest, zk, commandeOptions) => {
        const { arg, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, verifZokouAdmin, ms } = commandeOptions;

        console.log(`[DEBUG] promote command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] promote: Not a group chat`);
            repondre("𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐨𝐧𝐥𝐲 𝐟�{o𝐫 𝐠𝐫�{o𝐮𝐩𝐬 🚫");
            return;
        }

        if (!verifAdmin && !superUser) {
            console.log(`[DEBUG] promote: User is not an admin or superuser`);
            repondre("𝐎𝐧𝐥𝐲 𝐚𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 🚫");
            return;
        }

        if (!verifZokouAdmin) {
            console.log(`[DEBUG] promote: Bot is not an admin`);
            repondre("𝐈 𝐧𝐞𝐞𝐝 𝐭𝐨 𝐛�{e 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧 𝐭𝐨 𝐩𝐞𝐫𝐟𝐨𝐫𝐦 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧 🚫");
            return;
        }

        let user;
        if (msgRepondu) {
            console.log(`[DEBUG] promote: User detected via replied message`);
            user = msgRepondu.sender;
        } else if (arg && arg[0].startsWith('@')) {
            console.log(`[DEBUG] promote: User detected via mention`);
            user = arg[0].replace('@', '') + '@s.whatsapp.net';
        } else {
            console.log(`[DEBUG] promote: No user specified`);
            repondre("𝐏𝐥𝐞𝐚𝐬�{e 𝐭𝐚𝐠 𝐨𝐫 𝐫𝐞𝐩𝐥�{y 𝐭𝐨 𝐭𝐡�{e 𝐦𝐞𝐦𝐛�{e𝐫 𝐭𝐨 𝐩𝐫𝐨𝐦�{o𝐭�{e 📝");
            return;
        }

        try {
            console.log(`[DEBUG] promote: Promoting user: ${user}`);
            await zk.groupParticipantsUpdate(dest, [user], "promote");
            await repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗠𝗲𝗺𝗯𝗲𝗿 𝗣𝗿𝗼𝗺𝗼𝘁𝗲𝗱 👨🏿‍💼
│❒ 𝗨𝘀𝗲𝗿: @${user.split("@")[0]}
◈━━━━━━━━━━━━━━━━◈`, { mentions: [user] });
            console.log(`[DEBUG] promote: User promoted successfully`);
        } catch (error) {
            console.log(`[DEBUG] promote: Error: ${error}`);
            repondre(`𝐄𝐫𝐫�{o𝐫: ${error.message}`);
        }
    }
);

zokou(
    { nomCom: "demote", categorie: "Group", reaction: "👨🏿‍💼" },
    async (dest, zk, commandeOptions) => {
        const { arg, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, verifZokouAdmin, ms } = commandeOptions;

        console.log(`[DEBUG] demote command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] demote: Not a group chat`);
            repondre("𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦�{a𝐧𝐝 𝐢𝐬 𝐨𝐧𝐥�{y 𝐟�{o𝐫 𝐠𝐫�{o𝐮𝐩𝐬 🚫");
            return;
        }

        if (!verifAdmin && !superUser) {
            console.log(`[DEBUG] demote: User is not an admin or superuser`);
            repondre("𝐎𝐧�{l�{y 𝐚𝐝�{m𝐢𝐧𝐬 𝐜�{a𝐧 𝐮𝐬�{e 𝐭𝐡�{i𝐬 𝐜�{o𝐦�{m�{a𝐧𝐝 🚫");
            return;
        }

        if (!verifZokouAdmin) {
            console.log(`[DEBUG] demote: Bot is not an admin`);
            repondre("𝐈 𝐧�{e�{e𝐝 𝐭�{o 𝐛�{e 𝐚𝐧 �{a𝐝�{m𝐢𝐧 𝐭�{o 𝐩�{e𝐫𝐟�{o𝐫�{m �{t�{h𝐢𝐬 �{a𝐜�{t𝐢�{o𝐧 🚫");
            return;
        }

        let user;
        if (msgRepondu) {
            console.log(`[DEBUG] demote: User detected via replied message`);
            user = msgRepondu.sender;
        } else if (arg && arg[0].startsWith('@')) {
            console.log(`[DEBUG] demote: User detected via mention`);
            user = arg[0].replace('@', '') + '@s.whatsapp.net';
        } else {
            console.log(`[DEBUG] demote: No user specified`);
            repondre("𝐏�{l�{e�{a�{s�{e �{t�{a�{g �{o�{r �{r�{e�{p�{l�{y �{t�{o �{t�{h�{e �{m�{e�{m�{b�{e�{r �{t�{o �{d�{e�{m�{o�{t�{e 📝");
            return;
        }

        try {
            console.log(`[DEBUG] demote: Demoting user: ${user}`);
            await zk.groupParticipantsUpdate(dest, [user], "demote");
            await repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗠𝗲𝗺𝗯𝗲𝗿 𝗗𝗲𝗺𝗼𝘁𝗲𝗱 👨🏿‍💼
│❒ 𝗨𝘀𝗲𝗿: @${user.split("@")[0]}
◈━━━━━━━━━━━━━━━━◈`, { mentions: [user] });
            console.log(`[DEBUG] demote: User demoted successfully`);
        } catch (error) {
            console.log(`[DEBUG] demote: Error: ${error}`);
            repondre(`�{E�{r�{r�{o�{r: ${error.message}`);
        }
    }
);