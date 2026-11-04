import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getSudoUsers, addSudoUser } from '../../database/config.js';
import { resolvePhoneNumber, resolveSenderJid } from '../../lib/lidResolver.js';
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
        let targetWasUnresolvedLid = false;

        const resolveTargetPhone = async (rawTarget) => {
            if (!rawTarget) return '';
            if (String(rawTarget).endsWith('@lid')) {
                try {
                    const resolved = await Promise.race([
                        resolveSenderJid(rawTarget, m.chat, client, m.key).catch(() => null),
                        new Promise(r => setTimeout(() => r(null), 2500))
                    ]);
                    if (resolved && !String(resolved).endsWith('@lid')) return cleanPhone(resolved);
                } catch {}
                const fallback = resolvePhoneNumber(rawTarget, participants);
                if (!fallback) targetWasUnresolvedLid = true;
                return cleanPhone(fallback);
            }
            return cleanPhone(resolvePhoneNumber(rawTarget, participants));
        };

        if (m.quoted) {
            numberToAdd = await resolveTargetPhone(m.quoted.sender);
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            numberToAdd = await resolveTargetPhone(m.mentionedJid[0]);
        } else {
            numberToAdd = cleanPhone((args || []).join('') || args?.[0] || '');
        }

        if (!numberToAdd || !/^\d{7,15}$/.test(numberToAdd)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, targetWasUnresolvedLid ? `╭─❏ 「 ADD SUDO」
│ Couldn't resolve that user's phone number from their LID.
│ Type the number yourself instead, fool!
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` : `╭─❏ 「 ADD SUDO」
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
