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
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("Connection in progress...");
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
        else if (fs.existsSync(__dirname + "/auth/creds.json") && session != "zokk") {
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
    }
    catch (e) {
        console.log("Invalid Session " + e);
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
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return {
                    conversation: 'An Error Occurred, Repeat Command!'
                };
            }
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
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                else return jid;
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
            var mr = ms.Message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }

            var membreGroupe = verifGroupe ? ms.key.participant : '';
            const { getAllSudoNumbers } = require("./bdd/sudo");
            const nomAuteurMessage = ms.pushName;
            
            const owner1 = '254735342808';
            const owner2 = '254799283147';
            const sudo = await getAllSudoNumbers();
            const superUserNumbers = [servBot, owner1, owner2, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);
            
          
            const ownerName = '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧';
            
            function repondre(mes) { 
                zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); 
            }
            
            console.log("\tToxic-MD ONLINE");
            console.log("=========== Message Log ===========");
            if (verifGroupe) {
                console.log("Group: " + nomGroupe);
            }
            console.log("Sender: " + "[" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + " ]");
            console.log("Message Type: " + mtype);
            console.log("------ Content ------");
            console.log(texte);

            function groupeAdmin(membreGroupe) {
                let admin = [];
                for (m of membreGroupe) {
                    if (m.admin == null) continue;
                    admin.push(m.id);
                }
                return admin;
            }

            var etat = conf.ETAT;
            if(etat == 1) {
                await zk.sendPresenceUpdate("available", origineMessage);
            }
            else if(etat == 2) {
                await zk.sendPresenceUpdate("composing", origineMessage);
            }
            else if(etat == 3) {
                await zk.sendPresenceUpdate("recording", origineMessage);
            }
            else {
                await zk.sendPresenceUpdate("unavailable", origineMessage);
            }

            const mbre = verifGroupe ? await infosGroupe.participants : '';
            let admins = verifGroupe ? groupeAdmin(mbre) : '';
            const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
            var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;
            
            /** Command parsing */
            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
           
            const lien = conf.URL.split(',');  

            // Random bot picture selector
            function mybotpic() {
                const indiceAleatoire = Math.floor(Math.random() * lien.length);
                const lienAleatoire = lien[indiceAleatoire];
                return lienAleatoire;
            }

            var commandeOptions = {
                superUser, 
                dev,
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

            /************************ Anti-Delete Message ************************/
            if(ms.message.protocolMessage && ms.message.protocolMessage.type === 0 && (conf.ADM).toLocaleLowerCase() === 'yes') {
                if(ms.key.fromMe || ms.message.protocolMessage.key.fromMe) { 
                    console.log('Deleted message was from me'); 
                    return; 
                }

                console.log(`Deleted message detected`);
                let key = ms.message.protocolMessage.key;
                
                try {
                    let st = './store.json';
                    const data = fs.readFileSync(st, 'utf8');
                    const jsonData = JSON.parse(data);
                    let message = jsonData.messages[key.remoteJid];
                    let msg;

                    for (let i = 0; i < message.length; i++) {
                        if (message[i].key.id === key.id) {
                            msg = message[i];
                            break;
                        }
                    } 

                    if(!msg) {
                        console.log('Message not found in store');
                        return;
                    }

                    await zk.sendMessage(
                        idBot,
                        { 
                            image: { url: './media/deleted-message.jpg' },
                            caption: `😈 Anti-Delete Message 😈\nMessage from @${msg.key.participant.split('@')[0]}`,
                            mentions: [msg.key.participant]
                        }
                    ).then(() => {
                        zk.sendMessage(idBot, {forward: msg}, {quoted: msg});
                    });

                } catch (e) {
                    console.error('Anti-delete error:', e);
                }
            }

            /** Auto-Status Handling */
            if (ms.key && ms.key.remoteJid === "status@broadcast") {
                if (conf.AUTO_READ_STATUS === "yes") {
                    await zk.readMessages([ms.key]);
                }

                if (conf.AUTO_DOWNLOAD_STATUS === "yes") {
                    try {
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
                                video: { url: stVideo }, 
                                caption: stMsg
                            }, { quoted: ms });
                        }
                    } catch (statusError) {
                        console.error('Status download error:', statusError);
                    }
                }
            }

            // Block messages from specific group
            if (!dev && origineMessage == "120363158701337904@g.us") {
                return;
            }
            
            //---------------------------------------Level System--------------------------------
            if (texte && auteurMessage.endsWith("s.whatsapp.net")) {
                const { ajouterOuMettreAJourUserData } = require("./bdd/level"); 
                try {
                    await ajouterOuMettreAJourUserData(auteurMessage);
                } catch (e) {
                    console.error('Level system error:', e);
                }
            }
            
            /////////////////////////////   Mentions Handling /////////////////////////////////////////
            try {
                if (ms.message[mtype].contextInfo?.mentionedJid && 
                    (ms.message[mtype].contextInfo.mentionedJid.includes(idBot) ||  
                    ms.message[mtype].contextInfo.mentionedJid.includes(conf.NUMERO_OWNER + '@s.whatsapp.net')
                ) {
                    if (origineMessage == "120363158701337904@g.us") {
                        return;
                    }

                    if(superUser) {
                        console.log('Admin mentioned, ignoring mention response');
                        return;
                    } 
                    
                    let mbd = require('./bdd/mention');
                    let alldata = await mbd.recupererToutesLesValeurs();
                    let data = alldata[0];

                    if (data.status === 'non') { 
                        console.log('Mention replies disabled');
                        return;
                    }

                    let msg;

                    if (data.type.toLocaleLowerCase() === 'image') {
                        msg = {
                            image: { url: data.url },
                            caption: data.message.replace('{user}', nomAuteurMessage)
                        }
                    } else if (data.type.toLocaleLowerCase() === 'video') {
                        msg = {
                            video: { url: data.url },
                            caption: data.message.replace('{user}', nomAuteurMessage)
                        }
                    } else if (data.type.toLocaleLowerCase() === 'sticker') {
                        let stickerMess = new Sticker(data.url, {
                            pack: 'Toxic-MD',
                            type: StickerTypes.FULL,
                            categories: ["🤩", "🎉"],
                            id: "12345",
                            quality: 70,
                            background: "transparent",
                        });
                        const stickerBuffer2 = await stickerMess.toBuffer();
                        msg = { sticker: stickerBuffer2 }
                    } else if (data.type.toLocaleLowerCase() === 'audio') {
                        msg = {
                            audio: { url: data.url },
                            mimetype: 'audio/mp4',
                        }
                    }

                    if (msg) {
                        await zk.sendMessage(origineMessage, msg, { quoted: ms });
                    }
                }
            } catch (error) {
                console.error('Mention handling error:', error);
            }


 // Anti-Link System
try {
    const antiLinkActive = await verifierEtatJid(origineMessage);
    if (texte.includes('https://') && verifGroupe && antiLinkActive) {
        console.log("𝐋𝐢𝐧𝐤 𝐝𝐞𝐭𝐞𝐜𝐭𝐞𝐝");
        var isBotAdmin = verifGroupe ? admins.includes(idBot) : false;
        
        if(superUser || verifAdmin || !isBotAdmin) { 
            console.log('𝐍𝐨 𝐚𝐜𝐭𝐢𝐨𝐧 𝐧𝐞𝐞𝐝𝐞𝐝 (𝐚𝐝𝐦𝐢𝐧/𝐮𝐬𝐞𝐫 𝐞𝐱𝐜𝐞𝐩𝐭𝐢𝐨𝐧)'); 
            return;
        }

        const key = {
            remoteJid: origineMessage,
            fromMe: false,
            id: ms.key.id,
            participant: auteurMessage
        };

        let txt = "⚠️ 𝐋𝐢𝐧𝐤 𝐝𝐞𝐭𝐞𝐜𝐭𝐞𝐝 𝐢𝐧 𝐠𝐫𝐨𝐮𝐩\n";
        const action = await recupererActionJid(origineMessage);
        const gifLink = "https://raw.githubusercontent.com/xhclintohn/Toxic-MD/main/media/remover.gif";

        // Create warning sticker
        var sticker = new Sticker(gifLink, {
            pack: '𝐓𝐨𝐱𝐢𝐜-𝐌𝐃',
            author: '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧',
            type: StickerTypes.FULL,
            categories: ['⚠️', '🚫'],
            id: '12345',
            quality: 50,
            background: '#000000'
        });
        await sticker.toFile("st1.webp");

        if (action === 'remove') {
            txt += `𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐝𝐞𝐥𝐞𝐭𝐞𝐝\n@${auteurMessage.split("@")[0]} 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐫𝐨𝐦 𝐠𝐫𝐨𝐮𝐩.`;
            
            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
            await (0, baileys_1.delay)(800);
            await zk.sendMessage(origineMessage, { 
                text: txt, 
                mentions: [auteurMessage] 
            }, { quoted: ms });
            
            try {
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            } catch (e) {
                console.log("𝐀𝐧𝐭𝐢-𝐥𝐢𝐧𝐤 𝐫𝐞𝐦𝐨𝐯𝐚𝐥 𝐞𝐫𝐫𝐨𝐫: " + e);
            }
            
        } else if (action === 'delete') {
            txt += `𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐝𝐞𝐥𝐞𝐭𝐞𝐝\n@${auteurMessage.split("@")[0]} 𝐚𝐯𝐨𝐢𝐝 𝐬𝐞𝐧𝐝𝐢𝐧𝐠 𝐥𝐢𝐧𝐤𝐬.`;
            await zk.sendMessage(origineMessage, { 
                text: txt, 
                mentions: [auteurMessage] 
            }, { quoted: ms });
            
        } else if (action === 'warn') {
            const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount } = require('./bdd/warn');
            let warn = await getWarnCountByJID(auteurMessage);
            let warnlimit = conf.WARN_COUNT;

            if (warn >= warnlimit) {
                let kikmsg = `⚠️ 𝐋𝐢𝐧𝐤 𝐯𝐢𝐨𝐥𝐚𝐭𝐢𝐨𝐧\n𝐘𝐨𝐮'𝐯𝐞 𝐛𝐞𝐞𝐧 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐨𝐫 𝐫𝐞𝐚𝐜𝐡𝐢𝐧𝐠 𝐰𝐚𝐫𝐧 𝐥𝐢𝐦𝐢𝐭 (${warnlimit})`;
                await zk.sendMessage(origineMessage, { 
                    text: kikmsg, 
                    mentions: [auteurMessage] 
                }, { quoted: ms });
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            } else {
                let rest = warnlimit - warn;
                let msg = `⚠️ 𝐋𝐢𝐧𝐤 𝐯𝐢𝐨𝐥𝐚𝐭𝐢𝐨𝐧\n𝐖𝐚𝐫𝐧𝐢𝐧𝐠 𝐚𝐝𝐝𝐞𝐝 (${warn + 1}/${warnlimit})\n𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠 𝐰𝐚𝐫𝐧𝐢𝐧𝐠𝐬: ${rest}`;
                await ajouterUtilisateurAvecWarnCount(auteurMessage);
                await zk.sendMessage(origineMessage, { 
                    text: msg, 
                    mentions: [auteurMessage] 
                }, { quoted: ms });
            }
        }
        
        await zk.sendMessage(origineMessage, { delete: key });
        await fs.unlink("st1.webp");
    }
} catch (e) {
    console.log("𝐀𝐧𝐭𝐢-𝐥𝐢𝐧𝐤 𝐞𝐫𝐫𝐨𝐫: " + e);
}

// Anti-Bot System
try {
    const botMsg = ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16;
    const baileysMsg = ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16;
    if (botMsg || baileysMsg) {
        if (mtype === 'reactionMessage') { 
            console.log('𝐈𝐠𝐧𝐨𝐫𝐢𝐧𝐠 𝐫𝐞𝐚𝐜𝐭𝐢𝐨𝐧𝐬'); 
            return
        };

        const antibotActive = await atbverifierEtatJid(origineMessage);
        if(!antibotActive) {return};

        if(verifAdmin || auteurMessage === idBot) { 
            console.log('𝐍𝐨 𝐚𝐜𝐭𝐢𝐨𝐧 𝐧𝐞𝐞𝐝𝐞𝐝 (𝐚𝐝𝐦𝐢𝐧/𝐛𝐨𝐭 𝐞𝐱𝐜𝐞𝐩𝐭𝐢𝐨𝐧)'); 
            return
        };
        
        const key = {
            remoteJid: origineMessage,
            fromMe: false,
            id: ms.key.id,
            participant: auteurMessage
        };
        
        let txt = "🤖 𝐁𝐨𝐭 𝐝𝐞𝐭𝐞𝐜𝐭𝐞𝐝\n";
        const action = await atbrecupererActionJid(origineMessage);
        const gifLink = "https://raw.githubusercontent.com/xhclintohn/Toxic-MD/main/media/remover.gif";
        
        var sticker = new Sticker(gifLink, {
            pack: '𝐓𝐨𝐱𝐢𝐜-𝐌𝐃',
            author: '𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧',
            type: StickerTypes.FULL,
            categories: ['🤖', '🚫'],
            id: '12345',
            quality: 50,
            background: '#000000'
        });
        await sticker.toFile("st1.webp");

        if (action === 'remove') {
            txt += `𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐝𝐞𝐥𝐞𝐭𝐞𝐝\n@${auteurMessage.split("@")[0]} 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐫𝐨𝐦 𝐠𝐫𝐨𝐮𝐩.`;

            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
            await (0, baileys_1.delay)(800);
            await zk.sendMessage(origineMessage, { 
                text: txt, 
                mentions: [auteurMessage] 
            }, { quoted: ms });
            
            try {
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            } catch (e) {
                console.log("𝐀𝐧𝐭𝐢-𝐛𝐨𝐭 𝐫𝐞𝐦𝐨𝐯𝐚𝐥 𝐞𝐫𝐫𝐨𝐫: " + e);
            }
            
        } else if (action === 'delete') {
            txt += `𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐝𝐞𝐥𝐞𝐭����𝐝\n@${auteurMessage.split("@")[0]} 𝐚𝐯𝐨𝐢𝐝 𝐮𝐬𝐢𝐧𝐠 𝐛𝐨𝐭𝐬.`;
            await zk.sendMessage(origineMessage, { 
                text: txt, 
                mentions: [auteurMessage] 
            }, { quoted: ms });
            
        } else if (action === 'warn') {
            const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount } = require('./bdd/warn');
            let warn = await getWarnCountByJID(auteurMessage);
            let warnlimit = conf.WARN_COUNT;

            if (warn >= warnlimit) {
                let kikmsg = `🤖 𝐁𝐨𝐭 𝐯𝐢𝐨𝐥𝐚𝐭𝐢𝐨𝐧\n𝐘𝐨𝐮'𝐯𝐞 𝐛𝐞𝐞𝐧 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐨𝐫 𝐫𝐞𝐚𝐜𝐡𝐢𝐧𝐠 𝐰𝐚𝐫𝐧 𝐥𝐢𝐦𝐢𝐭 (${warnlimit})`;
                await zk.sendMessage(origineMessage, { 
                    text: kikmsg, 
                    mentions: [auteurMessage] 
                }, { quoted: ms });
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            } else {
                let rest = warnlimit - warn;
                let msg = `🤖 𝐁𝐨𝐭 𝐯𝐢𝐨𝐥𝐚𝐭𝐢𝐨𝐧\n𝐖𝐚𝐫𝐧𝐢𝐧𝐠 𝐚𝐝𝐝𝐞𝐝 (${warn + 1}/${warnlimit})\n𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠 𝐰𝐚𝐫𝐧𝐢𝐧𝐠𝐬: ${rest}`;
                await ajouterUtilisateurAvecWarnCount(auteurMessage);
                await zk.sendMessage(origineMessage, { 
                    text: msg, 
                    mentions: [auteurMessage] 
                }, { quoted: ms });
            }
        }
        
        await zk.sendMessage(origineMessage, { delete: key });
        await fs.unlink("st1.webp");
    }
} catch (er) {
    console.log('𝐀𝐧𝐭𝐢-𝐛𝐨𝐭 𝐞𝐫𝐫𝐨𝐫: ' + er);
}

/******** End of Group Update Event *************************/

/***************************** Cron Setup *****************************/
async function activateCrons() {
    const cron = require('node-cron');
    const { getCron } = require('./bdd/cron');

    let crons = await getCron();
    console.log(crons);
    if (crons.length > 0) {
        for (let i = 0; i < crons.length; i++) {
            if (crons[i].mute_at != null) {
                let set = crons[i].mute_at.split(':');

                console.log(`𝐒𝐞𝐭𝐭𝐢𝐧𝐠 𝐮𝐩 𝐚𝐮𝐭𝐨-𝐦𝐮𝐭𝐞 𝐟𝐨𝐫 ${crons[i].group_id} 𝐚𝐭 ${set[0]}:${set[1]}`)

                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                    await zk.groupSettingUpdate(crons[i].group_id, 'announcement');
                    zk.sendMessage(crons[i].group_id, { 
                        image: { url: './media/chrono.webp' }, 
                        caption: "🌙 𝐆𝐫𝐨𝐮𝐩 𝐢𝐬 𝐧𝐨𝐰 𝐜𝐥𝐨𝐬𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐧𝐢𝐠𝐡𝐭. 𝐆𝐨𝐨𝐝𝐧𝐢𝐠𝐡𝐭!" 
                    });
                }, {
                    timezone: "Africa/Nairobi"
                });
            }

            if (crons[i].unmute_at != null) {
                let set = crons[i].unmute_at.split(':');

                console.log(`𝐒𝐞𝐭𝐭𝐢𝐧𝐠 𝐮𝐩 𝐚𝐮𝐭𝐨-𝐮𝐧𝐦𝐮𝐭𝐞 𝐟𝐨𝐫 ${set[0]}:${set[1]}`)
        
                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                    await zk.groupSettingUpdate(crons[i].group_id, 'not_announcement');
                    zk.sendMessage(crons[i].group_id, { 
                        image: { url: './media/chrono.webp' }, 
                        caption: "☀️ 𝐆𝐨𝐨𝐝 𝐦𝐨𝐫𝐧𝐢𝐧𝐠! 𝐆𝐫𝐨𝐮𝐩 𝐢𝐬 𝐧𝐨𝐰 𝐨𝐩𝐞𝐧." 
                    });
                }, {
                    timezone: "Africa/Nairobi"
                });
            }
        }
    } else {
        console.log('𝐍𝐨 𝐜𝐫𝐨𝐧 𝐣𝐨𝐛𝐬 𝐭𝐨 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞');
    }
    return;
}

// Contact Event
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

// Connection Event
zk.ev.on("connection.update", async (con) => {
    const { lastDisconnect, connection } = con;
    if (connection === "connecting") {
        console.log("🔌 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐢𝐬 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠...");
    }
    else if (connection === 'open') {
        console.log("✅ 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝!");
        console.log("--------------------");
        console.log("𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐢𝐬 𝐧𝐨𝐰 𝐎𝐧𝐥𝐢𝐧𝐞 🚀\n\n");
        
        // Loading commands
        console.log("𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬...\n");
        fs.readdirSync(__dirname + "/commandes").forEach((fichier) => {
            if (path.extname(fichier).toLowerCase() == (".js")) {
                try {
                    require(__dirname + "/commandes/" + fichier);
                    console.log(`✔️ ${fichier} 𝐥𝐨𝐚𝐝𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲`);
                }
                catch (e) {
                    console.log(`❌ ${fichier} 𝐟𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝: ${e}`);
                }
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
        console.log("✅ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞𝐝");

        await activateCrons();
        
        if((conf.DP).toLowerCase() === 'yes') {     
            let cmsg =`      𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒 ⁠⁠
⁠              
> ❒⁠⁠⁠⁠ 𝐃𝐄𝐕: 
𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧   
> ❒⁠⁠⁠⁠ 𝐁𝐎𝐓: 
𝐓𝐨𝐱𝐢𝐜-𝐌𝐃
> ❒⁠⁠⁠⁠ 𝐌𝐎𝐃𝐄: 
${md}
⁠⁠⁠⁠`;
            await zk.sendMessage(zk.user.id, { text: cmsg });
        }
    }
    else if (connection == "close") {
        let reason = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
        if (reason === baileys_1.DisconnectReason.badSession) {
            console.log('❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐬𝐞𝐬𝐬𝐢𝐨𝐧, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐬𝐜𝐚𝐧 𝐐𝐑 𝐜𝐨𝐝𝐞');
        }
        else if (reason === baileys_1.DisconnectReason.connectionClosed) {
            console.log('🔌 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧 𝐜𝐥𝐨𝐬𝐞𝐝, 𝐫𝐞𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠...');
            main();
        }
        else if (reason === baileys_1.DisconnectReason.connectionLost) {
            console.log('🔌 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧 𝐥𝐨𝐬𝐭, 𝐫𝐞𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠...');
            main();
        }
        else if (reason === baileys_1.DisconnectReason.connectionReplaced) {
            console.log('⚠️ 𝐀𝐧𝐨𝐭𝐡𝐞𝐫 𝐬𝐞𝐬𝐬𝐢𝐨𝐧 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐜𝐭𝐢𝐯𝐞');
        }
        else if (reason === baileys_1.DisconnectReason.loggedOut) {
            console.log('❌ 𝐋𝐨𝐠𝐠𝐞𝐝 𝐨𝐮𝐭, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐬𝐜𝐚𝐧 𝐐𝐑 𝐜𝐨𝐝𝐞');
        }
        else if (reason === baileys_1.DisconnectReason.restartRequired) {
            console.log('🔄 𝐑𝐞𝐬𝐭𝐚𝐫𝐭𝐢𝐧𝐠...');
            main();
        } else {
            console.log('⚠️ 𝐑𝐞𝐬𝐭𝐚𝐫𝐭𝐢𝐧𝐠 𝐝𝐮𝐞 𝐭𝐨 𝐞𝐫𝐫𝐨𝐫: ', reason);         
            const {exec} = require("child_process");
            exec("pm2 restart all");            
        }
        console.log("Connection status: " + connection);
        main();
    }
});

// Credentials Update Event
zk.ev.on("creds.update", saveCreds);

// Utility Functions
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
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
};

zk.awaitForMessage = async (options = {}) => {
    return new Promise((resolve, reject) => {
        if (typeof options !== 'object') reject(new Error('Options must be an object'));
        if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
        if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
        if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
        if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));

        const timeout = options?.timeout || undefined;
        const filter = options?.filter || (() => true);
        let interval = undefined

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

// File Watch for Updates
let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`🔄 ${__filename} 𝐮𝐩𝐝𝐚𝐭𝐞𝐝`);
    delete require.cache[fichier];
    require(fichier);
});

main();
}, 5000);