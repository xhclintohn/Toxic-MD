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

const fmt = (msg) => `╭─❏ 「 ANTISTICKER 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default async (client, m) => {
    try {
        if (!m || !m.chat || !m.chat.endsWith('@g.us')) return;
        if (m.key?.fromMe) return;
        if (_num(m.sender) === DEV_NUMBER) return;

        const msg = m.message || {};
        const isSticker = !!(msg.stickerMessage || msg.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage);
        if (!isSticker) return;

        const gs = await getGroupSettings(m.chat);
        const mode = gs?.antisticker || 'off';
        if (mode === 'off') return;

        const meta = await client.groupMetadata(m.chat);
        const sender = resolveTargetJid(m.sender, meta.participants);
        if (!sender) return;

        const sNum = _num(sender);
        const botRaw = client.decodeJid ? client.decodeJid(client.user.id) : (client.user?.id || '');
        const botNum = _num(botRaw);

        const isAdmin = meta.participants.some(p => _pNum(p) === sNum && (p.admin === 'admin' || p.admin === 'superadmin'));
        const isBotAdmin = meta.participants.some(p => _pNum(p) === botNum && (p.admin === 'admin' || p.admin === 'superadmin'));

        if (isAdmin) return;
        if (!isBotAdmin) {
            return client.sendMessage(m.chat, {
                text: fmt(`@${sNum} sent a sticker.\nMake me admin to enforce anti-sticker. 😤`),
                mentions: [sender]
            });
        }

        try {
            await client.sendMessage(m.chat, {
                delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant || m.sender }
            });
        } catch {}

        if (mode === 'kick') {
            try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
            return client.sendMessage(m.chat, {
                text: fmt(`🚨 @${sNum} KICKED!\n│ Reason: Sent a sticker (zero tolerance)\n│ Stickers are banned here! 😈`),
                mentions: [sender]
            });
        }

        const MAX_WARNS = await getWarnLimit(m.chat);
        const count = await addWarn(m.chat, sNum);
        const remaining = MAX_WARNS - count;
        if (count >= MAX_WARNS) {
            await resetWarn(m.chat, sNum);
            try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
            return client.sendMessage(m.chat, {
                text: fmt(`🚨 @${sNum} KICKED!\n│ Reason: Sticker sent\n│ Warns: ${count}/${MAX_WARNS} — DONE. 😈`),
                mentions: [sender]
            });
        }
        return client.sendMessage(m.chat, {
            text: fmt(`⚠️ @${sNum}, warned!\n│ Reason: Sticker sent\n│ Sticker deleted.\n│ Warns: ${count}/${MAX_WARNS}\n│ ${remaining} more and you're out. 😈`),
            mentions: [sender]
        });
    } catch (e) {}
};
