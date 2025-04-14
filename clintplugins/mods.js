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

zokou({ nomCom: "telesticker", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, nomAuteurMessage, superUser } = commandeOptions;

  console.log(`[DEBUG] telesticker command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!superUser) {
    console.log(`[DEBUG] telesticker: User is not a superuser`);
    repondre('𝐎𝐧𝐥𝐲 𝐌𝐨𝐝𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 🚫');
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] telesticker: No link provided`);
    repondre("𝐏𝐮𝐭 𝐚 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐥𝐢𝐧𝐤 📝");
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
      type = '𝐀𝐧𝐢𝐦𝐚𝐭𝐞𝐝 𝐒𝐭𝐢𝐜𝐤𝐞𝐫';
    } else {
      type = '𝐍𝐨𝐭 𝐀𝐧𝐢𝐦𝐚𝐭𝐞𝐝 𝐒𝐭𝐢𝐜𝐤𝐞𝐫';
    }

    let msg = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗣𝗼𝗽𝗸𝗶𝗱-𝗦𝘁𝗶𝗰𝗸𝗲𝗿𝘀-𝗗𝗟
│❒ 𝗡𝗮𝗺𝗲: ${stickers.data.result.name}
│❒ 𝗧𝘆𝗽𝗲: ${type}
│❒ 𝗟𝗲𝗻𝗴𝘁𝗵: ${(stickers.data.result.stickers).length}
│❒ 𝗦𝘁𝗮𝘁𝘂𝘀: 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠...
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
        author: "𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃",
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
  } catch (e) {
    console.log(`[DEBUG] telesticker: Error: ${e}`);
    repondre(`𝐖𝐞 𝐠𝐨𝐭 𝐚𝐧 𝐞𝐫𝐫𝐨𝐫: ${e.message}`);
  }
});

zokou({ nomCom: "crew", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, auteurMessage, superUser, auteurMsgRepondu, msgRepondu } = commandeOptions;

  console.log(`[DEBUG] crew command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!superUser) {
    console.log(`[DEBUG] crew: User is not a superuser`);
    repondre("𝐎𝐧𝐥𝐲 𝐦𝐨𝐝𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 🚫");
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] crew: No group name provided`);
    repondre('𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐧𝐚𝐦𝐞 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐭𝐨 𝐜𝐫𝐞𝐚𝐭𝐞 📝');
    return;
  }

  if (!msgRepondu) {
    console.log(`[DEBUG] crew: No member mentioned`);
    repondre('𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐚 𝐦𝐞𝐦𝐛𝐞𝐫 𝐭𝐨 𝐚𝐝𝐝 📝');
    return;
  }

  const name = arg.join(" ");
  try {
    console.log(`[DEBUG] crew: Creating group: ${name}`);
    const group = await zk.groupCreate(name, [auteurMessage, auteurMsgRepondu]);
    console.log(`[DEBUG] crew: Created group with ID: ${group.gid}`);

    await zk.sendMessage(group.id, { text: `𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐮𝐞 𝐝𝐚𝐧𝐬 ${name} 🎉` });
    console.log(`[DEBUG] crew: Group creation successful`);
    repondre(`𝐆𝐫𝐨𝐮𝐩 𝐜𝐫𝐞𝐚𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲: ${name} ✅`);
  } catch (e) {
    console.log(`[DEBUG] crew: Error: ${e}`);
    repondre(`𝐄𝐫𝐫𝐨𝐫 𝐜𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐠𝐫𝐨𝐮𝐩: ${e.message}`);
  }
});

zokou({ nomCom: "left", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage } = commandeOptions;

  console.log(`[DEBUG] left command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!verifGroupe) {
    console.log(`[DEBUG] left: Not a group chat`);
    repondre("𝐆𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲 🚫");
    return;
  }

  if (!superUser) {
    console.log(`[DEBUG] left: User is not a superuser`);
    repondre("𝐎𝐫𝐝𝐞𝐫 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐨𝐰𝐧𝐞𝐫 🚫");
    return;
  }

  try {
    console.log(`[DEBUG] left: Bot leaving group`);
    await zk.groupLeave(dest);
    console.log(`[DEBUG] left: Successfully left group`);
    repondre(`𝐋𝐞𝐟𝐭 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 ✅`);
  } catch (e) {
    console.log(`[DEBUG] left: Error: ${e}`);
    repondre(`𝐄𝐫𝐫𝐨𝐫 𝐥𝐞𝐚𝐯𝐢𝐧𝐠 𝐠𝐫𝐨𝐮𝐩: ${e.message}`);
  }
});

zokou({ nomCom: "join", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage } = commandeOptions;

  console.log(`[DEBUG] join command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!superUser) {
    console.log(`[DEBUG] join: User is not a superuser`);
    repondre("𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 🚫");
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] join: No link provided`);
    repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐧𝐤 📝");
    return;
  }

  try {
    let result = arg[0].split('https://chat.whatsapp.com/')[1];
    console.log(`[DEBUG] join: Joining group with invite code: ${result}`);
    await zk.groupAcceptInvite(result);
    console.log(`[DEBUG] join: Successfully joined group`);
    repondre(`𝐒𝐮𝐜𝐜𝐞𝐬𝐬 ✅`);
  } catch (e) {
    console.log(`[DEBUG] join: Error: ${e}`);
    repondre('𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐞𝐫𝐫𝐨𝐫 🚫');
  }
});

zokou({ nomCom: "jid", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage, auteurMsgRepondu } = commandeOptions;

  console.log(`[DEBUG] jid command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!superUser) {
    console.log(`[DEBUG] jid: User is not a superuser`);
    repondre("𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 🚫");
    return;
  }

  let jid;
  if (!msgRepondu) {
    jid = dest;
  } else {
    jid = auteurMsgRepondu;
  }

  console.log(`[DEBUG] jid: Sending JID: ${jid}`);
  await zk.sendMessage(dest, { text: jid }, { quoted: ms });
  console.log(`[DEBUG] jid: JID sent successfully`);
});

zokou({ nomCom: "block", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage, auteurMsgRepondu } = commandeOptions;

  console.log(`[DEBUG] block command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!superUser) {
    console.log(`[DEBUG] block: User is not a superuser`);
    repondre("𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 🚫");
    return;
  }

  let jid;
  if (!msgRepondu) {
    if (verifGroupe) {
      console.log(`[DEBUG] block: No user mentioned in group`);
      repondre('𝐁𝐞 𝐬𝐮𝐫𝐞 𝐭𝐨 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐭𝐡𝐞 𝐩𝐞𝐫𝐬𝐨𝐧 𝐭𝐨 𝐛𝐥𝐨𝐜𝐤 📝');
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
    repondre('𝐒𝐮𝐜𝐜𝐞𝐬 ✅');
  } catch (e) {
    console.log(`[DEBUG] block: Error: ${e}`);
    repondre(`𝐄𝐫𝐫𝐨𝐫 𝐛𝐥𝐨𝐜𝐤𝐢𝐧𝐠 𝐮𝐬𝐞𝐫: ${e.message}`);
  }
});

zokou({ nomCom: "unblock", categorie: "Mods" }, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre, verifGroupe, msgRepondu, verifAdmin, superUser, auteurMessage, auteurMsgRepondu } = commandeOptions;

  console.log(`[DEBUG] unblock command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!superUser) {
    console.log(`[DEBUG] unblock: User is not a superuser`);
    repondre("𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 🚫");
    return;
  }

  let jid;
  if (!msgRepondu) {
    if (verifGroupe) {
      console.log(`[DEBUG] unblock: No user mentioned in group`);
      repondre('𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐭𝐡𝐞 𝐩𝐞𝐫𝐬𝐨𝐧 𝐭𝐨 𝐛𝐞 𝐮𝐧𝐥𝐨𝐜𝐤𝐞𝐝 📝');
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
    repondre('𝐒𝐮𝐜𝐜𝐞𝐬 ✅');
  } catch (e) {
    console.log(`[DEBUG] unblock: Error: ${e}`);
    repondre(`𝐄𝐫𝐫𝐨𝐫 𝐮𝐧𝐛𝐥𝐨𝐜𝐤𝐢𝐧𝐠 𝐮𝐬𝐞𝐫: ${e.message}`);
  }
});

zokou({ nomCom: "kickall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { auteurMessage, ms, repondre, arg, verifGroupe, nomGroupe, infosGroupe, nomAuteurMessage, verifAdmin, superUser, prefixe } = commandeOptions;

  console.log(`[DEBUG] kickall command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  const metadata = await zk.groupMetadata(dest);

  if (!verifGroupe) {
    console.log(`[DEBUG] kickall: Not a group chat`);
    repondre("✋🏿 ✋🏿 𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 ❌");
    return;
  }

  if (superUser || auteurMessage == metadata.owner) {
    repondre('𝐍𝐨𝐧-𝐚𝐝𝐦𝐢𝐧 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐫𝐨�{m 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩. 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝟓 𝐬𝐞𝐜𝐨𝐧𝐝𝐬 𝐭𝐨 𝐫𝐞𝐜𝐥𝐚𝐢𝐦 𝐲𝐨𝐮𝐫 𝐜𝐡𝐨𝐢𝐜𝐞 𝐛𝐲 𝐫𝐞𝐬𝐭𝐚𝐫𝐭𝐢𝐧𝐠 𝐭𝐡𝐞 𝐛𝐨𝐭. ⚠️');
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
      repondre('𝐀𝐥𝐥 𝐧𝐨𝐧-𝐚𝐝𝐦𝐢𝐧 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐡𝐚𝐯𝐞 𝐛𝐞𝐞𝐧 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 ✅');
    } catch (e) {
      console.log(`[DEBUG] kickall: Error: ${e}`);
      repondre("𝐈 𝐧𝐞𝐞𝐝 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐢𝐨𝐧 𝐫𝐢𝐠𝐡𝐭𝐬 𝐭𝐨 𝐩𝐞𝐫𝐟𝐨𝐫�{m 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧 🚫");
    }
  } else {
    console.log(`[DEBUG] kickall: User is not a superuser or group owner`);
    repondre("𝐎𝐫𝐝𝐞𝐫 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐨𝐰𝐧𝐞𝐫 𝐟𝐨𝐫 𝐬𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐫�{e𝐚𝐬𝐨𝐧𝐬 🚫");
  }
});

zokou({ nomCom: 'ban', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, auteurMsgRepondu, msgRepondu, repondre, prefixe, superUser } = commandeOptions;

  console.log(`[DEBUG] ban command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!superUser) {
    console.log(`[DEBUG] ban: User is not a superuser`);
    repondre('𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐨𝐧𝐥𝐲 𝐚𝐥𝐥𝐨𝐰𝐞𝐝 𝐭𝐨 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 🚫');
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] ban: No arguments provided`);
    repondre(`𝐌𝐞𝐧𝐭𝐢𝐨𝐧 𝐭𝐡𝐞 𝐯𝐢𝐜𝐭𝐢𝐦 𝐛𝐲 𝐭𝐲𝐩𝐢𝐧𝐠 ${prefixe}𝐛𝐚𝐧 𝐚𝐝𝐝/𝐝𝐞𝐥 𝐭𝐨 𝐛𝐚𝐧/𝐮𝐧𝐛𝐚𝐧 𝐭𝐡𝐞 𝐯𝐢𝐜𝐭𝐢�{m 📝`);
    return;
  }

  if (msgRepondu) {
    switch (arg.join(' ')) {
      case 'add':
        let youareban = await isUserBanned(auteurMsgRepondu);
        if (youareban) {
          console.log(`[DEBUG] ban: User is already banned`);
          repondre('𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐢𝐬 𝐚𝐥𝐫𝐞�{a𝐝𝐲 𝐛𝐚𝐧𝐧𝐞𝐝 🚫');
          return;
        }

        console.log(`[DEBUG] ban: Adding user to ban list: ${auteurMsgRepondu}`);
        await addUserToBanList(auteurMsgRepondu);
        repondre('𝐔𝐬𝐞𝐫 𝐛𝐚𝐧𝐧𝐞�{d 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 ✅');
        break;

      case 'del':
        let estbanni = await isUserBanned(auteurMsgRepondu);
        if (estbanni) {
          console.log(`[DEBUG] ban: Removing user from ban list: ${auteurMsgRepondu}`);
          await removeUserFromBanList(auteurMsgRepondu);
          repondre('𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐢𝐬 𝐧𝐨𝐰 𝐟𝐫𝐞𝐞 ✅');
        } else {
          console.log(`[DEBUG] ban: User is not banned`);
          repondre('𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐢𝐬 𝐧𝐨𝐭 𝐛𝐚𝐧𝐧𝐞�{d 🚫');
        }
        break;

      default:
        console.log(`[DEBUG] ban: Invalid option`);
        repondre('𝐁𝐚𝐝 𝐨𝐩𝐭𝐢𝐨𝐧 🚫');
        break;
    }
  } else {
    console.log(`[DEBUG] ban: No user mentioned`);
    repondre('𝐌𝐞𝐧𝐭𝐢�{o𝐧 𝐭𝐡𝐞 𝐯𝐢𝐜𝐭𝐢�{m 📝');
  }
});

zokou({ nomCom: 'bangroup', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, auteurMsgRepondu, msgRepondu, repondre, prefixe, superUser, verifGroupe } = commandeOptions;

  console.log(`[DEBUG] bangroup command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!superUser) {
    console.log(`[DEBUG] bangroup: User is not a superuser`);
    repondre('𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧�{d 𝐢𝐬 𝐨𝐧𝐥𝐲 𝐚𝐥𝐥𝐨𝐰𝐞�{d 𝐭𝐨 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 🚫');
    return;
  }

  if (!verifGroupe) {
    console.log(`[DEBUG] bangroup: Not a group chat`);
    repondre('𝐎𝐫𝐝𝐞�{r 𝐫𝐞𝐬𝐞𝐫𝐯𝐚𝐭𝐢𝐨�{n 𝐟𝐨�{r 𝐠𝐫�{o𝐮𝐩𝐬 🚫');
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] bangroup: No arguments provided`);
    repondre(`𝐓𝐲𝐩𝐞 ${prefixe}𝐛𝐚𝐧𝐠𝐫𝐨𝐮𝐩 𝐚𝐝𝐝/𝐝𝐞�{l 𝐭𝐨 𝐛𝐚𝐧/𝐮𝐧𝐛𝐚𝐧 𝐭𝐡𝐞 𝐠𝐫�{o𝐮𝐩 📝`);
    return;
  }

  const groupalreadyBan = await isGroupBanned(dest);

  switch (arg.join(' ')) {
    case 'add':
      if (groupalreadyBan) {
        console.log(`[DEBUG] bangroup: Group is already banned`);
        repondre('𝐓𝐡𝐢�{s 𝐠𝐫𝐨𝐮�{p 𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝�{y 𝐛𝐚𝐧𝐧𝐞�{d 🚫');
        return;
      }

      console.log(`[DEBUG] bangroup: Adding group to ban list: ${dest}`);
      await addGroupToBanList(dest);
      repondre('𝐆𝐫�{o𝐮𝐩 𝐛𝐚𝐧𝐧𝐞�{d 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥�{y ✅');
      break;

    case 'del':
      if (groupalreadyBan) {
        console.log(`[DEBUG] bangroup: Removing group from ban list: ${dest}`);
        await removeGroupFromBanList(dest);
        repondre('𝐓𝐡𝐢�{s 𝐠𝐫�{o𝐮𝐩 𝐢𝐬 𝐧�{o𝐰 𝐟𝐫𝐞�{e ✅');
      } else {
        console.log(`[DEBUG] bangroup: Group is not banned`);
        repondre('𝐓𝐡𝐢�{s 𝐠𝐫�{o𝐮𝐩 𝐢𝐬 𝐧�{o𝐭 𝐛𝐚𝐧𝐧𝐞�{d 🚫');
      }
      break;

    default:
      console.log(`[DEBUG] bangroup: Invalid option`);
      repondre('𝐁𝐚�{d 𝐨𝐩𝐭𝐢�{o𝐧 🚫');
      break;
  }
});

zokou({ nomCom: 'onlyadmin', categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, auteurMsgRepondu, msgRepondu, repondre, prefixe, superUser, verifGroupe, verifAdmin } = commandeOptions;

  console.log(`[DEBUG] onlyadmin command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (superUser || verifAdmin) {
    if (!verifGroupe) {
      console.log(`[DEBUG] onlyadmin: Not a group chat`);
      repondre('𝐎𝐫𝐝𝐞�{r 𝐫𝐞𝐬𝐞𝐫𝐯𝐚𝐭𝐢�{o𝐧 𝐟�{o𝐫 𝐠𝐫�{o𝐮𝐩�{s 🚫');
      return;
    }

    if (!arg[0]) {
      console.log(`[DEBUG] onlyadmin: No arguments provided`);
      repondre(`𝐓𝐲𝐩�{e ${prefixe}𝐨𝐧𝐥𝐲𝐚𝐝𝐦𝐢�{n 𝐚𝐝𝐝/𝐝�{e�{l 𝐭�{o 𝐛𝐚𝐧/𝐮𝐧𝐛�{a𝐧 𝐭𝐡�{e 𝐠𝐫�{o𝐮𝐩 📝`);
      return;
    }

    const groupalreadyBan = await isGroupOnlyAdmin(dest);

    switch (arg.join(' ')) {
      case 'add':
        if (groupalreadyBan) {
          console.log(`[DEBUG] onlyadmin: Group is already in onlyadmin mode`);
          repondre('𝐓𝐡𝐢�{s 𝐠�{r𝐨𝐮�{p 𝐢�{s 𝐚𝐥�{r𝐞𝐚�{d�{y 𝐢�{n 𝐨𝐧�{l𝐲𝐚�{d𝐦𝐢�{n 𝐦�{o𝐝�{e 🚫');
          return;
        }

        console.log(`[DEBUG] onlyadmin: Adding group to onlyadmin list: ${dest}`);
        await addGroupToOnlyAdminList(dest);
        repondre('𝐆�{r𝐨𝐮�{p 𝐬�{e𝐭 𝐭�{o 𝐨𝐧�{l𝐲𝐚�{d𝐦𝐢�{n �{m𝐨𝐝�{e �{s𝐮𝐜�{c𝐞�{s�{s𝐟�{u𝐥�{l�{y ✅');
        break;

      case 'del':
        if (groupalreadyBan) {
          console.log(`[DEBUG] onlyadmin: Removing group from onlyadmin list: ${dest}`);
          await removeGroupFromOnlyAdminList(dest);
          repondre('𝐓�{h𝐢�{s 𝐠�{r�{o𝐮�{p 𝐢�{s �{n�{o𝐰 𝐟�{r�{e�{e ✅');
        } else {
          console.log(`[DEBUG] onlyadmin: Group is not in onlyadmin mode`);
          repondre('𝐓�{h𝐢�{s �{g𝐫�{o𝐮�{p �{i�{s �{n�{o𝐭 �{i�{n �{o𝐧�{l�{y𝐚�{d𝐦�{i𝐧 �{m�{o𝐝�{e 🚫');
        }
        break;

      default:
        console.log(`[DEBUG] onlyadmin: Invalid option`);
        repondre('�{B𝐚�{d �{o𝐩�{t𝐢�{o𝐧 🚫');
        break;
    }
  } else {
    console.log(`[DEBUG] onlyadmin: User is not an admin or superuser`);
    repondre('�{Y𝐨�{u �{a𝐫�{e �{n�{o𝐭 �{e𝐧�{t𝐢�{t𝐥�{e�{d �{t�{o �{t�{h𝐢�{s �{o�{r�{d�{e�{r 🚫');
  }
});

zokou({ nomCom: 'sudo', categorie: 'Mods' }, async (dest, zk, commandeOptions) => {
  const { ms, arg, auteurMsgRepondu, msgRepondu, repondre, prefixe, superUser } = commandeOptions;

  console.log(`[DEBUG] sudo command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!superUser) {
    console.log(`[DEBUG] sudo: User is not a superuser`);
    repondre('�{T𝐡𝐢�{s �{c𝐨𝐦𝐦�{a𝐧�{d �{i�{s �{o𝐧�{l�{y �{a𝐥�{l�{o𝐰�{e�{d �{t�{o �{t�{h�{e �{b�{o𝐭 �{o𝐰�{n�{e�{r 🚫');
    return;
  }

  if (!arg[0]) {
    console.log(`[DEBUG] sudo: No arguments provided`);
    repondre(`�{M𝐞�{n𝐭�{i�{o�{n �{t�{h�{e �{p�{e�{r�{s�{o�{n �{b�{y �{t�{y�{p�{i�{n�{g ${prefixe}�{s�{u�{d�{o �{a�{d�{d/�{d�{e�{l 📝`);
    return;
  }

  if (msgRepondu) {
    switch (arg.join(' ')) {
      case 'add':
        let youaresudo = await issudo(auteurMsgRepondu);
        if (youaresudo) {
          console.log(`[DEBUG] sudo: User is already sudo`);
          repondre('�{T�{h�{i�{s �{u�{s�{e�{r �{i�{s �{a�{l�{r�{e�{a�{d�{y �{s�{u�{d�{o 🚫');
          return;
        }

        console.log(`[DEBUG] sudo: Adding user to sudo list: ${auteurMsgRepondu}`);
        await addSudoNumber(auteurMsgRepondu);
        repondre('�{S�{u�{c�{c�{e�{s�{s ✅');
        break;

      case 'del':
        let estsudo = await issudo(auteurMsgRepondu);
        if (estsudo) {
          console.log(`[DEBUG] sudo: Removing user from sudo list: ${auteurMsgRepondu}`);
          await removeSudoNumber(auteurMsgRepondu);
          repondre('�{T�{h�{i�{s �{u�{s�{e�{r �{i�{s �{n�{o�{w �{n�{o�{n-�{s�{u�{d�{o ✅');
        } else {
          console.log(`[DEBUG] sudo: User is not sudo`);
          repondre('�{T�{h�{i�{s �{u�{s�{e�{r �{i�{s �{n�{o�{t �{s�{u�{d�{o 🚫');
        }
        break;

      default:
        console.log(`[DEBUG] sudo: Invalid option`);
       