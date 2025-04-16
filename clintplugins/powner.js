const { zokou } = require('../framework/zokou');

// Define the owner number at the top
const OWNER_NUMBER = "+254735342808"; // Owner's phone number with country code
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`; // Formatted JID for WhatsApp

zokou({ nomCom: "powner", categorie: "Group", reaction: "💥" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, infosGroupe, auteurMessage, verifAdminBot } = commandeOptions;

  console.log(`[DEBUG] powner command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  // Check if it’s a group chat
  if (!verifGroupe) {
    console.log(`[DEBUG] powner: Not a group chat`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ STOP WASTING MY TIME! 😡 This ain’t a group, you clueless fool! Get to a group or get lost! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if the user is the owner
  if (auteurMessage !== OWNER_JID) {
    console.log(`[DEBUG] powner: User is not the owner`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ WHO DO YOU THINK YOU ARE? 😤 Only the boss, ${OWNER_NUMBER}, runs this show! Back off, wannabe! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if the bot is an admin
  if (!verifAdminBot) {
    console.log(`[DEBUG] powner: Bot is not an admin`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ LISTEN UP, ${ms.pushName}! 😡 I ain’t no admin here, so I can’t crown you! Make me an admin or quit whining! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Get group metadata to check participants
  const metadata = await zk.groupMetadata(dest);
  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  const ownerJid = OWNER_JID;

  // Check if the owner is in the group
  const ownerInGroup = membresGroupe.some(member => member.id === ownerJid);
  if (!ownerInGroup) {
    console.log(`[DEBUG] powner: Owner is not in the group`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ WHAT THE HELL, BOSS? 😳 You’re not even in this group! Join up or stop messing with me! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if the owner is already an admin
  const ownerMember = membresGroupe.find(member => member.id === ownerJid);
  const ownerIsAdmin = ownerMember.admin !== null;

  if (ownerIsAdmin) {
    console.log(`[DEBUG] powner: Owner is already an admin`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ CHILL, ${ms.pushName}! 😎 You’re already ruling this group like a king! No need to flex twice! 💪\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Promote the owner to admin
  try {
    console.log(`[DEBUG] powner: Promoting owner to admin: ${ownerJid}`);
    await zk.groupParticipantsUpdate(dest, [ownerJid], "promote");
    console.log(`[DEBUG] powner: Owner promoted successfully`);
    repondre(`𝐓𝐎𝐗𝐈�{C-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HELL YEAH, ${ms.pushName}! 😈 You’re now the TOP DOG in this group! Rule with an iron fist! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] powner: Error promoting owner: ${e}`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ DAMN IT, ${ms.pushName}! 😣 Something broke while crowning you: ${e.message}! Fix this mess! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

// Event listener for automatic promotion when the owner joins a group
zokou.on('group-participants-update', async (update) => {
  const { id, participants, action } = update;

  console.log(`[DEBUG] group-participants-update: Action: ${action}, Group: ${id}, Participants: ${participants}`);

  // Only proceed if the action is 'add'
  if (action !== 'add') {
    console.log(`[DEBUG] group-participants-update: Ignoring non-add action`);
    return;
  }

  // Check if the bot is an admin
  const metadata = await zokou.groupMetadata(id);
  const botJid = zokou.user.id;
  const botMember = metadata.participants.find(member => member.id === botJid);
  const botIsAdmin = botMember.admin !== null;

  if (!botIsAdmin) {
    console.log(`[DEBUG] group-participants-update: Bot is not an admin in group ${id}`);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ PATHETIC! 😤 I’m not an admin here, so I can’t crown the boss! Make me admin or get wrecked! 🚫\n◈━━━━━━━━━━━━━━━━◈` });
    return;
  }

  // Check if the owner joined
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

    // Send a group announcement
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOW DOWN, PEASANTS! 😈 The LEGENDARY BOSS, ${OWNER_NUMBER}, just rolled in!\n│❒ I’ve crowned them ADMIN faster than you can blink! 💥 Show some respect or get smoked! 🔥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈` });
  } catch (e) {
    console.log(`[DEBUG] group-participants-update: Error promoting owner: ${e}`);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THE BOSS, ${OWNER_NUMBER}, IS HERE! 😎 But this trash system failed me: ${e.message}!\n│❒ Fix this junk or I’ll burn it down! 😡\n◈━━━━━━━━━━━━━━━━◈` });
  }
});