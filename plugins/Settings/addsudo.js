import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getSudoUsers, addSudoUser } from '../../database/config.js';
import { resolvePhoneNumber } from '../../lib/lidResolver.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

function cleanPhone(input) {
    if (!input) return '';
    let s = String(input).trim();
    s = s.replace(/@s\.whatsapp\.net$/i, '').replace(/@lid$/i, '').split(':')[0];
    s = s.replace(/[^\d]/g, '');
    return s;
}

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, participants } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let numberToAdd;

        if (m.quoted) {
            numberToAdd = resolvePhoneNumber(m.quoted.sender, participants);
            numberToAdd = cleanPhone(numberToAdd);
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            numberToAdd = resolvePhoneNumber(m.mentionedJid[0], participants);
            numberToAdd = cleanPhone(numberToAdd);
        } else {
            numberToAdd = cleanPhone((args || []).join('') || args?.[0] || '');
        }

        if (!numberToAdd || !/^\d{7,15}$/.test(numberToAdd)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 ADD SUDO」
│ Give me a valid number or quote a user, fool!
│ Spaces, +, dashes are auto-cleaned.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const sudoUsers = await getSudoUsers();
        if (sudoUsers.includes(numberToAdd)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 ADD SUDO」
│ Already a sudo user, you clueless twit!
│ ${numberToAdd} is already in the elite ranks.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        await addSudoUser(numberToAdd);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return sendInteractive(client, m, `╭─❏ 「 ADD SUDO」
│ Bow down!
│ ${numberToAdd} is now a Sudo King!
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    });
};
