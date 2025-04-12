const { zokou } = require("../framework/zokou");
const axios = require("axios"); // Replaced node-fetch with axios

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
        `𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}𝐠𝐩𝐭 𝐇𝐞𝐥𝐥𝐨\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐭𝐞𝐱𝐭 𝐨𝐫 𝐪𝐮𝐞𝐫𝐲 𝐟𝐨𝐫 𝐆𝐏𝐓!`
      );
    }

    const query = arg.join(" ");
    console.log("Query:", query);

    try {
      repondre(`𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐟𝐫𝐨𝐦 𝐆𝐏𝐓...`);
      console.log("Fetching from API...");

      // Fetch response from API
      const url = `https://api.giftedtech.web.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(query)}`;
      console.log("API URL:", url);
      const response = await axios.get(url); // Use axios instead of fetch
      console.log("API Response Status:", response.status);

      if (response.status !== 200) {
        const errorText = response.data.error || "Unknown error";
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = response.data; // axios uses .data instead of .json()
      console.log("API Data:", data);

      if (data && data.result) {
        const res = data.result;
        await repondre(
          `${res}\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        );
      } else {
        console.log("Invalid API response structure");
        repondre(`𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐟𝐫𝐨𝐦 𝐀𝐏𝐈`);
      }
    } catch (error) {
      console.error("Error with GPT API:", error);
      repondre(
        `𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠...\n\n${error.message}`
      );
    }
  }
);

module.exports = { zokou };