const { zokou } = require("../framework/zokou")
//const { getGroupe } = require("../bdd/groupe")
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const {ajouterOuMettreAJourJid,mettreAJourAction,verifierEtatJid} = require("../bdd/antilien")
const {atbajouterOuMettreAJourJid,atbverifierEtatJid} = require("../bdd/antibot")
const { search, download } = require("aptoide-scraper");
const fs = require("fs-extra");
const conf = require("../set");
const { default: axios } = require('axios');
//const { uploadImageToImgur } = require('../framework/imgur');

const TOXIC_MD = "\u{1D413}\u{1D40E}\u{1D417}\u{1D408}\u{1D402}-\u{1D40C}\u{1D403}"; // 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

zokou({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {

  const { ms, repondre, arg, verifGroupe, nomGroupe, infosGroupe, nomAuteurMessage, verifAdmin, superUser } = commandeOptions

  if (!verifGroupe) {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This command is reserved for groups only 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
    return;
  }
  let mess = arg.length > 0 ? arg.join(' ') : 'No Message Provided';
  let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
  var tag = `
  
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ *Group*: ${nomGroupe}
│❒ *Sender*: ${nomAuteurMessage}
│❒ *Message*: ${mess}
◈━━━━━━━━━━━━━━━━◈
\n

`;

  let emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$','😟','🥵','🐅']
  let random = Math.floor(Math.random() * (emoji.length - 1))

  for (const membre of membresGroupe) {
    tag += `${emoji[random]}      @${membre.id.split("@")[0]}\n`
  }

  if (verifAdmin || superUser) {
    zk.sendMessage(dest, { text: tag, mentions: membresGroupe.map((i) => i.id) }, { quoted: ms })
  } else {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This command is reserved for admins only 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
  }
});

zokou({ nomCom: "link", categorie: 'Group', reaction: "🙋" }, async (dest, zk, commandeOptions) => {
  const { repondre, nomGroupe, nomAuteurMessage, verifGroupe } = commandeOptions;

  if (!verifGroupe) {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Sorry, this command is for groups only! 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
    return;
  }

  try {
    const link = await zk.groupInviteCode(dest);
    const lien = `https://chat.whatsapp.com/${link}`;

    const mess = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Hello ${nomAuteurMessage},
│❒ Here is the group link for ${nomGroupe}:
│❒ 📎 Group Link: ${lien}
◈━━━━━━━━━━━━━━━━◈
    `;

    repondre(mess);
  } catch (e) {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Error generating group link: ${e.message} 😓
◈━━━━━━━━━━━━━━━━◈
    `);
  }
});
/** Promote a member to admin */
zokou({ nomCom: "promote", categorie: 'Group', reaction: "👨🏿‍💼" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser } = commandeOptions;

  if (!verifGroupe) {
    return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This command is for groups only 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
  }

  const membresGroupe = verifGroupe ? await infosGroupe.participants : "";

  const verifMember = (user) => {
    for (const m of membresGroupe) {
      if (m.id === user) {
        return true;
      }
    }
    return false; // Return false if member is not found
  };

  const memberAdmin = (membres) => {
    return membres.filter(m => m.admin !== null).map(m => m.id);
  };

  const admins = verifGroupe ? memberAdmin(membresGroupe) : [];
  const admin = verifGroupe ? admins.includes(auteurMsgRepondu) : false;
  const membre = verifMember(auteurMsgRepondu);
  const autAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
  const zkad = verifGroupe ? admins.includes(zk.user.id) : false; // Use zk.user.id for consistency

  try {
    if (autAdmin || superUser) {
      if (msgRepondu) {
        if (zkad) {
          if (membre) {
            if (!admin) {
              const txt = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 🎊🎊🎊 @${auteurMsgRepondu.split("@")[0]} has risen in rank!
│❒ They have been named a group administrator. ✅
◈━━━━━━━━━━━━━━━━◈
              `;
              await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "promote");
              zk.sendMessage(dest, { text: txt, mentions: [auteurMsgRepondu] });
            } else {
              return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This member is already an administrator of the group 🚫
◈━━━━━━━━━━━━━━━━◈
              `);
            }
          } else {
            return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This user is not part of the group 🚫
◈━━━━━━━━━━━━━━━━◈
            `);
          }
        } else {
          return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Sorry, I cannot perform this action because I am not an administrator of the group 😓
◈━━━━━━━━━━━━━━━━◈
          `);
        }
      } else {
        repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Please tag the member to be promoted 🚫
◈━━━━━━━━━━━━━━━━◈
        `);
      }
    } else {
      return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Sorry, I cannot perform this action because you are not an administrator of the group 🚫
◈━━━━━━━━━━━━━━━━◈
      `);
    }
  } catch (e) {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Error promoting member: ${e.message} 😓
◈━━━━━━━━━━━━━━━━◈
    `);
  }
})

// End of promote command
/** Demote a member */
zokou({ nomCom: "demote", categorie: 'Group', reaction: "👨🏿‍💼" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser } = commandeOptions;
  let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
  if (!verifGroupe) {
    return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This command is for groups only 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
  }

  const verifMember = (user) => {
    for (const m of membresGroupe) {
      if (m.id === user) {
        return true;
      }
    }
    return false; // Return false if member is not found
  }

  const memberAdmin = (membres) => {
    return membres.filter(m => m.admin !== null).map(m => m.id);
  }

  const admins = verifGroupe ? memberAdmin(membresGroupe) : '';
  let admin = verifGroupe ? admins.includes(auteurMsgRepondu) : false;
  let membre = verifMember(auteurMsgRepondu)
  let autAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
  const zkad = verifGroupe ? admins.includes(zk.user.id) : false;
  try {
    if (autAdmin || superUser) {
      if (msgRepondu) {
        if (zkad) {
          if (membre) {
            if (!admin) {
              repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This member is not a group administrator 🚫
◈━━━━━━━━━━━━━━━━◈
              `);
            } else {
              const txt = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ @${auteurMsgRepondu.split("@")[0]} has been removed from their position as a group administrator 📉
│❒ They are no longer an admin. ✅
◈━━━━━━━━━━━━━━━━◈
              `;
              await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "demote");
              zk.sendMessage(dest, { text: txt, mentions: [auteurMsgRepondu] })
            }
          } else {
            return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This user is not part of the group 🚫
◈━━━━━━━━━━━━━━━━◈
            `);
          }
        } else {
          return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Sorry, I cannot perform this action because I am not an administrator of the group 😓
◈━━━━━━━━━━━━━━━━◈
          `);
        }
      } else {
        repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Please tag the member to be demoted 🚫
◈━━━━━━━━━━━━━━━━◈
        `);
      }
    } else {
      return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Sorry, I cannot perform this action because you are not an administrator of the group 🚫
◈━━━━━━━━━━━━━━━━◈
      `);
    }
  } catch (e) {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Error demoting member: ${e.message} 😓
◈━━━━━━━━━━━━━━━━◈
    `);
  }
})

/** End of demote command */
/** Remove a member */
zokou({ nomCom: "remove", categorie: 'Group', reaction: "👨🏿‍💼" }, async (dest, zk, commandeOptions) => {
  const { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, nomAuteurMessage, auteurMessage, superUser } = commandeOptions;
  let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
  if (!verifGroupe) {
    return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This command is for groups only 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
  }

  const verifMember = (user) => {
    for (const m of membresGroupe) {
      if (m.id === user) {
        return true;
      }
    }
    return false; // Return false if member is not found
  }

  const memberAdmin = (membres) => {
    return membres.filter(m => m.admin !== null).map(m => m.id);
  }

  const admins = verifGroupe ? memberAdmin(membresGroupe) : '';
  let admin = verifGroupe ? admins.includes(auteurMsgRepondu) : false;
  let membre = verifMember(auteurMsgRepondu)
  let autAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
  const zkad = verifGroupe ? admins.includes(zk.user.id) : false;
  try {
    if (autAdmin || superUser) {
      if (msgRepondu) {
        if (zkad) {
          if (membre) {
            if (!admin) {
              const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif"
              const sticker = new Sticker(gifLink, {
                pack: 'Zokou-Md', // The pack name
                author: nomAuteurMessage, // The author name
                type: StickerTypes.FULL, // The sticker type
                categories: ['🤩', '🎉'], // The sticker category
                id: '12345', // The sticker id
                quality: 50, // The quality of the output file
                background: '#000000'
              });

              await sticker.toFile("st.webp")
              const txt = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ @${auteurMsgRepondu.split("@")[0]} has been removed from the group 🚪
│❒ Goodbye! 👋
◈━━━━━━━━━━━━━━━━◈
              `;
              await zk.sendMessage(dest, { sticker: fs.readFileSync("st.webp") }, { quoted: msgRepondu })
              await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "remove");
              zk.sendMessage(dest, { text: txt, mentions: [auteurMsgRepondu] })
              fs.unlinkSync("st.webp"); // Clean up the sticker file
            } else {
              repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This member cannot be removed because they are an administrator of the group 🚫
◈━━━━━━━━━━━━━━━━◈
              `);
            }
          } else {
            return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This user is not part of the group 🚫
◈━━━━━━━━━━━━━━━━◈
            `);
          }
        } else {
          return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Sorry, I cannot perform this action because I am not an administrator of the group 😓
◈━━━━━━━━━━━━━━━━◈
          `);
        }
      } else {
        repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Please tag the member to be removed 🚫
◈━━━━━━━━━━━━━━━━◈
        `);
      }
    } else {
      return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Sorry, I cannot perform this action because you are not an administrator of the group 🚫
◈━━━━━━━━━━━━━━━━◈
      `);
    }
  } catch (e) {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Error removing member: ${e.message} 😓
◈━━━━━━━━━━━━━━━━◈
    `);
  }
})

/** End of remove command */

zokou({ nomCom: "del", categorie: 'Group',reaction:"🧹" }, async (dest, zk, commandeOptions) => {

  const { ms, repondre, verifGroupe, auteurMsgRepondu, idBot, msgRepondu, verifAdmin, superUser } = commandeOptions;
  
  if (!msgRepondu) {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Please mention the message to delete 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
    return;
  }
  if (superUser && auteurMsgRepondu === idBot) {
    const key = {
      remoteJid: dest,
      fromMe: true,
      id: ms.message.extendedTextMessage.contextInfo.stanzaId,
    }
    await zk.sendMessage(dest, { delete: key });
    return;
  }

  if (verifGroupe) {
    if (verifAdmin || superUser) {
      try {
        const key = {
          remoteJid: dest,
          id: ms.message.extendedTextMessage.contextInfo.stanzaId,
          fromMe: false,
          participant: ms.message.extendedTextMessage.contextInfo.participant
        }
        await zk.sendMessage(dest, { delete: key });
        return;
      } catch (e) {
        repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ I need admin rights to delete this message 😓
◈━━━━━━━━━━━━━━━━◈
        `);
      }
    } else {
      repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Sorry, you are not an administrator of the group 🚫
◈━━━━━━━━━━━━━━━━◈
      `);
    }
  }
});

zokou({ nomCom: "info", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe } = commandeOptions;
  if (!verifGroupe) {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This command is reserved for groups only 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
    return;
  }

  try {
    let ppgroup;
    try {
      ppgroup = await zk.profilePictureUrl(dest, 'image');
    } catch {
      ppgroup = conf.IMAGE_MENU;
    }

    const info = await zk.groupMetadata(dest);

    let mess = {
      image: { url: ppgroup },
      caption: `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ *Group Info*
│❒ 🎐 Name: ${info.subject}
│❒ 🔩 Group's ID: ${dest}
│❒ 🔍 Description:
│❒ ${info.desc || 'No description available'}
◈━━━━━━━━━━━━━━━━◈
      `
    }

    zk.sendMessage(dest, mess, { quoted: ms })
  } catch (e) {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Error fetching group info: ${e.message} 😓
◈━━━━━━━━━━━━━━━━◈
    `);
  }
});

//------------------------------------Anti-link-------------------------------

zokou({ nomCom: "antilink", categorie: 'Group', reaction: "🔗" }, async (dest, zk, commandeOptions) => {

  const { repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This command is for groups only 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
  }
  
  if (superUser || verifAdmin) {
    const isEnabled = await verifierEtatJid(dest)
    try {
      if (!arg || !arg[0] || arg === ' ') {
        repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ *Anti-Link Usage*
│❒ antilink on - Activate the anti-link feature
│❒ antilink off - Deactivate the anti-link feature
│❒ antilink action/remove - Directly remove the link without notice
│❒ antilink action/warn - Give warnings for links
│❒ antilink action/delete - Remove the link without sanctions
│❒ Note: By default, the anti-link feature is set to delete.
◈━━━━━━━━━━━━━━━━◈
        `);
        return;
      }
     
      if (arg[0] === 'on') {
        if (isEnabled) {
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-link feature is already activated for this group 🚫
◈━━━━━━━━━━━━━━━━◈
          `);
        } else {
          await ajouterOuMettreAJourJid(dest, "yes");
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-link feature has been successfully activated ✅
◈━━━━━━━━━━━━━━━━◈
          `);
        }
      } else if (arg[0] === "off") {
        if (isEnabled) {
          await ajouterOuMettreAJourJid(dest, "no");
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-link feature has been successfully deactivated ✅
◈━━━━━━━━━━━━━━━━◈
          `);
        } else {
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-link feature is not activated for this group 🚫
◈━━━━━━━━━━━━━━━━◈
          `);
        }
      } else if (arg.join('').split("/")[0] === 'action') {
        let action = (arg.join('').split("/")[1]).toLowerCase();
        if (action === 'remove' || action === 'warn' || action === 'delete') {
          await mettreAJourAction(dest, action);
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-link action has been updated to ${action} ✅
◈━━━━━━━━━━━━━━━━◈
          `);
        } else {
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The only actions available are warn, remove, and delete 🚫
◈━━━━━━━━━━━━━━━━◈
          `);
        }
      } else {
        repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ *Anti-Link Usage*
│❒ antilink on - Activate the anti-link feature
│❒ antilink off - Deactivate the anti-link feature
│❒ antilink action/remove - Directly remove the link without notice
│❒ antilink action/warn - Give warnings for links
│❒ antilink action/delete - Remove the link without sanctions
│❒ Note: By default, the anti-link feature is set to delete.
◈━━━━━━━━━━━━━━━━◈
        `);
      }
    } catch (error) {
      repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Error managing anti-link feature: ${error.message} 😓
◈━━━━━━━━━━━━━━━━◈
      `);
    }
  } else {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ You are not authorized to use this command 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
  }
});

//------------------------------------Anti-bot-------------------------------

zokou({ nomCom: "antibot", categorie: 'Group', reaction: "😬" }, async (dest, zk, commandeOptions) => {

  const { repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ This command is for groups only 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
  }
  
  if (superUser || verifAdmin) {
    const isEnabled = await atbverifierEtatJid(dest)
    try {
      if (!arg || !arg[0] || arg === ' ') {
        repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ *Anti-Bot Usage*
│❒ antibot on - Activate the anti-bot feature
│❒ antibot off - Deactivate the anti-bot feature
│❒ antibot action/remove - Directly remove the bot message without notice
│❒ antibot action/warn - Give warnings for bot messages
│❒ antibot action/delete - Remove the bot message without sanctions
│❒ Note: By default, the anti-bot feature is set to delete.
◈━━━━━━━━━━━━━━━━◈
        `);
        return;
      }
     
      if (arg[0] === 'on') {
        if (isEnabled) {
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-bot feature is already activated for this group 🚫
◈━━━━━━━━━━━━━━━━◈
          `);
        } else {
          await atbajouterOuMettreAJourJid(dest, "yes");
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-bot feature has been successfully activated ✅
◈━━━━━━━━━━━━━━━━◈
          `);
        }
      } else if (arg[0] === "off") {
        if (isEnabled) {
          await atbajouterOuMettreAJourJid(dest, "no");
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-bot feature has been successfully deactivated ✅
◈━━━━━━━━━━━━━━━━◈
          `);
        } else {
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-bot feature is not activated for this group 🚫
◈━━━━━━━━━━━━━━━━◈
          `);
        }
      } else if (arg.join('').split("/")[0] === 'action') {
        let action = (arg.join('').split("/")[1]).toLowerCase();
        if (action === 'remove' || action === 'warn' || action === 'delete') {
          await mettreAJourAction(dest, action);
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The anti-bot action has been updated to ${action} ✅
◈━━━━━━━━━━━━━━━━◈
          `);
        } else {
          repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ The only actions available are warn, remove, and delete 🚫
◈━━━━━━━━━━━━━━━━◈
          `);
        }
      } else {
        repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ *Anti-Bot Usage*
│❒ antibot on - Activate the anti-bot feature
│❒ antibot off - Deactivate the anti-bot feature
│❒ antibot action/remove - Directly remove the bot message without notice
│❒ antibot action/warn - Give warnings for bot messages
│❒ antibot action/delete - Remove the bot message without sanctions
│❒ Note: By default, the anti-bot feature is set to delete.
◈━━━━━━━━━━━━━━━━◈
        `);
      }
    } catch (error) {
      repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Error managing anti-bot feature: ${error.message} 😓
◈━━━━━━━━━━━━━━━━◈
      `);
    }
  } else {
    repondre(`
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ You are not authorized to use this command 🚫
◈━━━━━━━━━━━━━━━━◈
    `);
  }
});


//----------------------------------------------------------------------------

zokou({ nomCom: "group", categorie: 'Group' }, async (dest, zk, commandeOptions) => {

  const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;

  if (!verifGroupe) { repondre("order reserved for group only"); return };
  if (superUser || verifAdmin) {

    if (!arg[0]) { repondre('Instructions:\n\nType group open or close'); return; }
    const option = arg.join(' ')
    switch (option) {
      case "open":
        await zk.groupSettingUpdate(dest, 'not_announcement')
        repondre('group open')
        break;
      case "close":
        await zk.groupSettingUpdate(dest, 'announcement');
        repondre('Group close successfully');
        break;
      default: repondre("Please don't invent an option")
    }

    
  } else {
    repondre("order reserved for the administratorr");
    return;
  }
 

});

zokou({ nomCom: "left", categorie: "Mods" }, async (dest, zk, commandeOptions) => {

  const { repondre, verifGroupe, superUser } = commandeOptions;
  if (!verifGroupe) { repondre("order reserved for group only"); return };
  if (!superUser) {
    repondre("command reserved for the bot owner");
    return;
  }
  await repondre('sayonnara') ;
   
  zk.groupLeave(dest)
});

zokou({ nomCom: "gname", categorie: 'Group' }, async (dest, zk, commandeOptions) => {

  const { arg, repondre, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("order reserved for administrators of the group");
    return;
  };
  if (!arg[0]) {
    repondre("Please enter the group name");
    return;
  };
   const nom = arg.join(' ')
  await zk.groupUpdateSubject(dest, nom);
    repondre(`group name refresh: *${nom}*`)

 
}) ;

zokou({ nomCom: "gdesc", categorie: 'Group' }, async (dest, zk, commandeOptions) => {

  const { arg, repondre, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("order reserved for administrators of the group");
    return;
  };
  if (!arg[0]) {
    repondre("Please enter the group description");
    return;
  };
   const nom = arg.join(' ')
  await zk.groupUpdateDescription(dest, nom);
    repondre(`group description update: *${nom}*`)

 
}) ;


zokou({ nomCom: "gpp", categorie: 'Group' }, async (dest, zk, commandeOptions) => {

  const { repondre, msgRepondu, verifAdmin } = commandeOptions;

  if (!verifAdmin) {
    repondre("order reserved for administrators of the group");
    return;
  }; 
  if (msgRepondu.imageMessage) {
    const pp = await  zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage) ;

    await zk.updateProfilePicture(dest, { url: pp })
                .then( () => {
                    zk.sendMessage(dest,{text:"Group pfp changed"})
                    fs.unlinkSync(pp)
                }).catch(() =>   zk.sendMessage(dest,{text:err})
)
        
  } else {
    repondre('Please mention an image')
  }

});

/////////////
zokou({nomCom:"tag",categorie:'Group',reaction:"🎤"},async(dest,zk,commandeOptions)=>{

  const {repondre,msgRepondu,verifGroupe,arg ,verifAdmin , superUser}=commandeOptions;

  if(!verifGroupe)  { repondre('This command is only allowed in groups.')} ;
  if (verifAdmin || superUser) { 

  let metadata = await zk.groupMetadata(dest) ;

  //console.log(metadata.participants)
 let tag = [] ;
  for (const participant of metadata.participants ) {

      tag.push(participant.id) ;
  }
  //console.log(tag)

    if(msgRepondu) {
      console.log(msgRepondu)
      let msg ;

      if (msgRepondu.imageMessage) {

        

     let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage) ;
     // console.log(msgRepondu) ;
     msg = {

       image : { url : media } ,
       caption : msgRepondu.imageMessage.caption,
       mentions :  tag
       
     }
    

      } else if (msgRepondu.videoMessage) {

        let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage) ;

        msg = {

          video : { url : media } ,
          caption : msgRepondu.videoMessage.caption,
          mentions :  tag
          
        }

      } else if (msgRepondu.audioMessage) {
    
        let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage) ;
       
        msg = {
   
          audio : { url : media } ,
          mimetype:'audio/mp4',
          mentions :  tag
           }     
        
      } else if (msgRepondu.stickerMessage) {

    
        let media  = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage)

        let stickerMess = new Sticker(media, {
          pack: 'Bmw-mdtag',
          type: StickerTypes.CROPPED,
          categories: ["🤩", "🎉"],
          id: "12345",
          quality: 70,
          background: "transparent",
        });
        const stickerBuffer2 = await stickerMess.toBuffer();
       
        msg = { sticker: stickerBuffer2 , mentions : tag}


      }  else {
          msg = {
             text : msgRepondu.conversation,
             mentions : tag
          }
      }

    zk.sendMessage(dest,msg)

    } else {

        if(!arg || !arg[0]) { repondre('Enter the text to announce or mention the message to announce');
        ; return} ;

      zk.sendMessage(
         dest,
         {
          text : arg.join(' ') ,
          mentions : tag
         }     
      )
    }

} else {
  repondre('Command reserved for administrators.')
}

});


zokou({ nomCom: "apk", reaction: "✨", categorie: "Recherche" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  try {
    const appName = arg.join(' ');
    if (!appName) {
      return repondre("*Enter the name of the application to search for*");
    }

    const searchResults = await search(appName);

    if (searchResults.length === 0) {
      return repondre("*can't find application, please enter another name*");
    }

    const appData = await download(searchResults[0].id);
    const fileSize = parseInt(appData.size);

    if (fileSize > 300) {
      return repondre("The file exceeds 300 MB, unable to download.");
    }

    const downloadLink = appData.dllink;
    const captionText =
      "『 *Bmw-Md Application* 』\n\n*Name :* " + appData.name +
      "\n*Id :* " + appData["package"] +
      "\n*Last Update :* " + appData.lastup +
      "\n*Size :* " + appData.size +
      "\n";

    const apkFileName = (appData?.["name"] || "Downloader") + ".apk";
    const filePath = apkFileName;

    const response = await axios.get(downloadLink, { 'responseType': "stream" });
    const fileWriter = fs.createWriteStream(filePath);
    response.data.pipe(fileWriter);

    await new Promise((resolve, reject) => {
      fileWriter.on('finish', resolve);
      fileWriter.on("error", reject);
    });

    const documentMessage = {
      'document': fs.readFileSync(filePath),
      'mimetype': 'application/vnd.android.package-archive',
      'fileName': apkFileName
    };

    // Utilisation d'une seule méthode sendMessage pour envoyer l'image et le document
    zk.sendMessage(dest, { image: { url: appData.icon }, caption: captionText }, { quoted: ms });
    zk.sendMessage(dest, documentMessage, { quoted: ms });

    // Supprimer le fichier après envoi
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Erreur lors du traitement de la commande apk:', error);
    repondre("*Error during apk command processing*");
  }
});





/*******************************  automute && autoummute ***************************/

const cron = require(`../bdd/cron`) ;


zokou({
      nomCom : 'automute',
      categorie : 'Group'
  } , async (dest,zk,commandeOptions) => {

      const {arg , repondre , verifAdmin } = commandeOptions ;

      if (!verifAdmin) { repondre('You are not an administrator of the group') ; return}

      group_cron = await cron.getCronById(dest) ;
      
     

      if (!arg || arg.length == 0) {

        let state ;
        if (group_cron == null || group_cron.mute_at == null) {
  
            state =  "No time set for automatic mute"
        } else {
  
          state =  `The group will be muted at ${(group_cron.mute_at).split(':')[0]} ${(group_cron.mute_at).split(':')[1]}`
        }
  
        let msg = `* *State:* ${state}
        * *Instructions:* To activate automatic mute, add the minute and hour after the command separated by ':'
        Example automute 9:30
        * To delete the automatic mute, use the command *automute del*`
        

          repondre(msg) ;
          return ;
      } else {

        let texte = arg.join(' ')

        if (texte.toLowerCase() === `del` ) { 

          if (group_cron == null) {

              repondre('No cronometrage is active') ;
          } else {

              await cron.delCron(dest) ;

              repondre("The automatic mute has been removed; restart to apply changes") 
              .then(() => {

                exec("pm2 restart all");
              }) ;
          }
        } else if (texte.includes(':')) {

          //let { hr , min } = texte.split(':') ;

          await cron.addCron(dest,"mute_at",texte) ;

          repondre(`Setting up automatic mute for ${texte} ; restart to apply changes`) 
          .then(() => {

            exec("pm2 restart all");
          }) ;

        } else {
            repondre('Please enter a valid time with hour and minute separated by :') ;
        }


      }
  });


  zokou({
    nomCom : 'autounmute',
    categorie : 'Group'
} , async (dest,zk,commandeOptions) => {

    const {arg , repondre , verifAdmin } = commandeOptions ;

    if (!verifAdmin) { repondre('You are not an administrator of the group') ; return}

    group_cron = await cron.getCronById(dest) ;
    
   

    if (!arg || arg.length == 0) {

      let state ;
      if (group_cron == null || group_cron.unmute_at == null) {

          state = "No time set for autounmute" ;

      } else {

        state = `The group will be un-muted at ${(group_cron.unmute_at).split(':')[0]}H ${(group_cron.unmute_at).split(':')[1]}`
      }

      let msg = `* *State:* ${state}
      * *Instructions:* To activate autounmute, add the minute and hour after the command separated by ':'
      Example autounmute 7:30
      * To delete autounmute, use the command *autounmute del*`

        repondre(msg) ;
        return ;

    } else {

      let texte = arg.join(' ')

      if (texte.toLowerCase() === `del` ) { 

        if (group_cron == null) {

            repondre('No cronometrage has been activated') ;
        } else {

            await cron.delCron(dest) ;

            repondre("The autounmute has been removed; restart to apply the changes")
            .then(() => {

              exec("pm2 restart all");
            }) ;

            

        }
      } else if (texte.includes(':')) {

       

        await cron.addCron(dest,"unmute_at",texte) ;

        repondre(`Setting up autounmute for ${texte}; restart to apply the changes`)
        .then(() => {

          exec("pm2 restart all");
        }) ;

      } else {
          repondre('Please enter a valid time with hour and minute separated by :') ;
      }


    }
});



zokou({
  nomCom : 'fkick',
  categorie : 'Group'
} , async (dest,zk,commandeOptions) => {

  const {arg , repondre , verifAdmin , superUser , verifZokouAdmin } = commandeOptions ;

  if (verifAdmin || superUser) {

    if(!verifZokouAdmin){ repondre('You need administrative rights to perform this command') ; return ;}

    if (!arg || arg.length == 0) { repondre('Please enter the country code whose members will be removed') ; return ;}

      let metadata = await zk.groupMetadata(dest) ;

      let participants = metadata.participants ;

      for (let i = 0 ; i < participants.length ; i++) {

          if (participants[i].id.startsWith(arg[0]) && participants[i].admin === null ) {

             await zk.groupParticipantsUpdate(dest, [participants[i].id], "remove") ;
          }
      }

  } else {
    repondre('Sorry, you are not an administrator of the group')
  }


}) ;


zokou({
      nomCom : 'nsfw',
      categorie : 'Group'
}, async (dest,zk,commandeOptions) => {
  
    const {arg , repondre , verifAdmin } = commandeOptions ;

  if(!verifAdmin) { repondre('Sorry, you cannot enable NSFW content without being an administrator of the group') ; return}

      let hbd = require('../bdd/hentai') ;

    let isHentaiGroupe = await hbd.checkFromHentaiList(dest) ;

  if (arg[0] == 'on') {
    
       if(isHentaiGroupe) {repondre('NSFW content is already active for this group') ; return} ;

      await hbd.addToHentaiList(dest) ;

      repondre('NSFW content is now active for this group') ;
       
  } else if (arg[0] == 'off') {

     if(!isHentaiGroupe) {repondre('NSFW content is already disabled for this group') ; return} ;

      await hbd.removeFromHentaiList(dest) ;

      repondre('NSFW content is now disabled for this group') ;
  } else {

      repondre('You must enter "on" or "off"') ;
    }
} ) ;
