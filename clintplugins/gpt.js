require("dotenv").config();
const { zokou } = require("../framework/zokou");

const GPT_API = "https://api.dreaded.site/api/chatgpt?text=";

zokou({
  nomCom: "gpt",
  categorie: "AI",
  reaction: "🤖"
}, async (dest, zk, command) => {
  const { ms: quotedMessage, repondre: reply, arg: args } = command;

  if (!args || args.length === 0) {
    return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧.\n𝐄𝐱𝐚𝐦𝐩𝐥𝐞: !𝐠𝐩𝐭 𝐇𝐨𝐰 𝐭𝐨 𝐦𝐚𝐤𝐞 𝐩𝐚𝐬𝐭𝐚?");
  }

  try {
    const question = args.join(" ");
    const apiUrl = `${GPT_API}${encodeURIComponent(question)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Debug: Uncomment to see full API response
    // console.log("API Response:", JSON.stringify(data, null, 2));

    if (!data.success || !data.result) {
      return reply("⚠️ *𝐀𝐈 𝐄𝐫𝐫𝐨𝐫*:\nThe API returned an empty response\n\n👑 *𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*");
    }

    // If result exists but is empty
    if (data.result === "") {
      return reply("🤖 *𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐀𝐈*:\n\nI couldn't generate a response for that question.\nPlease try a different query.\n\n👑 *𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*");
    }

    await reply(`🤖 *𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐀𝐈*:\n\n${data.result}\n\n👑 *𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*`);

  } catch (error) {
    console.error("GPT Error:", error);
    reply(`⚠️ *𝐄𝐫𝐫𝐨𝐫*:\n${error.message}\n\nPlease try again later.`);
  }
});