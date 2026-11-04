import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getSettings, getSudoUsers, removeSudoUser } from '../../database/config.js';
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

        let numberToRemove;

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
            }
            return cleanPhone(resolvePhoneNumber(rawTarget, participants));
        };

        if (m.quoted) {
            numberToRemove = await resolveTargetPhone(m.quoted.sender);
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            numberToRemove = await resolveTargetPhone(m.mentionedJid[0]);
        } else {
            numberToRemove = cleanPhone((args || []).join('') || args?.[0] || '');
        }

        if (!numberToRemove || !/^\d{7,15}$/.test(numberToRemove)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 DELSUDO」
│ Provide a valid number or quote a user, genius.
│ Spaces, +, dashes are auto-cleaned.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const settings = await getSettings();
        if (!settings) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 DELSUDO」
│ Settings not found. Something's seriously broken.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const sudoUsers = await getSudoUsers();

        if (!sudoUsers.includes(numberToRemove)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 DELSUDO」
│ This number isn't even a sudo user, idiot.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        await removeSudoUser(numberToRemove);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

        await sendInteractive(client, m, `╭─❏ 「 DELSUDO」
│ ${numberToRemove} removed from Sudo Users.
│ Power revoked. Sucks to be them.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    });
};
