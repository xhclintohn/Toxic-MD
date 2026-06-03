import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getSettings, banUser, getBannedUsers, getSudoUsers } from '../../database/config.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { resolveTargetJid } from '../../lib/lidResolver.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let settings = await getSettings();
        if (!settings) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ BAN ≪───\n├ \n├ Settings not found, you broke something.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
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

        if (m.quoted) {
            resolvedJid = resolveTargetJid(m.quoted.sender, freshParticipants);
            numberToBan = resolvedJid ? resolvedJid.split('@')[0].replace(/\D/g, '') : null;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            resolvedJid = resolveTargetJid(m.mentionedJid[0], freshParticipants);
            numberToBan = resolvedJid ? resolvedJid.split('@')[0].replace(/\D/g, '') : null;
        } else {
            numberToBan = (args[0] || '').replace(/[^0-9]/g, '');
        }

        if (!numberToBan) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ BAN ≪───\n├ \n├ Please provide a valid number or quote a user, moron.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        if (numberToBan.length > 15) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ BAN ≪───\n├ \n├ Couldn't resolve that user's phone number (LID address).\n├ Ask them to send a message first so the bot can map them.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const _devNum = '254114885159';
        const _botNum = (context.client?.user?.id || '').split(':')[0].split('@')[0].replace(/\D/g, '');
        if (numberToBan === _devNum || (_botNum && numberToBan === _botNum)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ BAN ≪───\n├ \n├ That command cannot be used on the dev or the bot.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        if (sudoUsers.includes(numberToBan)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ BAN ≪───\n├ \n├ You cannot ban a Sudo User, you absolute fool!\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const bannedUsers = await getBannedUsers();

        if (bannedUsers.includes(numberToBan)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ BAN ≪───\n├ \n├ This user is already banned, genius.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        await banUser(numberToBan);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ BAN ≪───\n├ \n├ ${numberToBan} has been banned. Get wrecked!\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    });
};
