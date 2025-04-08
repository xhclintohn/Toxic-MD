const { zokou } = require('../framework/zokou');
const { ajouterUtilisateurAvecWarnCount, getWarnCountByJID, resetWarnCountByJID } = require('../bdd/warn');
const s = require("../set");

zokou(
  {
    nomCom: 'warn',
    categorie: 'Group'
  },
  async (dest, zk, commandeOptions) => {
    const { ms, arg, repondre, superUser, verifGroupe, verifAdmin, msgRepondu, auteurMsgRepondu } = commandeOptions;

    if (!verifGroupe) {
      return repondre("𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲!");
    }

    if (!verifAdmin && !superUser) {
      return repondre("𝐘𝐨𝐮'𝐫𝐞 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧 𝐨𝐫 𝐬𝐮𝐩𝐞𝐫𝐮𝐬𝐞𝐫, 𝐜𝐚𝐧'𝐭 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬!");
    }

    if (!msgRepondu) {
      return repondre("𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐮𝐬𝐞𝐫'𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐰𝐚𝐫𝐧 𝐭𝐡𝐞𝐦!");
    }

    try {
      const args = arg.join('').trim().toLowerCase();

      if (!args || args === '') {
        // Add or increment warn count
        await ajouterUtilisateurAvecWarnCount(auteurMsgRepondu);
        const warn = await getWarnCountByJID(auteurMsgRepondu);
        const warnLimit = s.WARN_COUNT || 3; // Default to 3 if not set

        if (warn >= warnLimit) {
          await repondre(`𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐡𝐚𝐬 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐭𝐡𝐞 𝐰𝐚𝐫𝐧 𝐥𝐢𝐦𝐢𝐭 (${warnLimit}). 𝐊𝐢𝐜𝐤𝐢𝐧𝐠 𝐭𝐡𝐞𝐦 𝐧𝐨𝐰!`);
          await zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "remove");
        } else {
          const remaining = warnLimit - warn;
          repondre(`𝐔𝐬𝐞𝐫 𝐰𝐚𝐫𝐧𝐞𝐝! 𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠 𝐰𝐚𝐫𝐧𝐬 𝐛𝐞𝐟𝐨𝐫𝐞 𝐤𝐢𝐜𝐤: ${remaining} - 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃`);
        }
      } else if (args === 'reset') {
        // Reset warn count
        await resetWarnCountByJID(auteurMsgRepondu);
        repondre("𝐖𝐚�{r𝐧 𝐜𝐨𝐮𝐧𝐭 𝐫𝐞𝐬𝐞𝐭 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃!");
      } else {
        repondre("𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 '.𝐰𝐚𝐫𝐧' 𝐭𝐨 𝐰𝐚𝐫𝐧 𝐨𝐫 '.𝐰𝐚𝐫𝐧 𝐫𝐞𝐬𝐞𝐭' 𝐭𝐨 𝐫𝐞𝐬𝐞𝐭!");
      }
    } catch (error) {
      console.error("Error in warn command:", error);
      repondre(`𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠 𝐰𝐡𝐢𝐥𝐞 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧�{g 𝐭𝐡𝐢𝐬 𝐰𝐚𝐫𝐧: ${error.message}`);
    }
  }
);