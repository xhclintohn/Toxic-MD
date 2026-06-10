import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const _sessionDir = path.join(__dirname, '../Session');

function _resolveFromSessionFile(lidNum) {
    try {
        const revFile = path.join(_sessionDir, `lid-mapping-${lidNum}_reverse.json`);
        if (fs.existsSync(revFile)) {
            const raw = fs.readFileSync(revFile, 'utf-8');
            const jid = JSON.parse(raw);
            if (jid) {
                const n = String(jid).split('@')[0].split(':')[0].replace(/\D/g, '');
                if (n && n.length >= 7 && n !== lidNum) {
                    if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNum, n);
                    return n + '@s.whatsapp.net';
                }
            }
        }
    } catch {}
    return null;
}

function getParticipantPhone(p) {
    const phoneNumber = p.phoneNumber || p.phone_number || p.pn || '';
    if (phoneNumber) {
        const num = String(phoneNumber).split('@')[0].split(':')[0].replace(/\D/g, '');
        if (num) return num;
    }

    const base = p.id || p.jid || '';
    if (base && !base.endsWith('@lid') && base.includes('@')) {
        const num = base.split('@')[0].split(':')[0].replace(/\D/g, '');
        if (num) return num;
    }

    const lid = p.lid || '';
    if (lid && !lid.endsWith('@lid') && lid.includes('@')) {
        const num = lid.split('@')[0].split(':')[0].replace(/\D/g, '');
        if (num) return num;
    }

    return null;
}

function getParticipantLidNum(p) {
    const base = p.id || p.jid || '';
    if (base && base.endsWith('@lid')) {
        return base.split('@')[0].split(':')[0].replace(/\D/g, '') || null;
    }

    const lid = p.lid || '';
    if (lid && lid.endsWith('@lid')) {
        return lid.split('@')[0].split(':')[0].replace(/\D/g, '') || null;
    }

    return null;
}

function resolveJidFromLid(lidJid, participants) {
    if (!lidJid) return null;
    const lidNum = lidJid.split('@')[0].split(':')[0].replace(/\D/g, '');
    if (!lidNum) return null;

    if (globalThis.lidPhoneCache) {
        const cached = globalThis.lidPhoneCache.get(lidNum);
        if (cached) return String(cached).replace(/\D/g, '') + '@s.whatsapp.net';
    }

    const fromFile = _resolveFromSessionFile(lidNum);
    if (fromFile) return fromFile;

    if (globalThis.resolvePhoneFromLid) {
        const phone = globalThis.resolvePhoneFromLid(lidJid);
        if (phone && typeof phone === 'string' && !phone.endsWith('@lid')) {
            const num = phone.split('@')[0].replace(/\D/g, '');
            if (num) return num + '@s.whatsapp.net';
        }
    }

    if (participants && participants.length > 0) {
        for (const p of participants) {
            const pLidNum = getParticipantLidNum(p);
            if (pLidNum && pLidNum === lidNum) {
                const phone = getParticipantPhone(p);
                if (phone) return phone + '@s.whatsapp.net';
            }
        }
    }

    return null;
}

function resolveTargetJid(rawJid, participants) {
    if (!rawJid) return null;
    const domain = (rawJid.split('@')[1] || '').toLowerCase();
    const num = rawJid.split('@')[0].split(':')[0].replace(/\D/g, '');
    if (!num) return null;

    if (domain === 'lid') {
        const resolved = resolveJidFromLid(rawJid, participants);
        if (resolved) return resolved;
        return null;
    }

    if (participants && participants.length > 0) {
        const match = participants.find(p => {
            const phone = getParticipantPhone(p);
            if (phone && (phone === num || phone.endsWith(num) || num.endsWith(phone))) return true;
            const base = p.id || p.jid || '';
            if (base && !base.endsWith('@lid')) {
                const pNum = base.split('@')[0].split(':')[0].replace(/\D/g, '');
                if (pNum && (pNum === num || pNum.endsWith(num) || num.endsWith(pNum))) return true;
            }
            return false;
        });
        if (match) {
            const phone = getParticipantPhone(match);
            if (phone) return phone + '@s.whatsapp.net';
        }
    }

    return num + '@s.whatsapp.net';
}

function resolvePhoneNumber(rawJid, participants) {
    if (!rawJid) return '';
    const domain = (rawJid.split('@')[1] || '').toLowerCase();
    const num = rawJid.split('@')[0].split(':')[0].replace(/\D/g, '');

    if (domain === 'lid') {
        const resolved = resolveJidFromLid(rawJid, participants);
        if (resolved) return resolved.split('@')[0].replace(/\D/g, '');
        return num;
    }

    return num;
}

async function resolveSenderJid(rawJid, chatJid, client) {
    if (!rawJid) return rawJid;
    if (!rawJid.endsWith('@lid')) return rawJid;

    const lidNum = rawJid.split('@')[0].split(':')[0].replace(/\D/g, '');

    if (globalThis.lidPhoneCache) {
        const cached = globalThis.lidPhoneCache.get(lidNum);
        if (cached) {
            const num = String(cached).replace(/\D/g, '');
            if (num && num !== lidNum) return num + '@s.whatsapp.net';
        }
    }

    const fromFile = _resolveFromSessionFile(lidNum);
    if (fromFile) return fromFile;

    if (globalThis.resolvePhoneFromLid) {
        const phone = globalThis.resolvePhoneFromLid(rawJid);
        if (phone && typeof phone === 'string') {
            const num = phone.replace(/\D/g, '');
            if (num && num !== lidNum) {
                if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNum, num);
                return num + '@s.whatsapp.net';
            }
        }
    }

    if (chatJid && client) {
        try {
            const meta = await client.groupMetadata(chatJid);
            for (const p of meta.participants || []) {
                const pLidRaw = p.lid || p.id || p.jid || '';
                const pLid = pLidRaw.split('@')[0].split(':')[0].replace(/\D/g, '');
                if (pLid !== lidNum) continue;
                const pBase = p.id || p.jid || '';
                if (pBase && !pBase.endsWith('@lid')) {
                    const phone = pBase.split('@')[0].split(':')[0].replace(/\D/g, '');
                    if (phone) {
                        if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNum, phone);
                        return phone + '@s.whatsapp.net';
                    }
                }
                if (p.phoneNumber) {
                    const phone = String(p.phoneNumber).replace(/\D/g, '');
                    if (phone) {
                        if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNum, phone);
                        return phone + '@s.whatsapp.net';
                    }
                }
            }
        } catch {}
    }

    if (globalThis.resolvePhoneFromLidAsync) {
        try {
            const phone = await globalThis.resolvePhoneFromLidAsync(rawJid);
            if (phone && typeof phone === 'string') {
                const num = phone.replace(/\D/g, '');
                if (num && num !== lidNum) return num + '@s.whatsapp.net';
            }
        } catch {}
    }

    return rawJid;
}

export { resolveJidFromLid, resolveTargetJid, resolvePhoneNumber, resolveSenderJid };
