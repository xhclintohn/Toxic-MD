const { zokou } = require("../framework/zokou");

zokou(
    { nomCom: "groupopen", categorie: "Group", reaction: "🔒" },
    async (dest, zk, commandeOptions) => {
        const { repondre, verifGroupe, verifAdmin, superUser, ms } = commandeOptions;

        console.log(`[DEBUG] groupopen command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] groupopen: Not a group chat`);
            repondre("�{O�{r�{d�{e�{r �{r�{e�{s�{e�{r�{v�{e�{d �{f�{o�{r �{g�{r�{o�{u�{p �{o�{n�{l�{y 🚫");
            return;
        }

        if (superUser || verifAdmin) {
            try {
                console.log(`[DEBUG] groupopen: Opening group`);
                await zk.groupSettingUpdate(dest, 'not_announcement');
                await repondre("�{G�{r�{o�{u�{p �{o�{p�{e�{n�{e�{d �{s�{u�{c�{c�{e�{s�{s�{f�{u�{l�{l�{y ✅");
                console.log(`[DEBUG] groupopen: Group opened successfully`);
            } catch (error) {
                console.log(`[DEBUG] groupopen: Error: ${error}`);
                repondre(`�{E�{r�{r�{o�{r: ${error.message}`);
            }
        } else {
            console.log(`[DEBUG] groupopen: User is not an admin or superuser`);
            repondre("�{O�{r�{d�{e�{r �{r�{e�{s�{e�{r�{v�{e�{d �{f�{o�{r �{t�{h�{e �{a�{d�{m�{i�{n�{i�{s�{t�{r�{a�{t�{o�{r 🚫");
        }
    }
);