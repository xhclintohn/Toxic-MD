const { zokou } = require("../framework/zokou");
const fetch = require("node-fetch");

// 𝐀𝐈 𝐌𝐨𝐝𝐮𝐥𝐞
// 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

zokou(
  {
    nomCom: "chatgpt",
    categorie: "AI",
    reaction: "🤖",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg, prefixe } = commandeOptions;

    // Check for query
    if (!arg || arg.length === 0) {
      return repondre(
        `𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}𝐜𝐡𝐚𝐭𝐠𝐩𝐭 𝐇𝐞𝐥𝐥𝐨\n\n𝐏𝐥𝐞𝐚𝐻𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐭𝐞𝐱𝐭 𝐨𝐫 𝐪𝐮𝐞𝐫𝐲 𝐟𝐨𝐫 𝐂𝐡𝐚𝐭𝐆𝐏𝐓!`
      );
    }

    const query = arg.join(" ");

    try {
      repondre(`𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐫𝐞𝐻𝐩𝐨𝐧𝐇𝐞 𝐟𝐫𝐨𝐦 𝐂𝐡𝐚𝐭𝐆𝐏𝐓...`);

      // Fetch response from API
      const response = await fetch(
        `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.result && data.result.prompt) {
        const res = data.result.prompt;
        await repondre(
          `${res}\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        );
      } else {
        repondre(`𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐫𝐞𝐇𝐩𝐨𝐧𝐇𝐞 𝐟𝐭𝐨𝐦 𝐀𝐏𝐈`);
      }
    } catch (error) {
      console.error("Error with ChatGPT API:", error);
      repondre(
        `𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠...\n\n${error.message}`
      );
    }
  }
);

module.exports = { zokou };