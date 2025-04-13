const { zokou } = require("../framework/zokou");
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

zokou(
  {
    nomCom: "tohd",
    categorie: "Conversion",
    reaction: "🖼️",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    try {
      // Check if the user replied to a message with an image
      if (!msgRepondu || (!msgRepondu.message?.imageMessage && !msgRepondu.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage)) {
        return repondre("𝗛𝗲𝘆, 𝘆𝗼𝘂 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝘁𝗼 𝗰𝗼𝗻𝘃𝗲𝗿𝘁 𝗶𝘁 𝘁𝗼 𝗛𝗗! 🖼️");
      }

      // Get the image message (either directly or from a quoted message)
      const imageMessage = msgRepondu.message?.imageMessage || msgRepondu.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

      if (!imageMessage) {
        return repondre("𝗦𝗼𝗿𝗿𝘆, 𝗜 𝗰𝗼𝘂𝗹𝗱𝗻’𝘁 𝗳𝗶𝗻𝗱 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗶𝗻 𝘁𝗵𝗮𝘁 𝗺𝗲𝘀𝘀𝗮𝗴𝗲. 𝗧𝗿𝘆 𝗿𝗲𝗽𝗹𝘆𝗶𝗻𝗴 𝘁𝗼 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲! 😓");
      }

      // Notify the user that the image is being processed
      repondre("𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗶𝗺𝗮𝗴𝗲 𝘁𝗼 𝗛𝗗… 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁! ⏳");

      // Download the image
      const mediaPath = await zk.downloadAndSaveMediaMessage(imageMessage);

      // Prepare the image for the API (DeepAI requires a file upload)
      const formData = new FormData();
      formData.append('image', fs.createReadStream(mediaPath));

      // Send the image to DeepAI's Image Upscaling API
      const deepAiApiKey = "YOUR_DEEPAI_API_KEY"; // Replace with your DeepAI API key
      const response = await axios.post('https://api.deepai.org/api/torch-srgan', formData, {
        headers: {
          'Api-Key': deepAiApiKey,
          ...formData.getHeaders(),
        },
      });

      const enhancedImageUrl = response.data.output_url;

      if (!enhancedImageUrl) {
        fs.unlinkSync(mediaPath); // Clean up the downloaded file
        return repondre("𝗦𝗼𝗿𝗿𝘆, 𝗜 𝗰𝗼𝘂𝗹𝗱𝗻’𝘁 𝗲𝗻𝗵𝗮𝗻𝗰𝗲 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲. 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿! 😓");
      }

      // Send the enhanced image back to the user
      await zk.sendMessage(dest, {
        image: { url: enhancedImageUrl },
        caption: "𝐇𝐞𝐫𝐞’𝐬 𝐲𝐨𝐮𝐫 𝐇𝐃 𝐢𝐦𝐚𝐠𝐞! 𝐄𝐧𝐡𝐚𝐧𝐜𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 | 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 🖼️",
      }, { quoted: ms });

      // Clean up the downloaded file
      fs.unlinkSync(mediaPath);

    } catch (error) {
      console.error("Error in .tohd command:", error);
      repondre("𝗢𝗼𝗽𝘀, 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝘄𝗲𝗻𝘁 𝘄𝗿𝗼𝗻𝗴 𝘄𝗵𝗶𝗹𝗲 𝗲𝗻𝗵𝗮𝗻𝗰𝗶𝗻𝗴 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲: " + error.message);
    }
  }
);