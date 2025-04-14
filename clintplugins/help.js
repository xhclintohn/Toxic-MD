const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const path = require('path');
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

zokou(
    { nomCom: "help", categorie: "General", reaction: "⭐" },
    async (dest, zk, commandeOptions) => {
        let { ms, repondre, mybotpic } = commandeOptions;

        console.log(`[DEBUG] .help command triggered by ${ms.key.participant || ms.key.remoteJid} in ${dest}`);

        // Set timezone and get time/date
        moment.tz.setDefault('Etc/GMT');
        const temps = moment().format('HH:mm:ss');
        const date = moment().format('DD/MM/YYYY');

        console.log(`[DEBUG] Time: ${temps}, Date: ${date}`);

        // Prepare the initial help message
        let infoMsg = `
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 

VERSION
> 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 V2.0

◈━━━━━━━━━━━━━━━━◈
│❒⁠⁠⁠⁠ TIME : ${temps}
│❒⁠⁠⁠⁠ DATE : ${date}
│❒⁠⁠⁠⁠ DEV : 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
⁠⁠⁠⁠◈━━━━━━━━━━━━━━━━◈
  `;

        // Get all unique categories from evt.cm
        const categories = [...new Set(global.evt.cm.map(cmd => cmd.categorie || "Uncategorized"))];

        console.log(`[DEBUG] Categories: ${categories}`);

        // Create a numbered list of categories
        let menuMsg = `
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 2025™

◈━━━━━━━━━━━━━━━━◈
`;

        categories.forEach((cat, index) => {
            menuMsg += `│❒⁠⁠⁠⁠【${index + 1}】 ${cat}\n`;
        });

        menuMsg += `◈━━━━━━━━━━━━━━━━◈
│❒⁠⁠⁠⁠ 📩 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝗮 𝗻𝘂𝗺𝗯𝗲𝗿 𝘁𝗼 𝘀𝗲𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀!
`;

        console.log(`[DEBUG] Full message to send:\n${infoMsg + menuMsg}`);

        try {
            // Send the help message with image/video
            var lien = mybotpic();
            console.log(`[DEBUG] mybotpic URL: ${lien}`);

            if (lien.match(/\.(mp4|gif)$/i)) {
                console.log(`[DEBUG] Sending as video/gif`);
                await zk.sendMessage(
                    dest,
                    {
                        video: { url: lien },
                        caption: infoMsg + menuMsg,
                        footer: "Toxic-MD WhatsApp Bot",
                        gifPlayback: true,
                    },
                    { quoted: ms }
                );
                console.log(`[DEBUG] Video/gif message sent`);
            } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
                console.log(`[DEBUG] Sending as image`);
                await zk.sendMessage(
                    dest,
                    {
                        image: { url: lien },
                        caption: infoMsg + menuMsg,
                        footer: "Toxic-MD WhatsApp Bot",
                    },
                    { quoted: ms }
                );
                console.log(`[DEBUG] Image message sent`);
            } else {
                console.log(`[DEBUG] Sending as text`);
                await repondre(infoMsg + menuMsg);
                console.log(`[DEBUG] Text message sent`);
            }

            // Wait for the user's reply
            console.log(`[DEBUG] Waiting for user reply...`);
            const reply = await zk.awaitForMessage({
                sender: ms.key.participant || ms.key.remoteJid,
                chatJid: dest,
                timeout: 30000, // 30 seconds timeout
                filter: (msg) => {
                    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                    return text && /^\d+$/.test(text) && parseInt(text) > 0 && parseInt(text) <= categories.length;
                }
            });

            // Get the selected category
            const selectedNumber = parseInt(reply.message?.conversation || reply.message?.extendedTextMessage?.text);
            const selectedCategory = categories[selectedNumber - 1];

            console.log(`[DEBUG] User replied with: ${selectedNumber}, Selected category: ${selectedCategory}`);

            // List commands in the selected category
            const commandsInCategory = global.evt.cm.filter(cmd => (cmd.categorie || "Uncategorized") === selectedCategory);
            let commandList = `
     𝐓𝐎𝐗𝐈𝐂-𝐌𝐃 

CATEGORY
> ${selectedCategory.toUpperCase()}

◈━━━━━━━━━━━━━━━━◈
`;

            if (commandsInCategory.length === 0) {
                commandList += "│❒⁠⁠⁠⁠ 𝗡𝗼 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗶𝘀 𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝘆. 😔\n";
            } else {
                commandsInCategory.forEach(cmd => {
                    commandList += `│❒⁠⁠⁠⁠ ${global.prefixe}${cmd.nomCom}\n`;
                });
                commandList += `\n│❒⁠⁠⁠⁠ 💡 𝗧𝘆𝗽𝗲 ${global.prefixe}<𝗰𝗼𝗺𝗺𝗮𝗻𝗱> 𝘁𝗼 𝘂𝘀𝗲 𝗶𝘁!`;
            }

            commandList += `
◈━━━━━━━━━━━━━━━━◈
`;

            console.log(`[DEBUG] Sending command list:\n${commandList}`);
            await zk.sendMessage(dest, { text: commandList }, { quoted: reply });
            console.log(`[DEBUG] Command list sent`);
        } catch (error) {
            console.log(`[DEBUG] Error in .help command: ${error}`);
            if (error.message === "Timeout") {
                await repondre(`⏰ 𝗧𝗶𝗺𝗲’𝘀 𝘂𝗽! 𝗡𝗼 𝘃𝗮𝗹𝗶𝗱 𝗿𝗲𝗽𝗹𝘆 𝗿𝗲𝗰𝗲𝗶𝘃𝗲𝗱. 𝗧𝗿𝘆 ${global.prefixe}help 𝗮𝗴�_a𝗶𝗻! 😊`);
            } else {
                await repondre(`𝐇𝐞𝐥𝐩 𝐜𝐨𝐦𝐦𝐚𝗻𝐝 𝐞𝐫𝐫𝐨𝐫: ${error.message}`);
            }
            console.log(`[DEBUG] Error message sent`);
        }
    }
);