const { zokou } = require("../framework/zokou");

// 𝐆𝐫𝐨𝐮𝐩 𝐌𝐨𝐝𝐮𝐥𝐞
// 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

zokou(
  {
    nomCom: "leave",
    categorie: "Group",
    reaction: "👋",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg, prefixe, isOwner } = commandeOptions;

    // Owner-only check for leaving all groups
    const ownerNumber = "254735342808@s.whatsapp.net";
    const sender = ms.key.participant || ms.key.remoteJid;

    // Handle .leaveall
    if (arg[0] === "all") {
      if (sender !== ownerNumber && !isOwner) {
        return repondre(
          `𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!\n\n𝐓𝐡𝐢𝐇 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐇 𝐫𝐞𝐇𝐭𝐫𝐢𝐜𝐭𝐞𝐝 𝐭𝐨 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 (@${ownerNumber.split("@")[0]}).`
        );
      }

      try {
        repondre(`𝐁𝐲𝐞 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞! 𝐓𝐡𝐞 𝐛𝐨𝐭 𝐰𝐢𝐥𝐥 𝐥𝐞𝐚𝐯𝐞 𝐚𝐥𝐥 𝐠𝐫𝐨𝐮𝐩𝐇...`);

        // Fetch all group chats (assumed method; adjust if needed)
        const chats = await zk.chats; // Hypothetical; replace with Zokou's method
        const groupChats = Object.values(chats).filter(
          (chat) => chat.id.endsWith("g.us") && !chat.readOnly
        );

        for (let i = 0; i < groupChats.length; i++) {
          await zk.sendMessage(
            groupChats[i].id,
            { text: "𝐁𝐲𝐞 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞! 𝐓𝐡𝐞 𝐛𝐨𝐭 𝐢𝐇 𝐥𝐞𝐚𝐯𝐢𝐧𝐠 𝐭𝐡𝐢𝐇 𝐠𝐫𝐨𝐮𝐩." },
            { quoted: ms }
          );
          await zk.groupLeave(groupChats[i].id);
          await delay(i * 2000); // 2-second delay between leaves
        }

        repondre(`𝐒𝐮𝐜𝐜𝐞𝐇𝐇! 𝐋𝐞𝐟𝐭 𝐚𝐥𝐥 𝐠𝐫𝐨𝐮𝐩𝐇.`);
      } catch (error) {
        console.error("Error leaving all groups:", error);
        repondre(`𝐄𝐫𝐫𝐨𝐫 𝐥𝐞𝐚𝐯𝐢𝐧𝐠 𝐚𝐥𝐥 𝐠𝐫𝐨𝐮𝐩𝐇: ${error.message}`);
      }
      return;
    }

    // Handle specific group JID
    if (arg.length > 0) {
      const groupJid = arg[0];
      if (!groupJid.endsWith("g.us")) {
        return repondre(
          `𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐠𝐫𝐨𝐮𝐩 𝐉𝐈𝐃! 𝐔𝐇𝐞 𝐚 𝐟𝐨𝐫𝐦𝐚𝐭 𝐥𝐢𝐤𝐞 𝟏𝟐𝟑𝟒𝟓𝟔@g.us`
        );
      }

      try {
        // Check if bot is in the group (assumed method)
        const chats = await zk.chats;
        const groupExists = Object.values(chats).some(
          (chat) => chat.id === groupJid
        );
        if (!groupExists) {
          return repondre(
            `𝐁𝐨𝐭 𝐢𝐇 𝐧𝐨𝐭 𝐢𝐧 𝐭𝐡𝐚𝐭 𝐠𝐫𝐨𝐮𝐩 (${groupJid})!`
          );
        }

        await zk.sendMessage(
          groupJid,
          { text: "𝐁𝐲𝐞 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞! 𝐓𝐡𝐞 �	b𝐨𝐭 𝐢𝐇 𝐥𝐞𝐚𝐯𝐢𝐧�	g 𝐭𝐡𝐢�	H �	g𝐫𝐨𝐮𝐩." },
          { quoted: ms }
        );
        await zk.groupLeave(groupJid);
        repondre(`𝐒𝐮𝐜𝐜𝐞𝐇𝐇! 𝐋𝐞𝐟𝐭 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 ${groupJid}.`);
      } catch (error) {
        console.error("Error leaving specific group:", error);
        repondre(`𝐄𝐫𝐫𝐨𝐫 𝐥𝐞𝐚𝐯𝐢𝐧�	g �	g𝐫𝐨𝐮𝐩 ${groupJid}: ${error.message}`);
      }
      return;
    }

    // Leave current group (default)
    if (!ms.key.remoteJid.endsWith("g.us")) {
      return repondre(
        `𝐓𝐡𝐢�	H 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐜𝐚𝐧 𝐨𝐧𝐥𝐲 𝐛𝐞 𝐮�	H𝐞𝐝 𝐢𝐧 �	g𝐫𝐨𝐮𝐩�	H!`
      );
    }

    try {
      await zk.sendMessage(
        dest,
        { text: "𝐁𝐲𝐞 𝐞𝐯�	e𝐫𝐲𝐨𝐧𝐞! 𝐓𝐡�	e 𝐛𝐨𝐭 𝐢�	H 𝐥𝐞𝐚𝐯𝐢𝐧�	g 𝐭𝐡𝐢�	H �	g𝐫𝐨𝐮𝐩." },
        { quoted: ms }
      );
      await zk.groupLeave(dest);
    } catch (error) {
      console.error("Error leaving current group:", error);
      repondre(
        `𝐄𝐫𝐫𝐨𝐫 𝐥𝐞𝐚𝐯𝐢𝐧�	g 𝐭𝐡𝐢�	H �	g𝐫𝐨𝐮𝐩: ${error.message}`
      );
    }
  }
);

module.exports = { zokou };

const delay = (time) => new Promise((res) => setTimeout(res, time));