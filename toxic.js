"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require("pino");
const boom_1 = require("@hapi/boom");
const conf = require("./set");
const axios = require("axios");
let fs = require("fs-extra");
let path = require("path");
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { verifierEtatJid, recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid, atbrecupererActionJid } = require("./bdd/antibot");
let evt = require(__dirname + "/framework/zokou");
const { isUserBanned, addUserToBanList, removeUserFromBanList } = require("./bdd/banUser");
const { addGroupToBanList, isGroupBanned, removeGroupFromBanList } = require("./bdd/banGroup");
const { isGroupOnlyAdmin, addGroupToOnlyAdminList, removeGroupFromOnlyAdminList } = require("./bdd/onlyAdmin");
let { reagir } = require(__dirname + "/framework/app");
var session = conf.session.replace(/Toxic-MD-WHATSAPP-BOT;;;=>/g, "");
const prefixe = conf.PREFIXE;
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

async function authentification() {
    try {
        const authPath = __dirname + "/auth/creds.json";
        const sessionData = atob(session);
        if (!fs.existsSync(authPath) || session != "zokk") {
            console.log("Connecting...");
            await fs.writeFileSync(authPath, sessionData, "utf8");
        }
    } catch (e) {
        console.log("Invalid session: " + e);
        return;
    }
}
authentification();

const store = (0, baileys_1.makeInMemoryStore)({ logger: pino().child({ level: "silent", stream: "store" }) });

setTimeout(() => {
    async function main() {
        const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Toxic-MD', "Safari"],
            printQRInTerminal: true,
            markOnlineOnConnect: false,
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg?.message || undefined;
                }
                return undefined;
            },
        };
        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);
        setInterval(() => { store.writeToFile("store.json"); }, 3000);

        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message) return;

            const decodeJid = (jid) => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
                }
                return jid;
            };

            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation :
                        mtype == "imageMessage" ? ms.message.imageMessage?.caption :
                        mtype == "videoMessage" ? ms.message.videoMessage?.caption :
                        mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text :
                        mtype == "buttonsResponseMessage" ? ms?.message?.buttonsResponseMessage?.selectedButtonId :
                        mtype == "listResponseMessage" ? ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId :
                        mtype == "messageContextInfo" ? (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];

            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            var mr = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant || ms.participant) : origineMessage;
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }

            var membreGroupe = verifGroupe ? ms.key.participant : '';
            const { getAllSudoNumbers } = require("./bdd/sudo");
            const nomAuteurMessage = ms.pushName;
            const dj = '254735342808';
            const dj2 = '254799283147';
            const sudo = await getAllSudoNumbers();
            const superUserNumbers = [servBot, dj, dj2, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);
            var dev = [dj, dj2].map((t) => t.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(auteurMessage);

            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }
            console.log("\tToxic-MD ONLINE ⚡");
            console.log("==== Message Received ======");
            if (verifGroupe) {
                console.log("Message from group 🗨️: " + nomGroupe);
            }
            console.log("Sent by 🗨️: [" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + " ]");
            console.log("Message type: " + mtype);
            console.log("------ Message Content ------");
            console.log(texte);

            function groupeAdmin(membreGroupe) {
                let admin = [];
                for (m of membreGroupe) {
                    if (m.admin == null) continue;
                    admin.push(m.id);
                }
                return admin;
            }

            const presenceState = conf.ETAT == 1 ? "available" :
                                 conf.ETAT == 2 ? "composing" :
                                 conf.ETAT == 3 ? "recording" : "unavailable";
            await zk.sendPresenceUpdate(presenceState, origineMessage);

            const mbre = verifGroupe ? await infosGroupe.participants : '';
            let admins = verifGroupe ? groupeAdmin(mbre) : '';
            const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
            var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;

            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;

            const lien = conf.URL.split(',');

            function mybotpic() {
                const indiceAleatoire = Math.floor(Math.random() * lien.length);
                return lien[indiceAleatoire];
            }

            var commandeOptions = {
                superUser, dev,
                verifGroupe,
                mbre,
                membreGroupe,
                verifAdmin,
                infosGroupe,
                nomGroupe,
                auteurMessage,
                nomAuteurMessage,
                idBot,
                verifZokouAdmin,
                prefixe,
                arg,
                repondre,
                mtype,
                groupeAdmin,
                msgRepondu,
                auteurMsgRepondu,
                ms,
                mybotpic
            };
            
            if (conf.AUTO_READ_MESSAGES === "yes") {
        zk.ev.on("messages.upsert", async m => {
          const {
            messages
          } = m;
          for (const message of messages) {
            if (!message.key.fromMe) {
              await zk.readMessages([message.key]);
            }
          }
        });
      }


            /************************ anti-delete-message */

if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0 && (conf.ADM).toLocaleLowerCase() === 'yes') {

    if (ms.key.fromMe || ms.message.protocolMessage.key.fromMe) {
        console.log('Delete message about me');
        return;
    }

    console.log(`Message `);
    let key = ms.message.protocolMessage.key;

    try {
        let st = './clintondb/store.json';
        let backupSt = './clintondb/store_backup.json';
        let data;

        // Ensure store.json exists, create if missing
        if (!fs.existsSync(st)) {
            console.log('store.json not found, creating new file');
            fs.writeFileSync(st, JSON.stringify({ messages: {} }, null, 2));
        }

        // Try reading primary store, fallback to backup if it fails
        try {
            data = fs.readFileSync(st, 'utf8');
        } catch (primaryError) {
            console.log('Failed to read store.json, attempting backup:', primaryError);
            if (fs.existsSync(backupSt)) {
                data = fs.readFileSync(backupSt, 'utf8');
            } else {
                console.log('Backup store.json not found');
                throw new Error('No valid store file available');
            }
        }

        // Parse JSON with validation
        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseError) {
            console.log('JSON parse error:', parseError);
            throw new Error('Corrupted store file');
        }

        // Ensure messages object exists for the chat
        if (!jsonData.messages[key.remoteJid]) {
            console.log('No messages found for chat:', key.remoteJid);
            return;
        }

        let message = jsonData.messages[key.remoteJid];
        let msg;

        // Search for the deleted message in store.json
        for (let i = 0; i < message.length; i++) {
            if (message[i].key.id === key.id) {
                msg = message[i];
                break;
            }
        }

        // If message not found, log more details for debugging
        if (!msg || msg === null || typeof msg === 'undefined') {
            console.log('Message not found - Key:', key, 'Chat:', key.remoteJid);
            return;
        }

        // Get chat info (group name or user name) for the notification
        let chatName = key.remoteJid.includes('@g.us') ? (await zk.groupMetadata(key.remoteJid)).subject : key.remoteJid.split('@')[0];

        // Get timestamp of the deleted message
        let timestamp = msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000).toLocaleString() : 'Unknown time';

        // Send anti-delete notification with more details
        await zk.sendMessage(
            idBot,
            {
                image: { url: './media/deleted-message.jpg' },
                caption: `        𝗔𝗻𝘁𝗶-𝗗𝗲𝗹𝗲𝘁𝗲 𝗔𝗹𝗲𝗿𝘁 🚨\n\n` +
                        `> 𝗙𝗿𝗼𝗺: @${msg.key.participant.split('@')[0]}\n` +
                        `> 𝗖𝗵𝗮𝘁: ${chatName}\n` +
                        `> D𝗲𝗹𝗲𝘁𝗲𝗱 𝗔𝘁: ${timestamp}\n\n` +
                        `𝗛𝗲𝗿𝗲’𝘀 𝘁𝗵𝗲 𝗱𝗲𝗹𝗲𝘁𝗲𝗱 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗯𝗲𝗹𝗼𝘄! 👇`,
                mentions: [msg.key.participant],
            }
        ).then(async () => {
            // Retry forwarding the deleted message with exponential backoff
            let attempts = 0;
            const maxAttempts = 3;
            const retryDelay = 2000;

            while (attempts < maxAttempts) {
                try {
                    await zk.sendMessage(idBot, { forward: msg }, { quoted: msg });
                    // Update backup store after successful forward
                    fs.writeFileSync(backupSt, JSON.stringify(jsonData, null, 2));
                    break;
                } catch (retryError) {
                    attempts++;
                    console.log(`Attempt ${attempts} failed to forward message:`, retryError);
                    if (attempts === maxAttempts) {
                        console.log('Max retry attempts reached');
                        await zk.sendMessage(idBot, { text: `𝗖𝗼𝘂𝗹𝗱𝗻’𝘁 𝗳𝗼𝗿𝘄𝗮𝗿𝗱 𝘁𝗵𝗲 𝗱𝗲𝗹𝗲𝘁𝗲𝗱 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗮𝗳𝘁𝗲𝗿 ${maxAttempts} 𝗮𝘁𝘁𝗲𝗺𝗽𝘁𝘀. 𝗘𝗿𝗿𝗼𝗿: ${retryError.message}` });
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempts)));
                }
            }
        });

    } catch (e) {
        console.log('Anti-delete error:', e);
        // Log more details for debugging
        console.log('Key:', key, 'Chat:', key.remoteJid, 'Error Stack:', e.stack);
    }
}
            /** ****** gestion auto-status  */
            if (ms.key && ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
                await zk.readMessages([ms.key]);
            }
            if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_DOWNLOAD_STATUS === "yes") {
                /* await zk.readMessages([ms.key]);*/
                if (ms.message.extendedTextMessage) {
                    var stTxt = ms.message.extendedTextMessage.text;
                    await zk.sendMessage(idBot, { text: stTxt }, { quoted: ms });
                }
                else if (ms.message.imageMessage) {
                    var stMsg = ms.message.imageMessage.caption;
                    var stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
                    await zk.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: ms });
                }
                else if (ms.message.videoMessage) {
                    var stMsg = ms.message.videoMessage.caption;
                    var stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
                    await zk.sendMessage(idBot, {
                        video: { url: stVideo }, caption: stMsg
                    }, { quoted: ms });
                }
                /** *************** */
                // console.log("*nouveau status* ");
            }
            /** ******function auto-status view */
            if (!dev && origineMessage == "120363158701337904@g.us") {
                return;
            }
            
 //---------------------------------------rang-count--------------------------------
             if (texte && auteurMessage.endsWith("s.whatsapp.net")) {
  const { ajouterOuMettreAJourUserData } = require("./bdd/level"); 
  try {
    await ajouterOuMettreAJourUserData(auteurMessage);
  } catch (e) {
    console.error(e);
  }
              }
            
                /////////////////////////////   Mentions /////////////////////////////////////////
         
              try {
        
                if (ms.message[mtype].contextInfo.mentionedJid && (ms.message[mtype].contextInfo.mentionedJid.includes(idBot) ||  ms.message[mtype].contextInfo.mentionedJid.includes(conf.NUMERO_OWNER + '@s.whatsapp.net'))    /*texte.includes(idBot.split('@')[0]) || texte.includes(conf.NUMERO_OWNER)*/) {
            
                    if (origineMessage == "120363158701337904@g.us") {
                        return;
                    } ;
            
                    if(superUser) {console.log('hummm') ; return ;} 
                    
                    let mbd = require('./bdd/mention') ;
            
                    let alldata = await mbd.recupererToutesLesValeurs() ;
            
                        let data = alldata[0] ;
            
                    if ( data.status === 'non') { console.log('mention pas actifs') ; return ;}
            
                    let msg ;
            
                    if (data.type.toLocaleLowerCase() === 'image') {
            
                        msg = {
                                image : { url : data.url},
                                caption : data.message
                        }
                    } else if (data.type.toLocaleLowerCase() === 'video' ) {
            
                            msg = {
                                    video : {   url : data.url},
                                    caption : data.message
                            }
            
                    } else if (data.type.toLocaleLowerCase() === 'sticker') {
            
                        let stickerMess = new Sticker(data.url, {
                            pack: conf.NOM_OWNER,
                            type: StickerTypes.FULL,
                            categories: ["🤩", "🎉"],
                            id: "12345",
                            quality: 70,
                            background: "transparent",
                          });
            
                          const stickerBuffer2 = await stickerMess.toBuffer();
            
                          msg = {
                                sticker : stickerBuffer2 
                          }
            
                    }  else if (data.type.toLocaleLowerCase() === 'audio' ) {
            
                            msg = {
            
                                audio : { url : data.url } ,
                                mimetype:'audio/mp4',
                                 }
                        
                    }
            
                    zk.sendMessage(origineMessage,msg,{quoted : ms})
            
                }
            } catch (error) {
                
            } 


     // Anti-link
try {
  const yes = await verifierEtatJid(origineMessage);
  const linkRegex = /(https?:\/\/|www\.|t\.me|bit\.ly|tinyurl\.com|lnkd\.in|fb\.me)[\S]+/i;
  
  if (linkRegex.test(texte) && verifGroupe && yes) {
    console.log("Link detected");
    
    // Proper admin check
    const botJid = zk.user.id.split(':')[0] + '@s.whatsapp.net';
    const verifZokAdmin = admins.includes(botJid);
    
    console.log('Bot admin status:', verifZokAdmin);
    console.log('Admins list:', admins);

    if (superUser || verifAdmin) {
      console.log('Admin/Sudo detected - no action');
      return;
    }

    if (!verifZokAdmin) {
      await zk.sendMessage(origineMessage, {
        text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n❌ I'm not admin! Can't delete links.`
      }, { quoted: ms });
      return;
    }

    const key = {
      remoteJid: origineMessage,
      fromMe: false,
      id: ms.key.id,
      participant: auteurMessage
    };
    const gifLink = "https://raw.githubusercontent.com/xhclintohn/Toxic-MD/main/media/remover.gif";
    const sticker = new Sticker(gifLink, {
      pack: '𝐓𝐎𝐗𝐈𝐂-𝐌𝐃',
      author: conf.OWNER_NAME,
      type: StickerTypes.FULL,
      categories: ['⚠️'],
      id: '12345',
      quality: 70,
      background: '#ff0000'
    });
    await sticker.toFile("st1.webp");

    const action = await recupererActionJid(origineMessage) || 'delete';

    if (action === 'remove') {
      const txt = `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ LINK VIOLATION!\n│❒ USER: @${auteurMessage.split("@")[0]}\n│❒ ACTION: REMOVED\n◈━━━━━━━━━━━━━━━━◈`;
      await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
      await (0, baileys_1.delay)(800);
      await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
      try {
        await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
      } catch (e) {
        await zk.sendMessage(origineMessage, {
          text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ REMOVAL FAILED!\n│❒ NEED ADMIN POWER\n◈━━━━━━━━━━━━━━━━◈`
        }, { quoted: ms });
      }
      await zk.sendMessage(origineMessage, { delete: key });
      await fs.unlink("st1.webp");
    } 
    else if (action === 'delete') {
      const txt = `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ LINK DELETED!\n│❒ USER: @${auteurMessage.split("@")[0]}\n│❒ NEXT: WARNING\n◈━━━━━━━━━━━━━━━━◈`;
      await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
      await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
      await zk.sendMessage(origineMessage, { delete: key });
      await fs.unlink("st1.webp");
    }
    else if (action === 'warn') {
      const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount, resetWarnCountByJID } = require('./bdd/warn');
      let warn = await getWarnCountByJID(auteurMessage);
      let warnLimit = conf.WARN_COUNT;
      
      if (warn >= warnLimit) {
        const kikmsg = `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ MAX WARNINGS!\n│❒ USER: @${auteurMessage.split("@")[0]}\n│❒ ACTION: BANNED\n◈━━━━━━━━━━━━━━━━◈`;
        await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
        await zk.sendMessage(origineMessage, { text: kikmsg, mentions: [auteurMessage] }, { quoted: ms });
        try {
          await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
          await resetWarnCountByJID(auteurMessage);
        } catch (e) {
          await zk.sendMessage(origineMessage, {
            text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BAN FAILED!\n│❒ NEED ADMIN\n◈━━━━━━━━━━━━━━━━◈`
          }, { quoted: ms });
        }
        await zk.sendMessage(origineMessage, { delete: key });
      } else {
        const remaining = warnLimit - warn;
        const msg = `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ WARNING #${warn+1}\n│❒ USER: @${auteurMessage.split("@")[0]}\n│❒ LEFT: ${remaining}\n◈━━━━━━━━━━━━━━━━◈`;
        await ajouterUtilisateurAvecWarnCount(auteurMessage);
        await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
        await zk.sendMessage(origineMessage, { text: msg, mentions: [auteurMessage] }, { quoted: ms });
        await zk.sendMessage(origineMessage, { delete: key });
      }
      await fs.unlink("st1.webp");
    }
  }
} catch (e) {
  console.log("Anti-link crash:", e);
  await zk.sendMessage(origineMessage, {
    text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ SYSTEM ERROR!\n│❒ ${e.message}\n◈━━━━━━━━━━━━━━━━◈`
  }, { quoted: ms });
}
    


    /** *************************anti-bot******************************************** */
    try {
        const botMsg = ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16;
        const baileysMsg = ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16;
        if (botMsg || baileysMsg) {

            if (mtype === 'reactionMessage') { console.log('I dont react to reactions') ; return} ;
            const antibotactiver = await atbverifierEtatJid(origineMessage);
            if(!antibotactiver) {return};

            if( verifAdmin || auteurMessage === idBot  ) { console.log('I do nothing'); return};
                        
            const key = {
                remoteJid: origineMessage,
                fromMe: false,
                id: ms.key.id,
                participant: auteurMessage
            };
            var txt = "bot detected, \n";
           // txt += `message supprimé \n @${auteurMessage.split("@")[0]} rétiré du groupe.`;
            const gifLink = "https://raw.githubusercontent.com/xhclintohn/Toxic-MD/main/media/remover.gif";
            var sticker = new Sticker(gifLink, {
                pack: 'Toxic-MD',
                author: conf.OWNER_NAME,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#000000'
            });
            await sticker.toFile("st1.webp");
            // var txt = `@${auteurMsgRepondu.split("@")[0]} a été rétiré du groupe..\n`
            var action = await atbrecupererActionJid(origineMessage);

              if (action === 'remove') {

                txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;

            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
            (0, baileys_1.delay)(800);
            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
            try {
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            }
            catch (e) {
                console.log("antibot ") + e;
            }
            await zk.sendMessage(origineMessage, { delete: key });
            await fs.unlink("st1.webp"); } 
                
               else if (action === 'delete') {
                txt += `message delete \n @${auteurMessage.split("@")[0]} Avoid sending link.`;
                //await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
               await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
               await zk.sendMessage(origineMessage, { delete: key });
               await fs.unlink("st1.webp");

            } else if(action === 'warn') {
                const {getWarnCountByJID ,ajouterUtilisateurAvecWarnCount} = require('./bdd/warn') ;

    let warn = await getWarnCountByJID(auteurMessage) ; 
    let warnlimit = conf.WARN_COUNT
 if ( warn >= warnlimit) { 
  var kikmsg = `bot detected ;you will be remove because of reaching warn-limit`;
    
     await zk.sendMessage(origineMessage, { text: kikmsg , mentions: [auteurMessage] }, { quoted: ms }) ;


     await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
     await zk.sendMessage(origineMessage, { delete: key });


    } else {
        var rest = warnlimit - warn ;
      var  msg = `bot detected , your warn_count was upgrade ;\n rest : ${rest} `;

      await ajouterUtilisateurAvecWarnCount(auteurMessage)

      await zk.sendMessage(origineMessage, { text: msg , mentions: [auteurMessage] }, { quoted: ms }) ;
      await zk.sendMessage(origineMessage, { delete: key });

    }
                }
        }
    }
    catch (er) {
        console.log('.... ' + er);
    }        
             
         
            /////////////////////////
            
            //execution des clintplugins   
            if (verifCom) {
                //await await zk.readMessages(ms.key);
                const cd = evt.cm.find((zokou) => zokou.nomCom === (com));
                if (cd) {
                    try {

            if ((conf.MODE).toLocaleLowerCase() != 'yes' && !superUser) {
                return;
            }

                         /******************* PM_PERMT***************/

            if (!superUser && origineMessage === auteurMessage&& conf.PM_PERMIT === "yes" ) {
                repondre("You don't have acces to commands here") ; return }
            ///////////////////////////////

             
            /*****************************banGroup  */
            if (!superUser && verifGroupe) {

                 let req = await isGroupBanned(origineMessage);
                    
                        if (req) { return }
            }

              /***************************  ONLY-ADMIN  */

            if(!verifAdmin && verifGroupe) {
                 let req = await isGroupOnlyAdmin(origineMessage);
                    
                        if (req) {  return }}

              /**********************banuser */
         
            
                if(!superUser) {
                    let req = await isUserBanned(auteurMessage);
                    
                        if (req) {repondre("You are banned from bot commands"); return}
                    

                } 

                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    }
                    catch (e) {
                        console.log("😡r😡 " + e);
                        zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
                    }
                }
            }
            //end of order execution
        });
        //end event message

/******** group event update ****************/
const { recupevents } = require('./bdd/welcome'); 

zk.ev.on('group-participants.update', async (group) => {
    console.log(group);

    let ppgroup;
    try {
        ppgroup = await zk.profilePictureUrl(group.id, 'image');
    } catch {
        ppgroup = '';
    }

    try {
        const metadata = await zk.groupMetadata(group.id);

        if (group.action == 'add' && (await recupevents(group.id, "welcome") == 'on')) {
            let msg = `TOXIC-MD`;
            let membres = group.participants;
            for (let membre of membres) {
                msg += ` \n𝐇𝐞𝐥𝐥𝐨 @${membre.split("@")[0]} 𝐀𝐍𝐃 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐎𝐔𝐑 𝐆𝐑𝐎𝐔𝐏 𝐇𝐄𝐑𝐄'𝐒 𝐀 𝐂𝐔𝐏 𝐎𝐅 𝐓𝐄𝐀.⭐ \n\n`;
            }

            msg += `> 𝐏𝐋𝐄𝐀𝐒𝐄 𝐑𝐄𝐀𝐃 𝐓𝐇𝐄 𝐆𝐑𝐎𝐔𝐏 𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐓𝐈𝐎𝐍 𝐓𝐎 𝐀𝐕𝐎𝐈𝐃 𝐆𝐄𝐓𝐓𝐈𝐍𝐆 𝐑𝐄𝐌𝐎𝐕𝐄𝐃* `;

            zk.sendMessage(group.id, { image: { url: ppgroup }, caption: msg, mentions: membres });
        } else if (group.action == 'remove' && (await recupevents(group.id, "goodbye") == 'on')) {
            let msg = `𝐒𝐨𝐦𝐞𝐨𝐧𝐞 𝐉𝐮𝐬𝐭 𝐥𝐞𝐟𝐭 𝐮𝐬🥲 𝐁𝐲𝐞𝐞.  𝐖𝐞 𝐩𝐫𝐨𝐛𝐚𝐛𝐥𝐲 𝐧𝐨𝐭 𝐠𝐨𝐧𝐧𝐚 𝐦𝐢𝐬𝐬 𝐲𝐨𝐮😒🚮;\n`;

            let membres = group.participants;
            for (let membre of membres) {
                msg += `@${membre.split("@")[0]}\n`;
            }

            zk.sendMessage(group.id, { text: msg, mentions: membres });

        } else if (group.action == 'promote' && (await recupevents(group.id, "antipromote") == 'on') ) {
            //  console.log(zk.user.id)
          if (group.author == metadata.owner || group.author  == conf.NUMERO_OWNER + '@s.whatsapp.net' || group.author == decodeJid(zk.user.id)  || group.author == group.participants[0]) { console.log('SuperUser case I do nothing') ;return ;} ;


         await   zk.groupParticipantsUpdate(group.id ,[group.author,group.participants[0]],"demote") ;

         zk.sendMessage(
              group.id,
              {
                text : `@${(group.author).split("@")[0]} has violated the anti-promotion rule, therefore both ${group.author.split("@")[0]} and @${(group.participants[0]).split("@")[0]} have been removed from administrative rights.`,
                mentions : [group.author,group.participants[0]]
              }
         )

        } else if (group.action == 'demote' && (await recupevents(group.id, "antidemote") == 'on') ) {

            if (group.author == metadata.owner || group.author ==  conf.NUMERO_OWNER + '@s.whatsapp.net' || group.author == decodeJid(zk.user.id) || group.author == group.participants[0]) { console.log('SuperUser case I do nothing') ;return ;} ;


           await  zk.groupParticipantsUpdate(group.id ,[group.author],"demote") ;
           await zk.groupParticipantsUpdate(group.id , [group.participants[0]] , "promote")

           zk.sendMessage(
                group.id,
                {
                  text : `@${(group.author).split("@")[0]} has violated the anti-demotion rule by removing @${(group.participants[0]).split("@")[0]}. Consequently, he has been stripped of administrative rights.` ,
                  mentions : [group.author,group.participants[0]]
                }
           )

     } 

    } catch (e) {
        console.error(e);
    }
});

/******** end of group event update *************************/

/******************************Cron setup */

        
    async  function activateCrons() {
        const cron = require('node-cron');
        const { getCron } = require('./bdd/cron');

          let crons = await getCron();
          console.log(crons);
          if (crons.length > 0) {
        
            for (let i = 0; i < crons.length; i++) {
        
              if (crons[i].mute_at != null) {
                let set = crons[i].mute_at.split(':');

                console.log(`establishment of an automute for ${crons[i].group_id} a ${set[0]} H ${set[1]}`)

                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                  await zk.groupSettingUpdate(crons[i].group_id, 'announcement');
                  zk.sendMessage(crons[i].group_id, { image : { url : './media/chrono.webp'} , caption: "Hello, it's time to close the group; Goodnight." });

                }, {
                    timezone: "Africa/Nairobi"
                  });
              }
        
              if (crons[i].unmute_at != null) {
                let set = crons[i].unmute_at.split(':');

                console.log(`etablissement d'un autounmute pour ${set[0]} H ${set[1]} `)
        
                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {

                  await zk.groupSettingUpdate(crons[i].group_id, 'not_announcement');

                  zk.sendMessage(crons[i].group_id, { image : { url : './media/chrono.webp'} , caption: "Good morning; It's time to open the group." });

                 
                },{
                    timezone: "Africa/Nairobi"
                  });
              }
        
            }
          } else {
            console.log('Crons have not been enabled');
          }

          return
        }

        
        //événement contact
        zk.ev.on("contacts.upsert", async (contacts) => {
            const insertContact = (newContact) => {
                for (const contact of newContact) {
                    if (store.contacts[contact.id]) {
                        Object.assign(store.contacts[contact.id], contact);
                    }
                    else {
                        store.contacts[contact.id] = contact;
                    }
                }
                return;
            };
            insertContact(contacts);
        });
        //fin événement contact 
        //événement connexion
        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log("ℹ️ Toxic MD is connecting...");
            }
            else if (connection === 'open') {
                console.log("✅ Toxic MD Connected to WhatsApp!");
                console.log("--");
                await (0, baileys_1.delay)(200);
                console.log("------");
                await (0, baileys_1.delay)(300);
                console.log("------------------/-----");
                console.log("Toxic MD is Online ✅\n\n");
                //chargement des clintplugins 
                console.log("Loading Toxic Commands ...\n");
                fs.readdirSync(__dirname + "/clintplugins").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == (".js")) {
                        try {
                            require(__dirname + "/clintplugins/" + fichier);
                            console.log(fichier + " Installed Successfully✔️");
                        }
                        catch (e) {
                            console.log(`${fichier} could not be installed due to : ${e}`);
                        } /* require(__dirname + "/xh_clinton/" + fichier);
                         console.log(fichier + " Installed ✔️")*/
                        (0, baileys_1.delay)(300);
                    }
                });
                (0, baileys_1.delay)(700);
                var md;
                if ((conf.MODE).toLocaleLowerCase() === "yes") {
                    md = "public";
                }
                else if ((conf.MODE).toLocaleLowerCase() === "no") {
                    md = "private";
                }
                else {
                    md = "undefined";
                }
                console.log("Commands Installation Completed ✅");

                await activateCrons();
                
                if((conf.DP).toLowerCase() === 'yes') {     

                let cmsg =`      BOT RUNNING
                ⁠              
> 𝑫𝑬𝑽   :
𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
> 𝑩𝑶𝑻   : 
Toxic-MD 
⁠⁠`;
                await zk.sendMessage(zk.user.id, { text: cmsg });
                }
            }
            else if (connection == "close") {
                let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (raisonDeconnexion === baileys_1.DisconnectReason.badSession) {
                    console.log('Session id error, rescan again...');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionClosed) {
                    console.log('!!! connection closed, reconnection in progress ...');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionLost) {
                    console.log('connection error trying to reconnect... ');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason?.connectionReplaced) {
                    console.log('connection replaced ,,, a session is already open please close it !!!');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.loggedOut) {
                    console.log('you are disconnected,,, please rescan the qr code please');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) {
                    console.log('reboot in progress ▶️');
                    main();
                }   else {

                    console.log('restart error  ',raisonDeconnexion) ;         
                    //repondre("* Redémarrage du bot en cour ...*");

                                const {exec}=require("child_process") ;

                                exec("pm2 restart all");            
                }
                // sleep(50000)
                console.log("hum " + connection);
                main(); //console.log(session)
            }
        });
        //fin événement connexion
        //événement authentification 
        zk.ev.on("creds.update", saveCreds);
        //fin événement authentification 
        //
        /** ************* */
        //fonctions utiles
        zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './' + filename + '.' + type.ext;
            // save to file
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };


        zk.awaitForMessage = async (options = {}) =>{
            return new Promise((resolve, reject) => {
                if (typeof options !== 'object') reject(new Error('Options must be an object'));
                if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
                if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
                if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
                if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));
        
                const timeout = options?.timeout || undefined;
                const filter = options?.filter || (() => true);
                let interval = undefined
        
                /**
                 * 
                 * @param {{messages: Baileys.proto.IWebMessageInfo[], type: Baileys.MessageUpsertType}} data 
                 */
                let listener = (data) => {
                    let { type, messages } = data;
                    if (type == "notify") {
                        for (let message of messages) {
                            const fromMe = message.key.fromMe;
                            const chatId = message.key.remoteJid;
                            const isGroup = chatId.endsWith('@g.us');
                            const isStatus = chatId == 'status@broadcast';
        
                            const sender = fromMe ? zk.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? message.key.participant.replace(/:.*@/g, '@') : chatId;
                            if (sender == options.sender && chatId == options.chatJid && filter(message)) {
                                zk.ev.off('messages.upsert', listener);
                                clearTimeout(interval);
                                resolve(message);
                            }
                        }
                    }
                }
                zk.ev.on('messages.upsert', listener);
                if (timeout) {
                    interval = setTimeout(() => {
                        zk.ev.off('messages.upsert', listener);
                        reject(new Error('Timeout'));
                    }, timeout);
                }
            });
        }



        // fin fonctions utiles
        /** ************* */
        return zk;
    }
    let fichier = require.resolve(__filename);
    fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`update ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
    });
    main();
}, 5000);
