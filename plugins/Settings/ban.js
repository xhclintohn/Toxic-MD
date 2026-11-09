import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getSettings, banUser, getBannedUsers, getSudoUsers } from '../../database/config.js';
import { resolveTargetJid, resolveSenderJid, resolveQuotedJid } from '../../lib/lidResolver.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, store } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let settings = await getSettings();
        if (!settings) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 BAN」
│ Settings not found, you broke something.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const sudoUsers = await getSudoUsers();

        let freshParticipants = [];
        if (m.chat && m.chat.endsWith('@g.us')) {
            try {
                const freshMeta = await client.groupMetadata(m.chat);
                freshParticipants = freshMeta.participants || [];
            } catch {}
        }
        if (!freshParticipants.length) freshParticipants = context.participants || [];

        let numberToBan;
        let resolvedJid;
        let targetWasUnresolvedLid = false;

        const unresolvedLidMessage = `╭─❏ 「 BAN」
│ Couldn't resolve that user's phone number (LID address).\n│ Ask them to send a message first so the bot can map them.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (m.quoted) {
            resolvedJid = await resolveQuotedJid(m.quoted.sender, { chatJid: m.chat, quotedChatJid: m.quoted.chat, quotedId: m.quoted.id, isGroup: !!m.isGroup, client, store }).catch(() => null);
            if (!resolvedJid || String(resolvedJid).endsWith('@lid')) {
                resolvedJid = resolveTargetJid(m.quoted.sender, freshParticipants);
            }
            if (!resolvedJid || String(resolvedJid).endsWith('@lid')) {
                targetWasUnresolvedLid = true;
            } else {
                numberToBan = resolvedJid.split('@')[0].replace(/\D/g, '');
            }
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            resolvedJid = resolveTargetJid(m.mentionedJid[0], freshParticipants);
            if (resolvedJid && String(resolvedJid).endsWith('@lid')) {
                try {
                    const _asyncResolved = await Promise.race([
                        resolveSenderJid(m.mentionedJid[0], m.chat, client).catch(() => null),
                        new Promise(r => setTimeout(() => r(null), 2500))
                    ]);
                    if (_asyncResolved && !String(_asyncResolved).endsWith('@lid')) resolvedJid = _asyncResolved;
                } catch {}
            }
            if (!resolvedJid || String(resolvedJid).endsWith('@lid')) {
                targetWasUnresolvedLid = true;
            } else {
                numberToBan = resolvedJid.split('@')[0].replace(/\D/g, '');
            }
        } else {
            numberToBan = (args[0] || '').replace(/[^0-9]/g, '');
        }

        if (targetWasUnresolvedLid || !numberToBan) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            if (targetWasUnresolvedLid) return await sendInteractive(client, m, unresolvedLidMessage);
            return await sendInteractive(client, m, `╭─❏ 「 BAN」
│ Please provide a valid number or quote a user, moron.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        if (numberToBan.length > 15) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, unresolvedLidMessage);
        }

        const _devNum = '254114885159';
        const _botNum = (context.client?.user?.id || '').split(':')[0].split('@')[0].replace(/\D/g, '');
        if (numberToBan === _devNum || (_botNum && numberToBan === _botNum)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 BAN」
│ That command cannot be used on the dev or the bot.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        if (sudoUsers.includes(numberToBan)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 BAN」
│ You cannot ban a Sudo User, you absolute fool!\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const bannedUsers = await getBannedUsers();

        if (bannedUsers.includes(numberToBan)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await sendInteractive(client, m, `╭─❏ 「 BAN」
│ This user is already banned, genius.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        await banUser(numberToBan);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await sendInteractive(client, m, `╭─❏ 「 BAN」
│ ${numberToBan} has been banned. Get wrecked!\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    });
};
