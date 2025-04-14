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
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, "");
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
                    return msg?.message || { conversation: 'Error: Repeat command!' };
                }
                return { conversation: 'Error: Repeat command!' };
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
            console.log("=========== Message Received ===========");
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

/************************ Anti-Delete Feature */

if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0 && (conf.ADM).toLowerCase() === 'yes') {

    if (ms.key.fromMe || ms.message.protocolMessage.key.fromMe) {
        console.log('Deleted message concerning me');
        return;
    }

    console.log('Message deleted');
    let key = ms.message.protocolMessage.key;

    try {
        // Fetch the deleted message directly using getMessage
        const msg = await zk.getMessage(key);
        if (!msg || !msg.message) {
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
                        `> 𝗙𝗿𝗼𝗺: @${key.participant.split('@')[0]}\n` +
                        `> 𝗖𝗵𝗮𝘁: ${chatName}\n` +
                        `> 𝗗𝗲𝗹𝗲𝘁𝗲𝗱 𝗔𝘁: ${timestamp}\n\n` +
                        `𝗛𝗲𝗿𝗲’𝘀 𝘁𝗵𝗲 𝗱𝗲𝗹𝗲𝘁𝗲𝗱 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗯𝗲𝗹𝗼𝘄! 👇`,
                mentions: [key.participant],
            }
        ).then(async () => {
            // Retry forwarding the deleted message if the first attempt fails
            try {
                await zk.sendMessage(idBot, { forward: msg }, { quoted: msg });
            } catch (retryError) {
                console.log('Failed to forward message, retrying:', retryError);
                setTimeout(async () => {
                    try {
                        await zk.sendMessage(idBot, { forward: msg }, { quoted: msg });
                    } catch (finalError) {
                        console.log('Final attempt to forward message failed:', finalError);
                        await zk.sendMessage(idBot, { text: `𝗖𝗼𝘂𝗹𝗱𝗻’𝘁 𝗳𝗼𝗿𝘄𝗮𝗿𝗱 𝘁𝗵𝗲 𝗱𝗲𝗹𝗲𝘁𝗲𝗱 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗮𝗳𝘁𝗲𝗿 𝗿𝗲𝘁𝗿𝘆. 𝗘𝗿𝗿𝗼𝗿: ${finalError.message}` });
                    }
                }, 2000); // Retry after 2 seconds
            }
        });

    } catch (e) {
        console.log('Anti-delete error:', e);
        console.log('Key:', key, 'Chat:', key.remoteJid);
    }
}

/** ****** Auto-Status Management */
if (ms.key && ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
    await zk.readMessages([ms.key]);
}
if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_DOWNLOAD_STATUS === "yes") {
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
}

/** ****** End Auto-Status */
if (!dev && origineMessage == "120363158701337904@g.us") {
    return;
}

//--------------------------------------- Rank Count --------------------------------
if (texte && auteurMessage.endsWith("s.whatsapp.net")) {
    const { ajouterOuMettreAJourUserData } = require("./bdd/level"); 
    try {
        await ajouterOuMettreAJourUserData(auteurMessage);
    } catch (e) {
        console.error(e);
    }
}

//--------------------------------------- Mentions --------------------------------
try {
    if (ms.message[mtype].contextInfo.mentionedJid && (ms.message[mtype].contextInfo.mentionedJid.includes(idBot) || ms.message[mtype].contextInfo.mentionedJid.includes(conf.NUMERO_OWNER + '@s.whatsapp.net'))) {
        if (origineMessage == "120363158701337904@g.us") {
            return;
        }

        if (superUser) {
            console.log('Mention ignored: Sender is a super user');
            return;
        }

        let mbd = require('./bdd/mention');
        let alldata = await mbd.recupererToutesLesValeurs();
        let data = alldata[0];

        if (data.status === 'non') {
            console.log('Mentions are not active');
            return;
        }

        let msg;

        if (data.type.toLowerCase() === 'image') {
            msg = {
                image: { url: data.url },
                caption: data.message
            };
        } else if (data.type.toLowerCase() === 'video') {
            msg = {
                video: { url: data.url },
                caption: data.message
            };
        } else if (data.type.toLowerCase() === 'sticker') {
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
                sticker: stickerBuffer2
            };
        } else if (data.type.toLowerCase() === 'audio') {
            msg = {
                audio: { url: data.url },
                mimetype: 'audio/mp4',
            };
        }

        zk.sendMessage(origineMessage, msg, { quoted: ms });
    }
} catch (error) {
    // Error handling for mentions
}


     // Anti-Link Feature
try {
    const yes = await verifierEtatJid(origineMessage);
    if (texte.includes('https://') && verifGroupe && yes) {

        console.log("Link detected");
        var verifZokAdmin = verifGroupe ? admins.includes(idBot) : false;

        if (superUser || verifAdmin || !verifZokAdmin) {
            console.log('No action taken');
            return;
        }

        const key = {
            remoteJid: origineMessage,
            fromMe: false,
            id: ms.key.id,
            participant: auteurMessage
        };
        var txt = "𝗟𝗶𝗻𝗸 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱 📎\n";
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

        var action = await recupererActionJid(origineMessage);

        if (action === 'remove') {
            txt += `𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗱𝗲𝗹𝗲𝘁𝗲𝗱 🚮\n@${auteurMessage.split("@")[0]} 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗿𝗲𝗺𝗼𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽.`;

            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
            (0, baileys_1.delay)(800);
            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
            try {
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            } catch (e) {
                console.log("Anti-link error: " + e);
            }
            await zk.sendMessage(origineMessage, { delete: key });
            await fs.unlink("st1.webp");
        } else if (action === 'delete') {
            txt += `𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗱𝗲𝗹𝗲𝘁𝗲𝗱 🚮\n@${auteurMessage.split("@")[0]} 𝗽𝗹𝗲𝗮𝘀𝗲 𝗮𝘃𝗼𝗶𝗱 𝘀𝗲𝗻𝗱𝗶𝗻𝗴 𝗹𝗶𝗻𝗸𝘀.`;
            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
            await zk.sendMessage(origineMessage, { delete: key });
            await fs.unlink("st1.webp");
        } else if (action === 'warn') {
            const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount } = require('./bdd/warn');

            let warn = await getWarnCountByJID(auteurMessage);
            let warnlimit = conf.WARN_COUNT;
            if (warn >= warnlimit) {
                var kikmsg = `𝗟𝗶𝗻𝗸 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱 📎\n𝗬𝗼𝘂 𝘄𝗶𝗹𝗹 𝗯𝗲 𝗿𝗲𝗺𝗼𝘃𝗲𝗱 𝗱𝘂𝗲 𝘁𝗼 𝗿𝗲𝗮𝗰𝗵𝗶𝗻𝗴 𝘁𝗵�_e 𝘄𝗮𝗿𝗻 𝗹𝗶𝗺𝗶𝘁!`;

                await zk.sendMessage(origineMessage, { text: kikmsg, mentions: [auteurMessage] }, { quoted: ms });
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                await zk.sendMessage(origineMessage, { delete: key });
            } else {
                var rest = warnlimit - warn;
                var msg = `𝗟𝗶𝗻𝗸 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱 📎\n𝗬𝗼𝘂𝗿 𝘄𝗮𝗿𝗻 𝗰𝗼𝘂𝗻𝘁 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝘂𝗽𝗱𝗮𝘁𝗲𝗱.\n𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴 𝘄𝗮𝗿𝗻𝘀: ${rest}`;

                await ajouterUtilisateurAvecWarnCount(auteurMessage);
                await zk.sendMessage(origineMessage, { text: msg, mentions: [auteurMessage] }, { quoted: ms });
                await zk.sendMessage(origineMessage, { delete: key });
            }
        }
    }
} catch (e) {
    console.log("Database error: " + e);
}
    


/** ************************* Anti-Bot Feature ******************************************** */
try {
    const botMsg = ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16;
    const baileysMsg = ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16;
    if (botMsg || baileysMsg) {

        if (mtype === 'reactionMessage') {
            console.log('I don’t react to reactions');
            return;
        }
        const antibotactiver = await atbverifierEtatJid(origineMessage);
        if (!antibotactiver) {
            return;
        }

        if (verifAdmin || auteurMessage === idBot) {
            console.log('No action taken');
            return;
        }

        const key = {
            remoteJid: origineMessage,
            fromMe: false,
            id: ms.key.id,
            participant: auteurMessage
        };
        var txt = "𝗕𝗼𝘁 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱 🤖\n";
        const gifLink = "https://raw.githubusercontent.com/xhclintohn/Toxic-MD/main/media/remover.gif";
        var sticker = new Sticker(gifLink, {
            pack: 'Anyway-Md',
            author: conf.OWNER_NAME,
            type: StickerTypes.FULL,
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 50,
            background: '#000000'
        });
        await sticker.toFile("st1.webp");

        var action = await atbrecupererActionJid(origineMessage);

        if (action === 'remove') {
            txt += `𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗱𝗲𝗹𝗲𝘁𝗲𝗱 🚮\n@${auteurMessage.split("@")[0]} 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗿𝗲𝗺𝗼𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽. 😔`;

            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
            (0, baileys_1.delay)(800);
            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
            try {
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            } catch (e) {
                console.log("Anti-bot error: " + e);
            }
            await zk.sendMessage(origineMessage, { delete: key });
            await fs.unlink("st1.webp");
        } else if (action === 'delete') {
            txt += `𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗱𝗲𝗹𝗲𝘁𝗲𝗱 🚮\n@${auteurMessage.split("@")[0]} 𝗽𝗹𝗲𝗮𝘀𝗲 𝗱𝗼𝗻’𝘁 𝘂𝘀�_e 𝗯𝗼𝘁𝘀 𝗵𝗲𝗿𝗲! 😓`;
            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
            await zk.sendMessage(origineMessage, { delete: key });
            await fs.unlink("st1.webp");
        } else if (action === 'warn') {
            const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount } = require('./bdd/warn');

            let warn = await getWarnCountByJID(auteurMessage);
            let warnlimit = conf.WARN_COUNT;
            if (warn >= warnlimit) {
                var kikmsg = `𝗕𝗼𝘁 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱 🤖\n𝗬𝗼𝘂’𝘃𝗲 𝗿𝗲𝗮𝗰𝗵𝗲𝗱 𝘁𝗵𝗲 𝘄𝗮𝗿𝗻 𝗹𝗶𝗺𝗶𝘁 𝗮𝗻𝗱 𝘄𝗶𝗹𝗹 𝗯𝗲 𝗿𝗲𝗺𝗼𝘃𝗲𝗱! 🚫`;

                await zk.sendMessage(origineMessage, { text: kikmsg, mentions: [auteurMessage] }, { quoted: ms });
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                await zk.sendMessage(origineMessage, { delete: key });
            } else {
                var rest = warnlimit - warn;
                var msg = `𝗕𝗼𝘁 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱 🤖\n𝗬𝗼𝘂𝗿 𝘄𝗮𝗿𝗻 𝗰𝗼𝘂𝗻𝘁 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝘂𝗽𝗱𝗮𝘁𝗲𝗱! 📈\n𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴 𝘄𝗮𝗿𝗻𝘀: ${rest} 😓`;

                await ajouterUtilisateurAvecWarnCount(auteurMessage);
                await zk.sendMessage(origineMessage, { text: msg, mentions: [auteurMessage] }, { quoted: ms });
                await zk.sendMessage(origineMessage, { delete: key });
            }
        }
    }
} catch (er) {
    console.log('Error in anti-bot: ' + er);
}

/************************ Command Execution from clintplugins */
if (verifCom) {
    const cd = evt.cm.find((zokou) => zokou.nomCom === (com));
    if (cd) {
        try {
            if ((conf.MODE).toLowerCase() != 'yes' && !superUser) {
                return;
            }

            /******************* PM_PERMIT ***************/
            if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") {
                repondre("𝗦𝗼𝗿𝗿𝘆, 𝘆𝗼𝘂 𝗱𝗼𝗻’𝘁 𝗵𝗮𝘃𝗲 𝗮𝗰𝗰𝗲𝘀𝘀 𝘁𝗼 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗵𝗲𝗿𝗲! 🚫");
                return;
            }

            /***************************** Ban Group */
            if (!superUser && verifGroupe) {
                let req = await isGroupBanned(origineMessage);
                if (req) {
                    return;
                }
            }

            /*************************** ONLY-ADMIN */
            if (!verifAdmin && verifGroupe) {
                let req = await isGroupOnlyAdmin(origineMessage);
                if (req) {
                    return;
                }
            }

            /********************** Ban User */
            if (!superUser) {
                let req = await isUserBanned(auteurMessage);
                if (req) {
                    repondre("𝗢𝗼𝗽𝘀, 𝘆𝗼𝘂’𝗿𝗲 𝗯𝗮𝗻𝗻𝗲𝗱 𝗳𝗿𝗼𝗺 𝘂𝘀𝗶𝗻𝗴 𝗯𝗼𝘁 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀! 🚫");
                    return;
                }
            }

            reagir(origineMessage, zk, ms, cd.reaction);
            cd.fonction(origineMessage, zk, commandeOptions);
        } catch (e) {
            console.log("Command error: " + e);
            zk.sendMessage(origineMessage, { text: "𝗢𝗵 𝗻𝗼, 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝘄𝗲𝗻𝘁 𝘄𝗿𝗼𝗻𝗴! 😡\n𝗘𝗿𝗿𝗼𝗿: " + e }, { quoted: ms });
        }
    }
}
// End of command execution

/******** Group Event Update ****************/
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
            let msg = `🌟 𝗧𝗼𝘅𝗶𝗰 𝗠𝗗 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗠𝗲𝘀𝘀𝗮𝗴𝗲 🌟\n\n`;
            let membres = group.participants;
            for (let membre of membres) {
                msg += `𝗛𝗲𝗹𝗹𝗼 @${membre.split("@")[0]}! 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝗼𝘂𝗿 𝗴𝗿𝗼𝘂𝗽! 🎉\n`;
            }

            msg += `📜 𝗣𝗹𝗲𝗮𝘀𝗲 𝗿𝗲𝗮𝗱 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 𝘁𝗼 𝗮𝘃𝗼𝗶𝗱 𝗯𝗲𝗶𝗻𝗴 𝗿𝗲𝗺𝗼𝘃𝗲𝗱! 😊`;

            zk.sendMessage(group.id, { image: { url: ppgroup }, caption: msg, mentions: membres });
        } else if (group.action == 'remove' && (await recupevents(group.id, "goodbye") == 'on')) {
            let msg = `👋 𝗢𝗻𝗲 𝗼𝗿 𝗺𝗼𝗿𝗲 𝗺𝗲𝗺𝗯𝗲𝗿𝘀 𝗵𝗮𝘃𝗲 𝗹𝗲𝗳𝘁 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽:\n\n`;

            let membres = group.participants;
            for (let membre of membres) {
                msg += `@${membre.split("@")[0]}\n`;
            }

            msg += `\n𝗚𝗼𝗼𝗱𝗯𝘆𝗲! 𝗪𝗶𝘀𝗵𝗶𝗻𝗴 𝘁𝗵𝗲𝗺 𝗮𝗹𝗹 𝘁𝗵𝗲 𝗯𝗲𝘀𝘁! 🌟`;
            zk.sendMessage(group.id, { text: msg, mentions: membres });

        } else if (group.action == 'promote' && (await recupevents(group.id, "antipromote") == 'on')) {
            if (group.author == metadata.owner || group.author == conf.NUMERO_OWNER + '@s.whatsapp.net' || group.author == decodeJid(zk.user.id) || group.author == group.participants[0]) {
                console.log('SuperUser detected, no action taken');
                return;
            }

            await zk.groupParticipantsUpdate(group.id, [group.author, group.participants[0]], "demote");

            zk.sendMessage(
                group.id,
                {
                    text: `⚠️ @${(group.author).split("@")[0]} 𝗵𝗮𝘀 𝘃𝗶𝗼𝗹𝗮𝘁𝗲𝗱 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗽𝗿𝗼𝗺𝗼𝘁𝗶𝗼𝗻 𝗿𝘂𝗹𝗲! 🚨\n𝗕𝗼𝘁𝗵 @${(group.author).split("@")[0]} 𝗮𝗻𝗱 @${(group.participants[0]).split("@")[0]} 𝗵𝗮𝘃𝗲 𝗯𝗲𝗲𝗻 𝗱𝗲𝗺𝗼𝘁𝗲𝗱 𝗳𝗿𝗼𝗺 𝗮𝗱𝗺𝗶𝗻 𝗿𝗶𝗴𝗵𝘁𝘀. 😠`,
                    mentions: [group.author, group.participants[0]]
                }
            );

        } else if (group.action == 'demote' && (await recupevents(group.id, "antidemote") == 'on')) {
            if (group.author == metadata.owner || group.author == conf.NUMERO_OWNER + '@s.whatsapp.net' || group.author == decodeJid(zk.user.id) || group.author == group.participants[0]) {
                console.log('SuperUser detected, no action taken');
                return;
            }

            await zk.groupParticipantsUpdate(group.id, [group.author], "demote");
            await zk.groupParticipantsUpdate(group.id, [group.participants[0]], "promote");

            zk.sendMessage(
                group.id,
                {
                    text: `⚠️ @${(group.author).split("@")[0]} 𝗵𝗮𝘀 𝘃𝗶𝗼𝗹𝗮𝘁𝗲𝗱 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗱𝗲𝗺𝗼𝘁𝗶𝗼𝗻 𝗿𝘂𝗹𝗲 𝗯𝘆 𝗱𝗲𝗺𝗼𝘁𝗶𝗻𝗴 @${(group.participants[0]).split("@")[0]}! 🚨\n𝗧𝗵𝗲𝘆 𝗵𝗮𝘃𝗲 𝗯𝗲𝗲𝗻 𝗱𝗲𝗺𝗼𝘁�_e𝗱, 𝗮𝗻𝗱 @${(group.participants[0]).split("@")[0]} 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗿𝗲𝘀𝘁𝗼𝗿𝗲𝗱 𝗮𝘀 𝗮𝗻 𝗮𝗱𝗺𝗶𝗻. 😤`,
                    mentions: [group.author, group.participants[0]]
                }
            );
        }
    } catch (e) {
        console.error("Group event error: " + e);
    }
});

/******** end of group event update *************************/

/****************************** Cron Setup */

async function activateCrons() {
    const cron = require('node-cron');
    const { getCron } = require('./bdd/cron');

    let crons = await getCron();
    console.log(crons);
    if (crons.length > 0) {
        for (let i = 0; i < crons.length; i++) {
            if (crons[i].mute_at != null) {
                let set = crons[i].mute_at.split(':');
                console.log(`Setting up an auto-mute for ${crons[i].group_id} at ${set[0]}:${set[1]}`);

                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                    await zk.groupSettingUpdate(crons[i].group_id, 'announcement');
                    zk.sendMessage(crons[i].group_id, {
                        image: { url: './media/chrono.webp' },
                        caption: "𝗛𝗲𝗹𝗹𝗼 𝗘𝘃𝗲𝗿𝘆𝗼𝗻𝗲! 🌙\n𝗜𝘁’𝘀 𝘁𝗶𝗺𝗲 𝘁𝗼 𝗰𝗹𝗼𝘀𝗲 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽. 𝗚𝗼𝗼𝗱𝗻𝗶𝗴𝗵𝘁! 😴"
                    });
                }, {
                    timezone: "Africa/Nairobi"
                });
            }

            if (crons[i].unmute_at != null) {
                let set = crons[i].unmute_at.split(':');
                console.log(`Setting up an auto-unmute at ${set[0]}:${set[1]}`);

                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                    await zk.groupSettingUpdate(crons[i].group_id, 'not_announcement');
                    zk.sendMessage(crons[i].group_id, {
                        image: { url: './media/chrono.webp' },
                        caption: "𝗚𝗼𝗼𝗱 𝗠𝗼𝗿𝗻𝗶𝗻𝗴 𝗘𝘃𝗲𝗿𝘆𝗼𝗻𝗲! ☀️\n𝗜𝘁’𝘀 𝘁𝗶𝗺𝗲 𝘁𝗼 𝗼𝗽𝗲𝗻 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽! 🎉"
                    });
                }, {
                    timezone: "Africa/Nairobi"
                });
            }
        }
    } else {
        console.log('No crons have been enabled');
    }

    return;
}

/****************************** Contact Event */
zk.ev.on("contacts.upsert", async (contacts) => {
    const insertContact = (newContact) => {
        for (const contact of newContact) {
            if (store.contacts[contact.id]) {
                Object.assign(store.contacts[contact.id], contact);
            } else {
                store.contacts[contact.id] = contact;
            }
        }
        return;
    };
    insertContact(contacts);
});
/****************************** End Contact Event */

/****************************** Connection Event */
zk.ev.on("connection.update", async (con) => {
    const { lastDisconnect, connection } = con;
    if (connection === "connecting") {
        console.log("ℹ️ Toxic MD is connecting...");
    } else if (connection === 'open') {
        console.log("✅ Toxic MD Connected to WhatsApp!");
        console.log("--");
        await (0, baileys_1.delay)(200);
        console.log("------");
        await (0, baileys_1.delay)(300);
        console.log("------------------/-----");
        console.log("Toxic MD is Online ✅\n\n");
        console.log("Loading Toxic Commands...\n");
        fs.readdirSync(__dirname + "/clintplugins").forEach((fichier) => {
            if (path.extname(fichier).toLowerCase() == (".js")) {
                try {
                    require(__dirname + "/clintplugins/" + fichier);
                    console.log(fichier + " Installed Successfully ✔️");
                } catch (e) {
                    console.log(`${fichier} could not be installed due to: ${e}`);
                }
                (0, baileys_1.delay)(300);
            }
        });
        (0, baileys_1.delay)(700);
        var md;
        if ((conf.MODE).toLowerCase() === "yes") {
            md = "public";
        } else if ((conf.MODE).toLowerCase() === "no") {
            md = "private";
        } else {
            md = "undefined";
        }
        console.log("Commands Installation Completed ✅");

        await activateCrons();

        if ((conf.DP).toLowerCase() === 'yes') {
            let cmsg = `      𝗕𝗢𝗧 𝗥𝗨𝗡𝗡𝗜𝗡𝗚 🚀\n\n` +
                       `> 𝗗𝗘𝗩: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 👨‍💻\n` +
                       `> 𝗕𝗢𝗧: 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 🤖\n\n` +
                       `𝗟𝗲𝘁’𝘀 𝗸𝗲𝗲𝗽 𝘁𝗵𝗲 𝗳𝘂𝗻 𝗴𝗼𝗶𝗻𝗴! 🎉`;
            await zk.sendMessage(zk.user.id, { text: cmsg });
        }
    } else if (connection == "close") {
        let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
        if (raisonDeconnexion === baileys_1.DisconnectReason.badSession) {
            console.log('Session ID error, please rescan the QR code...');
        } else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionClosed) {
            console.log('Connection closed, reconnecting...');
            main();
        } else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionLost) {
            console.log('Connection lost, attempting to reconnect...');
            main();
        } else if (raisonDeconnexion === baileys_1.DisconnectReason?.connectionReplaced) {
            console.log('Connection replaced, another session is already open. Please close it!');
        } else if (raisonDeconnexion === baileys_1.DisconnectReason.loggedOut) {
            console.log('Disconnected, please rescan the QR code to reconnect.');
        } else if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) {
            console.log('Restart in progress ▶️');
            main();
        } else {
            console.log('Restarting due to error: ', raisonDeconnexion);
            const { exec } = require("child_process");
            exec("pm2 restart all");
        }
        console.log("Connection status: " + connection);
        main();
    }
});
/****************************** End Connection Event */

/****************************** Authentication Event */
zk.ev.on("creds.update", saveCreds);
/****************************** End Authentication Event */

/****************************** Utility Functions */
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
        let interval = undefined;

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
        };
        zk.ev.on('messages.upsert', listener);
        if (timeout) {
            interval = setTimeout(() => {
                zk.ev.off('messages.upsert', listener);
                reject(new Error('Timeout'));
            }, timeout);
        }
    });
};



        // End Utility Functions
/******************************/

return zk;
}

let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`𝗙𝗶𝗹𝗲 𝗨𝗽𝗱𝗮𝘁𝗲𝗱: ${__filename} 🚀`);
    delete require.cache[fichier];
    require(fichier);
});

main();
}, 5000);