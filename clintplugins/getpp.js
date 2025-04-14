const { zokou } = require("../framework/zokou");

zokou(
  {
    nomCom: "getpp",
    categorie: "General",
    reaction: "📷",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu, auteurMsgRepondu, mybotpic } = commandeOptions;

    // Check if the message is a reply
    if (!msgRepondu) {
      return repondre("𝗛𝗲𝘆, 𝘆𝗼𝘂 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝘀𝗼𝗺𝗲𝗼𝗻𝗲’𝘀 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘁𝗼 𝗴𝗲𝘁 𝘁𝗵𝗲𝗶𝗿 𝗽𝗿𝗼𝗳𝗶𝗹𝗲 𝗽𝗶𝗰𝘁𝘂𝗿𝗲! 🤔");
    }

    try {
      // Notify the user that the profile picture is being fetched
      repondre("𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝘁𝗵𝗲 𝗽𝗿𝗼𝗳𝗶𝗹𝗲 𝗽𝗶𝗰𝘁𝘂𝗿𝗲 𝗳𝗼𝗿 𝘆𝗼𝘂… 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁! 📸");

      // Fetch the profile picture of the replied person
      let ppuser;
      try {
        ppuser = await zk.profilePictureUrl(auteurMsgRepondu, 'image');
      } catch {
        ppuser = mybotpic();
        repondre("𝗖𝗼𝘂𝗹𝗱𝗻’𝘁 𝗴𝗲𝘁 𝘁𝗵𝗲𝗶𝗿 𝗽𝗿𝗼𝗳𝗶𝗹𝗲 𝗽𝗶𝗰𝘁𝘂𝗿𝗲. 𝗧𝗵𝗲𝘆 𝗺𝗶𝗴𝗵𝘁 𝗵𝗮𝘃𝗲 𝗽𝗿𝗶𝘃𝗮𝗰𝘆 𝘀𝗲𝘁𝘁𝗶𝗻𝗴𝘀 𝗲𝗻𝗮𝗯𝗹𝗲𝗱. 𝗛𝗲𝗿𝗲’𝘀 𝗺𝘆 𝗽𝗶𝗰 𝗶𝗻𝘀𝘁𝗲𝗮𝗱! 😅");
      }

      // Send the profile picture
      await zk.sendMessage(
        dest,
        {
          image: { url: ppuser },
          caption: `𝗛𝗲𝗿𝗲’𝘀 𝘁𝗵𝗲 𝗽𝗿𝗼𝗳�_i𝗹𝗲 𝗽𝗶𝗰𝘁𝘂𝗿𝗲 𝗳𝗼𝗿 @${auteurMsgRepondu.split("@")[0]}! 🎉`,
          mentions: [auteurMsgRepondu],
        },
        { quoted: ms }
      );

    } catch (error) {
      console.error("Error in .getpp command:", error);
      repondre("𝗢𝗼𝗽𝘀, 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝘄𝗲𝗻𝘁 𝘄𝗿𝗼𝗻𝗴 𝘄𝗵𝗶𝗹𝗲 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝘁𝗵𝗲 𝗽𝗿𝗼𝗳𝗶𝗹𝗲 𝗽𝗶𝗰𝘁𝘂𝗿𝗲: " + error.message);
    }
  }
);