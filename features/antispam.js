import { getGroupSettings, addWarn, resetWarn, getWarnLimit, banUser } from '../database/config.js';
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

// Flood: too many messages in a short window (not aggressive)
const FLOOD_THRESHOLD = 8;
const FLOOD_WINDOW_MS = 6000;

// Same-text spam: identical body repeated
const REPEAT_THRESHOLD = 4;
const REPEAT_WINDOW_MS = 20000;

// Soft rate: many msgs in one minute (backup)
const MINUTE_THRESHOLD = 18;
const MINUTE_WINDOW_MS = 60000;

const _msgLog = new Map();
const _textLog = new Map();
const _minuteLog = new Map();
const _cooldown = new Map();

function pruneMap(map, max = 4000) {
    if (map.size > max) {
        const first = map.keys().next().value;
        map.delete(first);
    }
}

function trackTimestamps(map, key, windowMs) {
    const now = Date.now();
    if (!map.has(key)) map.set(key, []);
    const list = map.get(key).filter(t => now - t < windowMs);
    list.push(now);
    map.set(key, list);
    pruneMap(map);
    return list.length;
}

function trackRepeat(key, text, windowMs) {
    const now = Date.now();
    const normalized = String(text || '').trim().toLowerCase().slice(0, 200);
    if (!normalized || normalized.length < 2) return 0;
    if (!_textLog.has(key)) _textLog.set(key, []);
    const list = _textLog.get(key).filter(e => now - e.t < windowMs);
    list.push({ t: now, text: normalized });
    _textLog.set(key, list);
    pruneMap(_textLog);
    return list.filter(e => e.text === normalized).length;
}

function extractBody(m) {
    try {
        if (m.body) return String(m.body);
        if (m.text) return String(m.text);
        if (m.message?.conversation) return String(m.message.conversation);
        if (m.message?.extendedTextMessage?.text) return String(m.message.extendedTextMessage.text);
        if (m.message?.imageMessage?.caption) return String(m.message.imageMessage.caption);
        if (m.message?.videoMessage?.caption) return String(m.message.videoMessage.caption);
    } catch {}
    return '';
}

export default async (client, m) => {
    try {
        if (!m || !m.chat || !m.chat.endsWith('@g.us')) return;
        if (m.key?.fromMe) return;
        if (_num(m.sender) === DEV_NUMBER) return;

        const gs = await getGroupSettings(m.chat);
        const mode = gs?.antispam || 'off';
        if (mode === 'off' || mode === false || mode === 'false') return;

        const senderNum = _num(m.sender);
        if (!senderNum) return;

        // cooldown after action (avoid double-kick spam)
        const cdKey = m.chat + ':' + senderNum;
        if (_cooldown.has(cdKey) && Date.now() - _cooldown.get(cdKey) < 15000) return;

        const trackKey = cdKey;
        const body = extractBody(m);

        const floodCount = trackTimestamps(_msgLog, trackKey, FLOOD_WINDOW_MS);
        const minuteCount = trackTimestamps(_minuteLog, trackKey, MINUTE_WINDOW_MS);
        const repeatCount = trackRepeat(trackKey, body, REPEAT_WINDOW_MS);

        const isFlood = floodCount >= FLOOD_THRESHOLD;
        const isRepeat = repeatCount >= REPEAT_THRESHOLD;
        const isMinute = minuteCount >= MINUTE_THRESHOLD;

        if (!isFlood && !isRepeat && !isMinute) return;

        _msgLog.delete(trackKey);
        _textLog.delete(trackKey);
        _minuteLog.delete(trackKey);
        _cooldown.set(cdKey, Date.now());

        let reason = 'spamming';
        if (isRepeat) reason = `repeating the same message (${repeatCount}x)`;
        else if (isFlood) reason = `flooding (${floodCount}+ msgs / ${FLOOD_WINDOW_MS / 1000}s)`;
        else if (isMinute) reason = `message flood (${minuteCount}+ / min)`;

        const meta = await client.groupMetadata(m.chat).catch(() => null);
        if (!meta) return;
        const sender = resolveTargetJid(m.sender, meta.participants) || m.sender;
        if (!sender) return;

        const sNum = _num(sender) || senderNum;
        const botRaw = client.decodeJid ? client.decodeJid(client.user.id) : (client.user?.id || '');
        const botNum = _num(botRaw);

        const isAdmin = meta.participants.some(p => _pNum(p) === sNum && (p.admin === 'admin' || p.admin === 'superadmin'));
        const isBotAdmin = meta.participants.some(p => _pNum(p) === botNum && (p.admin === 'admin' || p.admin === 'superadmin'));

        if (isAdmin) return;
        if (sNum === botNum || sNum === DEV_NUMBER) return;

        // Always ban from bot when spam detected (while antispam is on)
        try {
            if (sNum && sNum.length >= 7 && sNum.length <= 15) {
                await banUser(sNum);
            }
        } catch {}

        // Try delete the spam message
        try {
            if (m.key) await client.sendMessage(m.chat, { delete: m.key }).catch(() => {});
        } catch {}

        const kickMode = mode === 'kick' || mode === 'hard' || mode === 'strict' || mode === 'ban';

        if (kickMode && isBotAdmin) {
            try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
            return client.sendMessage(m.chat, {
                text: fmt(`🚨 @${sNum} removed & banned!\n│ Reason: ${reason}\n│ Bot access revoked.`),
                mentions: [sender]
            });
        }

        // warn mode (or kick failed / bot not admin)
        let warnCount = 0;
        let MAX_WARNS = 3;
        try {
            MAX_WARNS = await getWarnLimit(m.chat).catch(() => 3) || 3;
            warnCount = await addWarn(m.chat, sNum).catch(() => 0) || 0;
        } catch {}

        if (warnCount >= MAX_WARNS && isBotAdmin) {
            try { await resetWarn(m.chat, sNum); } catch {}
            try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
            return client.sendMessage(m.chat, {
                text: fmt(`🚨 @${sNum} KICKED!\n│ Reason: ${reason}\n│ Warns: ${warnCount}/${MAX_WARNS}\n│ Banned from bot.`),
                mentions: [sender]
            });
        }

        return client.sendMessage(m.chat, {
            text: fmt(`⚠️ @${sNum}, stop spamming!\n│ Reason: ${reason}\n│ Warns: ${warnCount}/${MAX_WARNS}\n│ Banned from using the bot.\n│ Keep it up and you're gone.`),
            mentions: [sender]
        });
    } catch (e) {
        // silent
    }
};
