const { zokou } = require("../framework/zokou");

zokou(
    { nomCom: "tagall", categorie: "Group", reaction: "📣" },
    async (dest, zk, commandeOptions) => {
        const { arg, ms, repondre, verifGroupe, verifAdmin, superUser } = commandeOptions;

        console.log(`[DEBUG] tagall command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] tagall: Not a group chat`);
            repondre("𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐨𝐧𝐥𝐲 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 🚫");
            return;
        }

        if (!verifAdmin && !superUser) {
            console.log(`[DEBUG] tagall: User is not an admin or superuser`);
            repondre("𝐎𝐧𝐥𝐲 𝐚𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 🚫");
            return;
        }

        try {
            console.log(`[DEBUG] tagall: Fetching group metadata`);
            let metadata = await zk.groupMetadata(dest);
            let participants = metadata.participants;
            let mess = arg.join(" ") || "✨ *Hey everyone!* ✨";
            let emojiList = ["👋", "✨", "🌟", "🔥", "💥", "🎉"];
            let randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            let finalMessage = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗧𝗮𝗴 𝗔𝗹𝗹 📣
│❒ 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: ${mess}
◈━━━━━━━━━━━━━━━━◈
`;

            let tagged = [];
            for (let participant of participants) {
                tagged.push(participant.id);
                finalMessage += `${randomEmoji} @${participant.id.split("@")[0]}\n`;
            }

            console.log(`[DEBUG] tagall: Sending message with tagged members`);
            await zk.sendMessage(dest, { text: finalMessage, mentions: tagged }, { quoted: ms });
            console.log(`[DEBUG] tagall: Message sent successfully`);
        } catch (error) {
            console.log(`[DEBUG] tagall: Error: ${error}`);
            repondre(`𝐄𝐫𝐫𝐨𝐫: ${error.message}`);
        }
    }
);