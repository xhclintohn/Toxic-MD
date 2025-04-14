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





zokou({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {

  const { ms, repondre, arg, verifGroupe, nomGroupe, infosGroupe, nomAuteurMessage, verifAdmin, superUser } = commandeOptions;

  console.log(`[DEBUG] tagall command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!verifGroupe) {
    console.log(`[DEBUG] tagall: Not a group chat`);
    repondre("✋🏿 ✋🏿 𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 ❌");
    return;
  }

  let mess;
  if (!arg || arg === ' ') {
    mess = '𝐍𝐨 𝐌𝐞𝐬𝐬𝐚𝐠𝐞';
  } else {
    mess = arg.join(' ');
  }

  let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
  let tag = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗧𝗮𝗴 𝗔𝗹𝗹 📣
│❒ 𝗚𝗿𝗼𝘂𝗽: ${nomGroupe}
│❒ 𝗙𝗿𝗼𝗺: ${nomAuteurMessage}
│❒ 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: ${mess}
◈━━━━━━━━━━━━━━━━◈
`;

  let emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
  let random = Math.floor(Math.random() * (emoji.length - 1));

  for (const membre of membresGroupe) {
    tag += `${emoji[random]} @${membre.id.split("@")[0]}\n`;
  }

  if (verifAdmin || superUser) {
    console.log(`[DEBUG] tagall: Sending message with tagged members`);
    await zk.sendMessage(dest, { text: tag, mentions: membresGroupe.map((i) => i.id) }, { quoted: ms });
    console.log(`[DEBUG] tagall: Message sent successfully`);
  } else {
    console.log(`[DEBUG] tagall: User is not an admin or superuser`);
    repondre('𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐚𝐝𝐦𝐢𝐧𝐬 🚫');
  }
});

zokou({ nomCom: "link", categorie: 'Group', reaction: "🙋" }, async (dest, zk, commandeOptions) => {
  const { repondre, nomGroupe, nomAuteurMessage, verifGroupe, ms } = commandeOptions;

  console.log(`[DEBUG] link command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!verifGroupe) {
    console.log(`[DEBUG] link: Not a group chat`);
    repondre("𝐖𝐚𝐢𝐭 𝐛𝐫𝐨, 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐡𝐞 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐦𝐲 𝐃𝐌? 🚫");
    return;
  }

  try {
    console.log(`[DEBUG] link: Generating group invite link`);
    var link = await zk.groupInviteCode(dest);
    var lien = `https://chat.whatsapp.com/${link}`;

    let mess = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗜𝗻𝘃𝗶𝘁𝗲 𝗟𝗶𝗻𝗸 🙋
│❒ 𝗛𝗲𝗹𝗹𝗼: ${nomAuteurMessage}
│❒ 𝗚𝗿𝗼𝘂𝗽: ${nomGroupe}
│❒ 𝗟𝗶𝗻𝗸: ${lien}
◈━━━━━━━━━━━━━━━━◈

© 𝐓𝐨𝐱𝐢𝐜 𝐌𝐃 𝐒𝐜𝐢𝐞𝐧𝐜𝐞`;
    console.log(`[DEBUG] link: Sending group invite link`);
    repondre(mess);
    console.log(`[DEBUG] link: Group invite link sent successfully`);
  } catch (error) {
    console.log(`[DEBUG] link: Error: ${error}`);
    repondre(`𝐄𝐫𝐫𝐨𝐫: ${error.message}`);
  }
});
/** *nommer un membre comme admin */
zokou({ 
    nomCom: "promote", 
    categorie: 'Group', 
    reaction: "👨🏿‍💼" 
}, async (dest, zk, commandeOptions) => {
    let { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser, idBot } = commandeOptions;
    let membresGroupe = verifGroupe ? await infosGroupe.participants : ""
    if (!verifGroupe) { 
        return repondre("◈━━━━━━━━━━━━━━━━◈\n\n 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐨𝐧𝐥𝐲 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬!\n\n◈━━━━━━━━━━━━━━━━◈"); 
    }

    const verifMember = (user) => {
        for (const m of membresGroupe) {
            if (m.id === user) return true;
        }
        return false;
    }

    const memberAdmin = (membresGroupe) => {
        let admin = [];
        for (m of membresGroupe) {
            if (m.admin == null) continue;
            admin.push(m.id);
        }
        return admin;
    }

    const a = verifGroupe ? memberAdmin(membresGroupe) : '';
    let admin = verifGroupe ? a.includes(auteurMsgRepondu) : false;
    let membre = verifMember(auteurMsgRepondu);
    let autAdmin = verifGroupe ? a.includes(auteurMessage) : false;
    let zkad = verifGroupe ? a.includes(idBot) : false;

    try {
        if (!autAdmin && !superUser) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n 𝐘𝐨𝐮 𝐦𝐮𝐬𝐭 𝐛𝐞 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧 𝐭𝐨 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (!msgRepondu) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐭𝐡𝐞 𝐮𝐬𝐞𝐫 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐩𝐫𝐨𝐦𝐨𝐭𝐞!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (!zkad) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n 𝐈 𝐧𝐞𝐞𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐢𝐠𝐡𝐭𝐬 𝐭𝐨 𝐝𝐨 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (!membre) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n 𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐢𝐬𝐧'𝐭 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (admin) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n @${auteurMsgRepondu.split("@")[0]} 𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "promote");
        zk.sendMessage(dest, { 
            text: `◈━━━━━━━━━━━━━━━━◈\n\n🎉 𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐬 @${auteurMsgRepondu.split("@")[0]}! \n\n𝐘𝐨𝐮'𝐯𝐞 𝐛𝐞𝐞𝐧 𝐩𝐫𝐨𝐦𝐨𝐭𝐞𝐝 𝐭𝐨 𝐚𝐝𝐦𝐢𝐧! \n\n◈━━━━━━━━━━━━━━━━◈`, 
            mentions: [auteurMsgRepondu] 
        });

    } catch (e) { 
        repondre(`◈━━━━━━━━━━━━━━━━◈\n\n⚠️ 𝐄𝐫𝐫𝐨𝐫: ${e}\n\n◈━━━━━━━━━━━━━━━━◈`); 
    }
});

//fin nommer
/** ***demettre */

zokou({ 
    nomCom: "demote", 
    categorie: 'Group', 
    reaction: "👨🏿‍💼" 
}, async (dest, zk, commandeOptions) => {
    let { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser, idBot } = commandeOptions;
    let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
    
    if (!verifGroupe) { 
        return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐆𝐫𝐨𝐮𝐩 𝐎𝐧𝐥𝐲: 𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐰𝐨𝐫𝐤𝐬 𝐢𝐧 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲!\n\n◈━━━━━━━━━━━━━━━━◈"); 
    }

    const isMember = (user) => {
        return membresGroupe.some(m => m.id === user);
    }

    const getAdmins = (members) => {
        return members.filter(m => m.admin !== null).map(m => m.id);
    }

    const admins = verifGroupe ? getAdmins(membresGroupe) : [];
    const targetIsAdmin = admins.includes(auteurMsgRepondu);
    const isTargetMember = isMember(auteurMsgRepondu);
    const requesterIsAdmin = admins.includes(auteurMessage) || superUser;
    const botIsAdmin = admins.includes(idBot);

    try {
        if (!requesterIsAdmin) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝: 𝐘𝐨𝐮 𝐧𝐞𝐞𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐢𝐠𝐡𝐭𝐬 𝐭𝐨 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (!msgRepondu) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐔𝐬𝐚𝐠𝐞: 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐭𝐡𝐞 𝐦𝐞𝐦𝐛𝐞𝐫 𝐭𝐨 𝐝𝐞𝐦𝐨𝐭𝐞!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (!botIsAdmin) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐁𝐨𝐭 𝐋𝐢𝐦𝐢𝐭𝐚𝐭𝐢𝐨𝐧: 𝐈 𝐧𝐞𝐞𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐢𝐠𝐡𝐭𝐬 𝐭𝐨 𝐝𝐨 𝐭𝐡𝐢𝐬!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (!isTargetMember) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐔𝐬𝐞𝐫 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝: 𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐢𝐬𝐧'𝐭 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (!targetIsAdmin) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐑𝐞𝐠𝐮𝐥𝐚𝐫: 𝐓𝐡𝐢𝐬 𝐦𝐞𝐦𝐛𝐞𝐫 𝐢𝐬𝐧'𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "demote");
        zk.sendMessage(dest, { 
            text: `◈━━━━━━━━━━━━━━━━◈\n\n⚠️ @${auteurMsgRepondu.split("@")[0]} 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐝𝐞𝐦𝐨𝐭𝐞𝐝 𝐟𝐫𝐨𝐦 𝐚𝐝𝐦𝐢𝐧\n\n◈━━━━━━━━━━━━━━━━◈`, 
            mentions: [auteurMsgRepondu] 
        });

    } catch (e) { 
        repondre(`◈━━━━━━━━━━━━━━━━◈\n\n𝐄𝐫𝐫𝐨𝐫: ${e}\n\n◈━━━━━━━━━━━━━━━━◈`); 
    }
});


zokou({ 
    nomCom: "remove", 
    categorie: 'Group', 
    reaction: "👨🏿‍💼" 
}, async (dest, zk, commandeOptions) => {
    let { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, nomAuteurMessage, auteurMessage, superUser, idBot } = commandeOptions;
    let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
    
    if (!verifGroupe) { 
        return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐆𝐫𝐨𝐮𝐩 𝐎𝐧𝐥𝐲: 𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐰𝐨𝐫𝐤𝐬 𝐢𝐧 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲!\n\n◈━━━━━━━━━━━━━━━━◈"); 
    }

    // Extract mentioned users from message
    const mentionedUsers = msgRepondu?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    const isMember = (user) => {
        return membresGroupe.some(m => m.id === user);
    }

    const getAdmins = (members) => {
        return members.filter(m => m.admin !== null).map(m => m.id);
    }

    const admins = verifGroupe ? getAdmins(membresGroupe) : [];
    const requesterIsAdmin = admins.includes(auteurMessage) || superUser;
    const botIsAdmin = admins.includes(idBot);

    try {
        if (!requesterIsAdmin) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐃𝐞𝐧𝐢𝐞𝐝: 𝐘𝐨𝐮 𝐧𝐞𝐞𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐢𝐠𝐡𝐭𝐬 𝐭𝐨 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (!botIsAdmin) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐁𝐨𝐭 𝐋𝐢𝐦𝐢𝐭𝐚𝐭𝐢𝐨𝐧: 𝐈 𝐧𝐞𝐞𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐢𝐠𝐡𝐭𝐬 𝐭𝐨 𝐝𝐨 𝐭𝐡𝐢𝐬!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        if (!msgRepondu && mentionedUsers.length === 0) {
            return repondre("◈━━━━━━━━━━━━━━━━◈\n\n𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐔𝐬𝐚𝐠𝐞: 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐭𝐡𝐞 𝐦𝐞𝐦𝐛𝐞𝐫(𝐬) 𝐭𝐨 𝐫𝐞𝐦𝐨𝐯𝐞!\n\n◈━━━━━━━━━━━━━━━━◈");
        }

        // Combine replied-to user and mentioned users
        const usersToRemove = [];
        if (auteurMsgRepondu) usersToRemove.push(auteurMsgRepondu);
        if (mentionedUsers.length > 0) usersToRemove.push(...mentionedUsers);

        // Filter out duplicates
        const uniqueUsersToRemove = [...new Set(usersToRemove)];

        // Process each user
        for (const user of uniqueUsersToRemove) {
            if (admins.includes(user)) {
                zk.sendMessage(dest, { 
                    text: `◈━━━━━━━━━━━━━━━━◈\n\n⚠️ @${user.split("@")[0]} 𝐜𝐚𝐧'𝐭 𝐛𝐞 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 (𝐀𝐝𝐦𝐢𝐧)\n\n◈━━━━━━━━━━━━━━━━◈`, 
                    mentions: [user] 
                });
                continue;
            }

            if (!isMember(user)) {
                zk.sendMessage(dest, { 
                    text: `◈━━━━━━━━━━━━━━━━◈\n\n⚠️ @${user.split("@")[0]} 𝐢𝐬𝐧'𝐭 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩\n\n◈━━━━━━━━━━━━━━━━◈`, 
                    mentions: [user] 
                });
                continue;
            }

            // Create removal sticker
            const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
            var sticker = new Sticker(gifLink, {
                pack: 'Zokou-Md',
                author: nomAuteurMessage,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#000000'
            });

            await sticker.toFile("st.webp");
            await zk.groupParticipantsUpdate(dest, [user], "remove");
            
            zk.sendMessage(dest, { 
                text: `◈━━━━━━━━━━━━━━━━◈\n\n🗑️ @${user.split("@")[0]} 𝐰𝐚𝐬 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩\n\n◈━━━━━━━━━━━━━━━━◈`, 
                mentions: [user] 
            });
        }

    } catch (e) { 
        repondre(`◈━━━━━━━━━━━━━━━━◈\n\n𝐄𝐫𝐫𝐨𝐫: ${e}\n\n◈━━━━━━━━━━━━━━━━◈`); 
    }
});


/** *****fin retirer */


zokou({ nomCom: "del", categorie: 'Group',reaction:"🧹" }, async (dest, zk, commandeOptions) => {

  const { ms, repondre, verifGroupe,auteurMsgRepondu,idBot, msgRepondu, verifAdmin, superUser} = commandeOptions;
  
  if (!msgRepondu) {
    repondre("Please mention the message to delete.");
    return;
  }
  if(superUser && auteurMsgRepondu==idBot )
  {
    
       if(auteurMsgRepondu==idBot)
       {
         const key={
            remoteJid:dest,
      fromMe: true,
      id: ms.message.extendedTextMessage.contextInfo.stanzaId,
         }
         await zk.sendMessage(dest,{delete:key});return;
       } 
  }

          if(verifGroupe)
          {
               if(verifAdmin || superUser)
               {
                    
                         try{
                
      
            const key=   {
               remoteJid : dest,
               id : ms.message.extendedTextMessage.contextInfo.stanzaId ,
               fromMe : false,
               participant : ms.message.extendedTextMessage.contextInfo.participant

            }        
         
         await zk.sendMessage(dest,{delete:key});return;

             }catch(e){repondre( "I need admin rights.")}
                    
                      
               }else{repondre("Sorry, you are not an administrator of the group.")}
          }

});

zokou({ nomCom: "info", categorie: 'Group' }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, verifGroupe } = commandeOptions;
  if (!verifGroupe) { repondre("order reserved for the group only"); return };

 try { ppgroup = await zk.profilePictureUrl(dest ,'image') ; } catch { ppgroup = conf.IMAGE_MENU}

    const info = await zk.groupMetadata(dest)

    /*console.log(metadata.id + ", title: " + metadata.subject + ", description: " + metadata.desc)*/


    let mess = {
      image: { url: ppgroup },
      caption:  `*━━━━『Group Info』━━━━*\n\n*🎐Name:* ${info.subject}\n\n*🔩Group's ID:* ${dest}\n\n*🔍Desc:* \n\n${info.desc}`
    }


    zk.sendMessage(dest, mess, { quoted: ms })
  });



 //------------------------------------antilien-------------------------------

 zokou({ nomCom: "antilink", categorie: 'Group', reaction: "🔗" }, async (dest, zk, commandeOptions) => {

  var { repondre, arg, verifGroupe, superUser, verifAdmin, ms } = commandeOptions;

  console.log(`[DEBUG] antilink command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

  if (!verifGroupe) {
    console.log(`[DEBUG] antilink: Not a group chat`);
    return repondre("𝐅𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲 🚫");
  }

  if (superUser || verifAdmin) {
    const enetatoui = await verifierEtatJid(dest);
    console.log(`[DEBUG] antilink: Current state: ${enetatoui}`);

    try {
      if (!arg || !arg[0] || arg === ' ') {
        console.log(`[DEBUG] antilink: No arguments provided`);
        repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗢𝗽𝘁𝗶𝗼𝗻𝘀 🔗
│❒ antilink on - 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink off - 𝗗𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink action/remove - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝘀𝗲𝗻𝗱𝗲𝗿 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗻𝗼𝘁𝗶𝗰𝗲
│❒ antilink action/warn - 𝗚𝗶𝘃𝗲 𝘄𝗮𝗿𝗻𝗶𝗻𝗴𝘀
│❒ antilink action/delete - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗮𝗻𝘆 𝘀𝗮𝗻𝗰𝘁𝗶𝗼𝗻𝘀
◈━━━━━━━━━━━━━━━━◈

𝐍𝐨𝐭𝐞: 𝗕𝘆 𝗱𝗲𝗳𝗮𝘂𝗹𝘁, 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲 𝗶𝘀 𝘀𝗲𝘁 𝘁𝗼 𝗱𝗲𝗹𝗲𝘁𝗲.`); 
        return;
      }

      if (arg[0] === 'on') {
        if (enetatoui) {
          console.log(`[DEBUG] antilink: Already activated`);
          repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗦𝘁𝗮𝘁𝘂𝘀 🔗
│❒ 𝗧𝗵𝗲 𝗮𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗶𝘀 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱 𝗳𝗼𝗿 𝘁𝗵𝗶𝘀 𝗴𝗿𝗼𝘂𝗽 ✅
◈━━━━━━━━━━━━━━━━◈`);
        } else {
          console.log(`[DEBUG] antilink: Activating`);
          await ajouterOuMettreAJourJid(dest, "oui");
          repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗦𝘁𝗮𝘁𝘂𝘀 🔗
│❒ 𝗧𝗵𝗲 𝗮𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗶𝘀 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 ✅
◈━━━━━━━━━━━━━━━━◈`);
        }
      } else if (arg[0] === "off") {
        if (enetatoui) {
          console.log(`[DEBUG] antilink: Deactivating`);
          await ajouterOuMettreAJourJid(dest, "non");
          repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗦𝘁𝗮𝘁𝘂𝘀 🔗
│❒ 𝗧𝗵𝗲 𝗮𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗱𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱 🚫
◈━━━━━━━━━━━━━━━━◈`);
        } else {
          console.log(`[DEBUG] antilink: Not activated`);
          repondre(`
� Т𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗦𝘁𝗮𝘁𝘂𝘀 🔗
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗶𝘀 𝗻𝗼𝘁 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱 𝗳𝗼𝗿 𝘁𝗵𝗶𝘀 𝗴𝗿𝗼𝘂𝗽 🚫
◈━━━━━━━━━━━━━━━━◈`);
        }
      } else if (arg.join('').split("/")[0] === 'action') {
        let action = (arg.join('').split("/")[1]).toLowerCase();
        console.log(`[DEBUG] antilink: Action requested: ${action}`);

        if (action == 'remove' || action == 'warn' || action == 'delete') {
          console.log(`[DEBUG] antilink: Updating action to ${action}`);
          await mettreAJourAction(dest, action);
          repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗔𝗰𝘁𝗶𝗼𝗻 🔗
│❒ 𝗧𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗮𝗰𝘁𝗶𝗼𝗻 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝘂𝗽𝗱𝗮𝘁𝗲𝗱 𝘁𝗼 ${arg.join('').split("/")[1]} ✅
◈━━━━━━━━━━━━━━━━◈`);
        } else {
          console.log(`[DEBUG] antilink: Invalid action`);
          repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗘𝗿𝗿𝗼𝗿 🔗
│❒ 𝗧𝗵𝗲 𝗼𝗻𝗹𝘆 𝗮𝗰𝘁𝗶𝗼𝗻𝘀 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗮𝗿𝗲 𝘄𝗮𝗿𝗻, 𝗿𝗲𝗺𝗼𝘃𝗲, 𝗮𝗻𝗱 𝗱𝗲𝗹𝗲𝘁𝗲 🚫
◈━━━━━━━━━━━━━━━━◈`);
        }
      } else {
        console.log(`[DEBUG] antilink: Invalid argument`);
        repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗢𝗽𝘁𝗶𝗼𝗻𝘀 🔗
│❒ antilink on - 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink off - 𝗗𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink action/remove - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝘀𝗲𝗻𝗱𝗲𝗿 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗻𝗼𝘁𝗶𝗰𝗲
│❒ antilink action/warn - 𝗚𝗶𝘃𝗲 𝘄𝗮𝗿𝗻𝗶𝗻𝗴𝘀
│❒ antilink action/delete - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗮𝗻𝘆 𝘀𝗮𝗻𝗰𝘁𝗶𝗼𝗻𝘀
◈━━━━━━━━━━━━━━━━◈

𝐍𝐨𝐭𝐞: 𝗕𝘆 𝗱𝗲𝗳𝗮𝘂𝗹𝘁, 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲 𝗶𝘀 𝘀𝗲𝘁 𝘁𝗼 𝗱𝗲𝗹𝗲𝘁𝗲.`);
      }
    } catch (error) {
      console.log(`[DEBUG] antilink: Error: ${error}`);
      repondre(`𝐄𝐫𝐫𝐨𝐫: ${error.message}`);
    }
  } else {
    console.log(`[DEBUG] antilink: User is not an admin or superuser`);
    repondre('𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐞𝐧𝐭𝐢𝐭𝐥𝐞𝐝 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐨𝐫𝐝𝐞𝐫 🚫');
  }
});




 //------------------------------------antibot-------------------------------

 zokou({ nomCom: "antibot", categorie: 'Group', reaction: "😬" }, async (dest, zk, commandeOptions) => {


  var { repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;
  

  
  if (!verifGroupe) {
    return repondre("*for groups only*");
  }
  
  if( superUser || verifAdmin) {
    const enetatoui = await atbverifierEtatJid(dest)
    try {
      if (!arg || !arg[0] || arg === ' ') { repondre('antibot on to activate the anti-bot feature\nantibot off to deactivate the antibot feature\nantibot action/remove to directly remove the bot without notice\nantibot action/warn to give warnings\nantilink action/delete to remove the bot message without any sanctions\n\nPlease note that by default, the anti-bot feature is set to delete.') ; return};
     
      if(arg[0] === 'on') {

      
       if(enetatoui ) { repondre("the antibot is already activated for this group")
                    } else {
                  await atbajouterOuMettreAJourJid(dest,"oui");
                
              repondre("the antibot is successfully activated") }
     
            } else if (arg[0] === "off") {

              if (enetatoui) { 
                await atbajouterOuMettreAJourJid(dest , "non");

                repondre("The antibot has been successfully deactivated");
                
              } else {
                repondre("antibot is not activated for this group");
              }
            } else if (arg.join('').split("/")[0] === 'action') {

              let action = (arg.join('').split("/")[1]).toLowerCase() ;

              if ( action == 'remove' || action == 'warn' || action == 'delete' ) {

                await mettreAJourAction(dest,action);

                repondre(`The anti-bot action has been updated to ${arg.join('').split("/")[1]}`);

              } else {
                  repondre("The only actions available are warn, remove, and delete") ;
              }
            

            } else {  
              repondre('antibot on to activate the anti-bot feature\nantibot off to deactivate the antibot feature\nantibot action/remove to directly remove the bot without notice\nantibot action/warn to give warnings\nantilink action/delete to remove the bot message without any sanctions\n\nPlease note that by default, the anti-bot feature is set to delete.') ;

                            }
    } catch (error) {
       repondre(error)
    }

  } else { repondre('You are not entitled to this order') ;

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
          pack: 'Toxic-MD',
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
      "『 *Toxic-MD Application* 』\n\n*Name :* " + appData.name +
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
