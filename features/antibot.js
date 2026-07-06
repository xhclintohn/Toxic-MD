import { getGroupSettings, getKnownBots } from '../database/config.js';
import { resolveTargetJid } from '../lib/lidResolver.js';
import { computeBotScore } from '../lib/botSignature.js';

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
const _burstLog = new Map();
const _warned = new Set();
const _processed = new Set();

const _gsCache = new Map(); // jid -> { val, ts }
const _GS_TTL  = 30_000;   // 30-second per-group cache

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

async function punish(client, m, senderNum, trackKey, reason, forceKick) {
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
        if (_warned.has('noadmin:' + m.chat)) return;
        _warned.add('noadmin:' + m.chat);
        return client.sendMessage(m.chat, {
            text: fmt(`🤖 Spotted @${sNum} looking bot-like (${reason}), but I can't act.\n│ Make me admin so ANTIBOT can actually kick bots. 🙄`),
            mentions: [sender]
        }).catch(() => {});
    }

    if (!forceKick && !_warned.has(trackKey)) {
        _warned.add(trackKey);
        if (_warned.size > 5000) { const first = _warned.values().next().value; _warned.delete(first); }
        return client.sendMessage(m.chat, {
            text: fmt(`👀 @${sNum} smells like a bot to me. (${reason})\n│ Do that again and you're GONE. Last warning, don't test me. 🙄`),
            mentions: [sender]
        });
    }

    _warned.delete(trackKey);
    try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
    return client.sendMessage(m.chat, {
        text: fmt(`🤖💨 @${sNum} got YEETED.\n│ ${reason}\n│ Told you not to test me. Bots aren't welcome here, byeee. 🚫`),
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
        const senderNum = _num(m.sender);
        const text = m.body || m.text || '';
        const rawKeyJid = m.key?.participant || m.key?.participantAlt || '';
        const isBurst = trackBurst(m.chat + ':' + senderNum);
        const { score, signals } = computeBotScore({ id: m.id, rawKeyJid, resolvedSender: m.sender, text, isBurst });

        if (fromMe) return;

        const trackKey = m.chat + ':' + senderNum;

        const knownBots = await _withTimeout(getKnownBots(), 8000, 'getKnownBots()').catch(() => []);
        if (knownBots.includes(senderNum)) {
            return punish(client, m, senderNum, trackKey, 'marked as a known bot', true);
        }

        if (score < 1) return;

        const reasonParts = [];
        if (signals.baileysId) reasonParts.push('non-standard message ID');
        if (signals.lidOversized) reasonParts.push('fake sender ID');
        if (signals.styledFont) reasonParts.push('spammy stylized text');
        if (signals.burst) reasonParts.push('message flooding');
        const reason = reasonParts.join(', ');

        const forceKick = mode === 'remove' || score >= KICK_SCORE;
        return punish(client, m, senderNum, trackKey, reason, forceKick);
    } catch (e) {
        console.log('❌ [ANTIBOT INTERNAL]:', e?.message || e);
    }
};
