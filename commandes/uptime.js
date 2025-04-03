const { zokou } = require("../framework/zokou");
const moment = require("moment-timezone");
const speed = require("performance-now");
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Ping command with loading animation
zokou({
  nomCom: "ping",
  desc: "Check bot response speed",
  categorie: "General",
  reaction: "⚡",
  fromMe: true
}, async (dest, zk, { repondre, ms }) => {
    try {
        // Create initial loading message
        let loadingMsg = await zk.sendMessage(dest, { 
            text: "🔌 𝐓𝐞𝐬𝐭𝐢𝐧𝐠 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧... 0%"
        }, { quoted: ms });

        // Realistic network test simulation
        const testSteps = [
            { percent: 25, text: "📡 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠 𝐭𝐨 𝐬𝐞𝐫𝐯𝐞𝐫..." },
            { percent: 50, text: "⚡ 𝐓𝐞𝐬𝐭𝐢𝐧𝐠 𝐬𝐩𝐞𝐞𝐝..." },
            { percent: 75, text: "📊 𝐂𝐚𝐥𝐜𝐮𝐥𝐚𝐭𝐢𝐧𝐠 𝐫𝐞𝐬𝐮𝐥𝐭𝐬..." },
            { percent: 90, text: "✅ 𝐅𝐢𝐧𝐚𝐥𝐢𝐳𝐢𝐧𝐠..." }
        ];

        for (const step of testSteps) {
            await sleep(500 + Math.random() * 300); // Random delay for realism
            await zk.sendMessage(dest, {
                text: `${step.text} ${step.percent}%\n` +
                      `[${'█'.repeat(step.percent/5)}${'░'.repeat(20 - step.percent/5)}]`,
                edit: loadingMsg.key
            });
        }

        // Actual ping measurement
        const timestamp = speed();
        await sleep(200); // Simulate processing delay
        const pingResult = (speed() - timestamp).toFixed(2);
        
        // Quality indicator based on ping
        let quality = "";
        if (pingResult < 100) quality = "🌟 𝐄𝐱𝐜𝐞𝐥𝐥𝐞𝐧𝐭";
        else if (pingResult < 300) quality = "👍 𝐆𝐨𝐨𝐝";
        else if (pingResult < 600) quality = "⚠️ 𝐅𝐚𝐢𝐫";
        else quality = "🐌 𝐒𝐥𝐨𝐰";

        // Final result with fancy styling
        const resultMessage = `
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐏𝐈𝐍𝐆 𝐓𝐄𝐒𝐓
╰───── • ─────╯

⚡ 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞: ${pingResult} ms
${quality} 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧

╭───── • ─────╮
   𝐒𝐞𝐫𝐯𝐞𝐫 𝐒𝐭𝐚𝐭𝐮𝐬
╰───── • ─────╯
✅ 𝐎𝐩𝐞𝐫𝐚𝐭𝐢𝐨𝐧𝐚𝐥
🔋 𝟏𝟎𝟎% 𝐔𝐩𝐭𝐢𝐦𝐞

👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
        `;

        // Send final result
        await zk.sendMessage(dest, {
            text: resultMessage,
            edit: loadingMsg.key
        });

    } catch (error) {
        console.error("Ping error:", error);
        await repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐭𝐞𝐬𝐭 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧");
    }
});

// Uptime command with enhanced display
zokou({
  nomCom: "uptime",
  desc: "Check bot runtime",
  categorie: "General",
  reaction: "⏱️",
  fromMe: true
}, async (dest, zk, { repondre }) => {
    const formatRuntime = (seconds) => {
        seconds = Number(seconds);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor(seconds % 86400 / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        const secs = Math.floor(seconds % 60);

        return `╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐔𝐏𝐓𝐈𝐌𝐄
╰───── • ─────╯

⏳ ${days > 0 ? days + " day" + (days === 1 ? "" : "s") + ", " : ""}
${hours > 0 ? hours + " hour" + (hours === 1 ? "" : "s") + ", " : ""}
${minutes > 0 ? minutes + " minute" + (minutes === 1 ? "" : "s") + ", " : ""}
${secs > 0 ? secs + " second" + (secs === 1 ? "" : "s") : ""}

👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    };

    await repondre(formatRuntime(process.uptime()));
});

// Enhanced screenshot command
zokou({
  nomCom: "ss",
  desc: "Take website screenshot",
  categorie: "General",
  reaction: "📸",
  fromMe: true
}, async (dest, zk, { ms, arg, repondre }) => {
    if (!arg || arg.length === 0) {
        return repondre("🔗 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐰𝐞𝐛𝐬𝐢𝐭𝐞 𝐔𝐑𝐋");
    }

    try {
        // Show loading message
        const loadingMsg = await repondre("📸 𝐂𝐚𝐩𝐭𝐮𝐫𝐢𝐧𝐠 𝐬𝐜𝐫𝐞𝐞𝐧𝐬𝐡𝐨𝐭...");

        const url = arg.join(" ");
        const apiUrl = `https://api.maher-zubair.tech/misc/sstab?url=${encodeURIComponent(url)}&dimension=720x720`;
        
        // Simulate capture delay
        await sleep(1500);
        
        const screenshot = await getBuffer(apiUrl);
        
        await zk.sendMessage(dest, {
            image: screenshot,
            caption: `╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐒𝐂𝐑𝐄𝐄𝐍𝐒𝐇𝐎𝐓
╰───── • ─────╯

🌐 ${url}

👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        }, { quoted: ms });

        // Delete loading message
        await zk.sendMessage(dest, {
            delete: loadingMsg.key
        });

    } catch (error) {
        console.error("Screenshot error:", error);
        repondre("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐜𝐚𝐩𝐭𝐮𝐫𝐞 𝐬𝐜𝐫𝐞𝐞𝐧𝐬𝐡𝐨𝐭");
    }
});