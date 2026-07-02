import { getGroupSettings } from '../database/config.js';
import { resolveTargetJid } from '../lib/lidResolver.js';
import { isLikelyBotMessage } from '../lib/botSignature.js';

const DEV_NUMBER = '254114885159';
const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
const _pNum = (p) => {
    const phone = p.phoneNumber || p.phone_number || '';
    if (phone) return _num(phone);
    const base = p.id || p.jid || '';
    if (base && !base.endsWith('@lid')) return _num(base);
    return _num(p.lid || base);
};

const fmt = (msg) => `╭─❏ 「 ANTIBOT 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const BOT_THRESHOLD = 10;
const BOT_WINDOW_MS = 3000;
const _botLog = new Map();

function trackBot(key) {
    const now = Date.now();
    if (!_botLog.has(key)) _botLog.set(key, []);
    const timestamps = _botLog.get(key).filter(t => now - t < BOT_WINDOW_MS);
    timestamps.push(now);
    _botLog.set(key, timestamps);
    if (_botLog.size > 2000) { const first = _botLog.keys().next().value; _botLog.delete(first); }
    return timestamps.length;
}

async function kickDetected(client, m, senderNum, reason) {
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

    try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
    return client.sendMessage(m.chat, {
        text: fmt(`🤖 @${sNum} detected and KICKED!\n│ ${reason}\n│ No bots allowed in this group. 🚫`),
        mentions: [sender]
    });
}

export default async (client, m) => {
    try {
        if (!m || !m.chat || !m.chat.endsWith('@g.us')) return;
        if (m.key?.fromMe) return;
        if (_num(m.sender) === DEV_NUMBER) return;

        const gs = await getGroupSettings(m.chat);
        const enabled = gs?.antibot;
        if (!enabled || enabled === 0 || enabled === '0' || enabled === false) return;

        const senderNum = _num(m.sender);
        const trackKey = m.chat + ':' + senderNum;

        const rawKeyJid = m.key?.participant || m.key?.participantAlt || '';
        if (isLikelyBotMessage(m.id, rawKeyJid, m.sender)) {
            _botLog.delete(trackKey);
            return kickDetected(client, m, senderNum, 'Bot message signature detected');
        }

        const count = trackBot(trackKey);
        if (count < BOT_THRESHOLD) return;
        _botLog.delete(trackKey);

        return kickDetected(client, m, senderNum, `Bot-like behavior: ${BOT_THRESHOLD}+ messages in ${BOT_WINDOW_MS / 1000}s`);
    } catch (e) {}
};
