const { zokou } = require("../framework/zokou");

zokou(
    { nomCom: "antilink", categorie: "Group", reaction: "🔗" },
    async (dest, zk, commandeOptions) => {
        var { repondre, arg, verifGroupe, superUser, verifAdmin, ms } = commandeOptions;

        console.log(`[DEBUG] antilink command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] antilink: Not a group chat`);
            repondre("�{F�{o�{r �{g�{r�{o�{u�{p�{s �{o�{n�{l�{y 🚫");
            return;
        }

        if (superUser || verifAdmin) {
            const enetatoui = await atbverifierEtatJid(dest);
            console.log(`[DEBUG] antilink: Current state: ${enetatoui}`);

            try {
                if (!arg || !arg[0] || arg === ' ') {
                    console.log(`[DEBUG] antilink: No arguments provided`);
                    repondre(`
�{T�{O�{X�{I�{C-�{M�{D

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗢𝗽𝘁𝗶𝗼𝗻𝘀 🔗
│❒ antilink on - 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink off - 𝗗𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink action/remove - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝘀𝗲𝗻𝗱𝗲𝗿 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗻𝗼𝘁𝗶𝗰𝗲
│❒ antilink action/warn - 𝗚𝗶𝘃𝗲 𝘄𝗮𝗿𝗻𝗶𝗻𝗴𝘀
│❒ antilink action/delete - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝘀𝗮𝗻𝗰𝘁𝗶𝗼𝗻𝘀
◈━━━━━━━━━━━━━━━━◈

�{N�{o�{t�{e: 𝗕𝘆 𝗱𝗲𝗳𝗮𝘂𝗹𝘁, 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲 𝗶𝘀 𝘀𝗲𝘁 𝘁𝗼 𝗱𝗲𝗹𝗲𝘁𝗲.`);
                    return;
                }

                if (arg[0] === 'on') {
                    if (enetatoui) {
                        console.log(`[DEBUG] antilink: Already activated`);
                        repondre("�{T�{h�{e �{a�{n�{t�{i�{l�{i�{n�{k �{i�{s �{a�{l�{r�{e�{a�{d�{y �{a�{c�{t�{i�{v�{a�{t�{e�{d �{f�{o�{r �{t�{h�{i�{s �{g�{r�{o�{u�{p ✅");
                    } else {
                        console.log(`[DEBUG] antilink: Activating`);
                        await atbajouterOuMettreAJourJid(dest, "oui");
                        repondre("�{T�{h�{e �{a�{n�{t�{i�{l�{i�{n�{k �{i�{s �{s�{u�{c�{c�{e�{s�{s�{f�{u�{l�{l�{y �{a�{c�{t�{i�{v�{a�{t�{e�{d ✅");
                    }
                } else if (arg[0] === "off") {
                    if (enetatoui) {
                        console.log(`[DEBUG] antilink: Deactivating`);
                        await atbajouterOuMettreAJourJid(dest, "non");
                        repondre("�{T�{h�{e �{a�{n�{t�{i�{l�{i�{n�{k �{h�{a�{s �{b�{e�{e�{n �{s�{u�{c�{c�{e�{s�{s�{f�{u�{l�{l�{y �{d�{e�{a�{c�{t�{i�{v�{a�{t�{e�{d 🚫");
                    } else {
                        console.log(`[DEBUG] antilink: Not activated`);
                        repondre("�{A�{n�{t�{i�{l�{i�{n�{k �{i�{s �{n�{o�{t �{a�{c�{t�{i�{v�{a�{t�{e�{d �{f�{o�{r �{t�{h�{i�{s �{g�{r�{o�{u�{p 🚫");
                    }
                } else if (arg.join('').split("/")[0] === 'action') {
                    let action = (arg.join('').split("/")[1]).toLowerCase();
                    console.log(`[DEBUG] antilink: Action requested: ${action}`);

                    if (action == 'remove' || action == 'warn' || action == 'delete') {
                        console.log(`[DEBUG] antilink: Updating action to ${action}`);
                        await mettreAJourAction(dest, action);
                        repondre(`�{T�{h�{e �{a�{n�{t�{i-�{l�{i�{n�{k �{a�{c�{t�{i�{o�{n �{h�{a�{s �{b�{e�{e�{n �{u�{p�{d�{a�{t�{e�{d �{t�{o ${arg.join('').split("/")[1]} ✅`);
                    } else {
                        console.log(`[DEBUG] antilink: Invalid action`);
                        repondre("�{T�{h�{e �{o�{n�{l�{y �{a�{c�{t�{i�{o�{n�{s �{a�{v�{a�{i�{l�{a�{b�{l�{e �{a�{r�{e �{w�{a�{r�{n, �{r�{e�{m�{o�{v�{e, �{a�{n�{d �{d�{e�{l�{e�{t�{e 🚫");
                    }
                } else {
                    console.log(`[DEBUG] antilink: Invalid argument`);
                    repondre(`
�{T�{O�{X�{I�{C-�{M�{D

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗢𝗽𝘁𝗶𝗼𝗻𝘀 🔗
│❒ antilink on - 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink off - 𝗗𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink action/remove - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝘀𝗲𝗻𝗱𝗲𝗿 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗻𝗼𝘁𝗶𝗰𝗲
│❒ antilink action/warn - 𝗚𝗶𝘃𝗲 𝘄𝗮𝗿𝗻𝗶𝗻𝗴𝘀
│❒ antilink action/delete - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝘀𝗮𝗻𝗰𝘁𝗶𝗼𝗻𝘀
◈━━━━━━━━━━━━━━━━◈

�{N�{o�{t�{e: 𝗕𝘆 𝗱𝗲𝗳𝗮𝘂𝗹𝘁, 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂