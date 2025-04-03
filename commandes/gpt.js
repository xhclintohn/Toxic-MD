require("dotenv").config();
const { zokou } = require("../framework/zokou");

// ChatGPT Command
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

🤖 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧 𝐨𝐫 𝐩𝐫𝐨𝐦𝐩𝐭
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

🔍 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐫𝐞𝐪𝐮𝐞𝐬𝐭...
👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.text();
    
    // Format the response with fancy styling
    const formattedResponse = `
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐀𝐈
╰───── • ─────╯

🗣️ 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧: ${question}

🤖 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞: 
${result}


╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`;

    await repondre(formattedResponse);

  } catch (error) {
    console.error("Error:", error);
    await repondre(`
╭───── • ─────╮
   𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐀𝐈
╰───── • ─────╯

⚠️ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝:
${error.message}

👑 𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

╰── ⋅ ⋅ ⋅ ── ✦ ── ⋅ ⋅ ⋅ ──╯`);
  }
});