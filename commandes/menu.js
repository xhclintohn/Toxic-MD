const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");

module.exports = {
    name: "menu",
    alias: ["help", "cmd", "commands"],
    description: "Display all available commands",
    category: "General",
    reaction: "📜",

    async execute(dest, zk, commandeOptions) {
        const { ms, repondre, prefixe } = commandeOptions;
        const { cm } = require(__dirname + "/../framework/zokou");

        try {
            // Create loading bar animation
            const loadingBar = async () => {
                const stages = [
                    "▱▱▱▱▱▱▱▱▱▱ 0%",
                    "▰▱▱▱▱▱▱▱▱▱ 10%",
                    "▰▰▱▱▱▱▱▱▱▱ 20%",
                    "▰▰▰▱▱▱▱▱▱▱ 30%", 
                    "▰▰▰▰▱▱▱▱▱▱ 40%",
                    "▰▰▰▰▰▱▱▱▱▱ 50%",
                    "▰▰▰▰▰▰▱▱▱▱ 60%",
                    "▰▰▰▰▰▰▰▱▱▱ 70%",
                    "▰▰▰▰▰▰▰▰▱▱ 80%",
                    "▰▰▰▰▰▰▰▰▰▱ 90%",
                    "▰▰▰▰▰▰▰▰▰▰ 100%"
                ];

                const loadingMsg = await repondre("🔄 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐌𝐞𝐧𝐮...\n" + stages[0]);

                for (let i = 1; i < stages.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    await zk.sendMessage(dest, {
                        text: "🔄 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐌𝐞𝐧𝐮...\n" + stages[i],
                        edit: loadingMsg.key
                    });
                }

                return loadingMsg;
            };

            const loadingMsg = await loadingBar();

            // Prepare menu content
            let coms = {};
            cm.forEach((com) => {
                if (!coms[com.categorie]) coms[com.categorie] = [];
                coms[com.categorie].push(com.nomCom);
            });

            // System info
            moment.tz.setDefault('EAT');
            const systemInfo = `
╔════◇ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎* ◇════╗
│
│ 🖥️ *𝐁𝐨𝐭 𝐍𝐚𝐦𝐞:* 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐
│ ⏰ *𝐓𝐢𝐦𝐞:* ${moment().format('HH:mm:ss')} (EAT)
│ 💾 *𝐌𝐞𝐦𝐨𝐫𝐲:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
│
╚══════════════════════════╝
`;

            // Create menu
            let menuMsg = `
╔════◇ *𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔* ◇════╗
│
│ 📜 *𝐔𝐬𝐚𝐠𝐞:* ${prefixe}𝐡𝐞𝐥𝐩 <𝐜𝐨𝐦𝐦𝐚𝐧𝐝>
│ 🔍 *𝐅𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐞𝐝 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧*
│
╠════◇ *𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄𝐒* ◇════╣
`;

            // Add categories
            const categoryIcons = {
                "General": "📌",
                "Group": "👥",
                "Mods": "🛡️",
                "Fun": "🎮",
                "Search": "🔎"
            };

            for (const [category, commands] of Object.entries(coms)) {
                const icon = categoryIcons[category] || "✨";
                menuMsg += `\n│ ${icon} *${category.toUpperCase()}* ${icon}\n│\n`;
                menuMsg += `│ ${commands.map(cmd => `• ${cmd}`).join('\n│ ')}\n`;
            }

            // Footer
            menuMsg += `
╠════◇ *𝐂𝐑𝐄𝐃𝐈𝐓𝐒* ◇════╣
│
│ 👨‍💻 *𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫:* @254735342808
│ 🤖 *𝐌𝐚𝐢𝐧𝐭𝐚𝐢𝐧𝐞𝐫:* @254799283147
│
╚════◇ *𝐌𝐄𝐍𝐔 𝐑𝐄𝐀𝐃𝐘!* ◇════╝
`;

            // Send final menu
            await zk.sendMessage(
                dest,
                {
                    text: systemInfo + menuMsg,
                    mentions: [
                        '254735342808@s.whatsapp.net',
                        '254799283147@s.whatsapp.net'
                    ]
                },
                { quoted: ms }
            );

        } catch (error) {
            console.error("Menu Error:", error);
            await repondre("❌ 𝐄𝐫𝐫𝐨𝐫: 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐦𝐞𝐧𝐮. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.");
        }
    }
};