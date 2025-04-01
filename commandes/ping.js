"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");

// New ping command to measure bot response speed
zokou({ 
  nomCom: "ping", 
  reaction: "⚡", 
  nomFichier: __filename 
}, async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    const startTime = Date.now();
    
    await repondre("𝐂𝐡𝐞𝐜𝐤𝐢𝐧𝐠 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐬𝐩𝐞𝐞𝐝...");
    
    const endTime = Date.now();
    const pingTime = endTime - startTime;
    
    const pingMessage = `

┃ 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐏𝐢𝐧𝐠 ┃

┣✦ 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐓𝐢𝐦𝐞: ${pingTime}ms
┣✦ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐎𝐩𝐭𝐢𝐦𝐚𝐥
╰─────────────────╯`;
    
    await zk.sendMessage(dest, { 
      text: pingMessage 
    }, { quoted: ms });
});

// Existing test command with updated styling
zokou({ 
  nomCom: "test", 
  reaction: "🧒", 
  nomFichier: __filename 
}, async (dest, zk, commandeOptions) => {
    console.log("Commande saisie !!!s");
    const z = '╔════════════════╗\n┃ 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 ┃\n┃ 𝐈𝐬 𝐀𝐜𝐭𝐢𝐯𝐞 ┃\n╚════════════════╝\n☣️🚀 𝐀𝐂𝐓𝐈𝐕𝐄 𝐀𝐍𝐃 𝐑𝐄𝐀𝐃𝐘';
    const d = '\n\n╔════════════════╗\n┃ 𝐒𝐓𝐀𝐓𝐔𝐒 ┃\n╚════════════════╝\n✨ 𝐎𝐩𝐞𝐫𝐚𝐭𝐢𝐨𝐧𝐚𝐥';
    const varmess = z + d;
    const mp4 = 'https://telegra.ph/file/ce58cf8c538b1496fda33.mp4';
    await zk.sendMessage(dest, { 
      video: { url: mp4 }, 
      caption: varmess 
    });
});

console.log("mon test");