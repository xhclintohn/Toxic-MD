require("dotenv").config();
const { zokou } = require("../framework/zokou");

// Constants
const PAIR_API = "https://toxic-pair-code.onrender.com/pair";
const COUNTRY_CODE = "254"; // Default Kenya country code

zokou({
  nomCom: "pair",
  categorie: "Utility",
  reaction: "🔗"
}, async (dest, zk, command) => {
  const { ms: quotedMessage, repondre: reply, arg: args } = command;

  if (!args[0]) {
    return reply(`⚠️ *Usage*:\n.pair 2547XXXXXX\n\nExample: .pair ${COUNTRY_CODE}712345678`);
  }

  // Validate and format phone number
  let phoneNumber = args[0].replace(/\D/g, ''); // Remove all non-digit characters

  // Check if number starts with country code
  if (!phoneNumber.startsWith(COUNTRY_CODE)) {
    // If starts with 0 (like 07...), replace with 254
    if (phoneNumber.startsWith('0')) {
      phoneNumber = COUNTRY_CODE + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('7')) {
      phoneNumber = COUNTRY_CODE + phoneNumber;
    } else {
      return reply(`❌ *Invalid Number*\nPlease use format: ${COUNTRY_CODE}7XXXXXXX\nExample: ${COUNTRY_CODE}712345678`);
    }
  }

  // Validate final number length (254 + 9 digits)
  if (phoneNumber.length !== 12) {
    return reply(`❌ *Invalid Length*\nKenya numbers should be 12 digits (${COUNTRY_CODE}XXXXXXXXX)`);
  }

  try {
    // Fetch pairing code from API
    const response = await fetch(`${PAIR_API}?phone=${phoneNumber}`);
    const data = await response.json();

    if (!data.success) {
      return reply(`⚠️ *Pairing Failed*\n${data.message || "Invalid response from server"}`);
    }

    // Success response
    await reply(`✅ *Pairing Code Generated*\n\n📱 Number: ${phoneNumber}\n🔢 Code: *${data.code}*\n\n👑 *Owner: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*\n🤖 *Bot: Toxic-MD*`);

  } catch (error) {
    console.error("Pair Error:", error);
    reply(`⚠️ *API Error*\nFailed to generate code. Please try again later.\n\nError: ${error.message}`);
  }
});

// Command metadata
module.exports = {
  name: "pair",
  description: "Generate WhatsApp pairing code",
  usage: ".pair [phone]",
  enable: true
};