const { zokou } = require("../framework/zokou");
const moment = require("moment-timezone");
const { getBuffer } = require("../framework/dl/Function");
const speed = require("performance-now");

// Stylish runtime formatter
const runtime = (seconds) => {
  seconds = Number(seconds);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const secs = Math.floor(seconds % 60);

  return `${days > 0 ? days + (days === 1 ? " day, " : " days, ") : ""}${
    hours > 0 ? hours + (hours === 1 ? " hour, " : " hours, ") : ""}${
    minutes > 0 ? minutes + (minutes === 1 ? " minute, " : " minutes, ") : ""}${
    secs > 0 ? secs + (secs === 1 ? " second" : " seconds") : ""}`;
};

// Ping command
zokou({
  nomCom: "ping",
  desc: "Check bot response speed",
  categorie: "General",
  reaction: "⚡",
  fromMe: true
}, async (dest, zk, { repondre }) => {
  const timestamp = speed();
  const flashspeed = (speed() - timestamp).toFixed(4);
  await repondre(`⚡ *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐒𝐏𝐄𝐄𝐃*: ${flashspeed} ms`);
});

// Uptime command
zokou({
  nomCom: "uptime",
  desc: "Check bot runtime",
  categorie: "General",
  reaction: "⏱️",
  fromMe: true
}, async (dest, zk, { repondre }) => {
  const uptime = runtime(process.uptime());
  await repondre(`🕒 *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐔𝐏𝐓𝐈𝐌𝐄*:\n${uptime}`);
});

// Screenshot command
zokou({
  nomCom: "ss",
  desc: "Take website screenshot",
  categorie: "General",
  reaction: "📸",
  fromMe: true
}, async (dest, zk, { ms, arg, repondre }) => {
  if (!arg || arg.length === 0) {
    return repondre("🔗 *Please provide a website URL*");
  }

  try {
    const url = arg.join(" ");
    const apiUrl = `https://api.maher-zubair.tech/misc/sstab?url=${url}&dimension=720x720`;
    const screenshot = await getBuffer(apiUrl);
    
    await zk.sendMessage(dest, {
      image: screenshot,
      caption: "📷 *𝐒𝐜𝐫𝐞𝐞𝐧𝐬𝐡𝐨𝐭 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃*"
    }, { quoted: ms });
  } catch (error) {
    console.error("Screenshot error:", error);
    repondre("❌ *Failed to capture screenshot*");
  }
});