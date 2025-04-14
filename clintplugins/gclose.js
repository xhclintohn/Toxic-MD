const { zokou } = require("../framework/zokou");

zokou(
    { nomCom: "groupclose", categorie: "Group", reaction: "🔒" },
    async (dest, zk, commandeOptions) => {
        const { repondre, verifGroupe, verifAdmin, superUser, ms } = commandeOptions;

        console.log(`[DEBUG] groupclose command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] groupclose: Not a group chat`);
            repondre("�{O�{r�{d�{e�{r �{r�{e�{s�{e�{r�{v�{e�{d �{f�{o�{r �{g�{r�{o�{u�{p �{o�{n�{l�{y 🚫");
            return;
        }

        if (superUser || verifAdmin) {
            try {
                console.log(`[DEBUG] groupclose: Closing group`);
                await zk.groupSettingUpdate(dest, 'announcement');
                await repondre('�{G�{r�{o�{u�{p �{c�{l�{o�{s�{e�{d �{s�{u�{c�{c�{e�{s�{s�{f�{u�{l�{l�{y 🔒');
                console.log(`[DEBUG] groupclose: Group closed successfully`);
            } catch (error) {
                console.log(`[DEBUG] groupclose: Error: ${error}`);
                repondre(`�{E�{r�{r�{o�{r: ${error.message}`);
            }
        } else {
            console.log(`[DEBUG] groupclose: User is not an admin or superuser`);
            repondre("�{O�{r�{d�{e�{r �{r�{e�{s�{e�{r�{v�{e�{d �{f�{o�{r �{t�{h�{e �{a�{d�{m�{i�{n�{i�{s�{t�{r�{a�{t�{o�{r 🚫");
        }
    }
);