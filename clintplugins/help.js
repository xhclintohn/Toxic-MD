module.exports = {
    nomCom: "help",
    categorie: "General",
    async fonction(origineMessage, zk, commandeOptions) {
        const { repondre, ms } = commandeOptions;

        // Step 1: Get all unique categories from evt.cm
        const categories = [...new Set(global.evt.cm.map(cmd => cmd.categorie || "Uncategorized"))];

        // Step 2: Create a numbered list of categories
        let categoryList = "🌟 𝗛𝗲𝗹𝗽 𝗠𝗲𝗻𝘂 🌟\n\n" +
                          "𝗦𝗲𝗹𝗲𝗰𝘁 𝗮 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆 𝗯𝘆 𝗿𝗲𝗽𝗹𝘆𝗶𝗻𝗴 𝘄𝗶𝘁𝗵 𝗶𝘁𝘀 𝗻𝘂𝗺𝗯𝗲𝗿! 📜\n\n";
        const buttons = [];
        categories.forEach((cat, index) => {
            categoryList += `【${index + 1}】 ${cat}\n`;
            buttons.push({
                buttonId: `${index + 1}`,
                buttonText: { displayText: `${index + 1}` },
                type: 1
            });
        });
        categoryList += `\n📩 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗮 𝗻𝘂𝗺𝗯𝗲𝗿 𝘁𝗼 𝘀𝗲𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀!`;

        // Step 3: Send the category list with buttons
        await zk.sendMessage(origineMessage, {
            text: categoryList,
            buttons: buttons,
            headerType: 1
        }, { quoted: ms });

        // Step 4: Wait for the user's reply
        try {
            const reply = await zk.awaitForMessage({
                sender: ms.key.participant || ms.key.remoteJid,
                chatJid: origineMessage,
                timeout: 30000, // 30 seconds timeout
                filter: (msg) => {
                    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                    return text && /^\d+$/.test(text) && parseInt(text) > 0 && parseInt(text) <= categories.length;
                }
            });

            // Step 5: Get the selected category
            const selectedNumber = parseInt(reply.message?.conversation || reply.message?.extendedTextMessage?.text);
            const selectedCategory = categories[selectedNumber - 1];

            // Step 6: List commands in the selected category
            const commandsInCategory = global.evt.cm.filter(cmd => (cmd.categorie || "Uncategorized") === selectedCategory);
            let commandList = `📋 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗶𝗻 ${selectedCategory} 📋\n\n`;
            if (commandsInCategory.length === 0) {
                commandList += "𝗡𝗼 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗶𝘀 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆. 😔";
            } else {
                commandsInCategory.forEach(cmd => {
                    commandList += `➤ ${global.prefixe}${cmd.nomCom}\n`;
                });
                commandList += `\n💡 𝗧𝘆𝗽𝗲 ${global.prefixe}<𝗰𝗼𝗺𝗺𝗮𝗻𝗱> 𝘁𝗼 𝘂𝘀𝗲 𝗶𝘁!`;
            }

            // Step 7: Send the list of commands
            await zk.sendMessage(origineMessage, { text: commandList }, { quoted: reply });
        } catch (error) {
            // Handle timeout or invalid reply
            await zk.sendMessage(origineMessage, {
                text: "⏰ 𝗧𝗶𝗺𝗲’𝘀 𝘂𝗽! 𝗡𝗼 𝘃𝗮𝗹𝗶𝗱 𝗿𝗲𝗽𝗹𝘆 𝗿𝗲𝗰𝗲𝗶𝘃𝗲𝗱. 𝗧𝗿𝘆 ${global.prefixe}help 𝗮𝗴𝗮𝗶𝗻! 😊"
            }, { quoted: ms });
        }
    }
};