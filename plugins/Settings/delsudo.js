import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getSettings, getSudoUsers, removeSudoUser } from '../../database/config.js';
import { resolvePhoneNumber } from '../../lib/lidResolver.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, participants } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let numberToRemove;

        if (m.quoted) {
            numberToRemove = resolvePhoneNumber(m.quoted.sender, participants);
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            numberToRemove = resolvePhoneNumber(m.mentionedJid[0], participants);
        } else {
            numberToRemove = args[0];
        }

        if (!numberToRemove || !/^\d+$/.test(numberToRemove)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 DELSUDO」\n│ Provide a valid number or quote a user, genius.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const settings = await getSettings();
        if (!settings) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 DELSUDO」\n│ Settings not found. Something's seriously broken.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const sudoUsers = await getSudoUsers();

        if (!sudoUsers.includes(numberToRemove)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 DELSUDO」\n│ This number isn't even a sudo user, idiot.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        await removeSudoUser(numberToRemove);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

        await sendInteractive(client, m, `╭─❏ 「 DELSUDO」\n│ ${numberToRemove} removed from Sudo Users.\n│ Power revoked. Sucks to be them.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    });
};
