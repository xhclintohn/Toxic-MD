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
//import chalk from 'chalk'
const { verifierEtatJid , recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid , atbrecupererActionJid } = require("./bdd/antibot");
let evt = require(__dirname + "/framework/zokou");
const {isUserBanned , addUserToBanList , removeUserFromBanList} = require("./bdd/banUser");
const  {addGroupToBanList,isGroupBanned,removeGroupFromBanList} = require("./bdd/banGroup");
const {isGroupOnlyAdmin,addGroupToOnlyAdminList,removeGroupFromOnlyAdminList} = require("./bdd/onlyAdmin");
//const //{loadCmd}=require("/framework/mesfonctions")
let { reagir } = require(__dirname + "/framework/app");
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g,"");
const prefixe = conf.PREFIXE;
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)


async function authentification() {
    try {
       
        //console.log("le data "+data)
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("connexion en cour ...");
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
            //console.log(session)
        }
        else if (fs.existsSync(__dirname + "/auth/creds.json") && session != "zokk") {
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
    }
    catch (e) {
        console.log("Session Invalid " + e);
        return;
    }
}
authentification();
const store = (0, baileys_1.makeInMemoryStore)({
    logger: pino().child({ level: "silent", stream: "store" }),
});
setTimeout(() => {
    async function main() {
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Toxic-MD', "safari", "1.0.0"],
            printQRInTerminal: true,
            fireInitQueries: false,
            shouldSyncHistoryMessage: true,
            downloadHistory: true,
            syncFullHistory: true,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            keepAliveIntervalMs: 30_000,
            /* auth: state*/ auth: {
                creds: state.creds,
                /** caching makes the store faster to send/recv messages */
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            //////////
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return {
                    conversation: 'An Error Occurred, Repeat Command!'
                };
            }
            ///////
        };
        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);
        setInterval(() => { store.writeToFile("store.json"); }, 3000);
        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message)
                return;
            const decodeJid = (jid) => {
                if (!jid)
                    return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                else
                    return jid;
            };
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : mtype == "buttonsResponseMessage" ?
                ms?.message?.buttonsResponseMessage?.selectedButtonId : mtype == "listResponseMessage" ?
                ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : mtype == "messageContextInfo" ?
                (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];
            /* const dj='22559763447';
             const dj2='254751284190';
             const luffy='254762016957'*/
            /*  var superUser=[servBot,dj,dj2,luffy].map((s)=>s.replace(/[^0-9]/g)+"@s.whatsapp.net").includes(auteurMessage);
              var dev =[dj,dj2,luffy].map((t)=>t.replace(/[^0-9]/g)+"@s.whatsapp.net").includes(auteurMessage);*/
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            //ms.message.extendedTextMessage?.contextInfo?.mentionedJid
            // ms.message.extendedTextMessage?.contextInfo?.quotedMessage.
            var mr = ms.Message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }
            
              const memberGroup = isGroup ? ms.key.participant : '';
const { getAllSudoNumbers } = require("./bdd/sudo");
const senderName = ms.pushName;
const owner1 = '254735342808'; // Your first owner number
const owner2 = '254799283147'; // Your second owner number
const sudoUsers = await getAllSudoNumbers();

const superUserNumbers = [
    botServer, 
    owner1, 
    owner2,
    conf.OWNER_NUMBER
].map(num => num.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

const allAllowedNumbers = superUserNumbers.concat(sudoUsers);
const isSuperUser = allAllowedNumbers.includes(sender);

const isDev = [owner1, owner2].map(num => 
    num.replace(/[^0-9]/g, '') + "@s.whatsapp.net"
).includes(sender);

function reply(message) { 
    zk.sendMessage(chatId, { text: message }, { quoted: ms }); 
}

console.log("\t𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐎𝐍𝐋𝐈𝐍𝐄");
console.log("═════════ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐋𝐨𝐠 ═════════");
if (isGroup) {
    console.log("𝐆𝐫𝐨𝐮𝐩: " + groupName);
}
console.log(`𝐒𝐞𝐧𝐝𝐞𝐫: [${senderName} : ${sender.split("@")[0]}]`);
console.log("𝐓𝐲𝐩𝐞: " + messageType);
console.log("────── 𝐂𝐨𝐧𝐭𝐞𝐧𝐭 ──────");
console.log(text);

function getGroupAdmins(participants) {
    return participants
        .filter(p => p.admin !== null)
        .map(p => p.id);
}

// Presence updates
const status = conf.STATUS;
switch(status) {
    case 1:
        await zk.sendPresenceUpdate("available", chatId);
        break;
    case 2:
        await zk.sendPresenceUpdate("composing", chatId);
        break;
    case 3:
        await zk.sendPresenceUpdate("recording", chatId);
        break;
    default:
        await zk.sendPresenceUpdate("unavailable", chatId);
}

const participants = isGroup ? await groupMetadata.participants : [];
const admins = isGroup ? getGroupAdmins(participants) : [];
const isAdmin = isGroup ? admins.includes(sender) : false;
const isBotAdmin = isGroup ? admins.includes(botId) : false;

// Command parsing
const args = text ? text.trim().split(/ +/).slice(1) : null;
const isCommand = text ? text.startsWith(prefix) : false;
const command = isCommand ? text.slice(1).trim().split(/ +/).shift().toLowerCase() : false;

const links = conf.URL.split(',');

            
            // Utiliser une boucle for...of pour parcourir les liens
function mybotpic() {
    // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     const indiceAleatoire = Math.floor(Math.random() * lien.length);
     // Récupérer le lien correspondant à l'indice aléatoire
     const lienAleatoire = lien[indiceAleatoire];
     return lienAleatoire;
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


            /************************ anti-delete-message */

            if(ms.message.protocolMessage && ms.message.protocolMessage.type === 0 && (conf.ADM).toLocaleLowerCase() === 'yes' ) {

                if(ms.key.fromMe || ms.message.protocolMessage.key.fromMe) { console.log('Message supprimer me concernant') ; return }
        
                                console.log(`Message supprimer`)
                                let key =  ms.message.protocolMessage.key ;
                                
        
                               try {
        
                                  let st = './store.json' ;
        
                                const data = fs.readFileSync(st, 'utf8');
        
                                const jsonData = JSON.parse(data);
        
                                    let message = jsonData.messages[key.remoteJid] ;
                                
                                    let msg ;
        
                                    for (let i = 0 ; i < message.length ; i++) {
        
                                        if (message[i].key.id === key.id) {
                                            
                                            msg = message[i] ;
        
                                            break 
                                        }
        
                                    } 
        
                                  //  console.log(msg)
        
                                    if(msg === null || !msg ||msg === 'undefined') {console.log('Message non trouver') ; return } 
        
                                await zk.sendMessage(idBot,{ image : { url : './media/deleted-message.jpg'},caption : `        Anti-delete-message\n Message from @${msg.key.participant.split('@')[0]}​` , mentions : [msg.key.participant]},)
                                .then( () => {
                                    zk.sendMessage(idBot,{forward : msg},{quoted : msg}) ;
                                })
                               
                              
        
                               } catch (e) {
                                    console.log(e)
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
            /** ******fin auto-status */
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


     //anti-lien
     try {
        const yes = await verifierEtatJid(origineMessage)
        if (texte.includes('https://') && verifGroupe &&  yes  ) {

         console.log("lien detecté")
            var verifZokAdmin = verifGroupe ? admins.includes(idBot) : false;
            
             if(superUser || verifAdmin || !verifZokAdmin  ) { console.log('je fais rien'); return};
                        
                                    const key = {
                                        remoteJid: origineMessage,
                                        fromMe: false,
                                        id: ms.key.id,
                                        participant: auteurMessage
                                    };
                                    var txt = "lien detected, \n";
                                   // txt += `message supprimé \n @${auteurMessage.split("@")[0]} rétiré du groupe.`;
                                    const gifLink = "https://raw.githubusercontent.com/xhclintohn/Toxic-MD/main/media/remover.gif";
                                    var sticker = new Sticker(gifLink, {
                                        pack: '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧',
                                        author: conf.OWNER_NAME,
                                        type: StickerTypes.FULL,
                                        categories: ['🤩', '🎉'],
                                        id: '12345',
                                        quality: 50,
                                        background: '#000000'
                                    });
                                    await sticker.toFile("st1.webp");
                                    // var txt = `@${auteurMsgRepondu.split("@")[0]} a été rétiré du groupe..\n`
                                    var action = await recupererActionJid(origineMessage);

                                      if (action === 'remove') {

                                        txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;

                                    await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                                    (0, baileys_1.delay)(800);
                                    await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                                    try {
                                        await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                                    }
                                    catch (e) {
                                        console.log("antiien ") + e;
                                    }
                                    await zk.sendMessage(origineMessage, { delete: key });
                                    await fs.unlink("st1.webp"); } 
                                        
                                       else if (action === 'delete') {
                                        txt += `message deleted \n @${auteurMessage.split("@")[0]} avoid sending link.`;
                                        // await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
                                       await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                                       await zk.sendMessage(origineMessage, { delete: key });
                                       await fs.unlink("st1.webp");

                                    } else if(action === 'warn') {
                                        const {getWarnCountByJID ,ajouterUtilisateurAvecWarnCount} = require('./bdd/warn') ;

                            let warn = await getWarnCountByJID(auteurMessage) ; 
                            let warnlimit = conf.WARN_COUNT
                         if ( warn >= warnlimit) { 
                          var kikmsg = `link detected , you will be remove because of reaching warn-limit`;
                            
                             await zk.sendMessage(origineMessage, { text: kikmsg , mentions: [auteurMessage] }, { quoted: ms }) ;


                             await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                             await zk.sendMessage(origineMessage, { delete: key });


                            } else {
                                var rest = warnlimit - warn ;
                              var  msg = `Link detected , your warn_count was upgrade ;\n rest : ${rest} `;

                              await ajouterUtilisateurAvecWarnCount(auteurMessage)

                              await zk.sendMessage(origineMessage, { text: msg , mentions: [auteurMessage] }, { quoted: ms }) ;
                              await zk.sendMessage(origineMessage, { delete: key });

                            }
                                    }
                                }
                                
                            }
                        
                    
                
            
        
    
    catch (e) {
        console.log("bdd err " + e);
    }
    


    /** *************************anti-bot******************************************** */
    try {
        const botMsg = ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16;
        const baileysMsg = ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16;
        if (botMsg || baileysMsg) {

            if (mtype === 'reactionMessage') { console.log('Je ne reagis pas au reactions') ; return} ;
            const antibotactiver = await atbverifierEtatJid(origineMessage);
            if(!antibotactiver) {return};

            if( verifAdmin || auteurMessage === idBot  ) { console.log('je fais rien'); return};
                        
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
                pack: '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧',
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
            
            //execution des commandes   
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
                        console.log("😡😡 " + e);
                        zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
                    }
                }
            }
            //fin exécution commandes
        });
        //fin événement message

/******** evenement groupe update ****************/
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
        // Group Update Event Handler
zk.ev.on('group-participants.update', async (group) => {
    try {
        const metadata = await zk.groupMetadata(group.id);
        const groupImg = await zk.profilePictureUrl(group.id, 'image').catch(() => null);

        // Welcome Message
        if (group.action === 'add' && (await recupevents(group.id, "welcome") === 'on') {
            let welcomeMsg = `*𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐌𝐄𝐒𝐒𝐀𝐆𝐄*\n\n`;
            group.participants.forEach(member => {
                welcomeMsg += `✨ *Welcome* @${member.split("@")[0]} to the group!\n`;
            });
            welcomeMsg += `\n📌 *Please read group rules carefully*`;

            zk.sendMessage(group.id, { 
                image: { url: groupImg || './media/default-welcome.jpg' },
                caption: welcomeMsg,
                mentions: group.participants
            });

        // Goodbye Message
        } else if (group.action === 'remove' && (await recupevents(group.id, "goodbye") === 'on') {
            let goodbyeMsg = `*Member Departure*\n`;
            group.participants.forEach(member => {
                goodbyeMsg += `➖ @${member.split("@")[0]}\n`;
            });

            zk.sendMessage(group.id, { 
                text: goodbyeMsg,
                mentions: group.participants
            });

        // Anti-Promotion System
        } else if (group.action === 'promote' && (await recupevents(group.id, "antipromote") === 'on') {
            const authorized = [
                metadata.owner,
                conf.NUMERO_OWNER + '@s.whatsapp.net',
                decodeJid(zk.user.id),
                group.participants[0]
            ].includes(group.author);

            if (!authorized) {
                await zk.groupParticipantsUpdate(group.id, [group.author, group.participants[0]], "demote");
                zk.sendMessage(group.id, {
                    text: `⚠️ @${group.author.split("@")[0]} violated anti-promotion rules\n` +
                          `Both user and promoted member have been demoted`,
                    mentions: [group.author, group.participants[0]]
                });
            }

        // Anti-Demotion System
        } else if (group.action === 'demote' && (await recupevents(group.id, "antidemote") === 'on')) {
            const authorized = [
                metadata.owner,
                conf.NUMERO_OWNER + '@s.whatsapp.net',
                decodeJid(zk.user.id),
                group.participants[0]
            ].includes(group.author);

            if (!authorized) {
                await zk.groupParticipantsUpdate(group.id, [group.author], "demote");
                await zk.groupParticipantsUpdate(group.id, [group.participants[0]], "promote");
                zk.sendMessage(group.id, {
                    text: `⚠️ @${group.author.split("@")[0]} violated anti-demotion rules\n` +
                          `Admin rights have been reversed`,
                    mentions: [group.author, group.participants[0]]
                });
            }
        }
    } catch (e) {
        console.error('𝐆𝐫𝐨𝐮𝐩 𝐄𝐯𝐞𝐧𝐭 𝐄𝐫𝐫𝐨𝐫:', e);
    }
});

/********* End of Group Update Event *********/

/********* Cron Job Setup *********/
async function activateCrons() {
    const cron = require('node-cron');
    const { getCron } = require('./bdd/cron');

    const cronJobs = await getCron();
    if (cronJobs.length === 0) {
        console.log('𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐜𝐫𝐨𝐧 𝐣𝐨𝐛𝐬');
        return;
    }

    cronJobs.forEach(job => {
        if (job.mute_at) {
            const [hour, minute] = job.mute_at.split(':');
            console.log(`⏰ 𝐒𝐞𝐭𝐭𝐢𝐧𝐠 𝐮𝐩 𝐚𝐮𝐭𝐨-𝐦𝐮𝐭𝐞 𝐚𝐭 ${hour}:${minute} 𝐟𝐨𝐫 ${job.group_id}`);

            cron.schedule(`${minute} ${hour} * * *`, async () => {
                await zk.groupSettingUpdate(job.group_id, 'announcement');
                zk.sendMessage(job.group_id, { 
                    image: { url: './media/night-mode.jpg' },
                    caption: "🌙 *Group is now closed for the night*\nGoodnight everyone!"
                });
            }, { timezone: "Africa/Nairobi" });
        }

        if (job.unmute_at) {
            const [hour, minute] = job.unmute_at.split(':');
            console.log(`⏰ 𝐒𝐞𝐭𝐭𝐢𝐧𝐠 𝐮𝐩 𝐚𝐮𝐭𝐨-𝐮𝐧𝐦𝐮𝐭𝐞 𝐚𝐭 ${hour}:${minute} 𝐟𝐨𝐫 ${job.group_id}`);

            cron.schedule(`${minute} ${hour} * * *`, async () => {
                await zk.groupSettingUpdate(job.group_id, 'not_announcement');
                zk.sendMessage(job.group_id, { 
                    image: { url: './media/day-mode.jpg' },
                    caption: "☀️ *Good morning! Group is now open*"
                });
            }, { timezone: "Africa/Nairobi" });
        }
    });
}

/********* Connection Events *********/
zk.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "connecting") {
        console.log("🔌 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠...");
    } else if (connection === "open") {
        console.log("✅ 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝");
        
        // Load commands
        console.log("🔄 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬...");
        fs.readdirSync(__dirname + "/commands").forEach(file => {
            if (path.extname(file).toLowerCase() === ".js") {
                try {
                    require(__dirname + "/commands/" + file);
                    console.log(`✔️ ${file} 𝐥𝐨𝐚𝐝𝐞𝐝`);
                } catch (e) {
                    console.log(`❌ ${file} 𝐟𝐚𝐢𝐥𝐞𝐝: ${e.message}`);
                }
            }
        });

        await activateCrons();
        
        if (conf.DP.toLowerCase() === 'yes') {
            const statusMsg = `      ❒─❒ *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 𝐒𝐓𝐀𝐓𝐔𝐒* ❒─❒
╭❒─❒─❒─❒─❒              
❒ 𝐎𝐰𝐧𝐞𝐫 : *𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*   
❒ 𝐁𝐨𝐭   : *𝐓𝐎𝐗𝐈𝐂-𝐌𝐃*
❒ 𝐌𝐨𝐝𝐞 : ${conf.MODE.toLowerCase() === "yes" ? "public" : "private"}
╰❒─❒─❒─❒─❒`;
            await zk.sendMessage(zk.user.id, { text: statusMsg });
        }
    } else if (connection === "close") {
        const statusCode = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
        
        const errorMessages = {
            [baileys_1.DisconnectReason.badSession]: "❌ Invalid session, please rescan QR",
            [baileys_1.DisconnectReason.connectionClosed]: "🔌 Connection closed, reconnecting...",
            [baileys_1.DisconnectReason.connectionLost]: "📡 Connection lost, reconnecting...",
            [baileys_1.DisconnectReason.connectionReplaced]: "⚠️ Another session detected",
            [baileys_1.DisconnectReason.loggedOut]: "🔐 Logged out, please rescan QR",
            [baileys_1.DisconnectReason.restartRequired]: "🔄 Restarting..."
        };

        console.log(errorMessages[statusCode] || `⚠️ Unknown error: ${statusCode}`);
        
        if (statusCode !== baileys_1.DisconnectReason.connectionReplaced && 
            statusCode !== baileys_1.DisconnectReason.badSession) {
            main();
        }
    }
});

// Utility Functions
zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
    try {
        const quoted = message.msg || message;
        const mime = quoted.mimetype || '';
        const type = message.mtype?.replace(/Message/gi, '') || mime.split('/')[0];
        
        const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, type);
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        const fileType = await FileType.fromBuffer(buffer);
        const fileExt = fileType?.ext || 'bin';
        const filePath = `./${filename}.${fileExt}`;
        
        await fs.writeFileSync(filePath, buffer);
        return filePath;
    } catch (e) {
        console.error('𝐌𝐞𝐝𝐢𝐚 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐄𝐫𝐫𝐨𝐫:', e);
        return null;
    }
};

// File watcher for development
if (process.env.NODE_ENV !== 'production') {
    const filePath = require.resolve(__filename);
    fs.watchFile(filePath, () => {
        fs.unwatchFile(filePath);
        console.log(`🔄 ${path.basename(__filename)} updated - restarting...`);
        delete require.cache[filePath];
        require(filePath);
    });
}

// Start the bot
main();