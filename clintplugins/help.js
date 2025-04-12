const util = require("util");
const fs = require("fs-extra");
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

// Help Command
zokou(
  {
    nomCom: "help",
    categorie: "General",
    reaction: "⚡",
  },
  async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe } = commandeOptions;
    let { cm } = require(__dirname + "/../framework/zokou");

    // Initial loading message
    let loadingMsg = await zk.sendMessage(
      dest,
      {
        text: "𝐋𝐨𝐚𝐝𝐢𝐧𝐠......\n▰▱▱▱▱▱▱▱▱▱ 10%",
      },
      { quoted: ms }
    );

    // Function to update loading progress
    const updateProgress = async (percent) => {
      const filled = Math.floor(percent / 10);
      const empty = 10 - filled;
      const batteryBar = "▰".repeat(filled) + "▱".repeat(empty);
      await zk.sendMessage(
        dest,
        {
          text: `𝐋𝐨𝐚𝐝𝐢𝐧𝐠...\n${batteryBar} ${percent}%`,
          edit: loadingMsg.key,
        },
        { quoted: ms }
      );
    };

    // Custom loading steps with skips (10%, 30%, 50%, 70%, 100%)
    const loadingSteps = [10, 30, 50, 70, 100];
    for (let percent of loadingSteps) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await updateProgress(percent);
    }

    // Command categorization
    var coms = {};
    cm.map(async (com) => {
      if (!coms[com.categorie]) {
        coms[com.categorie] = [];
      }
      coms[com.categorie].push(com.nomCom);
    });

    // Build category menu
    let categoryMenu = "◈━━━━━━━━━━━━━━━━◈\n  ⚡ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘 𝐌𝐄𝐍𝐔 ⚡\n\n";
    let categoryIndex = 1;
    for (const cat in coms) {
      categoryMenu += `  ${categoryIndex++}. *${cat}*\n`;
    }
    categoryMenu += "◈━━━━━━━━━━━━━━━━◈\n> 𝐓𝐲𝐩𝐞 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 𝐭𝐨 𝐬𝐞𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐢𝐧 𝐭𝐡𝐚𝐭 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲\n";

    // Send category menu
    await zk.sendMessage(
      dest,
      {
        text: categoryMenu,
      },
      { quoted: ms }
    );

    // Listen for user input for category selection without prefix
    zk.onMessage(async (msg) => {
      const selectedCategory = msg.body.trim();
      const categoryNumber = parseInt(selectedCategory);

      // Check if the input is a valid number and within the range of categories
      if (!isNaN(categoryNumber) && categoryNumber > 0 && categoryNumber <= Object.keys(coms).length) {
        const selectedCat = Object.keys(coms)[categoryNumber - 1];
        let commandList = `◈━━━━━━━━━━━━━━━━◈\n  ⚡ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 𝐈𝐍 *${selectedCat}* ⚡\n\n`;

        coms[selectedCat].forEach((cmd) => {
          commandList += `  ➺ ${cmd}\n`;
        });
        commandList += "◈━━━━━━━━━━━━━━━━◈";

        await zk.sendMessage(
          dest,
          {
            text: commandList,
          },
          { quoted: msg }
        );
      } else {
        repondre("❌ Invalid