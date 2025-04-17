const { zokou } = require("../framework/zokou");
const axios = require("axios");

// 𝐀𝐈 𝐌𝐨𝐝𝐮𝐥𝐞
// 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

zokou(
  {
    nomCom: "gemini",
    categorie: "AI",
    reaction: "🧠",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg, prefixe } = commandeOptions;

    console.log("Command triggered: .gemini");

    // Check for query
    if (!arg || arg.length === 0) {
      console.log("No query provided");
      return repondre(
        `𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 No query? Stop wasting my time! 📝\n│❒ Example: ${prefixe}gemini Hello, which model are you?\n◈━━━━━━━━━━━━━━━━◈`
      );
    }

    const query = arg.join(" ");
    console.log("Query:", query);

    try {
      repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Generating response from Gemini... 😈\n◈━━━━━━━━━━━━━━━━◈`);
      console.log("Fetching from API...");

      // Fetch response from API
      const url = `https://api.giftedtech.web.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`;
      console.log("API URL:", url);
      const response = await axios.get(url);
      console.log("API Response Status:", response.status);

      if (response.status !== 200) {
        const errorText = response.data.error || "Unknown error";
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = response.data;
      console.log("API Data:", data);

      if (data && data.success && data.result) {
        const res = data.result;
        await repondre(
          `𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Query: ${query}\n│❒ Response: ${res}\n│❒ BOOM! 😈 Answered like a boss! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`
        );
      } else {
        console.log("Invalid API response structure");
        repondre(
          `𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Invalid response from API! 🚫\n◈━━━━━━━━━━━━━━━━◈`
        );
      }
    } catch (error) {
      console.error("Error with Gemini API:", error);
      repondre(
        `𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS SUCKS, ${ms.pushName || "User"}! 😤 Failed: ${error.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`
      );
    }
  }
);
