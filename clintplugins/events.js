const { zokou } = require('../framework/zokou');
const { attribuerUnevaleur } = require('../bdd/welcome');

async function events(nomCom) {
    zokou({
        nomCom: nomCom,
        categorie: 'Group',
        reaction: '⚙️'
    }, async (dest, zk, commandeOptions) => {
        const { ms, arg, repondre, superUser, verifAdmin, nomAuteurMessage } = commandeOptions;

        if (!verifAdmin && !superUser) {
            return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, you ain’t got the keys to mess with ${nomCom}! 😡 Only admins or 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 can run 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇’s group vibes! 🚫\n◈━━━━━━━━━━━━━━━━◈`);
        }

        if (!arg[0] || arg.join(' ').trim() === '') {
            return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, don’t be lazy! Use *${nomCom} on* to activate or *${nomCom} off* to shut it down! 😎 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇 needs clear orders! 🔥\n◈━━━━━━━━━━━━━━━━◈`);
        }

        const setting = arg[0].toLowerCase();
        if (setting === 'on' || setting === 'off') {
            try {
                await attribuerUnevaleur(dest, nomCom, setting);
                await zk.sendMessage(
                    dest,
                    {
                        text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM, ${nomAuteurMessage}! ${nomCom} is now ${setting} for this group! 🔥\n│❒ 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇’s got it locked in! 🚀\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`,
                        footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`
                    },
                    { quoted: ms }
                );
            } catch (error) {
                console.error(`Error updating ${nomCom}:`, error);
                await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL BUST, ${nomAuteurMessage}! 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇 tripped while setting ${nomCom}: ${error.message} 😡 Try again or flop! 😣\n◈━━━━━━━━━━━━━━━━◈`);
            }
        } else {
            repondre(`𝐓𝐎𝐗𝐈C-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, what’s this nonsense? 😡 Only *${nomCom} on* or *${nomCom} off* works for 𝔗𝔬𝔵𝔦𝔠 𝔐𝔇! Get it right! 🔧\n◈━━━━━━━━━━━━━━━━◈`);
        }
    });
}

// Register the commands
events('welcome');
events('goodbye');
events('antipromote');
events('antidemote');