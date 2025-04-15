const { zokou } = require("../framework/zokou");

const TOXIC_MD = "\u{1D413}\u{1D40E}\u{1D417}\u{1D408}\u{1D402}-\u{1D40C}\u{1D403}"; // 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

zokou({ nomCom: "join", categorie: 'Group', reaction: "⭐" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  // Check for a WhatsApp group invite link in the message or replied-to message
  let inviteLink = arg.join(' ').trim();
  if (!inviteLink && ms.quoted && ms.quoted.text) {
    inviteLink = ms.quoted.text.trim();
  }

  if (!inviteLink) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ \u{1D443}\u{1D459}\u{1D452}\u{1D44E}\u{1D460}\u{1D452} \u{1D45D}\u{1D45F}\u{1D45C}\u{1D463}\u{1D456}\u{1D451}\u{1D452} \u{1D44E} \u{1D44A}\u{1D455}\u{1D44E}\u{1D461}\u{1D460}\u{1D44E}\u{1D45D}\u{1D45D} \u{1D454}\u{1D45F}\u{1D45C}\u{1D462}\u{1D45D} \u{1D459}\u{1D456}\u{1D45B}\u{1D458} 🚫
│❒ \u{1D438}\u{1D465}\u{1D44E}\u{1D45A}\u{1D45D}\u{1D459}\u{1D452}: .join https://chat.whatsapp.com/ABC123xyz
◈━━━━━━━━━━━━━━━━◈
    `;
    // Translates to: 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐧𝐤 🚫
    // 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .join https://chat.whatsapp.com/ABC123xyz
    repondre(message);
    return;
  }

  // Validate the WhatsApp group invite link
  const whatsappRegex = /^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]+/;
  if (!whatsappRegex.test(inviteLink)) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ \u{1D43C}\u{1D45B}\u{1D463}\u{1D44E}\u{1D459}\u{1D456}\u{1D451} \u{1D44A}\u{1D455}\u{1D44E}\u{1D461}\u{1D460}\u{1D44E}\u{1D45D}\u{1D45D} \u{1D454}\u{1D45F}\u{1D45C}\u{1D462}\u{1D45D} \u{1D459}\u{1D456}\u{1D45B}\u{1D458} 🚫
│❒ \u{1D443}\u{1D459}\u{1D452}\u{1D44E}\u{1D460}\u{1D452} \u{1D45D}\u{1D45F}\u{1D45C}\u{1D463}\u{1D456}\u{1D451}\u{1D452} \u{1D44E} \u{1D463}\u{1D44E}\u{1D459}\u{1D456}\u{1D451} \u{1D44A}\u{1D455}\u{1D44E}\u{1D461}\u{1D460}\u{1D44E}\u{1D45D}\u{1D45D} \u{1D454}\u{1D45F}\u{1D45C}\u{1D462}\u{1D45D} \u{1D459}\u{1D456}\u{1D45B}\u{1D458}, \u{1D452}.\u{1D454}., https://chat.whatsapp.com/ABC123xyz
◈━━━━━━━━━━━━━━━━◈
    `;
    // Translates to: 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐧𝐤 🚫
    // 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫�{o𝐯𝐢𝐝𝐞 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐧𝐤, 𝐞.𝐠., https://chat.whatsapp.com/ABC123xyz
    repondre(message);
    return;
  }

  try {
    // Extract the invite code from the link (e.g., "ABC123xyz" from "https://chat.whatsapp.com/ABC123xyz")
    const inviteCode = inviteLink.split('https://chat.whatsapp.com/')[1];

    // Join the group using the invite code
    const groupId = await zk.groupAcceptInvite(inviteCode);

    // Fetch group metadata to get the group name
    const groupMetadata = await zk.groupMetadata(groupId);
    const groupName = groupMetadata.subject;

    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ \u{1D446}\u{1D462}\u{1D450}\u{1D450}\u{1D452}\u{1D460}\u{1D460}\u{1D453}\u{1D462}\u{1D459}\u{1D459}\u{1D466} \u{1D457}\u{1D45C}\u{1D456}\u{1D45B}\u{1D452}\u{1D451} \u{1D454}\u{1D45F}\u{1D45C}\u{1D462}\u{1D45D} 🤝
│❒ \u{1D43C} \u{1D455}\u{1D44E}\u{1D463}\u{1D452} \u{1D457}\u{1D45C}\u{1D456}\u{1D45B}\u{1D452}\u{1D451}: ${groupName}
│❒ \u{1D43F}\u{1D456}\u{1D45B}\u{1D458}: ${inviteLink}
◈━━━━━━━━━━━━━━━━◈
    `;
    // Translates to: 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥�{y 𝐣𝐨𝐢𝐧𝐞𝐝 𝐠𝐫𝐨𝐮𝐩 🤝
    // 𝐈 𝐡𝐚𝐯𝐞 𝐣𝐨𝐢𝐧𝐞𝐝: (groupName)
    // 𝐋𝐢𝐧𝐤: (inviteLink)
    repondre(message);
  } catch (error) {
    const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ \u{1D439}\u{1D44E}\u{1D456}\u{1D459}\u{1D452}\u{1D451} \u{1D461}\u{1D45C} \u{1D457}\u{1D45C}\u{1D456}\u{1D45B} \u{1D454}\u{1D45F}\u{1D45C}\u{1D462}\u{1D45D}: ${error.message} 😓
│❒ \u{1D443}\u{1D459}\u{1D452}\u{1D44E}\u{1D460}\u{1D452} \u{1D450}\u{1D455}\u{1D452}\u{1D450}\u{1D458} \u{1D461}\u{1D455}\u{1D452} \u{1D459}\u{1D456}\u{1D45B}\u{1D458} \u{1D44E}\u{1D45B}\u{1D451} \u{1D461}\u{1D45F}\u{1D466} \u{1D44E}\u{1D454}\u{1D44E}\u{1D456}\u{1D45B}.
◈━━━━━━━━━━━━━━━━◈
    `;
    // Translates to: 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐣𝐨𝐢𝐧 𝐠𝐫𝐨𝐮𝐩: (error.message) 😓
    // 𝐏𝐥𝐞𝐚𝐬𝐞 𝐜𝐡𝐞𝐜𝐤 𝐭𝐡𝐞 𝐥𝐢𝐧𝐤 𝐚𝐧𝐤 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.
    repondre(errorMessage);
  }
});