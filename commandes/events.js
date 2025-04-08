const { zokou } = require('../framework/zokou');
const { attribuerUnevaleur } = require('../bdd/welcome');

async function events(nomCom) {
    zokou({
        nomCom: nomCom,
        categorie: 'Group'
    }, async (dest, zk, commandeOptions) => {
        const { ms, arg, repondre, superUser, verifAdmin } = commandeOptions;

        if (!verifAdmin && !superUser) {
            return repondre("𝐘𝐨𝐮 𝐜𝐚𝐧'𝐭 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝, 𝐲𝐨𝐮'𝐫𝐞 𝐧𝐨𝐭 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧 𝐨𝐫 𝐬𝐮𝐩𝐞𝐫𝐮𝐬𝐞𝐫!");
        }

        if (!arg[0] || arg.join(' ').trim() === '') {
            return repondre(`𝐔𝐬𝐞 ${nomCom} 𝐨𝐧 𝐭𝐨 𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞 𝐨𝐫 ${nomCom} 𝐨𝐟𝐟 𝐭𝐨 𝐝𝐞𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞.`);
        }

        const setting = arg[0].toLowerCase();
        if (setting === 'on' || setting === 'off') {
            try {
                await attribuerUnevaleur(dest, nomCom, setting);
                repondre(`${nomCom} 𝐢𝐬 𝐧𝐨𝐰 𝐬𝐞𝐭 𝐭𝐨 ${setting} 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃.`);
            } catch (error) {
                console.error(`Error updating ${nomCom}:`, error);
                repondre(`𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠 𝐰𝐡𝐢𝐥𝐞 𝐮𝐩𝐝𝐚𝐭𝐢𝐧𝐠 ${nomCom}.`);
            }
        } else {
            repondre("𝐎𝐧𝐥𝐲 '𝐨𝐧' 𝐭𝐨 𝐚�(c𝐭𝐢𝐯𝐚𝐭𝐞 𝐨𝐫 '𝐨𝐟𝐟' 𝐭𝐨 𝐝𝐞𝐚𝐜𝐭𝐢𝐯𝐚𝐭𝐞 𝐚𝐫𝐞 𝐚𝐥𝐥𝐨𝐰𝐞𝐝!");
        }
    });
}

// Register the commands
events('welcome');
events('goodbye');
events('antipromote');
events('antidemote');