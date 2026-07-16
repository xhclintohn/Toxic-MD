import { getGroupSettings, getKnownBots } from '../database/config.js';
import { resolveTargetJid } from '../lib/lidResolver.js';

const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
const _pNum = (p) => {
    const phone = p.phoneNumber || p.phone_number || '';
    if (phone) return _num(phone);
    const base = p.id || p.jid || '';
    if (base && !base.endsWith('@lid')) return _num(base);
    return _num(p.lid || base);
};

const fmt = (msg) => `╭─❏ 「 ANTIBOT 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const BURST_WINDOW_MS = 3000;
const BURST_THRESHOLD = 10;
const KICK_SCORE = 2;
const MAX_WARNS = 2;
const KICK_IMMUNITY_MS = 30000;

const _burstLog = new Map();
const _warnCount = new Map();
const _recentlyKicked = new Map();
const _processed = new Set();

const _gsCache = new Map();
const _GS_TTL = 30_000;

async function _cachedGS(jid) {
    const now = Date.now();
    const hit = _gsCache.get(jid);
    if (hit && (now - hit.ts) < _GS_TTL) return hit.val;
    const val = await getGroupSettings(jid);
    _gsCache.set(jid, { val, ts: now });
    if (_gsCache.size > 500) { const first = _gsCache.keys().next().value; _gsCache.delete(first); }
    return val;
}

function trackBurst(key) {
    const now = Date.now();
    if (!_burstLog.has(key)) _burstLog.set(key, []);
    const timestamps = _burstLog.get(key).filter(t => now - t < BURST_WINDOW_MS);
    timestamps.push(now);
    _burstLog.set(key, timestamps);
    if (_burstLog.size > 2000) { const first = _burstLog.keys().next().value; _burstLog.delete(first); }
    return timestamps.length >= BURST_THRESHOLD;
}

function _isRecentlyKicked(trackKey) {
    if (!_recentlyKicked.has(trackKey)) return false;
    const ts = _recentlyKicked.get(trackKey);
    if (Date.now() - ts < KICK_IMMUNITY_MS) return true;
    _recentlyKicked.delete(trackKey);
    return false;
}

function _markKicked(trackKey) {
    _recentlyKicked.set(trackKey, Date.now());
    if (_recentlyKicked.size > 2000) { const first = _recentlyKicked.keys().next().value; _recentlyKicked.delete(first); }
}

function _isBotCheck(id, rawKeyJid, resolvedSender, mtype) {
    const tkFail = (id.startsWith('3EB0') || id.startsWith('BAE5')) && id.length <= 24;
    const dvFail = (() => {
        const part = (rawKeyJid || '').split('@')[0];
        if (part.includes(':')) return parseInt(part.split(':')[1] || '0', 10) > 0;
        return false;
    })();
    const resolvedNum = _num(resolvedSender || '');
    const pfFail = resolvedNum.length > 13;
    const idFail = !/^[A-F0-9]{32}$/i.test(id);
    const isBotId = (id.startsWith('3EB0') || id.startsWith('BAE5')) && id.length <= 24;
    const isBotSender = resolvedNum.length > 13 || (resolvedSender || '').endsWith('@bot');
    let isBot = isBotId || isBotSender;
    if (mtype === 'conversation') {
        isBot = false;
    }
    return isBot;
}

async function punish(client, m, senderNum, trackKey, mode, forceKick) {
    if (_isRecentlyKicked(trackKey)) return;

    const meta = await client.groupMetadata(m.chat);
    const sender = resolveTargetJid(m.sender, meta.participants) || m.sender;
    if (!sender) return;

    const sNum = _num(sender);
    const botRaw = client.decodeJid ? client.decodeJid(client.user.id) : (client.user?.id || '');
    const botNum = _num(botRaw);

    const isAdmin = meta.participants.some(p => _pNum(p) === sNum && (p.admin === 'admin' || p.admin === 'superadmin'));
    const isBotAdmin = meta.participants.some(p => _pNum(p) === botNum && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (isAdmin) return;
    if (!isBotAdmin) {
        const noAdminKey = 'noadmin:' + m.chat;
        if (_isRecentlyKicked(noAdminKey)) return;
        _markKicked(noAdminKey);
        return client.sendMessage(m.chat, {
            text: fmt(`🤖 Spotted @${sNum} looking bot-like, but I can't act.\n│ Make me admin so ANTIBOT can actually kick bots. 🙄`),
            mentions: [sender]
        }).catch(() => {});
    }

    if (forceKick) {
        _warnCount.delete(trackKey);
        _markKicked(trackKey);
        try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
        return client.sendMessage(m.chat, {
            text: fmt(`🤖💨 @${sNum} got YEETED.\n│ Told you not to test me. Bots aren't welcome here, byeee. 🚫`),
            mentions: [sender]
        });
    }

    const count = (_warnCount.get(trackKey) || 0) + 1;
    _warnCount.set(trackKey, count);
    if (_warnCount.size > 5000) { const first = _warnCount.keys().next().value; _warnCount.delete(first); }

    if (count < MAX_WARNS) {
        return client.sendMessage(m.chat, {
            text: fmt(`👀 @${sNum} smells like a bot to me. Bots aren't allowed!\n│ Warning ${count}/${MAX_WARNS}. Do that again.`),
            mentions: [sender]
        });
    }

    _warnCount.delete(trackKey);
    _markKicked(trackKey);
    try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
    return client.sendMessage(m.chat, {
        text: fmt(`🤖💨 @${sNum} got YEETED.\n│ Told you not to test me. Bots aren't welcome here, byeee. 🚫`),
        mentions: [sender]
    });
}

function _withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('[ANTIBOT TIMEOUT] ' + label + ' took longer than ' + ms + 'ms')), ms))
    ]);
}

export default async (client, m) => {
    try {
        if (!m || !m.chat || !m.chat.endsWith('@g.us')) return;

        const msgId = m.id || m.key?.id || '';
        if (msgId && _processed.has(msgId)) return;
        if (msgId) {
            _processed.add(msgId);
            if (_processed.size > 500) { const first = _processed.values().next().value; _processed.delete(first); }
        }

        const gs = await _withTimeout(_cachedGS(m.chat), 8000, 'getGroupSettings(' + m.chat + ')');
        const mode = gs?.antibot;
        if (!mode || mode === 'off' || mode === 0 || mode === false || mode === '0') return;

        const fromMe = m.key?.fromMe;
        if (fromMe) return;

        const senderNum = _num(m.sender);
        const trackKey = m.chat + ':' + senderNum;

        if (_isRecentlyKicked(trackKey)) return;

        const mtype = m.mtype || m.messageType || '';
        const rawKeyJid = m.key?.participant || m.key?.participantAlt || '';
        const resolvedSender = m.sender || rawKeyJid;
        const id = m.id || '';

        const isBot = _isBotCheck(id, rawKeyJid, resolvedSender, mtype);

        const knownBots = await _withTimeout(getKnownBots(), 8000, 'getKnownBots()').catch(() => []);
        if (knownBots.includes(senderNum)) {
            return punish(client, m, senderNum, trackKey, mode, true);
        }

        if (!isBot) return;

        const isKickMode = mode === 'kick' || mode === 'remove';
        return punish(client, m, senderNum, trackKey, mode, isKickMode);
    } catch (e) {
        console.log('❌ [ANTIBOT INTERNAL]:', e?.message || e);
    }
};