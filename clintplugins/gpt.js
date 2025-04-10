const { zokou } = require("../framework/zokou");
const fetch = require("node-fetch");

// 𝐀𝐈 𝐌𝐨𝐝𝐮𝐥𝐞
// 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

zokou(
  {
    nomCom: "gpt",
    categorie: "AI",
    reaction: "🤖",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg, prefixe } = commandeOptions;

    console.log("Command triggered: .gpt");

    // Check for query
    if (!arg || arg.length === 0) {
      console.log("No query provided");
      return repondre(
        `𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}𝐠𝐩𝐭 𝐇𝐞𝐥𝐥𝐨\n\n𝐏𝐥𝐞𝐚𝐇𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐭𝐞𝐱𝐭 𝐨𝐫 𝐪𝐮𝐞𝐫𝐲 𝐟𝐨𝐫 𝐆𝐏𝐓!`
      );
    }

    const query = arg.join(" ");
    console.log("Query:", query);

    try {
      repondre(`𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐫𝐞𝐇𝐩𝐨𝐧𝐇𝐞 𝐟𝐫𝐨𝐦 𝐆𝐏𝐓...`);
      console.log("Fetching from API...");

      // Fetch response from API
      const url = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`;
      console.log("API URL:", url);
      const response = await fetch(url);
      console.log("API Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("API Data:", data);

      if (data && data.result && data.result.prompt) {
        const res = data.result.prompt;
        await repondre(
          `${res}\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_�{c𝐥𝐢𝐧𝐭𝐨𝐧`
        );
      } else {
        console.log("Invalid API response structure");
        repondre(`𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐫𝐞𝐇𝐩𝐨𝐧𝐇𝐞 𝐟𝐫𝐨𝐦 𝐀𝐏𝐈`);
      }
    } catch (error) {
      console.error("Error with GPT API:", error);
      repondre(
        `𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫�{o𝐧𝐠...\n\n${error.message}`
      );
    }
  }
);

module.exports = { zokou };