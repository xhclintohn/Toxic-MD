const { zokou } = require("../framework/zokou");
const mumaker = require("mumaker");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
//                   𝐋𝐎𝐆𝐎 𝐌𝐀𝐊𝐄𝐑 𝐌𝐎𝐃𝐔𝐋𝐄                //
//               𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃                //
//             𝐎𝐰𝐧𝐞�{r: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧                   //
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

// Naruto Logo Command
zokou(
  {
    nomCom: "naruto",
    categorie: "Logo",
    reaction: "⛩",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, prefixe } = commandeOptions;
    try {
      if (!arg || arg.length === 0) {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}naruto 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐍𝐚𝐫𝐮𝐭𝐨-𝐬𝐭𝐲𝐥𝐞 𝐥𝐨𝐠𝐨 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞!`
        );
        return;
      }
      repondre("🔄 𝐏𝐫�{o𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐍𝐚𝐫𝐮𝐭𝐨 𝐥𝐨𝐠𝐨...");
      const result = await mumaker.ephoto(
        "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html",
        arg.join(" ")
      );
      await zk.sendMessage(
        dest,
        {
          image: { url: result.image },
          caption:
            "⛩ 𝐍𝐚𝐫𝐮𝐭𝐨 𝐋𝐨𝐠𝐨 ⛩\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
        },
        { quoted: ms }
      );
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

// 3D Christmas Logo Command
zokou(
  {
    nomCom: "3dchristmas",
    categorie: "Logo",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, prefixe } = commandeOptions;
    try {
      if (!arg || arg.length === 0) {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}3dchristmas 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐟𝐞𝐬𝐭𝐢𝐯𝐞 𝟑𝐃 𝐂𝐡𝐫𝐢𝐬𝐭𝐦𝐚𝐬 𝐥𝐨𝐠𝐨 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞!`
        );
        return;
      }
      repondre("🔄 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝟑𝐃 𝐂𝐡𝐫𝐢𝐬𝐭𝐦𝐚𝐬 𝐥𝐨𝐠𝐨...");
      const result = await mumaker.textpro(
        "https://textpro.me/3d-christmas-text-effect-by-name-1055.html",
        arg.join(" ")
      );
      await zk.sendMessage(
        dest,
        {
          image: { url: result.image },
          caption:
            "🎄 𝟑𝐃 𝐂𝐡𝐫𝐢𝐬𝐭𝐦𝐚𝐬 𝐋𝐨𝐠𝐨 🎄\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
        },
        { quoted: ms }
      cochon });
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

// Blood Logo Command
zokou(
  {
    nomCom: "blood",
    categorie: "Logo",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, prefixe } = commandeOptions;
    try {
      if (!arg || arg.length === 0) {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}blood 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐜𝐫𝐞𝐞𝐩𝐲 𝐁𝐥𝐨𝐨𝐝 𝐥𝐨𝐠𝐨 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞!`
        );
        return;
      }
      repondre("🔄 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐁𝐥𝐨�{o𝐝 𝐥𝐨𝐠𝐨...");
      const result = await mumaker.textpro(
        "https://textpro.me/horror-blood-text-effect-online-883.html",
        arg.join(" ")
      );
      await zk.sendMessage(
        dest,
        {
          image: { url: result.image },
          caption:
            "🩸 𝐁𝐥𝐨𝐨𝐝 𝐋𝐨𝐠𝐨 🩸\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
        },
        { quoted: ms }
      );
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

// Deepsea Logo Command
zokou(
  {
    nomCom: "deepsea",
    categorie: "Logo",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, prefixe } = commandeOptions;
    try {
      if (!arg || arg.length === 0) {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}deepsea 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐦𝐲𝐬𝐭𝐞𝐫𝐢𝐨𝐮𝐬 𝐃𝐞𝐞𝐩𝐬𝐞𝐚 𝐥𝐨𝐠𝐨 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮�{r 𝐧𝐚𝐦𝐞!`
        );
        return;
      }
      repondre("🔄 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐃𝐞𝐞𝐩𝐬𝐞𝐚 𝐥𝐨𝐠𝐨...");
      const result = await mumaker.textpro(
        "https://textpro.me/create-3d-deep-sea-metal-text-effect-online-1053.html",
        arg.join(" ")
      );
      await zk.sendMessage(
        dest,
        {
          image: { url: result.image },
          caption:
            "🌊 𝐃𝐞𝐞𝐩𝐬𝐞𝐚 𝐋𝐨𝐠𝐨 🌊\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
        },
        { quoted: ms }
      );
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

// Glitch Logo Command
zokou(
  {
    nomCom: "glitch",
    categorie: "Logo",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, prefixe } = commandeOptions;
    try {
      if (!arg || arg.length === 0) {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}glitch 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚𝐧 𝐢𝐦𝐩𝐫𝐞𝐬𝐬𝐢𝐯𝐞 𝐆𝐥𝐢𝐭𝐜𝐡 𝐥𝐨𝐠𝐨 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞!`
        );
        return;
      }
      repondre("🔄 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐆𝐥𝐢𝐭𝐜𝐡 𝐥𝐨𝐠𝐨...");
      const result = await mumaker.textpro(
        "https://textpro.me/create-impressive-glitch-text-effects-online-1027.html",
        arg.join(" ")
      );
      await zk.sendMessage(
        dest,
        {
          image: { url: result.image },
          caption:
            "⚡ 𝐆𝐥𝐢𝐭�{c𝐡 𝐋𝐨𝐠𝐨 ⚡\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨�{n",
        },
        { quoted: ms }
      );
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

// Thunder Logo Command
zokou(
  {
    nomCom: "thunder",
    categorie: "Logo",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, prefixe } = commandeOptions;
    try {
      if (!arg || arg.length === 0) {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}thunder 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐬𝐭𝐫𝐢𝐤𝐢𝐧𝐠 𝐓𝐡𝐮𝐧𝐝𝐞𝐫 𝐥𝐨𝐠𝐨 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞!`
        );
        return;
      }
      repondre("🔄 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐓𝐡𝐮𝐧𝐝𝐞𝐫 𝐥𝐨𝐠𝐨...");
      const result = await mumaker.textpro(
        "https://textpro.me/online-thunder-text-effect-generator-1031.html",
        arg.join(" ")
      );
      await zk.sendMessage(
        dest,
        {
          image: { url: result.image },
          caption:
            "⚡ 𝐓𝐡𝐮𝐧𝐝𝐞𝐫 𝐋𝐨𝐠𝐨 ⚡\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
        },
        { quoted: ms }
      );
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

// Joker Logo Command
zokou(
  {
    nomCom: "joker",
    categorie: "Logo",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, prefixe } = commandeOptions;
    try {
      if (!arg || arg.length === 0) {
        repondre(
          `🔹 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}joker 𝐓𝐨𝐱𝐢𝐜\n\n𝐂𝐫𝐞𝐚𝐭𝐞 𝐚 𝐰𝐢𝐜𝐤𝐞𝐝 𝐉𝐨𝐤𝐞𝐫 𝐥𝐨𝐠𝐨 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐧𝐚𝐦𝐞!`
        );
        return;
      }
      repondre("🔄 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐉𝐨𝐤𝐞𝐫 𝐥𝐨𝐠𝐨...");
      const result = await mumaker.textpro(
        "https://textpro.me/create-logo-joker-online-934.html",
        arg.join(" ")
      );
      await zk.sendMessage(
        dest,
        {
          image: { url: result.image },
          caption:
            "🃏 𝐉𝐨𝐤𝐞𝐫 𝐋𝐨𝐠𝐨 🃏\n\n𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛�{y 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃\n𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧",
        },
        { quoted: ms }
      );
    } catch (e) {
      repondre(`❌ 𝐎𝐨𝐩𝐬! 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠: ${e.message}`);
    }
  }
);

module.exports = { zokou };