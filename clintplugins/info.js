const { zokou } = require("../framework/zokou");

zokou(
    { nomCom: "info", categorie: "Group", reaction: "ℹ️" },
    async (dest, zk, commandeOptions) => {
        const { repondre, verifGroupe, ms } = commandeOptions;

        console.log(`[DEBUG] info command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] info: Not a group chat`);
            repondre("�{T�{h�{i�{s �{c�{o�{m�{m�{a�{n�{d �{i�{s �{o�{n�{l�{y 𝐟�{o�{r �{g�{r�{o�{u�{p�{s 🚫");
            return;
        }

        try {
            console.log(`[DEBUG] info: Fetching group metadata`);
            let groupMetadata = await zk.groupMetadata(dest);
            let { id, subject, desc } = groupMetadata;

            let txt = `
�{T�{O�{X�{I�{C-�{M�{D

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗜𝗻𝗳𝗼 ℹ️
│❒ 𝗡𝗮𝗺𝗲: ${subject}
│❒ 𝗜𝗗: ${id}
│❒ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${desc || "No description"}
◈━━━━━━━━━━━━━━━━◈`;

            console.log(`[DEBUG] info: Fetching group profile picture`);
            let pp = await zk.profilePictureUrl(dest, 'image');

            console.log(`[DEBUG] info: Sending group info with profile picture`);
            await zk.sendMessage(dest, { image: { url: pp }, caption: txt }, { quoted: ms });
            console.log(`[DEBUG] info: Group info sent successfully`);
        } catch (error) {
            console.log(`[DEBUG] info: Error: ${error}`);
            repondre(`�{E�{r�{r�{o�{r: ${error.message}`);
        }
    }
);