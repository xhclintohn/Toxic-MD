const { zokou } = require('../framework/zokou');
const s = require('../set');

zokou(
  {
    nomCom: "setvar",
    categorie: "Heroku",
    reaction: "⚙️",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, superUser, arg } = commandeOptions;

    try {
      console.log('DEBUG - setvar triggered:', { arg, superUser });

      if (!superUser) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BACK OFF! Only mods can touch this command, peasant! 😡\n◈━━━━━━━━━━━━━━━━◈`);
      }

      if (!arg[0] || !arg.join(' ').includes('=')) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ USELESS INPUT! Format it right, like: .setvar OWNER_NAME=xhclinton 😤\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const text = arg.join(' ').trim();
      const [key, value] = text.split('=').map(str => str.trim());

      if (!key || !value) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ STOP WASTING MY TIME! Provide a valid KEY=VALUE pair! 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      if (!s.HEROKU_API_KEY || !s.HEROKU_APP_NAME) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ CONFIG ERROR! HEROKU_API_KEY or HEROKU_APP_NAME missing in set.js! Fix it now! 😵\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const Heroku = require("heroku-client");
      const heroku = new Heroku({ token: s.HEROKU_API_KEY });
      const baseURI = `/apps/${s.HEROKU_APP_NAME}`;

      await heroku.patch(`${baseURI}/config-vars`, {
        body: { [key]: value },
      });

      await repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM! Heroku var ${key} set to ${value}! Rebooting like a boss... 💪\n◈━━━━━━━━━━━━━━━━◈`);

    } catch (error) {
      console.error('setvar error:', error);
      await repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ EPIC FAIL! Something broke: ${error.message} 😡 Fix it or suffer!\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);

zokou(
  {
    nomCom: "allvar",
    categorie: "Heroku",
    reaction: "📋",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, superUser } = commandeOptions;

    try {
      console.log('DEBUG - allvar triggered:', { superUser });

      if (!superUser) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ GET LOST! Only mods can peek at the vars, loser! 😠\n◈━━━━━━━━━━━━━━━━◈`);
      }

      if (!s.HEROKU_API_KEY || !s.HEROKU_APP_NAME) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ CONFIG DISASTER! HEROKU_API_KEY or HEROKU_APP_NAME missing in set.js! Sort it out! 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const Heroku = require("heroku-client");
      const heroku = new Heroku({ token: s.HEROKU_API_KEY });
      const baseURI = `/apps/${s.HEROKU_APP_NAME}`;

      const vars = await heroku.get(`${baseURI}/config-vars`);
      let str = `TOXIC-MD VARS\n\n◈━━━━━━━━━━━━━━━━◈\n`;
      for (const vr in vars) {
        str += `☣️ *${vr}* = ${vars[vr]}\n`;
      }
      str += `◈━━━━━━━━━━━━━━━━◈`;

      await repondre(str);

    } catch (error) {
      console.error('allvar error:', error);
      await repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ CRASH AND BURN! Error: ${error.message} 😡 Get it together!\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);

zokou(
  {
    nomCom: "getvar",
    categorie: "Heroku",
    reaction: "🔍",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, superUser, arg } = commandeOptions;

    try {
      console.log('DEBUG - getvar triggered:', { arg, superUser });

      if (!superUser) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NO ENTRY! Only mods can snoop on vars, punk! 😤\n◈━━━━━━━━━━━━━━━━◈`);
      }

      if (!arg[0]) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ DON'T BE LAZY! Give me a variable name in CAPS! 😡\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const varName = arg.join(' ').trim().toUpperCase();

      if (!s.HEROKU_API_KEY || !s.HEROKU_APP_NAME) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ CONFIG FAILURE! HEROKU_API_KEY or HEROKU_APP_NAME missing in set.js! Fix it! 😵\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const Heroku = require("heroku-client");
      const heroku = new Heroku({ token: s.HEROKU_API_KEY });
      const baseURI = `/apps/${s.HEROKU_APP_NAME}`;

      const vars = await heroku.get(`${baseURI}/config-vars`);
      if (vars[varName]) {
        await repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ GOT IT! ${varName} = ${vars[varName]} 💥\n◈━━━━━━━━━━━━━━━━◈`);
      } else {
        await repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NOPE! Variable ${varName} doesn't exist, try again! 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

    } catch (error) {
      console.error('getvar error:', error);
      await repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL FAILURE! Error: ${error.message} 😡 Fix this mess!\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);