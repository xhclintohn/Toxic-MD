const { zokou } = require('../framework/zokou');
const { addstickcmd, deleteCmd, getCmdById, inStickCmd, getAllStickCmds } = require('../bdd/stickcmd');

zokou(
    {
        nomCom: 'setcmd',
        categorie: 'stickcmd'
    }, 
    async (dest, zk, commandeOptions) => { 
        const { ms, arg, repondre, superUser, msgRepondu } = commandeOptions;

        if (!superUser) { 
            repondre('You can\'t use this command'); 
            return; 
        }

        if (msgRepondu && msgRepondu.stickerMessage) {  
            if (!arg || !arg[0]) { 
                repondre('Please provide the name of the command'); 
                return; 
            }
          
            await addstickcmd(arg[0].toLowerCase(), msgRepondu.stickerMessage.url);
            repondre('Sticker command saved successfully');
        } else {
            repondre('Please mention a sticker');
        }
    }
); 

zokou(
    {
        nomCom: 'delcmd',
        categorie: 'stickcmd'
    },
    async (dest, zk, commandeOptions) => {
        const { ms, arg, repondre, superUser } = commandeOptions;

        if (!superUser) {
            repondre('Only mods can use this command');
            return;
        }

        if (!arg || !arg[0]) {
            repondre('Please provide the name of the command you want to delete');
            return;
        }

        const cmdToDelete = arg[0];

        try {
            await deleteCmd(cmdToDelete.toLowerCase());
            repondre(`The command ${cmdToDelete} has been deleted successfully.`);
        } catch {
            repondre(`The command ${cmdToDelete} doesn\'t exist`);
        }
    }
);

zokou(
    {
        nomCom: 'allcmd',
        categorie: 'stickcmd'
    },
    async (dest, zk, commandeOptions) => {
        const { repondre, superUser } = commandeOptions;

        if (!superUser) {
            repondre('Only mods can use this command');
            return;
        }

        const allCmds = await getAllStickCmds();

        if (allCmds.length > 0) {
            const cmdList = allCmds.map(cmd => cmd.cmd).join(', ');
            repondre(`*List of all stick commands:*\n${cmdList}`);
        } else {
            repondre('No stick commands saved');
        }
    }
);