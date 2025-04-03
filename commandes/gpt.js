require("dotenv").config();
const { zokou } = require("../framework/zokou");
const axios = require("axios");

zokou({
  nomCom: "gpt",
  categorie: "AI",
  reaction: "🤖"
}, async (dest, zk, command) => {
  const { ms, repondre, arg } = command;

  if (!arg[0]) {
    return repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐀𝐈
╰───── • ─────╯

🤖 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);
  }

  try {
    const question = arg.join(" ");
    const apiUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(question)}`;

    // Show processing message
    await repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐀𝐈
╰───── • ─────╯

⏳ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐫𝐞𝐪𝐮𝐞𝐬𝐭...
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);

    const response = await axios.get(apiUrl);
    const data = response.data;

    // Handle empty responses
    if (!data || !data.result || data.result.trim() === "") {
      return repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐀𝐈
╰───── • ─────╯

🤖 𝐍𝐨 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐫𝐞𝐜𝐞𝐢𝐯𝐞𝐝
💡 𝐓𝐫𝐲 𝐚𝐬𝐤𝐢𝐧𝐠 𝐝𝐢𝐟𝐟𝐞𝐫𝐞𝐧𝐭𝐥𝐲
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);
    }

    // Format response with same style as play command
    await repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐀𝐈
╰───── • ─────╯

🗣️ 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧: ${question}

🤖 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞:
${data.result}

👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);

  } catch (error) {
    console.error("GPT Error:", error);
    await repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐀𝐈
╰───── • ─────╯

⚠️ 𝐄𝐫𝐫𝐨𝐫: ${error.response?.status === 429 ? 'Too many requests' : 'Service unavailable'}
💡 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);
  }
});