const { zokou } = require('../framework/zokou');
const axios = require("axios");
let { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { isUserBanned, addUserToBanList, removeUserFromBanList } = require("../bdd/banUser");
const { addGroupToBanList, isGroupBanned, removeGroupFromBanList } = require("../bdd/banGroup");
const { isGroupOnlyAdmin, addGroupToOnlyAdminList, removeGroupFromOnlyAdminList } = require("../bdd/onlyAdmin");
const { removeSudoNumber, addSudoNumber, issudo } = require("../bdd/sudo");

const sleep = (ms) => {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
};

// Check bot connectivity
const isBotConnected = (zk) => {
  return zk.user && zk.user.id && zk.connectionStatus === 'open';
};

zokou({ nomCom: "telesticker", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, nomAuteurMessage, superUser } = commandeOptions;

  console.log(`[DEBUG] telesticker command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] telesticker: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this junk system! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] telesticker: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU WORTHLESS FOOL! 😤 Only mods can use this command! Get lost! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] telesticker: No link provided`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 No Telegram sticker link? Stop screwing around! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  let lien = arg.join(' ');
  let packname = lien.split('/addstickers/')[1];
  let api = 'https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getStickerSet?name=' + encodeURIComponent(packname);

  try {
    console.log(`[DEBUG] telesticker: Fetching sticker set from ${api}`);
    let stickers = await axios.get(api);

    let type = null;
    if (stickers.data.result.is_animated === true || stickers.data.result.is_video === true) {
      type = 'Animated Sticker';
    } else {
      type = 'Not Animated Sticker';
    }

    let msg = `
𝗧𝗢𝗫𝗜𝗖-𝗠𝗗

◈━━━━━━━━━━━━━━━━◈
│❒ Stickers-DL
│❒ Name: ${stickers.data.result.name}
│❒ Type: ${type}
│❒ Length: ${(stickers.data.result.stickers).length}
│❒ Status: Downloading...
◈━━━━━━━━━━━━━━━━◈`;

    console.log(`[DEBUG] telesticker: Sending initial message`);
    await repondre(msg);

    for (let i = 0; i < (stickers.data.result.stickers).length; i++) {
      console.log(`[DEBUG] telesticker: Fetching sticker ${i + 1}/${(stickers.data.result.stickers).length}`);
      let file = await axios.get(`https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getFile?file_id=${stickers.data.result.stickers[i].file_id}`);

      let buffer = await axios({
        method: 'get',
        url: `https://api.telegram.org/file/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/${file.data.result.file_path}`,
        responseType: 'arraybuffer',
      });

      console.log(`[DEBUG] telesticker: Creating sticker ${i + 1}`);
      const sticker = new Sticker(buffer.data, {
        pack: nomAuteurMessage,
        author: "Toxic-𝗠𝗗",
        type: StickerTypes.FULL,
        categories: ['🤩', '🎉'],
        id: '12345',
        quality: 50,
        background: '#000000'
      });

      const stickerBuffer = await sticker.toBuffer();
      console.log(`[DEBUG] telesticker: Sending sticker ${i + 1}`);
      await zk.sendMessage(dest, { sticker: stickerBuffer }, { quoted: ms });
    }

    console.log(`[DEBUG] telesticker: All stickers sent successfully`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM, ${ms.pushName || "User"}! 😈 All stickers downloaded! You’re a legend! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] telesticker: Error: ${e.message}`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ GARBAGE SYSTEM, ${ms.pushName || "User"}! 😤 Failed to grab stickers: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: "crew", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, auteurMessage, superUser, auteurMsgRepondu, msgRepondu } = commandeOptions;

  console.log(`[DEBUG] crew command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] crew: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash heap! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] crew: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC LOSER! 😤 Only mods can create groups! Get out! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] crew: No group name provided`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 No group name? Stop wasting my time! 📝\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!msgRepondu) {
    console.log(`[DEBUG] crew: No member mentioned`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU FORGOT TO TAG SOMEONE, ${ms.pushName || "User"}! 😤 Mention a member! 📝\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  const name = arg.join(" ");
  try {
    console.log(`[DEBUG] crew: Creating group: ${name}`);
    const group = await zk.groupCreate(name, [auteurMessage, auteurMsgRepondu]);
    console.log(`[DEBUG] crew: Created group with ID: ${group.gid}`);

    await zk.sendMessage(group.id, { text: `𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Welcome to ${name}! 😈 Let’s dominate! 💥\n◈━━━━━━━━━━━━━━━━◈` });
    console.log(`[DEBUG] crew: Group creation successful`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 Group ${name} created! You’re the king! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] crew: Error: ${e.message}`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Failed to create group: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: "left", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage } = commandeOptions;

  console.log(`[DEBUG] left command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] left: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this junk! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!verifGroupe) {
    console.log(`[DEBUG] left: Not a group chat`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU IDIOT! 😤 This ain’t a group! Get to one! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] left: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU DARE, ${ms.pushName || "User"}? 😤 Only the owner can make me leave! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  try {
    console.log(`[DEBUG] left: Bot leaving group`);
    await zk.groupLeave(dest);
    console.log(`[DEBUG] left: Successfully left group`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 I’m outta this group! Peace out! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] left: Error: ${e.message}`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS SUCKS, ${ms.pushName || "User"}! 😤 Couldn’t leave: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: "join", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage } = commandeOptions;

  console.log(`[DEBUG] join command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] join: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] join: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU WORTHLESS FOOL! 😤 Only the owner can make me join! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] join: No link provided`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 No group link? Stop messing around! 📝\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  try {
    let result = arg[0].split('https://chat.whatsapp.com/')[1];
    console.log(`[DEBUG] join: Joining group with invite code: ${result}`);
    await zk.groupAcceptInvite(result);
    console.log(`[DEBUG] join: Successfully joined group`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 I’m in the group! Let’s dominate! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] join: Error: ${e.message}`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Failed to join: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: "jid", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage, auteurMsgRepondu } = commandeOptions;

  console.log(`[DEBUG] jid command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] jid: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] jid: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC LOSER! 😤 Only the owner can see JIDs! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  let jid;
  if (!msgRepondu) {
    jid = dest;
  } else {
    jid = auteurMsgRepondu;
  }

  console.log(`[DEBUG] jid: Sending JID: ${jid}`);
  await zk.sendMessage(dest, { text: `𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ JID: ${jid}\n│❒ BOOM! 😈 Got it! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈` }, { quoted: ms });
  console.log(`[DEBUG] jid: JID sent successfully`);
});

zokou({ nomCom: "block", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage, auteurMsgRepondu } = commandeOptions;

  console.log(`[DEBUG] block command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] block: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] block: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU WORTHLESS FOOL! 😤 Only the owner can block users! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  let jid;
  if (!msgRepondu) {
    if (verifGroupe) {
      console.log(`[DEBUG] block: No user mentioned in group`);
      repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 Tag someone to block, idiot! 📝\n◈━━━━━━━━━━━━━━━━◈`);
      return;
    }
    jid = dest;
  } else {
    jid = auteurMsgRepondu;
  }

  try {
    console.log(`[DEBUG] block: Blocking user: ${jid}`);
    await zk.updateBlockStatus(jid, "block");
    console.log(`[DEBUG] block: User blocked successfully`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 User ${jid} blocked! They’re gone! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] block: Error: ${e.message}`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Couldn’t block: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: "unblock", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage, auteurMsgRepondu } = commandeOptions;

  console.log(`[DEBUG] unblock command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] unblock: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] unblock: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC LOSER! 😤 Only the owner can unblock users! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  let jid;
  if (!msgRepondu) {
    if (verifGroupe) {
      console.log(`[DEBUG] unblock: No user mentioned in group`);
      repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 Tag someone to unblock, idiot! 📝\n◈━━━━━━━━━━━━━━━━◈`);
      return;
    }
    jid = dest;
  } else {
    jid = auteurMsgRepondu;
  }

  try {
    console.log(`[DEBUG] unblock: Unblocking user: ${jid}`);
    await zk.updateBlockStatus(jid, "unblock");
    console.log(`[DEBUG] unblock: User unblocked successfully`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 User ${jid} unblocked! They’re back! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
  } catch (e) {
    console.log(`[DEBUG] unblock: Error: ${e.message}`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Couldn’t unblock: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: "kickall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { auteurMessage, ms, repondre, arg, verifGroupe, nomGroupe, infosGroupe, nomAuteurMessage, verifAdmin, superUser, prefixe } = commandeOptions;

  console.log(`[DEBUG] kickall command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] kickall: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  const metadata = await zk.groupMetadata(dest);

  if (!verifGroupe) {
    console.log(`[DEBUG] kickall: Not a group chat`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU IDIOT! 😤 This command is for groups only! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (superUser || auteurMessage == metadata.owner) {
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Non-admin members will be yeeted from ${nomGroupe}! 😈 You’ve got 5 seconds to back out by restarting the bot! ⚠️\n◈━━━━━━━━━━━━━━━━◈`);
    await sleep(5000);

    let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
    try {
      let users = membresGroupe.filter((member) => !member.admin);
      console.log(`[DEBUG] kickall: Removing ${users.length} non-admin members`);

      for (const membre of users) {
        console.log(`[DEBUG] kickall: Removing user: ${membre.id}`);
        await zk.groupParticipantsUpdate(dest, [membre.id], "remove");
        await sleep(500);
      }

      console.log(`[DEBUG] kickall: All non-admin members removed successfully`);
      repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 All non-admins kicked from ${nomGroupe}! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
    } catch (e) {
      console.log(`[DEBUG] kickall: Error: ${e.message}`);
      repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 I need admin rights to kick: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    }
  } else {
    console.log(`[DEBUG] kickall: User is not a superuser or group owner`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC FOOL! 😤 Only the group owner can kick all! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: 'ban', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, auteurMsgRepondu, msgRepondu, repondre, prefixe, superUser } = commandeOptions;

  console.log(`[DEBUG] ban command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] ban: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] ban: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC LOSER! 😤 Only the owner can ban users! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] ban: No arguments provided`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 Use ${prefixe}ban add/del and tag someone, idiot! 📝\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (msgRepondu) {
    switch (arg.join(' ')) {
      case 'add':
        try {
          let youareban = await isUserBanned(auteurMsgRepondu);
          if (youareban) {
            console.log(`[DEBUG] ban: User is already banned`);
            repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS FOOL ${auteurMsgRepondu} IS ALREADY BANNED! 😤 Try harder! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
            return;
          }

          console.log(`[DEBUG] ban: Adding user to ban list: ${auteurMsgRepondu}`);
          await addUserToBanList(auteurMsgRepondu);
          repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 User ${auteurMsgRepondu} banned! They’re toast! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
        } catch (e) {
          console.log(`[DEBUG] ban: Error adding user: ${e.message}`);
          repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Failed to ban: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        }
        break;

      case 'del':
        try {
          let estbanni = await isUserBanned(auteurMsgRepondu);
          if (estbanni) {
            console.log(`[DEBUG] ban: Removing user from ban list: ${auteurMsgRepondu}`);
            await removeUserFromBanList(auteurMsgRepondu);
            repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 User ${auteurMsgRepondu} is free! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
          } else {
            console.log(`[DEBUG] ban: User is not banned`);
            repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS FOOL ${auteurMsgRepondu} ISN’T BANNED! 😤 Try again! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
          }
        } catch (e) {
          console.log(`[DEBUG] ban: Error removing user: ${e.message}`);
          repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Failed to unban: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        }
        break;

      default:
        console.log(`[DEBUG] ban: Invalid option`);
        repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU IDIOT, ${ms.pushName || "User"}! 😤 Use ${prefixe}ban add/del, not that nonsense! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        break;
    }
  } else {
    console.log(`[DEBUG] ban: No user mentioned`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 Tag someone to ban, moron! 📝\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: 'bangroup', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, auteurMsgRepondu, msgRepondu, repondre, prefixe, superUser, verifGroupe } = commandeOptions;

  console.log(`[DEBUG] bangroup command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] bangroup: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] bangroup: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC LOSER! 😤 Only the owner can ban groups! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!verifGroupe) {
    console.log(`[DEBUG] bangroup: Not a group chat`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU IDIOT! 😤 This command is for groups only! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] bangroup: No arguments provided`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 Use ${prefixe}bangroup add/del, moron! 📝\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  try {
    const groupalreadyBan = await isGroupBanned(dest);

    switch (arg.join(' ')) {
      case 'add':
        if (groupalreadyBan) {
          console.log(`[DEBUG] bangroup: Group is already banned`);
          repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS GROUP IS ALREADY BANNED! 😤 Try harder! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
          return;
        }

        console.log(`[DEBUG] bangroup: Adding group to ban list: ${dest}`);
        await addGroupToBanList(dest);
        repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 Group banned! It’s done! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
        break;

      case 'del':
        if (groupalreadyBan) {
          console.log(`[DEBUG] bangroup: Removing group from ban list: ${dest}`);
          await removeGroupFromBanList(dest);
          repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 Group is free! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
        } else {
          console.log(`[DEBUG] bangroup: Group is not banned`);
          repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS GROUP ISN’T BANNED! 😤 Try again! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        }
        break;

      default:
        console.log(`[DEBUG] bangroup: Invalid option`);
        repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU IDIOT, ${ms.pushName || "User"}! 😤 Use ${prefixe}bangroup add/del, not that nonsense! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        break;
    }
  } catch (e) {
    console.log(`[DEBUG] bangroup: Error: ${e.message}`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Failed: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: 'onlyadmin', categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, auteurMsgRepondu, msgRepondu, repondre, prefixe, superUser, verifGroupe, verifAdmin } = commandeOptions;

  console.log(`[DEBUG] onlyadmin command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] onlyadmin: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (superUser || verifAdmin) {
    if (!verifGroupe) {
      console.log(`[DEBUG] onlyadmin: Not a group chat`);
      repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU IDIOT! 😤 This command is for groups only! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
      return;
    }

    if (!arg[0]) {
      console.log(`[DEBUG] onlyadmin: No arguments provided`);
      repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 Use ${prefixe}onlyadmin add/del, moron! 📝\n◈━━━━━━━━━━━━━━━━◈`);
      return;
    }

    try {
      const groupalreadyBan = await isGroupOnlyAdmin(dest);

      switch (arg.join(' ')) {
        case 'add':
          if (groupalreadyBan) {
            console.log(`[DEBUG] onlyadmin: Group is already in onlyadmin mode`);
            repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS GROUP IS ALREADY IN ONLYADMIN MODE! 😤 Try harder! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
            return;
          }

          console.log(`[DEBUG] onlyadmin: Adding group to onlyadmin list: ${dest}`);
          await addGroupToOnlyAdminList(dest);
          repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 Group set to onlyadmin mode! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
          break;

        case 'del':
          if (groupalreadyBan) {
            console.log(`[DEBUG] onlyadmin: Removing group from onlyadmin list: ${dest}`);
            await removeGroupFromOnlyAdminList(dest);
            repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 Group is free from onlyadmin mode! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
          } else {
            console.log(`[DEBUG] onlyadmin: Group is not in onlyadmin mode`);
            repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS GROUP ISN’T IN ONLYADMIN MODE! 😤 Try again! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
          }
          break;

        default:
          console.log(`[DEBUG] onlyadmin: Invalid option`);
          repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU IDIOT, ${ms.pushName || "User"}! 😤 Use ${prefixe}onlyadmin add/del, not that nonsense! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
          break;
      }
    } catch (e) {
      console.log(`[DEBUG] onlyadmin: Error: ${e.message}`);
      repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Failed: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    }
  } else {
    console.log(`[DEBUG] onlyadmin: User is not an admin or superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC FOOL! 😤 You’re not an admin or owner! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
  }
});

zokou({ nomCom: 'sudo', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, auteurMsgRepondu, msgRepondu, repondre, prefixe, superUser } = commandeOptions;

  console.log(`[DEBUG] sudo command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!isBotConnected(zk)) {
    console.log(`[DEBUG] sudo: Bot not connected`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YO, ${ms.pushName || "User"}! 😤 I’m offline! Restart this trash! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] sudo: User is not a superuser`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU PATHETIC LOSER! 😤 Only the owner can manage sudo! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] sudo: No arguments provided`);
    repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 Use ${prefixe}sudo add/del and tag someone, idiot! 📝\n◈━━━━━━━━━━━━━━━━◈`);
    return;
  }

  if (msgRepondu) {
    switch (arg.join(' ')) {
      case 'add':
        try {
          let youaresudo = await issudo(auteurMsgRepondu);
          if (youaresudo) {
            console.log(`[DEBUG] sudo: User is already sudo`);
            repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS FOOL ${auteurMsgRepondu} IS ALREADY SUDO! 😤 Try harder! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
            return;
          }

          console.log(`[DEBUG] sudo: Adding user to sudo list: ${auteurMsgRepondu}`);
          await addSudoNumber(auteurMsgRepondu);
          repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 User ${auteurMsgRepondu} is now sudo! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━�Cv`);
        } catch (e) {
          console.log(`[DEBUG] sudo: Error adding user: ${e.message}`);
          repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Failed to add sudo: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        }
        break;

      case 'del':
        try {
          let estsudo = await issudo(auteurMsgRepondu);
          if (estsudo) {
            console.log(`[DEBUG] sudo: Removing user from sudo list: ${auteurMsgRepondu}`);
            await removeSudoNumber(auteurMsgRepondu);
            repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! 😈 User ${auteurMsgRepondu} is no longer sudo! 💪\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`);
          } else {
            console.log(`[DEBUG] sudo: User is not sudo`);
            repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS FOOL ${auteurMsgRepondu} ISN’T SUDO! 😤 Try again! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
          }
        } catch (e) {
          console.log(`[DEBUG] sudo: Error removing user: ${e.message}`);
          repondre(`𝗧𝗢𝗫𝗜𝗖-𝗠𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ THIS IS GARBAGE, ${ms.pushName || "User"}! 😤 Failed to remove sudo: ${e.message}! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        }
        break;

      default:
        console.log(`[DEBUG] sudo: Invalid option`);
        repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ YOU IDIOT, ${ms.pushName || "User"}! 😤 Use ${prefixe}sudo add/del, not that nonsense! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        break;
    }
  } else {
    console.log(`[DEBUG] sudo: No user mentioned`);
    repondre(`𝗧𝗢𝗫𝗜𝗖_M𝗗\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ HEY, ${ms.pushName || "User"}! 😡 Tag someone for sudo, moron! 📝\n◈━━━━━━━━━━━━━━━━◈`);
  }
});