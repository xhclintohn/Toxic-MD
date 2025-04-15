const { zokou } = require("../framework/zokou");

const TOXIC_MD = "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃";
const MY_NUMBER = "+254735342808"; // Your number
const STYLE_LINES = "◈━━━━━━━━━━━━━━━━◈";

// No database needed - simple memory storage
const antiLinkGroups = new Set();

// Helper function to check if bot is admin
async function isBotAdmin(zk, groupJid) {
  try {
    const groupMetadata = await zk.groupMetadata(groupJid);
    const botId = zk.user.id.split(":")[0] + "@s.whatsapp.net";
    return groupMetadata.participants.some(
      (p) => p.id === botId && p.admin !== null
    );
  } catch (e) {
    console.log("Error checking bot admin status:", e);
    return false;
  }
}

// Enable command
zokou({ nomCom: "enable", categorie: "Group" }, async (dest, zk, cmdOpts) => {
  const { repondre, arg, verifGroupe, ms } = cmdOpts;

  if (!verifGroupe) {
    return repondre(
      `${STYLE_LINES}\n${TOXIC_MD}\n❌ This command is for groups only!\n${STYLE_LINES}`
    );
  }

  // Check if bot is admin
  if (!(await isBotAdmin(zk, dest))) {
    return repondre(
      `${STYLE_LINES}\n${TOXIC_MD}\n❌ I need to be a group admin to enable antilink!\n${STYLE_LINES}`
    );
  }

  if (!arg[0] || arg[0].toLowerCase() !== "antilink") {
    return repondre(
      `${STYLE_LINES}\n${TOXIC_MD}\n❌ Please specify 'antilink' (e.g., enable antilink)\n${STYLE_LINES}`
    );
  }

  antiLinkGroups.add(dest);
  return repondre(
    `${STYLE_LINES}\n${TOXIC_MD}\n✅ Antilink enabled! All links will be deleted except from admins and ${MY_NUMBER}.\n${STYLE_LINES}`
  );
});

// Disable command (for convenience)
zokou({ nomCom: "disable", categorie: "Group" }, async (dest, zk, cmdOpts) => {
  const { repondre, arg, verifGroupe } = cmdOpts;

  if (!verifGroupe) {
    return repondre(
      `${STYLE_LINES}\n${TOXIC_MD}\n❌ This command is for groups only!\n${STYLE_LINES}`
    );
  }

  if (!arg[0] || arg[0].toLowerCase() !== "antilink") {
    return repondre(
      `${STYLE_LINES}\n${TOXIC_MD}\n❌ Please specify 'antilink' (e.g., disable antilink)\n${STYLE_LINES}`
    );
  }

  antiLinkGroups.delete(dest);
  return repondre(
    `${STYLE_LINES}\n${TOXIC_MD}\n✅ Antilink disabled for this group.\n${STYLE_LINES}`
  );
});

// Detection
zokou.on("message", async (message) => {
  const { texte, verifGroupe, auteurMessage, ms, zk, superUser, admins } =
    message;

  // Skip if:
  if (
    !verifGroupe || // Not a group
    !antiLinkGroups.has(message.origineMessage) || // Antilink not enabled
    !texte // No text to check
  ) {
    return;
  }

  // Check if bot is admin
  if (!(await isBotAdmin(zk, message.origineMessage))) {
    antiLinkGroups.delete(message.origineMessage); // Disable antilink if bot isn't admin
    return zk.sendMessage(
      message.origineMessage,
      {
        text: `${STYLE_LINES}\n${TOXIC_MD}\n❌ Antilink disabled because I am not a group admin!\n${STYLE_LINES}`,
      },
      { quoted: ms }
    );
  }

  // Normalize sender's number
  const senderNumber = auteurMessage.split("@")[0];
  const myNumberNormalized = MY_NUMBER.replace("+", "");

  // Skip if sender is bot owner, group admin, or your number
  if (
    superUser ||
    admins.includes(auteurMessage) ||
    senderNumber === myNumberNormalized
  ) {
    return;
  }

  // Link detection regex (http, https, short links, etc.)
  const linkRegex =
    /(https?:\/\/[^\s]+|www\.[^\s]+|bit\.ly\/[^\s]+|t\.co\/[^\s]+|tinyurl\.com\/[^\s]+)/i;
  if (!linkRegex.test(texte)) {
    return;
  }

  // Retry deletion up to 3 times
  let attempts = 0;
  const maxAttempts = 3;
  const retryDelay = 1000;

  while (attempts < maxAttempts) {
    try {
      await zk.sendMessage(message.origineMessage, {
        delete: {
          remoteJid: message.origineMessage,
          fromMe: false,
          id: ms.key.id,
          participant: auteurMessage,
        },
      });
      // Notify sender
      await zk.sendMessage(
        message.origineMessage,
        {
          text: `${STYLE_LINES}\n${TOXIC_MD}\n⚠️ Links are not allowed in this group, @${senderNumber}! Message deleted.\n${STYLE_LINES}`,
          mentions: [auteurMessage],
        },
        { quoted: ms }
      );
      break;
    } catch (e) {
      attempts++;
      console.log(`Delete attempt ${attempts} failed:`, e);
      if (attempts === maxAttempts) {
        console.log("Max delete attempts reached:", e);
        await zk.sendMessage(
          message.origineMessage,
          {
            text: `${STYLE_LINES}\n${TOXIC_MD}\n❌ Failed to delete link message after ${maxAttempts} attempts.\n${STYLE_LINES}`,
          },
          { quoted: ms }
        );
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
});