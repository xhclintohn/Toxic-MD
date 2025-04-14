const { zokou } = require("../framework/zokou");

zokou(
    { nomCom: "link", categorie: "Group", reaction: "🙋" },
    async (dest, zk, commandeOptions) => {
        const { repondre, verifGroupe, verifAdmin, superUser, ms } = commandeOptions;

        console.log(`[DEBUG] link command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] link: Not a group chat`);
            repondre("�{F�{o�{r �{g�{r�{o�{u�{p�{s �{o�{n�{l�{y 🚫");
            return;
        }

        if (!verifAdmin && !superUser) {
            console.log(`[DEBUG] link: User is not an admin or superuser`);
            repondre("�{T�{h�{i�{s �{c�{o�{m�{m�{a𝐧�{d �{i�{s �{r�{e�{s�{e�{r�{v�{e�{d �{f�{o�{r �{g�{r�{o�{u�{p �{a�{d�{m�{i�{n�{s 🚫");
            return;
        }

        try {
            console.log(`[DEBUG] link: Generating group invite link`);
            const link = await zk.groupInviteCode(dest);
            const groupLink = `https://chat.whatsapp.com/${link}`;
            await repondre(`
�{T�{O�{X�{I�{C-�{M�{D

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗜𝗻𝘃𝗶𝘁𝗲 𝗟𝗶𝗻𝗸 🙋
│❒ 𝗟𝗶𝗻𝗸: ${groupLink}
◈━━━━━━━━━━━━━━━━◈`);
            console.log(`[DEBUG] link: Group invite link sent successfully`);
        } catch (error) {
            console.log(`[DEBUG] link: Error: ${error}`);
            repondre(`�{E�{r�{r�{o�{r: ${error.message}`);
        }
    }
);