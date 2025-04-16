const { zokou } = require('../framework/zokou');

// Define the owner number
const OWNER_NUMBER = "+254735342808";
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

// Normalize phone number for comparison
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
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU ABSOLUTE MORON! 😡 This isn’t a group! Quit wasting my time and get to a group NOW! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if the user is the owner
  const normalizedAuteur = normalizeNumber(auteurMessage.split('@')[0]);
  const normalizedOwner = normalizeNumber(OWNER_NUMBER);
  const isOwner = auteurMessage === OWNER_JID || normalizedAuteur === normalizedOwner || auteurMessage.startsWith(OWNER_NUMBER);
  console.log(`[DEBUG] Owner check: isOwner=${isOwner}, normalizedAuteur=${normalizedAuteur}, normalizedOwner=${normalizedOwner}`);

  if (!isOwner) {
    console.log(`[DEBUG] powner: User is not the owner`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC FAKE! 😤 Dare to mimic ${OWNER_NUMBER}? You’re a NOBODY! Crawl away, trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Double-check bot admin status
  let botIsAdmin = false;
  try {
    const metadata = await zk.groupMetadata(dest);
    const botJid = zk.user.id;
    const botMember = metadata.participants.find(member => member.id === botJid);
    botIsAdmin = botMember && botMember.admin !== null;
    console.log(`[DEBUG] Bot admin check: botIsAdmin=${botIsAdmin}, botJid=${botJid}, metadata=`, JSON.stringify(metadata, null, 2));
  } catch (e) {
    console.log(`[DEBUG] Error fetching metadata: ${e}`);
  }

  if (!botIsAdmin) {
    console.log(`[DEBUG] powner: Bot is not an admin`);
    repondre(`𝐓�{OX𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${userName}! 😤 I’m not admin, so I can’t crown you! Tell these losers to make me admin or they’ll REGRET IT! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Get group metadata
  const metadata = await zk.groupMetadata(dest);
  const membresGroupe = verifGroupe ? await infosGroupe.participants : [];
  const ownerJid = OWNER_JID;

  // Check if owner is in group
  const ownerInGroup = membresGroupe.some(member => member.id === ownerJid || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  console.log(`[DEBUG] Owner in group: ${ownerInGroup}`);

  if (!ownerInGroup) {
    console.log(`[DEBUG] powner: Owner is not in the group`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOSS, YOU SERIOUS? 😳 You’re not even in this group! Join up or I’m OUTTA HERE! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Check if owner is already admin
  const ownerMember = membresGroupe.find(member => member.id === ownerJid || normalizeNumber(member.id.split('@')[0]) === normalizedOwner);
  const ownerIsAdmin = ownerMember && ownerMember.admin !== null;
  console.log(`[DEBUG] Owner admin status: ${ownerIsAdmin}`);

  if (ownerIsAdmin) {
    console.log(`[DEBUG] powner: Owner is already an admin`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ RELAX, ${userName}! 😎 You’re already the EMPEROR of this dump! Keep ruling, legend! 💪\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  // Promote owner
  try {
    console.log(`[DEBUG] powner: Promoting owner to admin: ${ownerJid}`);
    await zk.groupParticipantsUpdate(dest, [ownerJid], "promote");
    console.log(`[DEBUG] powner: Owner promoted successfully`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOW BEFORE ${userName}! 😈 You’re now the UNSTOPPABLE WARLORD of this group! SLAY THEM ALL! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] powner: Error promoting owner: ${e}`);
    repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS BULLSHIT, ${userName}! 😤 Couldn’t crown you: ${e.message}! Smash this junk system! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
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
  let botIsAdmin = false;
  try {
    const metadata = await zokou.groupMetadata(id);
    const botJid = zokou.user.id;
    const botMember = metadata.participants.find(member => member.id === botJid);
    botIsAdmin = botMember && botMember.admin !== null;
    console.log(`[DEBUG] Auto-promote bot admin check: botIsAdmin=${botIsAdmin}`);
  } catch (e) {
    console.log(`[DEBUG] Error fetching metadata for auto-promote: ${e}`);
  }

  if (!botIsAdmin) {
    console.log(`[DEBUG] group-participants-update: Bot is not admin`);
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ LAME! 😤 I’m not admin, so I can’t crown the boss! Make me admin or kiss your luck goodbye! 🚫\n◈━━━━━━━━━━━━━━━━◈` });
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
    await zokou.sendMessage(id, { text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ EVERYONE SHUT UP! 😈 The SUPREME OVERLORD ${OWNER_NUMBER} just stormed in!\n│❒ I’ve made them ADMIN before you could even blink! KNEEL OR BE CRUSHED! 💥\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈` });
  } catch (e) {
    console.log(`[DEBUG] group-participants-update: Error promoting owner: ${e}`);
    await zokou.sendMessage(id, { text: `𝐓�{OX𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THE BOSS ${OWNER_NUMBER} IS HERE! 😎 But this trash heap failed: ${e.message}!\n│❒ Fix this garbage or I’ll torch it! 😡\n◈━━━━━━━━━━━━━━━━◈` });
  }
});