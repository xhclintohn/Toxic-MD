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

const fmt = (msg) => `╭─❏ 「 ANTISPAM 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const SPAM_THRESHOLD = 5;
const SPAM_WINDOW_MS = 5000;
const _msgLog = new Map();

function trackMessage(key) {
    const now = Date.now();
    if (!_msgLog.has(key)) _msgLog.set(key, []);
    const timestamps = _msgLog.get(key).filter(t => now - t < SPAM_WINDOW_MS);
    timestamps.push(now);
    _msgLog.set(key, timestamps);
    if (_msgLog.size > 5000) { const first = _msgLog.keys().next().value; _msgLog.delete(first); }
    return timestamps.length;
}

export default async (client, m) => {
    try {
        if (!m || !m.chat || !m.chat.endsWith('@g.us')) return;
        if (m.key?.fromMe) return;
        if (_num(m.sender) === DEV_NUMBER) return;

        const gs = await getGroupSettings(m.chat);
        const mode = gs?.antispam || 'off';
        if (mode === 'off') return;

        const senderNum = _num(m.sender);
        const trackKey = m.chat + ':' + senderNum;
        const count = trackMessage(trackKey);
        if (count < SPAM_THRESHOLD) return;

        _msgLog.delete(trackKey);

        const meta = await client.groupMetadata(m.chat);
        const sender = resolveTargetJid(m.sender, meta.participants);
        if (!sender) return;

        const sNum = _num(sender);
        const botRaw = client.decodeJid ? client.decodeJid(client.user.id) : (client.user?.id || '');
        const botNum = _num(botRaw);

        const isAdmin = meta.participants.some(p => _pNum(p) === sNum && (p.admin === 'admin' || p.admin === 'superadmin'));
        const isBotAdmin = meta.participants.some(p => _pNum(p) === botNum && (p.admin === 'admin' || p.admin === 'superadmin'));

        if (isAdmin) return;
        if (!isBotAdmin) return;

        if (mode === 'kick') {
            try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
            return client.sendMessage(m.chat, {
                text: fmt(`🚨 @${sNum} KICKED for spamming!\n│ Sent ${SPAM_THRESHOLD}+ messages in ${SPAM_WINDOW_MS / 1000}s\n│ Spammers don't last long here. 😈`),
                mentions: [sender]
            });
        }

        const MAX_WARNS = await getWarnLimit(m.chat);
        const warnCount = await addWarn(m.chat, sNum);
        const remaining = MAX_WARNS - warnCount;
        if (warnCount >= MAX_WARNS) {
            await resetWarn(m.chat, sNum);
            try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
            return client.sendMessage(m.chat, {
                text: fmt(`🚨 @${sNum} KICKED!\n│ Reason: Spamming (${SPAM_THRESHOLD}+ msgs/${SPAM_WINDOW_MS / 1000}s)\n│ Warns: ${warnCount}/${MAX_WARNS} — See ya. 😈`),
                mentions: [sender]
            });
        }
        return client.sendMessage(m.chat, {
            text: fmt(`⚠️ @${sNum}, stop spamming!\n│ Sent ${SPAM_THRESHOLD}+ messages in ${SPAM_WINDOW_MS / 1000}s\n│ Warns: ${warnCount}/${MAX_WARNS}\n│ ${remaining} more and you're gone. 😈`),
            mentions: [sender]
        });
    } catch (e) {}
};
