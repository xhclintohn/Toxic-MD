const { zokou } = require("../framework/zokou");
//const { getGroupe } = require("../bdd/groupe");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid } = require("../bdd/antilien");
const { atbajouterOuMettreAJourJid, atbverifierEtatJid } = require("../bdd/antibot");
const { search, download } = require("aptoide-scraper");
const fs = require("fs-extra");
const conf = require("../set");
const { default: axios } = require('axios');
//const { uploadImageToImgur } = require('../framework/imgur');

zokou(
    { nomCom: "tagall", categorie: 'Group', reaction: "📣" },
    async (dest, zk, commandeOptions) => {
        const { ms, repondre, arg, verifGroupe, nomGroupe, infosGroupe, nomAuteurMessage, verifAdmin, superUser } = commandeOptions;

        console.log(`[DEBUG] tagall command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] tagall: Not a group chat`);
            repondre("✋🏿 ✋🏿 𝗧𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗶𝘀 𝗿𝗲𝘀𝗲𝗿𝘃𝗲𝗱 𝗳𝗼𝗿 𝗴𝗿𝗼𝘂𝗽𝘀 ❌");
            return;
        }

        let mess;
        if (!arg || arg === ' ') {
            mess = '𝗔𝘂𝗰𝘂𝗻 𝗠𝗲𝘀𝘀𝗮𝗴𝗲';
        } else {
            mess = arg.join(' ');
        }
        console.log(`[DEBUG] tagall: Message to tag with: ${mess}`);

        let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
        console.log(`[DEBUG] tagall: Group members count: ${membresGroupe.length}`);

        var tag = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗧𝗮𝗴𝗮𝗹𝗹 📣
│❒ 𝗚𝗿𝗼𝘂𝗽: ${nomGroupe}
│❒ 𝗛𝗲𝘆: ${nomAuteurMessage}
│❒ 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: ${mess}
◈━━━━━━━━━━━━━━━━◈
\n`;

        let emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
        let random = Math.floor(Math.random() * (emoji.length - 1));
        console.log(`[DEBUG] tagall: Random emoji selected: ${emoji[random]}`);

        for (const membre of membresGroupe) {
            tag += `${emoji[random]}      @${membre.id.split("@")[0]}\n`;
        }

        if (verifAdmin || superUser) {
            console.log(`[DEBUG] tagall: User is admin or superuser, sending message`);
            try {
                await zk.sendMessage(dest, { text: tag, mentions: membresGroupe.map((i) => i.id) }, { quoted: ms });
                console.log(`[DEBUG] tagall: Message sent successfully`);
            } catch (error) {
                console.log(`[DEBUG] tagall: Error sending message: ${error}`);
                repondre(`𝐄𝐫𝐫𝐨𝐫 𝐬𝐞𝐧𝐝𝐢𝐧𝐠 𝐭𝐚𝐠𝐚𝐥𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐞: ${error.message}`);
            }
        } else {
            console.log(`[DEBUG] tagall: User is not admin or superuser`);
            repondre('𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐚𝐝𝐦𝐢𝐧𝐬');
        }
    }
);

zokou(
    { nomCom: "link", categorie: 'Group', reaction: "🙋" },
    async (dest, zk, commandeOptions) => {
        const { repondre, nomGroupe, nomAuteurMessage, verifGroupe } = commandeOptions;

        console.log(`[DEBUG] link command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] link: Not a group chat`);
            repondre("𝐖𝐚𝐢𝐭 𝐛𝐫𝐨, 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐡𝐞 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐦𝐲 𝐝𝐦? 😅");
            return;
        }

        try {
            var link = await zk.groupInviteCode(dest);
            console.log(`[DEBUG] link: Group invite code: ${link}`);

            var lien = `https://chat.whatsapp.com/${link}`;
            let mess = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗟𝗶𝗻𝗸 🙋
│❒ 𝗛𝗲𝗹𝗹𝗼: ${nomAuteurMessage}
│❒ 𝗚𝗿𝗼𝘂𝗽: ${nomGroupe}
│❒ 𝗟𝗶𝗻𝗸: ${lien}
◈━━━━━━━━━━━━━━━━◈

©𝐓𝐨𝐱𝐢𝐜 𝐌𝐃 𝐒𝐜𝐢𝐞𝐧𝐜𝐞`;

            console.log(`[DEBUG] link: Sending message:\n${mess}`);
            await repondre(mess);
            console.log(`[DEBUG] link: Message sent successfully`);
        } catch (error) {
            console.log(`[DEBUG] link: Error generating group link: ${error}`);
            repondre(`𝐄𝐫𝐫𝐨𝐫 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐧𝐤: ${error.message}`);
        }
    }
);

zokou(
    { nomCom: "promote", categorie: 'Group', reaction: "👨🏿‍💼" },
    async (dest, zk, commandeOptions) => {
        let { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser, idBot } = commandeOptions;

        console.log(`[DEBUG] promote command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] promote: Not a group chat`);
            repondre("𝐅𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲 🚫");
            return;
        }

        let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
        console.log(`[DEBUG] promote: Group members count: ${membresGroupe.length}`);

        const verifMember = (user) => {
            for (const m of membresGroupe) {
                if (m.id !== user) {
                    continue;
                } else {
                    return true;
                }
            }
            return false;
        };

        const memberAdmin = (membresGroupe) => {
            let admin = [];
            for (let m of membresGroupe) {
                if (m.admin == null) continue;
                admin.push(m.id);
            }
            return admin;
        };

        const a = verifGroupe ? memberAdmin(membresGroupe) : '';
        let admin = verifGroupe ? a.includes(auteurMsgRepondu) : false;
        let membre = verifMember(auteurMsgRepondu);
        let autAdmin = verifGroupe ? a.includes(auteurMessage) : false;
        let zkad = verifGroupe ? a.includes(idBot) : false;

        console.log(`[DEBUG] promote: autAdmin=${autAdmin}, superUser=${superUser}, zkad=${zkad}, membre=${membre}, admin=${admin}`);

        try {
            if (autAdmin || superUser) {
                if (msgRepondu) {
                    if (zkad) {
                        if (membre) {
                            if (admin == false) {
                                var txt = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗣𝗿𝗼𝗺𝗼𝘁𝗲 👨🏿‍💼
│❒ 🎊 @${auteurMsgRepondu.split("@")[0]} 𝗿𝗼𝘀𝗲 𝗶𝗻 𝗿𝗮𝗻𝗸!
│❒ 𝗧𝗵𝗲𝘆 𝗵𝗮𝘃𝗲 𝗯𝗲𝗲𝗻 𝗻𝗮𝗺𝗲𝗱 𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻𝗶𝘀𝘁𝗿𝗮𝘁𝗼𝗿.
◈━━━━━━━━━━━━━━━━◈`;

                                console.log(`[DEBUG] promote: Promoting ${auteurMsgRepondu}`);
                                await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "promote");
                                await zk.sendMessage(dest, { text: txt, mentions: [auteurMsgRepondu] });
                                console.log(`[DEBUG] promote: Promotion successful`);
                            } else {
                                console.log(`[DEBUG] promote: Member is already an admin`);
                                repondre("𝐓𝐡𝐢𝐬 𝐦𝐞𝐦𝐛𝐞𝐫 𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
                            }
                        } else {
                            console.log(`[DEBUG] promote: User is not part of the group`);
                            repondre("𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐢𝐬 𝐧𝐨𝐭 𝐩𝐚𝐫𝐭 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
                        }
                    } else {
                        console.log(`[DEBUG] promote: Bot is not an admin`);
                        repondre("𝐒𝐨𝐫𝐫𝐲, 𝐈 𝐜𝐚𝐧𝐧𝐨𝐭 𝐩𝐞𝐫𝐟𝐨𝐫𝐦 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐈 𝐚𝐦 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐮𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
                    }
                } else {
                    console.log(`[DEBUG] promote: No member tagged`);
                    repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐭𝐡𝐞 𝐦𝐞𝐦𝐛𝐞𝐫 𝐭𝐨 𝐛𝐞 𝐧𝐨𝐦𝐢𝐮𝐧𝐚𝐭𝐞𝐝 📝");
                }
            } else {
                console.log(`[DEBUG] promote: User is not an admin or superuser`);
                repondre("𝐒𝐨𝐫𝐫𝐲, 𝐈 𝐜𝐚𝐧𝐧𝐨𝐭 𝐩𝐞𝐫𝐟𝐨𝐫𝐦 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐮𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
            }
        } catch (e) {
            console.log(`[DEBUG] promote: Error: ${e}`);
            repondre(`𝐎𝐨𝐩𝐬, 𝐚𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝: ${e.message}`);
        }
    }
);

zokou(
    { nomCom: "demote", categorie: 'Group', reaction: "👨🏿‍💼" },
    async (dest, zk, commandeOptions) => {
        let { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, auteurMessage, superUser, idBot } = commandeOptions;

        console.log(`[DEBUG] demote command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] demote: Not a group chat`);
            repondre("𝐅𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲 🚫");
            return;
        }

        let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
        console.log(`[DEBUG] demote: Group members count: ${membresGroupe.length}`);

        const verifMember = (user) => {
            for (const m of membresGroupe) {
                if (m.id !== user) {
                    continue;
                } else {
                    return true;
                }
            }
            return false;
        };

        const memberAdmin = (membresGroupe) => {
            let admin = [];
            for (let m of membresGroupe) {
                if (m.admin == null) continue;
                admin.push(m.id);
            }
            return admin;
        };

        const a = verifGroupe ? memberAdmin(membresGroupe) : '';
        let admin = verifGroupe ? a.includes(auteurMsgRepondu) : false;
        let membre = verifMember(auteurMsgRepondu);
        let autAdmin = verifGroupe ? a.includes(auteurMessage) : false;
        let zkad = verifGroupe ? a.includes(idBot) : false;

        console.log(`[DEBUG] demote: autAdmin=${autAdmin}, superUser=${superUser}, zkad=${zkad}, membre=${membre}, admin=${admin}`);

        try {
            if (autAdmin || superUser) {
                if (msgRepondu) {
                    if (zkad) {
                        if (membre) {
                            if (admin == false) {
                                console.log(`[DEBUG] demote: Member is not an admin`);
                                repondre("𝐓𝐡𝐢𝐬 𝐦𝐞𝐦𝐛𝐞𝐫 𝐢𝐬 𝐧𝐨𝐭 𝐚 𝐠𝐫𝐨𝐮𝐩 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫.");
                            } else {
                                var txt = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗗𝗲𝗺𝗼𝘁𝗲 👨🏿‍💼
│❒ @${auteurMsgRepondu.split("@")[0]} 𝘄𝗮𝘀 𝗿𝗲𝗺𝗼𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲𝗶𝗿 𝗽𝗼𝘀𝗶𝘁𝗶𝗼𝗻 𝗮𝘀 𝗮 𝗴𝗿𝗼𝘂𝗽 𝗮𝗱𝗺𝗶𝗻𝗶𝘀𝘁𝗿𝗮𝘁𝗼𝗿.
◈━━━━━━━━━━━━━━━━◈`;

                                console.log(`[DEBUG] demote: Demoting ${auteurMsgRepondu}`);
                                await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "demote");
                                await zk.sendMessage(dest, { text: txt, mentions: [auteurMsgRepondu] });
                                console.log(`[DEBUG] demote: Demotion successful`);
                            }
                        } else {
                            console.log(`[DEBUG] demote: User is not part of the group`);
                            repondre("𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐢𝐬 𝐧𝐨𝐭 𝐩𝐚𝐫𝐭 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
                        }
                    } else {
                        console.log(`[DEBUG] demote: Bot is not an admin`);
                        repondre("𝐒𝐨𝐫𝐫𝐲, 𝐈 𝐜𝐚𝐧𝐧𝐨𝐭 𝐩𝐞𝐫𝐟𝐨𝐫𝐦 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐈 𝐚𝐦 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
                    }
                } else {
                    console.log(`[DEBUG] demote: No member tagged`);
                    repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐭𝐡𝐞 𝐦𝐞𝐦𝐛𝐞𝐫 𝐭𝐨 𝐛𝐞 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 📝");
                }
            } else {
                console.log(`[DEBUG] demote: User is not an admin or superuser`);
                repondre("𝐒𝐨𝐫𝐫𝐲, 𝐈 𝐜𝐚𝐧𝐧𝐨𝐭 𝐩𝐞𝐫𝐟𝐨𝐫𝐮𝐦 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
            }
        } catch (e) {
            console.log(`[DEBUG] demote: Error: ${e}`);
            repondre(`𝐎𝐨𝐩𝐬, 𝐚𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝: ${e.message}`);
        }
    }
);

zokou(
    { nomCom: "remove", categorie: 'Group', reaction: "👨🏿‍💼" },
    async (dest, zk, commandeOptions) => {
        let { repondre, msgRepondu, infosGroupe, auteurMsgRepondu, verifGroupe, nomAuteurMessage, auteurMessage, superUser, idBot } = commandeOptions;

        console.log(`[DEBUG] remove command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] remove: Not a group chat`);
            repondre("𝐅𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲 🚫");
            return;
        }

        let membresGroupe = verifGroupe ? await infosGroupe.participants : "";
        console.log(`[DEBUG] remove: Group members count: ${membresGroupe.length}`);

        const verifMember = (user) => {
            for (const m of membresGroupe) {
                if (m.id !== user) {
                    continue;
                } else {
                    return true;
                }
            }
            return false;
        };

        const memberAdmin = (membresGroupe) => {
            let admin = [];
            for (let m of membresGroupe) {
                if (m.admin == null) continue;
                admin.push(m.id);
            }
            return admin;
        };

        const a = verifGroupe ? memberAdmin(membresGroupe) : '';
        let admin = verifGroupe ? a.includes(auteurMsgRepondu) : false;
        let membre = verifMember(auteurMsgRepondu);
        let autAdmin = verifGroupe ? a.includes(auteurMessage) : false;
        let zkad = verifGroupe ? a.includes(idBot) : false;

        console.log(`[DEBUG] remove: autAdmin=${autAdmin}, superUser=${superUser}, zkad=${zkad}, membre=${membre}, admin=${admin}`);

        try {
            if (autAdmin || superUser) {
                if (msgRepondu) {
                    if (zkad) {
                        if (membre) {
                            if (admin == false) {
                                const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
                                var sticker = new Sticker(gifLink, {
                                    pack: '𝐓𝐨𝐱𝐢𝐜-𝐌𝐃',
                                    author: nomAuteurMessage,
                                    type: StickerTypes.FULL,
                                    categories: ['🤩', '🎉'],
                                    id: '12345',
                                    quality: 50,
                                    background: '#000000'
                                });

                                console.log(`[DEBUG] remove: Creating sticker`);
                                await sticker.toFile("st.webp");
                                var txt = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗥𝗲𝗺𝗼𝘃𝗲 👨🏿‍💼
│❒ @${auteurMsgRepondu.split("@")[0]} 𝘄𝗮𝘀 𝗿𝗲𝗺𝗼𝘃𝗲𝗱 𝗳𝗿𝗼𝗺 𝘁𝗵𝗲 𝗴𝗿𝗼𝘂𝗽.
◈━━━━━━━━━━━━━━━━◈`;

                                console.log(`[DEBUG] remove: Removing ${auteurMsgRepondu}`);
                                await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "remove");
                                // Uncomment the sticker sending if needed
                                // await zk.sendMessage(dest, { sticker: fs.readFileSync("st.webp") }, { quoted: ms });
                                await zk.sendMessage(dest, { text: txt, mentions: [auteurMsgRepondu] });
                                console.log(`[DEBUG] remove: Removal successful`);
                            } else {
                                console.log(`[DEBUG] remove: Member is an admin`);
                                repondre("𝐓𝐡𝐢𝐬 𝐦𝐞𝐦𝐛𝐞𝐫 𝐜𝐚𝐧𝐧𝐨𝐭 𝐛𝐞 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐭𝐡𝐞𝐲 𝐚𝐫𝐞 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
                            }
                        } else {
                            console.log(`[DEBUG] remove: User is not part of the group`);
                            repondre("𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐢𝐬 𝐧𝐨𝐭 𝐩𝐚𝐫𝐭 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
                        }
                    } else {
                        console.log(`[DEBUG] remove: Bot is not an admin`);
                        repondre("𝐒𝐨𝐫𝐫𝐲, 𝐈 𝐜𝐚𝐧𝐧𝐨𝐭 𝐩𝐞𝐫𝐟𝐨𝐫𝐦 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐈 𝐚𝐦 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
                    }
                } else {
                    console.log(`[DEBUG] remove: No member tagged`);
                    repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐭𝐡𝐞 𝐦𝐞𝐦𝐛𝐞𝐫 𝐭𝐨 𝐛𝐞 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 📝");
                }
            } else {
                console.log(`[DEBUG] remove: User is not an admin or superuser`);
                repondre("𝐒𝐨𝐫𝐫𝐲, 𝐈 𝐜𝐚𝐧𝐧𝐨𝐭 𝐩𝐞𝐫𝐟𝐨𝐫𝐮𝐦 𝐭𝐡𝐢𝐬 𝐚𝐜𝐭𝐢𝐨𝐧 𝐛𝐞𝐜𝐚𝐮𝐬𝐞 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩.");
            }
        } catch (e) {
            console.log(`[DEBUG] remove: Error: ${e}`);
            repondre(`𝐎𝐨𝐩𝐬, 𝐚𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝: ${e.message}`);
        }
    }
);

zokou(
    { nomCom: "del", categorie: 'Group', reaction: "🧹" },
    async (dest, zk, commandeOptions) => {
        const { ms, repondre, verifGroupe, auteurMsgRepondu, idBot, msgRepondu, verifAdmin, superUser } = commandeOptions;

        console.log(`[DEBUG] del command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!msgRepondu) {
            console.log(`[DEBUG] del: No message replied to`);
            repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐭𝐡𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐝𝐞𝐥𝐞𝐭𝐞 📝");
            return;
        }

        if (superUser && auteurMsgRepondu == idBot) {
            if (auteurMsgRepondu == idBot) {
                const key = {
                    remoteJid: dest,
                    fromMe: true,
                    id: ms.message.extendedTextMessage.contextInfo.stanzaId,
                };
                console.log(`[DEBUG] del: Deleting bot's own message`);
                await zk.sendMessage(dest, { delete: key });
                console.log(`[DEBUG] del: Bot message deleted successfully`);
                return;
            }
        }

        if (verifGroupe) {
            if (verifAdmin || superUser) {
                try {
                    const key = {
                        remoteJid: dest,
                        id: ms.message.extendedTextMessage.contextInfo.stanzaId,
                        fromMe: false,
                        participant: ms.message.extendedTextMessage.contextInfo.participant
                    };
                    console.log(`[DEBUG] del: Deleting message`);
                    await zk.sendMessage(dest, { delete: key });
                    console.log(`[DEBUG] del: Message deleted successfully`);
                } catch (e) {
                    console.log(`[DEBUG] del: Error: ${e}`);
                    repondre("𝐈 𝐧𝐞𝐞𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐢𝐠𝐡𝐭𝐬 𝐭𝐨 𝐝𝐞𝐥𝐞𝐭𝐞 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐳𝐚𝐠𝐞 🚫");
                }
            } else {
                console.log(`[DEBUG] del: User is not an admin or superuser`);
                repondre("𝐒𝐨𝐫𝐫𝐲, 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 🚫");
            }
        }
    }
);

zokou(
    { nomCom: "info", categorie: 'Group', reaction: "ℹ️" },
    async (dest, zk, commandeOptions) => {
        const { ms, repondre, verifGroupe } = commandeOptions;

        console.log(`[DEBUG] info command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] info: Not a group chat`);
            repondre("𝐎𝐫𝐝𝐞𝐫 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲 🚫");
            return;
        }

        try {
            let ppgroup = await zk.profilePictureUrl(dest, 'image');
            console.log(`[DEBUG] info: Group profile picture URL: ${ppgroup}`);
            var img = ppgroup;
        } catch {
            console.log(`[DEBUG] info: Failed to get group profile picture, using default`);
            var img = conf.IMAGE_MENU;
        }

        const info = await zk.groupMetadata(dest);
        console.log(`[DEBUG] info: Group metadata: ${JSON.stringify(info)}`);

        let mess = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗜𝗻𝗳𝗼 ℹ️
│❒ 𝗡𝗮𝗺𝗲: ${info.subject}
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: ${dest}
│❒ 𝗗𝗲𝘀𝗰: ${info.desc || 'No description'}
◈━━━━━━━━━━━━━━━━◈`;

        console.log(`[DEBUG] info: Sending message:\n${mess}`);
        await zk.sendMessage(dest, { image: { url: img }, caption: mess }, { quoted: ms });
        console.log(`[DEBUG] info: Message sent successfully`);
    }
);

zokou(
    { nomCom: "antilink", categorie: 'Group', reaction: "🔗" },
    async (dest, zk, commandeOptions) => {
        var { repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;

        console.log(`[DEBUG] antilink command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] antilink: Not a group chat`);
            repondre("𝐅𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲 🚫");
            return;
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
│❒ antilink action/remove - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗻𝗼𝘁𝗶𝗰𝗲
│❒ antilink action/warn - 𝗚𝗶𝘃𝗲 𝘄𝗮𝗿𝗻𝗶𝗻𝗴𝘀
│❒ antilink action/delete - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝘀𝗮𝗻𝗰𝘁𝗶𝗼𝗻𝘀
◈━━━━━━━━━━━━━━━━◈

𝐍𝐨𝐭𝐞: 𝗕𝘆 𝗱𝗲𝗳𝗮𝘂𝗹𝘁, 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲 𝗶𝘀 𝘀𝗲𝘁 𝘁𝗼 𝗱𝗲𝗹𝗲𝘁𝗲.`);
                    return;
                }

                if (arg[0] === 'on') {
                    if (enetatoui) {
                        console.log(`[DEBUG] antilink: Already activated`);
                        repondre("𝐓𝐡𝐞 𝐚𝐧𝐭𝐢𝐥𝐢𝐧𝐤 𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 ✅");
                    } else {
                        console.log(`[DEBUG] antilink: Activating`);
                        await ajouterOuMettreAJourJid(dest, "oui");
                        repondre("𝐓𝐡𝐞 𝐚𝐧𝐭𝐢𝐥𝐢𝐧𝐤 𝐢𝐬 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 ✅");
                    }
                } else if (arg[0] === "off") {
                    if (enetatoui) {
                        console.log(`[DEBUG] antilink: Deactivating`);
                        await ajouterOuMettreAJourJid(dest, "non");
                        repondre("𝐓𝐡𝐞 𝐚𝐧𝐭𝐢𝐥𝐢𝐧𝐤 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐝𝐞𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 🚫");
                    } else {
                        console.log(`[DEBUG] antilink: Not activated`);
                        repondre("𝐀𝐧𝐭𝐢𝐥𝐢𝐧𝐤 𝐢𝐬 𝐧𝐨𝐭 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 🚫");
                    }
                } else if (arg.join('').split("/")[0] === 'action') {
                    let action = (arg.join('').split("/")[1]).toLowerCase();
                    console.log(`[DEBUG] antilink: Action requested: ${action}`);

                    if (action == 'remove' || action == 'warn' || action == 'delete') {
                        console.log(`[DEBUG] antilink: Updating action to ${action}`);
                        await mettreAJourAction(dest, action);
                        repondre(`𝐓𝐡𝐞 𝐚𝐧𝐭𝐢-𝐥𝐢𝐧𝐤 𝐚𝐜𝐭𝐢𝐨𝐧 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐮𝐩𝐝𝐚𝐭𝐞𝐝 𝐭𝐨 ${arg.join('').split("/")[1]} ✅`);
                    } else {
                        console.log(`[DEBUG] antilink: Invalid action`);
                        repondre("𝐓𝐡𝐞 𝐨𝐧𝐥𝐲 𝐚𝐜𝐭𝐢𝐨𝐧𝐬 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐚𝐫𝐞 𝐰𝐚𝐫𝐧, 𝐫𝐞𝐦𝐨𝐯𝐞, 𝐚𝐧𝐝 𝐝𝐞𝐥𝐞𝐭𝐞 🚫");
                    }
                } else {
                    console.log(`[DEBUG] antilink: Invalid argument`);
                    repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗹𝗶𝗻𝗸 𝗢𝗽𝘁𝗶𝗼𝗻𝘀 🔗
│❒ antilink on - 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink off - 𝗗𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗹𝗶𝗻𝗸 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antilink action/remove - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗹𝗶𝗻𝗸 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗻𝗼𝘁𝗶𝗰𝗲
│❒ antilink action/warn - 𝗚𝗶𝘃𝗲 𝘄𝗮𝗿𝗻𝗶𝗻𝗴𝘀
│❒ antilink action/delete - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵�_e 𝗹𝗶𝗻𝗸 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝘀𝗮𝗻𝗰𝘁𝗶𝗼𝗻𝘀
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
    }
);



zokou(
    { nomCom: "antibot", categorie: 'Group', reaction: "😬" },
    async (dest, zk, commandeOptions) => {
        var { repondre, arg, verifGroupe, superUser, verifAdmin } = commandeOptions;

        console.log(`[DEBUG] antibot command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] antibot: Not a group chat`);
            repondre("𝐅𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲 🚫");
            return;
        }

        if (superUser || verifAdmin) {
            const enetatoui = await atbverifierEtatJid(dest);
            console.log(`[DEBUG] antibot: Current state: ${enetatoui}`);

            try {
                if (!arg || !arg[0] || arg === ' ') {
                    console.log(`[DEBUG] antibot: No arguments provided`);
                    repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗯𝗼𝘁 𝗢𝗽𝘁𝗶𝗼𝗻𝘀 😬
│❒ antibot on - 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗯𝗼𝘁 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antibot off - 𝗗𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗯𝗼𝘁 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antibot action/remove - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗯𝗼𝘁 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗻𝗼𝘁𝗶𝗰𝗲
│❒ antibot action/warn - 𝗚𝗶𝘃𝗲 𝘄𝗮𝗿𝗻𝗶𝗻𝗴𝘀
│❒ antibot action/delete - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗯𝗼𝘁 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝘀𝗮𝗻𝗰𝘁𝗶𝗼𝗻𝘀
◈━━━━━━━━━━━━━━━━◈

𝐍𝐨𝐭𝐞: 𝗕𝘆 𝗱𝗲𝗳𝗮𝘂𝗹𝘁, 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗯𝗼𝘁 𝗳𝗲𝗮𝘁𝘂𝗿𝗲 𝗶𝘀 𝘀𝗲𝘁 𝘁𝗼 𝗱𝗲𝗹𝗲𝘁𝗲.`);
                    return;
                }

                if (arg[0] === 'on') {
                    if (enetatoui) {
                        console.log(`[DEBUG] antibot: Already activated`);
                        repondre("𝐓𝐡𝐞 𝐚𝐧𝐭𝐢𝐛𝐨𝐭 𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 ✅");
                    } else {
                        console.log(`[DEBUG] antibot: Activating`);
                        await atbajouterOuMettreAJourJid(dest, "oui");
                        repondre("𝐓𝐡𝐞 𝐚𝐧𝐭𝐢𝐛𝐨𝐭 𝐢𝐬 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 ✅");
                    }
                } else if (arg[0] === "off") {
                    if (enetatoui) {
                        console.log(`[DEBUG] antibot: Deactivating`);
                        await atbajouterOuMettreAJourJid(dest, "non");
                        repondre("𝐓𝐡𝐞 𝐚𝐧𝐭𝐢𝐛𝐨𝐭 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐝𝐞𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 🚫");
                    } else {
                        console.log(`[DEBUG] antibot: Not activated`);
                        repondre("𝐀𝐧𝐭𝐢𝐛𝐨𝐭 𝐢𝐬 𝐧𝐨𝐭 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 🚫");
                    }
                } else if (arg.join('').split("/")[0] === 'action') {
                    let action = (arg.join('').split("/")[1]).toLowerCase();
                    console.log(`[DEBUG] antibot: Action requested: ${action}`);

                    if (action == 'remove' || action == 'warn' || action == 'delete') {
                        console.log(`[DEBUG] antibot: Updating action to ${action}`);
                        await mettreAJourAction(dest, action);
                        repondre(`𝐓𝐡𝐞 𝐚𝐧𝐭𝐢-𝐛𝐨𝐭 𝐚𝐜𝐭𝐢𝐨𝐧 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐮𝐩𝐝𝐚𝐭𝐞𝐝 𝐭𝐨 ${arg.join('').split("/")[1]} ✅`);
                    } else {
                        console.log(`[DEBUG] antibot: Invalid action`);
                        repondre("𝐓𝐡𝐞 𝐨𝐧𝐥𝐲 𝐚𝐜𝐭𝐢𝐨𝐧𝐬 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐚𝐫𝐞 𝐰𝐚𝐫𝐧, 𝐫𝐞𝐦𝐨𝐯𝐞, 𝐚𝐧𝐝 𝐝𝐞𝐥𝐞𝐭𝐞 🚫");
                    }
                } else {
                    console.log(`[DEBUG] antibot: Invalid argument`);
                    repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗻𝘁𝗶𝗯𝗼𝘁 𝗢𝗽𝘁𝗶𝗼𝗻𝘀 😬
│❒ antibot on - 𝗔𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗯𝗼𝘁 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antibot off - 𝗗𝗲𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗯𝗼𝘁 𝗳𝗲𝗮𝘁𝘂𝗿𝗲
│❒ antibot action/remove - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗯𝗼𝘁 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝗻𝗼𝘁𝗶𝗰𝗲
│❒ antibot action/warn - 𝗚𝗶𝘃𝗲 𝘄𝗮𝗿𝗻𝗶𝗻𝗴𝘀
│❒ antibot action/delete - 𝗥𝗲𝗺𝗼𝘃𝗲 𝘁𝗵𝗲 𝗯𝗼𝘁 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘄𝗶𝘁𝗵𝗼𝘂𝘁 𝘀𝗮𝗻𝗰𝘁𝗶𝗼𝗻𝘀
◈━━━━━━━━━━━━━━━━◈

𝐍𝐨𝐭𝐞: 𝗕𝘆 𝗱𝗲𝗳𝗮𝘂𝗹𝘁, 𝘁𝗵𝗲 𝗮𝗻𝘁𝗶-𝗯𝗼𝘁 𝗳𝗲𝗮𝘁𝘂𝗿𝗲 𝗶𝘀 𝘀𝗲𝘁 𝘁𝗼 𝗱𝗲𝗹𝗲𝘁𝗲.`);
                }
            } catch (error) {
                console.log(`[DEBUG] antibot: Error: ${error}`);
                repondre(`𝐄𝐫𝐫𝐨𝐫: ${error.message}`);
            }
        } else {
            console.log(`[DEBUG] antibot: User is not an admin or superuser`);
            repondre('𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐞𝐧𝐭𝐢𝐭𝐥𝐞𝐝 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐨𝐫𝐝𝐞𝐫 🚫');
        }
    }
);

zokou(
    { nomCom: "group", categorie: 'Group', reaction: "🔒" },
    async (dest, zk, commandeOptions) => {
        const { repondre, verifGroupe, verifAdmin, superUser, arg } = commandeOptions;

        console.log(`[DEBUG] group command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] group: Not a group chat`);
            repondre("𝐎𝐫𝐝𝐞𝐫 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲 🚫");
            return;
        }

        if (superUser || verifAdmin) {
            if (!arg[0]) {
                console.log(`[DEBUG] group: No arguments provided`);
                repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗦𝗲𝘁𝘁𝗶𝗻𝗴𝘀 🔒
│❒ 𝗜𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀:
│❒ group open - 𝗔𝗹𝗹𝗼𝘄 𝗮𝗹𝗹 𝗺𝗲𝗺𝗯𝗲𝗿𝘀 𝘁𝗼 𝘀𝗲𝗻𝗱 𝗺𝗲𝘀𝘀𝗮𝗴𝗲𝘀
│❒ group close - 𝗥𝗲𝘀𝘁𝗿𝗶𝗰𝘁 𝗺𝗲𝘀𝘀𝗮𝗴𝗲𝘀 𝘁𝗼 𝗮𝗱𝗺𝗶𝗻𝘀 𝗼𝗻𝗹𝘆
◈━━━━━━━━━━━━━━━━◈`);
                return;
            }

            const option = arg.join(' ').toLowerCase();
            console.log(`[DEBUG] group: Option provided: ${option}`);

            switch (option) {
                case "open":
                    console.log(`[DEBUG] group: Opening group`);
                    await zk.groupSettingUpdate(dest, 'not_announcement');
                    repondre("𝐆𝐫𝐨𝐮𝐩 𝐨𝐩𝐞𝐧𝐞𝐱𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 ✅");
                    break;
                case "close":
                    console.log(`[DEBUG] group: Closing group`);
                    await zk.groupSettingUpdate(dest, 'announcement');
                    repondre("𝐆𝐫𝐨𝐮𝐩 𝐜𝐥𝐨𝐬𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 🔒");
                    break;
                default:
                    console.log(`[DEBUG] group: Invalid option`);
                    repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐝𝐨𝐧'𝐭 𝐢𝐧𝐯𝐞𝐧𝐭 𝐚𝐧 𝐨𝐩𝐭𝐢𝐨𝐧 🚫");
            }
        } else {
            console.log(`[DEBUG] group: User is not an admin or superuser`);
            repondre("𝐎𝐫𝐝𝐞𝐫 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 🚫");
        }
    }
);

zokou(
    { nomCom: "left", categorie: "Mods", reaction: "👋" },
    async (dest, zk, commandeOptions) => {
        const { repondre, verifGroupe, superUser } = commandeOptions;

        console.log(`[DEBUG] left command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] left: Not a group chat`);
            repondre("𝐎𝐫𝐝𝐞𝐫 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩 𝐨𝐧𝐥𝐲 🚫");
            return;
        }

        if (!superUser) {
            console.log(`[DEBUG] left: User is not a superuser`);
            repondre("𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 🚫");
            return;
        }

        console.log(`[DEBUG] left: Bot is leaving the group`);
        await repondre('𝐒𝐚𝐲𝐨𝐧𝐚𝐫𝐚 👋');
        await zk.groupLeave(dest);
        console.log(`[DEBUG] left: Bot has left the group`);
    }
);

zokou(
    { nomCom: "gname", categorie: 'Group', reaction: "📝" },
    async (dest, zk, commandeOptions) => {
        const { arg, repondre, verifAdmin } = commandeOptions;

        console.log(`[DEBUG] gname command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifAdmin) {
            console.log(`[DEBUG] gname: User is not an admin`);
            repondre("𝐎𝐫𝐝𝐞𝐫 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐬 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 🚫");
            return;
        }

        if (!arg[0]) {
            console.log(`[DEBUG] gname: No group name provided`);
            repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐧𝐚𝐦𝐞 📝");
            return;
        }

        const nom = arg.join(' ');
        console.log(`[DEBUG] gname: Updating group name to: ${nom}`);
        await zk.groupUpdateSubject(dest, nom);
        repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗡𝗮𝗺𝗲 𝗨𝗽𝗱𝗮𝘁𝗲 📝
│❒ 𝗡𝗲𝘄 𝗡𝗮𝗺𝗲: ${nom}
◈━━━━━━━━━━━━━━━━◈`);
        console.log(`[DEBUG] gname: Group name updated successfully`);
    }
);

zokou(
    { nomCom: "gdesc", categorie: 'Group', reaction: "📝" },
    async (dest, zk, commandeOptions) => {
        const { arg, repondre, verifAdmin } = commandeOptions;

        console.log(`[DEBUG] gdesc command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifAdmin) {
            console.log(`[DEBUG] gdesc: User is not an admin`);
            repondre("𝐎𝐫𝐝𝐞𝐫 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐬 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 🚫");
            return;
        }

        if (!arg[0]) {
            console.log(`[DEBUG] gdesc: No group description provided`);
            repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐝𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧 📝");
            return;
        }

        const nom = arg.join(' ');
        console.log(`[DEBUG] gdesc: Updating group description to: ${nom}`);
        await zk.groupUpdateDescription(dest, nom);
        repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 𝗨𝗽𝗱𝗮𝘁𝗲 📝
│❒ 𝗡𝗲𝘄 𝗗𝗲𝘀𝗰: ${nom}
◈━━━━━━━━━━━━━━━━◈`);
        console.log(`[DEBUG] gdesc: Group description updated successfully`);
    }
);

zokou(
    { nomCom: "gpp", categorie: 'Group', reaction: "🖼️" },
    async (dest, zk, commandeOptions) => {
        const { repondre, msgRepondu, verifAdmin } = commandeOptions;

        console.log(`[DEBUG] gpp command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifAdmin) {
            console.log(`[DEBUG] gpp: User is not an admin`);
            repondre("𝐎𝐫𝐝𝐞𝐫 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐬 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 🚫");
            return;
        }

        if (msgRepondu?.imageMessage) {
            console.log(`[DEBUG] gpp: Image message detected, downloading`);
            const pp = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);

            try {
                console.log(`[DEBUG] gpp: Updating group profile picture`);
                await zk.updateProfilePicture(dest, { url: pp });
                await repondre(`
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗣𝗶𝗰𝘁𝘂𝗿𝗲 𝗨𝗽𝗱𝗮𝘁𝗲 🖼️
│❒ 𝗚𝗿𝗼𝘂𝗽 𝗽𝗳𝗽 𝗰𝗵𝗮𝗻𝗴𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 ✅
◈━━━━━━━━━━━━━━━━◈`);
                fs.unlinkSync(pp);
                console.log(`[DEBUG] gpp: Group profile picture updated successfully`);
            } catch (err) {
                console.log(`[DEBUG] gpp: Error: ${err}`);
                repondre(`𝐄𝐫𝐫𝐨𝐫 𝐮𝐩𝐝𝐚𝐭𝐢𝐧𝐠 𝐠𝐫𝐨𝐮𝐩 𝐩𝐟𝐩: ${err.message}`);
            }
        } else {
            console.log(`[DEBUG] gpp: No image message detected`);
            repondre('𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 🖼️');
        }
    }
);

/////////////
zokou(
    { nomCom: "tag", categorie: 'Group', reaction: "🎤" },
    async (dest, zk, commandeOptions) => {
        const { repondre, msgRepondu, verifGroupe, arg, verifAdmin, superUser } = commandeOptions;

        console.log(`[DEBUG] hidetag command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifGroupe) {
            console.log(`[DEBUG] hidetag: Not a group chat`);
            repondre('𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐨𝐧𝐥𝐲 𝐚𝐥𝐥𝐨𝐰𝐞𝐝 𝐢𝐧 𝐠𝐫𝐨𝐮𝐩𝐬 🚫');
            return;
        }

        if (verifAdmin || superUser) {
            let metadata = await zk.groupMetadata(dest);
            console.log(`[DEBUG] hidetag: Group members count: ${metadata.participants.length}`);

            let tag = [];
            for (const participant of metadata.participants) {
                tag.push(participant.id);
            }

            if (msgRepondu) {
                console.log(`[DEBUG] hidetag: Replied message detected`);
                let msg;

                if (msgRepondu.imageMessage) {
                    console.log(`[DEBUG] hidetag: Image message detected, downloading`);
                    let media = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
                    msg = {
                        image: { url: media },
                        caption: msgRepondu.imageMessage.caption,
                        mentions: tag
                    };
                } else if (msgRepondu.videoMessage) {
                    console.log(`[DEBUG] hidetag: Video message detected, downloading`);
                    let media = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
                    msg = {
                        video: { url: media },
                        caption: msgRepondu.videoMessage.caption,
                        mentions: tag
                    };
                } else if (msgRepondu.audioMessage) {
                    console.log(`[DEBUG] hidetag: Audio message detected, downloading`);
                    let media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
                    msg = {
                        audio: { url: media },
                        mimetype: 'audio/mp4',
                        mentions: tag
                    };
                } else if (msgRepondu.stickerMessage) {
                    console.log(`[DEBUG] hidetag: Sticker message detected, downloading`);
                    let media = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);
                    let stickerMess = new Sticker(media, {
                        pack: '𝐓𝐨𝐱𝐢𝐜-𝐌𝐃',
                        type: StickerTypes.CROPPED,
                        categories: ["🤩", "🎉"],
                        id: "12345",
                        quality: 70,
                        background: "transparent",
                    });
                    const stickerBuffer2 = await stickerMess.toBuffer();
                    msg = { sticker: stickerBuffer2, mentions: tag };
                } else {
                    console.log(`[DEBUG] hidetag: Text message detected`);
                    msg = {
                        text: msgRepondu.conversation,
                        mentions: tag
                    };
                }

                console.log(`[DEBUG] hidetag: Sending message with mentions`);
                await zk.sendMessage(dest, msg);
                console.log(`[DEBUG] hidetag: Message sent successfully`);
            } else {
                if (!arg || !arg[0]) {
                    console.log(`[DEBUG] hidetag: No arguments provided`);
                    repondre('𝐄𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐭𝐞𝐱𝐭 𝐭𝐨 𝐚𝐧𝐧𝐨𝐮𝐧𝐜𝐞 𝐨𝐫 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐭𝐡𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐚𝐧𝐧𝐨𝐮𝐧𝐜𝐞 📝');
                    return;
                }

                console.log(`[DEBUG] hidetag: Sending text message with mentions`);
                await zk.sendMessage(dest, { text: arg.join(' '), mentions: tag });
                console.log(`[DEBUG] hidetag: Text message sent successfully`);
            }
        } else {
            console.log(`[DEBUG] hidetag: User is not an admin or superuser`);
            repondre('𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐬 🚫');
        }
    }
);

zokou(
    { nomCom: "apk", reaction: "✨", categorie: "Recherche" },
    async (dest, zk, commandeOptions) => {
        const { repondre, arg, ms } = commandeOptions;

        console.log(`[DEBUG] apk command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        try {
            const appName = arg.join(' ');
            if (!appName) {
                console.log(`[DEBUG] apk: No app name provided`);
                repondre("𝐄𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐧𝐚𝐦𝐞 𝐨𝐟 𝐭𝐡𝐞 𝐚𝐩𝐩𝐥𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐭𝐨 𝐬𝐞𝐚𝐫𝐜𝐡 𝐟𝐨𝐫 📝");
                return;
            }

            console.log(`[DEBUG] apk: Searching for app: ${appName}`);
            const searchResults = await search(appName);

            if (searchResults.length === 0) {
                console.log(`[DEBUG] apk: No results found`);
                repondre("𝐂𝐚𝐧'𝐭 𝐟𝐢𝐧𝐝 𝐚𝐩𝐩𝐥𝐢𝐜𝐚𝐭𝐢𝐨𝐧, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚𝐧𝐨𝐭𝐡𝐞𝐫 𝐧𝐚𝐦𝐞 🚫");
                return;
            }

            console.log(`[DEBUG] apk: Downloading app: ${searchResults[0].id}`);
            const appData = await download(searchResults[0].id);
            const fileSize = parseInt(appData.size);

            if (fileSize > 300) {
                console.log(`[DEBUG] apk: File size exceeds 300 MB`);
                repondre("𝐓𝐡𝐞 𝐟𝐢𝐥𝐞 𝐞𝐱𝐜𝐞𝐞𝐝𝐬 𝟑𝟎𝟎 𝐌𝐁, 𝐮𝐧𝐚𝐛𝐥𝐞 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 🚫");
                return;
            }

            const downloadLink = appData.dllink;
            const captionText = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝗽𝗽𝗹𝗶𝗰𝗮𝘁𝗶𝗼𝗻 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 ✨
│❒ 𝗡𝗮𝗺𝗲: ${appData.name}
│❒ 𝗜𝗱: ${appData["package"]}
│❒ 𝗟𝗮𝘀𝘁 𝗨𝗽𝗱𝗮𝘁𝗲: ${appData.lastup}
│❒ 𝗦𝗶𝘇𝗲: ${appData.size}
◈━━━━━━━━━━━━━━━━◈`;

            const apkFileName = (appData?.["name"] || "Downloader") + ".apk";
            const filePath = apkFileName;

            console.log(`[DEBUG] apk: Downloading APK from: ${downloadLink}`);
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

            console.log(`[DEBUG] apk: Sending app icon and details`);
            await zk.sendMessage(dest, { image: { url: appData.icon }, caption: captionText }, { quoted: ms });
            console.log(`[DEBUG] apk: Sending APK file`);
            await zk.sendMessage(dest, documentMessage, { quoted: ms });
            console.log(`[DEBUG] apk: APK sent successfully`);

            fs.unlinkSync(filePath);
            console.log(`[DEBUG] apk: Temporary file deleted`);
        } catch (error) {
            console.error(`[DEBUG] apk: Error: ${error}`);
            repondre(`𝐄𝐫𝐫𝐨𝐫 𝐝𝐮𝐫𝐢𝐧𝐠 𝐚𝐩𝐤 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐩𝐫� o𝐜𝐞𝐬𝐬𝐢𝐧𝐠: ${error.message}`);
        }
    }
);

const cron = require(`../bdd/cron`);

zokou(
    { nomCom: 'automute', categorie: 'Group', reaction: "🔇" },
    async (dest, zk, commandeOptions) => {
        const { arg, repondre, verifAdmin } = commandeOptions;

        console.log(`[DEBUG] automute command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifAdmin) {
            console.log(`[DEBUG] automute: User is not an admin`);
            repondre('𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 🚫');
            return;
        }

        let group_cron = await cron.getCronById(dest);
        console.log(`[DEBUG] automute: Current cron state: ${JSON.stringify(group_cron)}`);

        if (!arg || arg.length == 0) {
            let state;
            if (group_cron == null || group_cron.mute_at == null) {
                state = "𝐍𝐨 𝐭𝐢𝐦𝐞 𝐬𝐞𝐭 𝐟𝐨𝐫 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜 𝐦𝐮𝐭𝐞";
            } else {
                state = `𝐓𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐦𝐮𝐭𝐞𝐝 𝐚𝐭 ${(group_cron.mute_at).split(':')[0]}:${(group_cron.mute_at).split(':')[1]}`;
            }

            let msg = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝘂𝘁𝗼𝗺𝘂𝘁𝗲 𝗦𝘁𝗮𝘁𝘂𝘀 🔇
│❒ 𝗦𝘁𝗮𝘁𝗲: ${state}
│❒ 𝗜𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀:
│❒ 𝗧𝗼 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰 𝗺𝘂𝘁𝗲, 𝗮𝗱𝗱 𝘁𝗵𝗲 𝗺𝗶𝗻𝘂𝘁𝗲 𝗮𝗻𝗱 𝗵𝗼𝘂𝗿 𝗮𝗳𝘁𝗲𝗿 𝘁𝗵𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝘀𝗲𝗽𝗮𝗿𝗮𝘁𝗲𝗱 𝗯𝘆 ':'
│❒ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲: automute 9:30
│❒ 𝗧𝗼 𝗱𝗲𝗹𝗲𝘁𝗲 𝘁𝗵𝗲 𝗮𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗰 𝗺𝘂𝘁𝗲, 𝘂𝘀𝗲 𝘁𝗵𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 automute del
◈━━━━━━━━━━━━━━━━◈`;

            console.log(`[DEBUG] automute: Sending state message`);
            await repondre(msg);
            console.log(`[DEBUG] automute: State message sent`);
            return;
        } else {
            let texte = arg.join(' ');

            if (texte.toLowerCase() === `del`) {
                if (group_cron == null) {
                    console.log(`[DEBUG] automute: No cron set`);
                    repondre('𝐍𝐨 𝐜𝐫𝐨𝐧𝐨𝐦𝐞𝐭𝐫𝐚𝐠𝐞 𝐢𝐬 𝐚𝐜𝐭𝐢𝐯𝐞 🚫');
                } else {
                    console.log(`[DEBUG] automute: Deleting cron`);
                    await cron.delCron(dest);
                    await repondre("𝐓𝐡𝐞 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜 𝐦𝐮𝐭𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐫𝐞𝐦𝐨𝐯𝐞𝐝; 𝐫𝐞𝐬𝐭𝐚𝐫𝐭 𝐭𝐨 𝐚𝐩𝐩𝐥𝐲 𝐜𝐡𝐚𝐧𝐠𝐞𝐬 🔄");
                    console.log(`[DEBUG] automute: Restarting bot`);
                    exec("pm2 restart all");
                }
            } else if (texte.includes(':')) {
                console.log(`[DEBUG] automute: Setting mute time to: ${texte}`);
                await cron.addCron(dest, "mute_at", texte);
                await repondre(`𝐒𝐞𝐭𝐭𝐢𝐧𝐠 𝐮𝐩 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢�{c 𝐦𝐮𝐭𝐞 𝐟𝐨𝐫 ${texte}; 𝐫𝐞𝐬𝐭𝐚𝐫𝐭 𝐭𝐨 𝐚𝐩𝐩𝐥�{y 𝐜𝐡𝐚𝐧𝐠𝐞𝐬 🔄`);
                console.log(`[DEBUG] automute: Restarting bot`);
                exec("pm2 restart all");
            } else {
                console.log(`[DEBUG] automute: Invalid time format`);
                repondre('𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐭𝐢𝐦𝐞 𝐰𝐢𝐭𝐡 𝐡𝐨𝐮𝐫 𝐚𝐧𝐝 𝐦𝐢𝐧𝐮𝐭𝐞 𝐬𝐞𝐩𝐚𝐫𝐚𝐭𝐞𝐝 𝐛𝐲 : 🚫');
            }
        }
    }
);

zokou(
    { nomCom: 'autounmute', categorie: 'Group', reaction: "🔊" },
    async (dest, zk, commandeOptions) => {
        const { arg, repondre, verifAdmin } = commandeOptions;

        console.log(`[DEBUG] autounmute command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifAdmin) {
            console.log(`[DEBUG] autounmute: User is not an admin`);
            repondre('𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 🚫');
            return;
        }

        let group_cron = await cron.getCronById(dest);
        console.log(`[DEBUG] autounmute: Current cron state: ${JSON.stringify(group_cron)}`);

        if (!arg || arg.length == 0) {
            let state;
            if (group_cron == null || group_cron.unmute_at == null) {
                state = "𝐍𝐨 𝐭𝐢𝐦𝐞 𝐬𝐞𝐭 𝐟𝐨𝐫 𝐚𝐮𝐭𝐨𝐮𝐧𝐦𝐮𝐭𝐞";
            } else {
                state = `𝐓𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐮𝐧-𝐦𝐮𝐭𝐞𝐝 𝐚𝐭 ${(group_cron.unmute_at).split(':')[0]}𝐇:${(group_cron.unmute_at).split(':')[1]}`;
            }

            let msg = `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗔𝘂𝘁𝗼𝘂𝗻𝗺𝘂𝘁𝗲 𝗦𝘁𝗮𝘁𝘂𝘀 🔊
│❒ 𝗦𝘁𝗮𝘁𝗲: ${state}
│❒ 𝗜𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀:
│❒ 𝗧𝗼 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲 𝗮𝘂𝘁𝗼𝘂𝗻𝗺𝘂𝘁𝗲, 𝗮𝗱𝗱 𝘁𝗵𝗲 𝗺𝗶𝗻𝘂𝘁𝗲 𝗮𝗻𝗱 𝗵𝗼𝘂𝗿 𝗮𝗳𝘁𝗲𝗿 𝘁𝗵𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝘀𝗲𝗽𝗮𝗿𝗮𝘁𝗲𝗱 𝗯𝘆 ':'
│❒ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲: autounmute 7:30
│❒ 𝗧𝗼 𝗱𝗲𝗹𝗲𝘁𝗲 𝗮𝘂𝘁𝗼𝘂𝗻𝗺𝘂𝘁𝗲, 𝘂𝘀𝗲 𝘁𝗵𝗲 𝗰𝗼𝗺𝗺�_a𝐧𝐝 autounmute del
◈━━━━━━━━━━━━━━━━◈`;

            console.log(`[DEBUG] autounmute: Sending state message`);
            await repondre(msg);
            console.log(`[DEBUG] autounmute: State message sent`);
            return;
        } else {
            let texte = arg.join(' ');

            if (texte.toLowerCase() === `del`) {
                if (group_cron == null) {
                    console.log(`[DEBUG] autounmute: No cron set`);
                    repondre('𝐍𝐨 𝐜𝐫𝐨𝐧𝐨𝐦𝐞𝐭𝐫𝐚𝐠𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 🚫');
                } else {
                    console.log(`[DEBUG] autounmute: Deleting cron`);
                    await cron.delCron(dest);
                    await repondre("𝐓𝐡𝐞 𝐚𝐮𝐭𝐨𝐮𝐧𝐦𝐮𝐭𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐫𝐞𝐦𝐨𝐯𝐞𝐝; 𝐫𝐞𝐬𝐭𝐚𝐫𝐭 𝐭𝐨 𝐚𝐩𝐩𝐥𝐲 𝐭𝐡𝐞 𝐜𝐡𝐚𝐧𝐠𝐞𝐬 🔄");
                    console.log(`[DEBUG] autounmute: Restarting bot`);
                    exec("pm2 restart all");
                }
            } else if (texte.includes(':')) {
                console.log(`[DEBUG] autounmute: Setting unmute time to: ${texte}`);
                await cron.addCron(dest, "unmute_at", texte);
                await repondre(`𝐒𝐞𝐭𝐭𝐢𝐧𝐠 𝐮𝐩 𝐚𝐮𝐭𝐨𝐮𝐧𝐦𝐮𝐭𝐞 𝐟𝐨𝐫 ${texte}; 𝐫𝐞𝐬𝐭𝐚𝐫𝐭 𝐭𝐨 𝐚𝐩𝐩𝐥𝐲 𝐭𝐡�{e 𝐜𝐡𝐚𝐧𝐠𝐞𝐬 🔄`);
                console.log(`[DEBUG] autounmute: Restarting bot`);
                exec("pm2 restart all");
            } else {
                console.log(`[DEBUG] autounmute: Invalid time format`);
                repondre('𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐭𝐢𝐦𝐞 𝐰𝐢𝐭𝐡 𝐡𝐨𝐮𝐫 𝐚𝐧𝐝 𝐦𝐢𝐧𝐮𝐭𝐞 𝐬𝐞𝐩𝐚𝐫𝐚𝐭𝐞𝐝 𝐛𝐲 : 🚫');
            }
        }
    }
);

zokou(
    { nomCom: 'antiforeign', categorie: 'Group', reaction: "👢" },
    async (dest, zk, commandeOptions) => {
        const { arg, repondre, verifAdmin, superUser, verifZokouAdmin } = commandeOptions;

        console.log(`[DEBUG] fkick command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (verifAdmin || superUser) {
            if (!verifZokouAdmin) {
                console.log(`[DEBUG] fkick: Bot is not an admin`);
                repondre('𝐘𝐨𝐮 𝐧𝐞𝐞𝐝 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐢𝐯𝐞 𝐫𝐢𝐠𝐡𝐭𝐬 𝐭𝐨 𝐩𝐞𝐫𝐟𝐨𝐫𝐦 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 🚫');
                return;
            }

            if (!arg || arg.length == 0) {
                console.log(`[DEBUG] fkick: No country code provided`);
                repondre('𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞�{r 𝐭𝐡𝐞 𝐜𝐨𝐮𝐧𝐭𝐫𝐲 𝐜𝐨𝐝𝐞 𝐰𝐡𝐨𝐬𝐞 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 📝');
                return;
            }

            let metadata = await zk.groupMetadata(dest);
            let participants = metadata.participants;
            console.log(`[DEBUG] fkick: Group members count: ${participants.length}`);

            for (let i = 0; i < participants.length; i++) {
                if (participants[i].id.startsWith(arg[0]) && participants[i].admin === null) {
                    console.log(`[DEBUG] fkick: Removing participant: ${participants[i].id}`);
                    await zk.groupParticipantsUpdate(dest, [participants[i].id], "remove");
                }
            }

            repondre(`𝐌𝐞𝐦𝐛𝐞𝐫𝐬 𝐰𝐢𝐭𝐡 𝐜𝐨𝐮𝐧𝐭𝐫𝐲 𝐜𝐨𝐝𝐞 ${arg[0]} 𝐡𝐚𝐯𝐞 𝐛𝐞𝐞𝐧 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 👢`);
            console.log(`[DEBUG] fkick: Removal process completed`);
        } else {
            console.log(`[DEBUG] fkick: User is not an admin or superuser`);
            repondre('𝐒𝐨𝐫𝐫𝐲, 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 🚫');
        }
    }
);

zokou(
    { nomCom: 'nsfw', categorie: 'Group', reaction: "🔞" },
    async (dest, zk, commandeOptions) => {
        const { arg, repondre, verifAdmin } = commandeOptions;

        console.log(`[DEBUG] nsfw command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        if (!verifAdmin) {
            console.log(`[DEBUG] nsfw: User is not an admin`);
            repondre('𝐒𝐨𝐫𝐫𝐲, 𝐲𝐨𝐮 𝐜𝐚𝐧𝐧𝐨𝐭 𝐞𝐧𝐚𝐛𝐥𝐞 𝐍𝐒𝐅𝐖 𝐜𝐨𝐧𝐭𝐞𝐧𝐭 𝐰𝐢𝐭𝐡𝐨𝐮𝐭 𝐛𝐞𝐢𝐧𝐠 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫 𝐨𝐟 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 🚫');
            return;
        }

        let hbd = require('../bdd/hentai');
        let isHentaiGroupe = await hbd.checkFromHentaiList(dest);
        console.log(`[DEBUG] nsfw: NSFW status: ${isHentaiGroupe}`);

        if (arg[0] == 'on') {
            if (isHentaiGroupe) {
                console.log(`[DEBUG] nsfw: NSFW already active`);
                repondre('𝐍𝐒𝐅𝐖 𝐜𝐨𝐧𝐭𝐞𝐧𝐭 𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐜𝐭𝐢𝐯�{e 𝐟𝐨�{r 𝐭𝐡𝐢�{s 𝐠𝐫𝐨𝐮𝐩 🔞');
                return;
            }

            console.log(`[DEBUG] nsfw: Activating NSFW`);
            await hbd.addToHentaiList(dest);
            repondre('𝐍𝐒𝐅𝐖 𝐜𝐨𝐧𝐭𝐞𝐧 𝐚𝐜𝐭𝐢𝐯𝐞  🔞');
        } else if (arg[0] == 'off') {
            if (!isHentaiGroupe) {
                console.log(`[DEBUG] nsfw: NSFW already disabled`);
                repondre('𝐍𝐒𝐅𝐖 𝐜𝐨𝐧𝐭𝐞𝐧�{t 𝐢�{s 𝐚𝐥𝐫𝐞𝐚𝐝�{y 𝐝𝐢𝐬𝐚𝐛𝐥�{e�{d 𝐟𝐨�{r 𝐭𝐡𝐢�{s 𝐠𝐫�{o𝐮�{p 🚫');
                return;
            }

            console.log(`[DEBUG] nsfw: Disabling NSFW`);
            await hbd.removeFromHentaiList(dest);
            repondre('𝐍𝐒𝐅𝐖 𝐍𝐎𝐖 𝐃𝐈𝐒𝐀𝐁𝐋𝐄𝐃 🚫');
        } else {
            console.log(`[DEBUG] nsfw: Invalid argument`);
            repondre('𝐘�{o𝐮 𝐦𝐮𝐬�{t 𝐞𝐧𝐭�{e𝐫 "�{o𝐧" �{o�{r "�{o𝐟𝐟" 🚫');
        }
    }
);