const USERNAME_TTL = 6 * 60 * 60 * 1000;
const NEGATIVE_TTL = 15 * 60 * 1000;
const QUERY_TIMEOUT = 8000;
const MAX_CACHE = 8000;
const CHUNK_SIZE = 64;
const MAX_PARALLEL_CHUNKS = 4;
const MAX_SCAN = 1024;

const usernameByJid = new Map();
const jidByUsername = new Map();
const inFlight = new Map();
const primed = new Map();

let usyncCtor = null;
let usyncCtorLoaded = false;

async function loadUSyncQuery() {
    if (usyncCtorLoaded) return usyncCtor;
    usyncCtorLoaded = true;
    try {
        const baileys = await import('@whiskeysockets/baileys');
        usyncCtor = baileys.USyncQuery || baileys.default?.USyncQuery || null;
    } catch {
        usyncCtor = null;
    }
    return usyncCtor;
}

function capMap(map) {
    while (map.size > MAX_CACHE) {
        const first = map.keys().next().value;
        if (first === undefined) break;
        map.delete(first);
    }
}

function digits(value) {
    if (!value) return '';
    return String(value).split('@')[0].split(':')[0].replace(/\D/g, '');
}

function isLid(value) {
    return typeof value === 'string' && value.endsWith('@lid');
}

function idKey(id) {
    if (!id) return '';
    const num = digits(id);
    if (!num) return '';
    return (isLid(id) ? 'lid:' : 'pn:') + num;
}

function normalizeId(id) {
    if (!id) return '';
    const num = digits(id);
    if (!num) return '';
    if (isLid(id)) return num + '@lid';
    return num + '@s.whatsapp.net';
}

function normalizeUsername(value) {
    if (!value) return '';
    let v = String(value).trim().toLowerCase();
    v = v.replace(/^@+/, '').replace(/@.*$/, '').trim();
    if (!v) return '';
    if (!/^[a-z0-9._-]{3,30}$/.test(v)) return '';
    if (/^[0-9.\-_]+$/.test(v)) return '';
    return v;
}

function fresh(entry, ttl) {
    return !!entry && (Date.now() - entry.time) < ttl;
}

function cacheUsername(id, username) {
    const key = idKey(id);
    if (!key) return;
    const clean = normalizeUsername(username);
    if (!clean) {
        const prev = usernameByJid.get(key);
        if (prev && prev.username) return;
        usernameByJid.set(key, { username: null, time: Date.now() });
        capMap(usernameByJid);
        return;
    }
    usernameByJid.set(key, { username: clean, time: Date.now() });
    jidByUsername.set(clean, { id: normalizeId(id), time: Date.now() });
    capMap(usernameByJid);
    capMap(jidByUsername);
}

function getCachedUsername(id) {
    const key = idKey(id);
    if (!key) return null;
    const entry = usernameByJid.get(key);
    if (!entry) return null;
    if (entry.username && fresh(entry, USERNAME_TTL)) return entry.username;
    if (!entry.username && fresh(entry, NEGATIVE_TTL)) return null;
    return entry.username && fresh(entry, USERNAME_TTL) ? entry.username : null;
}

function isKnown(id) {
    const key = idKey(id);
    if (!key) return true;
    const entry = usernameByJid.get(key);
    if (!entry) return false;
    if (entry.username) return fresh(entry, USERNAME_TTL);
    return fresh(entry, NEGATIVE_TTL);
}

function getCachedJidForUsername(username) {
    const clean = normalizeUsername(username);
    if (!clean) return null;
    const entry = jidByUsername.get(clean);
    if (entry && fresh(entry, USERNAME_TTL)) return entry.id;
    return null;
}

function withTimeout(promise, ms) {
    return Promise.race([
        Promise.resolve(promise),
        new Promise(resolve => setTimeout(() => resolve(null), ms))
    ]);
}

function parseUsyncNode(node) {
    if (node === null || node === undefined) return null;
    if (typeof node === 'string') return node;
    if (Buffer.isBuffer(node)) return node.toString();
    const content = node.content !== undefined ? node.content : node;
    if (content === null || content === undefined) return null;
    if (typeof content === 'string') return content;
    if (Buffer.isBuffer(content)) return content.toString();
    if (Array.isArray(content)) {
        for (const child of content) {
            const parsed = parseUsyncNode(child);
            if (parsed) return parsed;
        }
        return null;
    }
    if (content.data) return Buffer.from(content.data).toString();
    if (content.username) return String(content.username);
    return null;
}

async function rawUsernameQuery(client, ids) {
    if (!client || typeof client.executeUSyncQuery !== 'function') return [];
    const USyncQuery = await loadUSyncQuery();
    if (!USyncQuery) return [];
    const targets = ids.map(normalizeId).filter(Boolean);
    if (targets.length === 0) return [];
    try {
        const query = new USyncQuery();
        query.protocols.push({
            name: 'username',
            getQueryElement: () => ({ tag: 'username', attrs: {} }),
            getUserElement: () => null,
            parser: node => parseUsyncNode(node)
        });
        for (const id of targets) query.users.push({ id });
        const result = await withTimeout(client.executeUSyncQuery(query), QUERY_TIMEOUT);
        const list = result?.list;
        if (!Array.isArray(list)) return [];
        return list;
    } catch {
        return [];
    }
}

async function getUsernames(client, ids) {
    const out = new Map();
    const wanted = [];
    const seen = new Set();
    for (const id of ids || []) {
        const key = idKey(id);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        const cached = getCachedUsername(id);
        if (cached) {
            out.set(key, cached);
            continue;
        }
        if (isKnown(id)) continue;
        wanted.push(id);
    }
    if (wanted.length === 0) return out;

    const chunks = [];
    for (let i = 0; i < wanted.length; i += CHUNK_SIZE) chunks.push(wanted.slice(i, i + CHUNK_SIZE));

    for (let i = 0; i < chunks.length; i += MAX_PARALLEL_CHUNKS) {
        const slice = chunks.slice(i, i + MAX_PARALLEL_CHUNKS);
        const results = await Promise.all(slice.map(chunk => rawUsernameQuery(client, chunk)));
        results.forEach((list, index) => {
            const chunk = slice[index];
            const answered = new Set();
            for (const item of list || []) {
                const itemId = item?.id || item?.jid || '';
                const username = normalizeUsername(item?.username);
                if (!itemId) continue;
                answered.add(idKey(itemId));
                cacheUsername(itemId, username);
                if (username) out.set(idKey(itemId), username);
            }
            for (const id of chunk) {
                const key = idKey(id);
                if (!answered.has(key)) cacheUsername(id, null);
            }
        });
    }
    return out;
}

async function getUsername(client, id) {
    const target = normalizeId(id) || id;
    const cached = getCachedUsername(target);
    if (cached) return { id: target, username: cached };
    const key = idKey(target);
    if (!key) return { id: target, username: null };
    if (inFlight.has(key)) return inFlight.get(key);
    const task = (async () => {
        const list = await rawUsernameQuery(client, [target]);
        const first = list?.[0];
        const username = normalizeUsername(first?.username);
        cacheUsername(first?.id || target, username);
        return { id: first?.id || target, username: username || null };
    })().finally(() => inFlight.delete(key));
    inFlight.set(key, task);
    return task;
}

function participantIds(participants) {
    const ids = [];
    for (const p of participants || []) {
        const base = p?.id || p?.jid || '';
        if (base) ids.push(base);
        const alt = p?.lid || '';
        if (alt && idKey(alt) !== idKey(base)) ids.push(alt);
        const phone = p?.phoneNumber || p?.phone_number || p?.pn || '';
        if (phone && idKey(phone) !== idKey(base)) ids.push(normalizeId(phone));
    }
    return ids.slice(0, MAX_SCAN);
}

function participantUsername(p) {
    const direct = normalizeUsername(p?.username || p?.userName || p?.user_name || '');
    if (direct) return direct;
    return null;
}

async function primeGroupUsernames(client, source, options = {}) {
    const participants = Array.isArray(source) ? source : (source?.participants || []);
    if (!participants || participants.length === 0) return;
    const cacheKey = Array.isArray(source) ? (options.chat || '') : (source?.id || options.chat || '');
    if (cacheKey) {
        const last = primed.get(cacheKey);
        if (last && (Date.now() - last) < USERNAME_TTL && !options.force) return;
        primed.set(cacheKey, Date.now());
    }
    for (const p of participants) {
        const direct = participantUsername(p);
        if (direct) cacheUsername(p.id || p.jid || '', direct);
    }
    const ids = participantIds(participants).filter(id => !isKnown(id));
    if (ids.length === 0) return;
    await getUsernames(client, ids).catch(() => {});
}

function findParticipant(participants, target) {
    if (!target) return null;
    const num = digits(target);
    const lidTarget = isLid(target) ? num : '';
    for (const p of participants || []) {
        const base = p?.id || p?.jid || '';
        const lidField = p?.lid || '';
        const phone = digits(p?.phoneNumber || p?.phone_number || p?.pn || '');
        const baseNum = digits(base);
        const lidNum = isLid(base) ? baseNum : digits(isLid(lidField) ? lidField : '');
        if (lidTarget && lidNum && lidTarget === lidNum) return p;
        if (!lidTarget) {
            if (phone && (phone === num || (num.length >= 7 && (phone.endsWith(num) || num.endsWith(phone))))) return p;
            if (!isLid(base) && baseNum && (baseNum === num || (num.length >= 7 && (baseNum.endsWith(num) || num.endsWith(baseNum))))) return p;
        }
        if (!lidTarget && lidNum && lidNum === num) return p;
    }
    return null;
}

function participantPhone(p) {
    if (!p) return '';
    const phone = digits(p.phoneNumber || p.phone_number || p.pn || '');
    if (phone) return phone;
    const base = p.id || p.jid || '';
    if (base && !isLid(base)) return digits(base);
    const lidField = p.lid || '';
    if (lidField && !isLid(lidField)) return digits(lidField);
    return '';
}

function lidPhoneFromCache(target) {
    if (!isLid(target)) return '';
    const num = digits(target);
    if (!num) return '';
    if (globalThis.lidPhoneCache) {
        const hit = globalThis.lidPhoneCache.get(num);
        if (hit) return digits(hit);
    }
    if (typeof globalThis.resolvePhoneFromLid === 'function') {
        const hit = globalThis.resolvePhoneFromLid(target);
        if (hit) {
            const clean = digits(hit);
            if (clean && clean !== num) return clean;
        }
    }
    return '';
}

function pickActionableJid(target, participants) {
    if (!target) return null;
    const participant = findParticipant(participants, target);
    if (participant) {
        const base = participant.id || participant.jid || '';
        if (base) return base;
    }
    if (isLid(target)) {
        const phone = lidPhoneFromCache(target);
        if (phone) return phone + '@s.whatsapp.net';
        return digits(target) + '@lid';
    }
    const num = digits(target);
    if (!num) return null;
    return num + '@s.whatsapp.net';
}

async function resolveUsernameToJid(client, rawUsername, options = {}) {
    const username = normalizeUsername(rawUsername);
    if (!username) return null;

    const cached = getCachedJidForUsername(username);
    if (cached) {
        const actionable = pickActionableJid(cached, options.participants || []);
        if (actionable) return actionable;
    }

    let participants = options.participants || [];
    const chat = options.chat || '';
    if ((!participants || participants.length === 0) && chat.endsWith('@g.us') && client) {
        try {
            const meta = await client.groupMetadata(chat);
            participants = meta?.participants || [];
        } catch {
            participants = [];
        }
    }

    for (const p of participants || []) {
        if (participantUsername(p) === username) {
            const base = p.id || p.jid || '';
            if (base) {
                cacheUsername(base, username);
                return base;
            }
        }
    }

    if (participants && participants.length > 0) {
        for (const p of participants) {
            const base = p.id || p.jid || '';
            const known = getCachedUsername(base);
            if (known === username) return base;
        }
        await primeGroupUsernames(client, participants, { chat }).catch(() => {});
        for (const p of participants) {
            const base = p.id || p.jid || '';
            const known = getCachedUsername(base);
            if (known === username) return base;
            const lidField = p.lid || '';
            if (lidField && getCachedUsername(lidField) === username && base) return base;
            const phone = participantPhone(p);
            if (phone && getCachedUsername(phone + '@s.whatsapp.net') === username && base) return base;
        }
    }

    const hit = getCachedJidForUsername(username);
    if (hit) return pickActionableJid(hit, participants);

    if (client && typeof client.onWhatsApp === 'function') {
        const probes = ['@' + username, username];
        for (const probe of probes) {
            try {
                const result = await withTimeout(client.onWhatsApp(probe), QUERY_TIMEOUT);
                const entry = Array.isArray(result) ? result.find(r => r?.exists !== false && (r?.jid || r?.lid)) : null;
                const found = entry?.jid || entry?.lid;
                if (found) {
                    cacheUsername(found, username);
                    return pickActionableJid(found, participants);
                }
            } catch {}
        }
    }

    return null;
}

function extractUsernameToken(input) {
    if (!input) return '';
    const raw = Array.isArray(input) ? input.join(' ') : String(input);
    const parts = raw.trim().split(/\s+/).filter(Boolean);
    for (const part of parts) {
        if (part.includes('@s.whatsapp.net') || part.includes('@lid') || part.includes('@g.us')) continue;
        const clean = normalizeUsername(part);
        if (clean) return clean;
    }
    return '';
}

function extractNumberToken(input) {
    if (!input) return '';
    const raw = Array.isArray(input) ? input.join(' ') : String(input);
    const parts = raw.trim().split(/\s+/).filter(Boolean);
    for (const part of parts) {
        if (part.includes('@g.us')) continue;
        if (part.includes('@lid')) {
            const num = digits(part);
            if (num) return num + '@lid';
        }
        const num = digits(part);
        if (num.length >= 7) return num + '@s.whatsapp.net';
    }
    return '';
}

async function describeTarget(client, jid, participants) {
    const participant = findParticipant(participants, jid);
    const phone = participantPhone(participant) || (isLid(jid) ? lidPhoneFromCache(jid) : digits(jid));
    let username = getCachedUsername(jid);
    if (!username && participant) {
        username = participantUsername(participant) || getCachedUsername(participant.id || participant.jid || '');
    }
    if (!username && phone) username = getCachedUsername(phone + '@s.whatsapp.net');
    if (!username && client) {
        const info = await getUsername(client, jid).catch(() => null);
        if (info?.username) username = info.username;
    }
    return {
        jid,
        phone: phone || '',
        username: username || null,
        participant: participant || null,
        tag: digits(jid) || jid.split('@')[0],
        label: username ? '@' + username : '@' + (phone || digits(jid))
    };
}

async function resolveTarget(client, context = {}, options = {}) {
    const m = options.m || context.m || {};
    const chat = options.chat || m.chat || '';
    let participants = options.participants || context.participants || context.groupMetadata?.participants || m.metadata?.participants || [];
    if ((!participants || participants.length === 0) && chat.endsWith('@g.us') && client) {
        try {
            const meta = await client.groupMetadata(chat);
            participants = meta?.participants || [];
        } catch {
            participants = [];
        }
    }

    const order = options.order || ['mention', 'quoted', 'text'];
    const textSource = options.text !== undefined ? options.text : (context.text || (Array.isArray(context.args) ? context.args.join(' ') : ''));

    for (const source of order) {
        if (source === 'mention') {
            const mentions = m.mentionedJid || [];
            for (const mention of mentions) {
                if (!mention) continue;
                const actionable = pickActionableJid(mention, participants);
                if (actionable) {
                    const info = await describeTarget(client, actionable, participants);
                    return { ...info, raw: mention, source: 'mention', participants };
                }
            }
        }
        if (source === 'quoted') {
            const quotedSender = m.quoted?.sender || m.quoted?.participant || '';
            if (quotedSender) {
                const actionable = pickActionableJid(quotedSender, participants);
                if (actionable) {
                    const info = await describeTarget(client, actionable, participants);
                    return { ...info, raw: quotedSender, source: 'quoted', participants };
                }
            }
        }
        if (source === 'text') {
            const username = extractUsernameToken(textSource);
            if (username) {
                const resolved = await resolveUsernameToJid(client, username, { participants, chat });
                if (resolved) {
                    const info = await describeTarget(client, resolved, participants);
                    return { ...info, username: info.username || username, label: '@' + (info.username || username), raw: '@' + username, source: 'username', participants };
                }
            }
            const numeric = extractNumberToken(textSource);
            if (numeric) {
                const actionable = pickActionableJid(numeric, participants);
                if (actionable) {
                    const info = await describeTarget(client, actionable, participants);
                    return { ...info, raw: numeric, source: 'number', participants };
                }
            }
        }
    }

    return null;
}

function usernameTokens(text) {
    const raw = String(text || '');
    const out = [];
    const seen = new Set();
    const re = /@([A-Za-z0-9._-]{2,30})/g;
    let match;
    while ((match = re.exec(raw)) !== null) {
        const token = match[1];
        if (/^\d+$/.test(token)) continue;
        if (token.includes('.') && /^(s|g|c)$/.test(token.split('.')[0])) continue;
        const clean = normalizeUsername(token);
        if (clean && !seen.has(clean)) {
            seen.add(clean);
            out.push(clean);
        }
    }
    if (out.length === 0) {
        const parts = raw.trim().split(/\s+/).slice(1);
        for (const part of parts) {
            if (part.startsWith('@') || part.includes('@')) continue;
            if (/^\d+$/.test(part)) continue;
            const clean = normalizeUsername(part);
            if (clean && clean.length >= 3 && !seen.has(clean)) {
                seen.add(clean);
                out.push(clean);
                break;
            }
        }
    }
    return out;
}

async function resolveMentionsFromText(client, text, options = {}) {
    const tokens = usernameTokens(text);
    if (tokens.length === 0) return [];
    const participants = options.participants || [];
    const chat = options.chat || '';
    const budget = options.timeout || 4000;
    const results = [];
    const seen = new Set(options.existing || []);
    const deadline = Date.now() + budget;
    for (const token of tokens) {
        if (Date.now() > deadline) break;
        const jid = await withTimeout(resolveUsernameToJid(client, token, { participants, chat }), Math.max(500, deadline - Date.now())).catch(() => null);
        if (jid && !seen.has(jid)) {
            seen.add(jid);
            results.push(jid);
        }
    }
    return results;
}

function mentionTag(target) {
    if (!target) return '';
    if (typeof target === 'string') return '@' + (digits(target) || target.split('@')[0]);
    return '@' + (target.tag || digits(target.jid));
}

export {
    getUsername,
    getUsernames,
    getCachedUsername,
    getCachedJidForUsername,
    cacheUsername,
    normalizeUsername,
    extractUsernameToken,
    extractNumberToken,
    primeGroupUsernames,
    resolveUsernameToJid,
    resolveTarget,
    describeTarget,
    pickActionableJid,
    findParticipant,
    participantPhone,
    mentionTag,
    usernameTokens,
    resolveMentionsFromText
};
