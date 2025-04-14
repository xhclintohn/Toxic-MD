const { zokou } = require("../framework/zokou");

zokou(
    { nomCom: "hidetag", categorie: "Group", reaction: "🎤" },
    async (dest, zk, commandeOptions) => {
        const { repondre, msgRepondu, verifGroupe, arg, verifAdmin, superUser, ms } = commandeOptions;

        console.log(`[DEBUG] hidetag command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] hidetag: Not a group chat`);
            repondre('�{T�{h�{i�{s �{c�{o�{m�{m�{a𝐧�{d �{i�{s �{o�{n�{l�{y �{a�{l�{l�{o�{w�{e�{d �{i�{n �{g�{r�{o�{u�{p�{s 🚫');
            return;
        }

        if (verifAdmin || superUser) {
            let metadata = await zk.groupMetadata(dest);
            console.log(`[DEBUG] hidetag: Group members count: ${metadata.participants.length}`);

            let tag = [];
            for (const participant of metadata.participants) {
                tag.push(participant.id);
            }

            if (msgRepondu) {
                console.log(`[DEBUG] hidetag: Replied message detected`);
                let msg;

                if (msgRepondu.imageMessage) {
                    console.log(`[DEBUG] hidetag: Image message detected, downloading`);
                    let media = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
                    msg = {
                        image: { url: media },
                        caption: msgRepondu.imageMessage.caption,
                        mentions: tag
                    };
                } else if (msgRepondu.videoMessage) {
                    console.log(`[DEBUG] hidetag: Video message detected, downloading`);
                    let media = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
                    msg = {
                        video: { url: media },
                        caption: msgRepondu.videoMessage.caption,
                        mentions: tag
                    };
                } else if (msgRepondu.audioMessage) {
                    console.log(`[DEBUG] hidetag: Audio message detected, downloading`);
                    let media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
                    msg = {
                        audio: { url: media },
                        mimetype: 'audio/mp4',
                        mentions: tag
                    };
                } else {
                    console.log(`[DEBUG] hidetag: Text message detected`);
                    msg = {
                        text: msgRepondu.conversation,
                        mentions: tag
                    };
                }

                console.log(`[DEBUG] hidetag: Sending message with mentions`);
                await zk.sendMessage(dest, msg);
                console.log(`[DEBUG] hidetag: Message sent successfully`);
            } else {
                if (!arg || !arg[0]) {
                    console.log(`[DEBUG] hidetag: No arguments provided`);
                    repondre('�{E�{n�{t�{e�{r �{t�{h�{e �{t�{e�{x�{t �{t�{o �{a�{n�{n�{o�{u�{n�{c�{e �{o�{r �{m�{e�{n�{t�{i�{o�{n �{t�{h�{e �{m�{e�{s�{s�{a�{g�{e �{t�{o �{a�{n�{n�{o�{u�{n�{c�{e 📝');
                    return;
                }

                console.log(`[DEBUG] hidetag: Sending text message with mentions`);
                await zk.sendMessage(dest, { text: arg.join(' '), mentions: tag });
                console.log(`[DEBUG] hidetag: Text message sent successfully`);
            }
        } else {
            console.log(`[DEBUG] hidetag: User is not an admin or superuser`);
            repondre('�{C�{o�{m�{m�{a�{n�{d �{r�{e�{s�{e�{r�{v�{e�{d �{f�{o�{r �{a�{d�{m�{i�{n�{i�{s�{t�{r�{a�{t�{o�{r�{s 🚫');
        }
    }
);