import fs from 'fs';
import path from 'path';
import { isPnUser, isLidUser, areJidsSameUser } from '@whiskeysockets/baileys';

const SESSION_DIRS = [
    path.resolve('./Session'),
    path.resolve('./session'),
    path.resolve('./auth_info_baileys'),
    path.resolve(process.cwd(), 'Session')
];

function digitsOnly(value) {
    if (!value) return '';
    return String(value).split('@')[0].split(':')[0].replace(/\D/g, '');
}

function getParticipantPhone(p) {
    if (!p || typeof p !== 'object') return null;
    const phoneNumber = p.phoneNumber || p.phone_number || p.pn || p.number || '';
    if (phoneNumber) {
        const num = digitsOnly(phoneNumber);
        if (num && num.length >= 7 && num.length <= 15) return num;
    }
    const base = p.id || p.jid || p.participant || '';
    if (base && !String(base).endsWith('@lid') && String(base).includes('@')) {
        const num = digitsOnly(base);
        if (num && num.length >= 7 && num.length <= 15) return num;
    }
    return null;
}

function getParticipantLidNum(p) {
    if (!p || typeof p !== 'object') return null;
    const base = p.id || p.jid || '';
    if (base && String(base).endsWith('@lid')) {
        return digitsOnly(base) || null;
    }
    const lid = p.lid || '';
    if (lid && String(lid).endsWith('@lid')) {
        return digitsOnly(lid) || null;
    }
    return null;
}

function resolveSenderIdentifiers(key) {
    if (!key) return { jid: null, lid: null };
    const primary = key.participant || key.remoteJid;
    const alternate = key.participantAlt || key.remoteJidAlt;
    let jid = null;
    let lid = null;
    if (isPnUser?.(primary) || (typeof primary === 'string' && primary.endsWith('@s.whatsapp.net'))) {
        jid = primary;
    } else if (isPnUser?.(alternate) || (typeof alternate === 'string' && alternate.endsWith('@s.whatsapp.net'))) {
        jid = alternate;
    }
    if (isLidUser?.(primary) || (typeof primary === 'string' && primary.endsWith('@lid'))) {
        lid = primary;
    } else if (isLidUser?.(alternate) || (typeof alternate === 'string' && alternate.endsWith('@lid'))) {
        lid = alternate;
    }
    return { jid, lid };
}

function readReverseMappingFromSession(lidNum) {
    if (!lidNum) return null;
    for (const dir of SESSION_DIRS) {
        try {
            if (!fs.existsSync(dir)) continue;
            const candidates = [
                path.join(dir, `lid-mapping-${lidNum}_reverse.json`),
                path.join(dir, `lid-mapping-${lidNum}.json`)
            ];
            for (const file of candidates) {
                if (!fs.existsSync(file)) continue;
                try {
                    const raw = fs.readFileSync(file, 'utf8');
                    const parsed = JSON.parse(raw);
                    let phone = null;
                    if (typeof parsed === 'string') phone = digitsOnly(parsed);
                    else if (parsed && typeof parsed === 'object') {
                        phone = digitsOnly(parsed.pn || parsed.phone || parsed.jid || parsed.id || '');
                    }
                    if (phone && phone.length >= 7 && phone.length <= 15 && phone !== lidNum) {
                        return phone;
                    }
                } catch {}
            }
            try {
                const files = fs.readdirSync(dir);
                for (const f of files) {
                    if (!f.startsWith('lid-mapping-') || !f.endsWith('.json')) continue;
                    if (f.includes('_reverse')) continue;
                    try {
                        const raw = fs.readFileSync(path.join(dir, f), 'utf8');
                        const parsed = JSON.parse(raw);
                        const lidFromName = f.replace('lid-mapping-', '').replace('.json', '').replace('_reverse', '');
                        if (typeof parsed === 'string') {
                            const val = digitsOnly(parsed);
                            if (lidFromName === lidNum && val && val !== lidNum) return val;
                            if (val === lidNum) {
                                const pn = digitsOnly(lidFromName);
                                if (pn && pn.length >= 7 && pn.length <= 15) return pn;
                            }
                        }
                    } catch {}
                }
            } catch {}
        } catch {}
    }
    return null;
}

function cachePair(lidNum, phoneNum) {
    if (!lidNum || !phoneNum || lidNum === phoneNum) return;
    if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(String(lidNum), String(phoneNum));
    if (globalThis.phoneLidCache) globalThis.phoneLidCache.set(String(phoneNum), String(lidNum));
    try {
        if (typeof globalThis.cacheLidPhone === 'function') globalThis.cacheLidPhone(String(lidNum), String(phoneNum));
    } catch {}
}

function resolveJidFromLid(lidJid, participants) {
    if (!lidJid) return null;
    const lidNum = digitsOnly(lidJid);
    if (!lidNum) return null;

    if (globalThis.lidPhoneCache) {
        const cached = globalThis.lidPhoneCache.get(lidNum);
        if (cached) {
            const num = digitsOnly(cached);
            if (num && num !== lidNum && num.length >= 7 && num.length <= 15) {
                return num + '@s.whatsapp.net';
            }
        }
    }

    if (globalThis.resolvePhoneFromLid) {
        try {
            const phone = globalThis.resolvePhoneFromLid(lidJid);
            if (phone && typeof phone === 'string' && !phone.endsWith('@lid')) {
                const num = digitsOnly(phone);
                if (num && num !== lidNum && num.length >= 7 && num.length <= 15) {
                    cachePair(lidNum, num);
                    return num + '@s.whatsapp.net';
                }
            }
        } catch {}
    }

    const fromSession = readReverseMappingFromSession(lidNum);
    if (fromSession) {
        cachePair(lidNum, fromSession);
        return fromSession + '@s.whatsapp.net';
    }

    if (participants && participants.length > 0) {
        for (const p of participants) {
            const pLidNum = getParticipantLidNum(p);
            if (pLidNum && pLidNum === lidNum) {
                const phone = getParticipantPhone(p);
                if (phone && phone !== lidNum) {
                    cachePair(lidNum, phone);
                    return phone + '@s.whatsapp.net';
                }
                const base = p.id || p.jid || '';
                if (base && !String(base).endsWith('@lid')) {
                    const num = digitsOnly(base);
                    if (num && num.length >= 7 && num.length <= 15) {
                        cachePair(lidNum, num);
                        return num + '@s.whatsapp.net';
                    }
                }
            }
        }
    }

    return null;
}

function resolveTargetJid(rawJid, participants) {
    if (!rawJid) return null;
    const domain = (String(rawJid).split('@')[1] || '').toLowerCase();
    const num = digitsOnly(rawJid);
    if (!num) return null;

    if (domain === 'lid' || String(rawJid).endsWith('@lid')) {
        const resolved = resolveJidFromLid(rawJid, participants);
        if (resolved) return resolved;
        return rawJid;
    }

    if (domain === 's.whatsapp.net' || domain === 'hosted') {
        return num + '@s.whatsapp.net';
    }

    if (participants && participants.length > 0) {
        const match = participants.find(p => {
            const phone = getParticipantPhone(p);
            if (phone && (phone === num || phone.endsWith(num) || num.endsWith(phone))) return true;
            const base = p.id || p.jid || '';
            if (base && !String(base).endsWith('@lid')) {
                const pNum = digitsOnly(base);
                if (pNum && (pNum === num || pNum.endsWith(num) || num.endsWith(pNum))) return true;
            }
            return false;
        });
        if (match) {
            const phone = getParticipantPhone(match);
            if (phone) return phone + '@s.whatsapp.net';
            const base = match.id || match.jid || '';
            if (base) return base;
        }
    }

    return num + '@s.whatsapp.net';
}

function resolvePhoneNumber(rawJid, participants) {
    if (!rawJid) return '';
    const domain = (String(rawJid).split('@')[1] || '').toLowerCase();
    const num = digitsOnly(rawJid);
    if (domain === 'lid' || String(rawJid).endsWith('@lid')) {
        const resolved = resolveJidFromLid(rawJid, participants);
        if (resolved) return digitsOnly(resolved);
        return num;
    }
    return num;
}

function pickBestJid(key, participants) {
    if (!key) return null;
    const { jid, lid } = resolveSenderIdentifiers(key);
    if (jid && !String(jid).endsWith('@lid')) {
        const num = digitsOnly(jid);
        if (num && num.length >= 7 && num.length <= 15) {
            if (lid) cachePair(digitsOnly(lid), num);
            return num + '@s.whatsapp.net';
        }
        return jid;
    }
    if (lid) {
        const resolved = resolveJidFromLid(lid, participants);
        if (resolved) return resolved;
        return lid;
    }
    const primary = key.participant || key.remoteJid;
    if (primary) return resolveTargetJid(primary, participants) || primary;
    return null;
}

async function resolveSenderJid(rawJid, chatJid, client, msgKey = null) {
    if (!rawJid) return rawJid;
    if (!String(rawJid).endsWith('@lid')) return rawJid;

    const lidNum = digitsOnly(rawJid);

    if (msgKey) {
        const best = pickBestJid(msgKey, null);
        if (best && !String(best).endsWith('@lid')) return best;
        const { jid } = resolveSenderIdentifiers(msgKey);
        if (jid && String(jid).endsWith('@s.whatsapp.net')) {
            const num = digitsOnly(jid);
            if (num && num !== lidNum && num.length >= 7 && num.length <= 15) {
                cachePair(lidNum, num);
                return num + '@s.whatsapp.net';
            }
        }
        const altPn = msgKey.participantAlt || msgKey.remoteJidAlt;
        if (altPn && String(altPn).endsWith('@s.whatsapp.net')) {
            const num = digitsOnly(altPn);
            if (num && num !== lidNum && num.length >= 7 && num.length <= 15) {
                cachePair(lidNum, num);
                return num + '@s.whatsapp.net';
            }
        }
    }

    const syncResolved = resolveJidFromLid(rawJid, null);
    if (syncResolved) return syncResolved;

    if (globalThis.resolvePhoneFromLidAsync) {
        try {
            const phone = await globalThis.resolvePhoneFromLidAsync(rawJid);
            if (phone && typeof phone === 'string') {
                const num = digitsOnly(phone);
                if (num && num !== lidNum && num.length >= 7 && num.length <= 15) {
                    cachePair(lidNum, num);
                    return num + '@s.whatsapp.net';
                }
            }
        } catch {}
    }

    if (client?.signalRepository?.lidMapping?.getPNForLID) {
        try {
            const formats = [rawJid, `${lidNum}@lid`, `${lidNum}:0@lid`];
            for (const fmt of formats) {
                const pn = await client.signalRepository.lidMapping.getPNForLID(fmt);
                if (pn && typeof pn === 'string') {
                    const num = digitsOnly(pn);
                    if (num && num !== lidNum && num.length >= 7 && num.length <= 15) {
                        cachePair(lidNum, num);
                        return num + '@s.whatsapp.net';
                    }
                }
            }
        } catch {}
    }

    if (chatJid && client) {
        try {
            const meta = await client.groupMetadata(chatJid);
            for (const p of meta.participants || []) {
                const pLidRaw = p.lid || p.id || p.jid || '';
                const pLid = digitsOnly(pLidRaw);
                if (pLid !== lidNum) continue;
                const phone = getParticipantPhone(p);
                if (phone) {
                    cachePair(lidNum, phone);
                    return phone + '@s.whatsapp.net';
                }
                const pBase = p.id || p.jid || '';
                if (pBase && !String(pBase).endsWith('@lid')) {
                    const phone2 = digitsOnly(pBase);
                    if (phone2) {
                        cachePair(lidNum, phone2);
                        return phone2 + '@s.whatsapp.net';
                    }
                }
            }
        } catch {}
    }

    return rawJid;
}

function getDisplayJid(rawJid, participants) {
    if (!rawJid) return '';
    if (!String(rawJid).endsWith('@lid')) {
        const num = digitsOnly(rawJid);
        return num ? num + '@s.whatsapp.net' : rawJid;
    }
    return resolveJidFromLid(rawJid, participants) || rawJid;
}

function getDisplayTag(rawJid, participants) {
    const jid = getDisplayJid(rawJid, participants);
    const num = digitsOnly(jid);
    if (!num) return 'user';
    if (String(jid).endsWith('@lid') || (num.length > 15)) {
        return 'user';
    }
    return num;
}

export {
    resolveJidFromLid,
    resolveTargetJid,
    resolvePhoneNumber,
    resolveSenderJid,
    resolveSenderIdentifiers,
    pickBestJid,
    getDisplayJid,
    getDisplayTag,
    getParticipantPhone,
    getParticipantLidNum,
    readReverseMappingFromSession,
    cachePair,
    isPnUser,
    isLidUser,
    areJidsSameUser
};
