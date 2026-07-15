import { getGroupSettings, addWarn, resetWarn, getWarnLimit } from '../database/config.js';
import { resolveTargetJid } from '../lib/lidResolver.js';

const DEV_NUMBER = '254114885159';

const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

const _pNum = (p) => {
    const phone = p.phoneNumber || p.phone_number || '';
    if (phone) return _num(phone);
    const base = p.id || p.jid || '';
    if (base && !base.endsWith('@lid')) return _num(base);
    return _num(p.lid || base);
};

const isDevJid = (jid) => _num(jid) === DEV_NUMBER;

const fmt = (msg) => `╭─❏ 「 ANTIGROUPSTATUS 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

function isGroupStatusMessage(msg) {
    if (!msg) return false;
    const candidates = [
        msg.extendedTextMessage, msg.imageMessage, msg.videoMessage,
        msg.documentMessage, msg.audioMessage, msg.stickerMessage
    ];
    for (const c of candidates) {
        if (c?.contextInfo?.isGroupStatus === true) return true;
    }
    return msg.contextInfo?.isGroupStatus === true;
}

export default async (client, m) => {
    try {
        if (!m || !m.chat || !m.chat.endsWith('@g.us')) return;
        if (m.key?.fromMe) return;
        if (isDevJid(m.sender)) return;

        const groupSettings = await getGroupSettings(m.chat);
        const mode = (groupSettings.antigroupstatus || 'off').toLowerCase();
        if (mode === 'off') return;

        if (!isGroupStatusMessage(m.message)) return;

        const groupMetadata = await client.groupMetadata(m.chat);
        const sender = resolveTargetJid(m.sender, groupMetadata.participants);
        if (!sender) return;

        const senderNum = _num(sender);
        const botRaw = client.decodeJid ? client.decodeJid(client.user.id) : (client.user?.id || '');
        const botNum = _num(botRaw);

        const isAdmin = groupMetadata.participants.some(p => _pNum(p) === senderNum && (p.admin === 'admin' || p.admin === 'superadmin'));
        const isBotAdmin = groupMetadata.participants.some(p => _pNum(p) === botNum && (p.admin === 'admin' || p.admin === 'superadmin'));

        if (isAdmin) return;

        const username = senderNum || sender.split('@')[0];

        if (!isBotAdmin) {
            await client.sendMessage(m.chat, {
                text: fmt(`@${username} posted a group status.\nMake me admin so I can actually do something about it. 😤`),
                mentions: [sender] });
            return;
        }

        try {
            await client.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant || m.sender
                }
            });
        } catch {}

        if (mode === 'delete') {
            return;
        }

        if (mode === 'kick') {
            try {
                await client.groupParticipantsUpdate(m.chat, [sender], 'remove');
                await client.sendMessage(m.chat, {
                    text: fmt(`🚨 @${username} KICKED!\n│ Reason: 📢 Group status posted\n│ Kick mode — admins only. 😈`),
                    mentions: [sender]
                });
            } catch {}
            return;
        }

        const MAX_WARNS = await getWarnLimit(m.chat);
        const newCount = await addWarn(m.chat, username);
        const remaining = MAX_WARNS - newCount;

        if (newCount >= MAX_WARNS) {
            await resetWarn(m.chat, username);
            try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
            await client.sendMessage(m.chat, {
                text: fmt(`🚨 @${username} KICKED!\n│ Reason: 📢 Group status posted\n│ Warns: ${newCount}/${MAX_WARNS}\n│ That's it. Get out. 😈\n│ Warn count wiped clean.`),
                mentions: [sender]
            });
            return;
        }

        await client.sendMessage(m.chat, {
            text: fmt(`⚠️ @${username}, warned!\n│ Reason: 📢 Group status posted\n│ Message deleted.\n│ Warns: ${newCount}/${MAX_WARNS}\n│ ${remaining} more and you're GONE. 😈`),
            mentions: [sender]
        });
    } catch (err) {
        console.error('[ANTIGROUPSTATUS] Error:', err.message);
    }
};
