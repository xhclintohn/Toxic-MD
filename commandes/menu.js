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
        const { ms, repondre, prefixe, mybotpic } = commandeOptions;
        const { cm } = require(__dirname + "/../framework/zokou");

        try {
            // Enhanced loading animation
            const loadingStages = [
                "▰▱▱▱▱▱▱▱▱ 10%",
                "▰▰▱▱▱▱▱▱▱ 25%",
                "▰▰▰▰▱▱▱▱▱ 50%",
                "▰▰▰▰▰▰▱▱▱ 75%",
                "▰▰▰▰▰▰▰▰▱ 90%",
                "▰▰▰▰▰▰▰▰▰ 100%"
            ];

            let loadingMsg = await repondre("🔄 𝐏𝐫𝐞𝐩𝐚𝐫𝐢𝐧𝐠 𝐈𝐧𝐭𝐞𝐫𝐚𝐜𝐭𝐢𝐯𝐞 𝐌𝐞𝐧𝐮...\n" + loadingStages[0]);

            // Animate loading
            for (let i = 1; i < loadingStages.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 400));
                await zk.sendMessage(dest, {
                    text: "🔄 𝐏𝐫𝐞𝐩𝐚𝐫𝐢𝐧𝐠 𝐈𝐧𝐭𝐞𝐫𝐚𝐜𝐭𝐢𝐯𝐞 𝐌𝐞𝐧𝐮...\n" + loadingStages[i],
                    edit: loadingMsg.key
                });
            }

            // Prepare command categories
            let coms = {};
            cm.forEach((com) => {
                if (!coms[com.categorie]) coms[com.categorie] = [];
                coms[com.categorie].push(com.nomCom);
            });

            // System info with fancy font
            moment.tz.setDefault('EAT');
            const systemInfo = `
╔════◇ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍* ◇════╗
│
│ 🖥️ *𝐁𝐨𝐭 𝐍𝐚𝐦𝐞:* 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐕𝟐
│ ⏳ *𝐔𝐩𝐭𝐢𝐦𝐞:* ${moment.duration(process.uptime(), 'seconds').humanize()}
│ 🕒 *𝐓𝐢𝐦𝐞:* ${moment().format('HH:mm:ss')} (EAT)
│ 💾 *𝐌𝐞𝐦𝐨𝐫𝐲:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
│
╚══════════════════════════════╝
`;

            // Create graphical menu
            let menuMsg = `
╔════◇ *𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔* ◇════╗
│
│ 📜 *𝐔𝐬𝐚𝐠𝐞:* ${prefixe}𝐡𝐞𝐥𝐩 <𝐜𝐨𝐦𝐦𝐚𝐧𝐝>
│ 🔍 *𝐅𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐞𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐧𝐟𝐨*
│
╠════◇ *𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄𝐒* ◇════╣
`;

            // Enhanced category display
            const categoryIcons = {
                "General": "📌",
                "Group": "👥",
                "Mods": "🛡️",
                "Fun": "🎮",
                "Search": "🔎",
                "Media": "🎬",
                "Tools": "🛠️"
            };

            for (const [category, commands] of Object.entries(coms)) {
                const icon = categoryIcons[category] || "✨";
                menuMsg += `\n│ ${icon} *${category.toUpperCase()}* ${icon}\n│\n`;
                
                // Display commands in a grid layout
                const cols = 3;
                for (let i = 0; i < commands.length; i += cols) {
                    const row = commands.slice(i, i + cols);
                    menuMsg += `│ ${row.map(cmd => `• ${cmd}`).join('  ')}\n`;
                }
            }

            // Footer with credits
            menuMsg += `
╠════◇ *𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑𝐒* ◇════╣
│
│ 👨‍💻 *𝐂𝐫𝐞𝐚𝐭𝐨𝐫:* @254735342808
│ 🤖 *𝐌𝐚𝐢𝐧𝐭𝐚𝐢𝐧𝐞𝐫:* @254799283147
│
╚════◇ *𝐄𝐍𝐉𝐎𝐘!* ◇════╝
`;

            // Remove loading message
            await zk.sendMessage(dest, { text: "", edit: loadingMsg.key });

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
            await repondre("❌ 𝐄𝐫𝐫𝐨𝐫: 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐢𝐬𝐩𝐥𝐚𝐲 𝐦𝐞𝐧𝐮. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.");
        }
    }
};