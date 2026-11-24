const polls = new Map();
const MAX_POLLS = 200;
const TTL_MS = 24 * 60 * 60 * 1000;

const keyOf = (chatJid, pollId) => `${chatJid}:${pollId}`;

export function rememberPoll(chatJid, pollId, secret, creatorJid, extra) {
    if (!chatJid || !pollId || !secret) return false;
    const now = Date.now();
    for (const [k, v] of polls) {
        if (now - v.ts > TTL_MS) polls.delete(k);
    }
    if (polls.size >= MAX_POLLS) polls.delete(polls.keys().next().value);
    polls.set(keyOf(chatJid, pollId), {
        secret: Buffer.from(secret),
        creatorJid: creatorJid || '',
        participantAlt: extra?.participantAlt || '',
        remoteJidAlt: extra?.remoteJidAlt || '',
        addressingMode: extra?.addressingMode || '',
        options: Array.isArray(extra?.options) ? extra.options : [],
        ts: now
    });
    return true;
}

export function getPollSecret(chatJid, pollId) {
    const entry = polls.get(keyOf(chatJid, pollId));
    if (!entry) return null;
    if (Date.now() - entry.ts > TTL_MS) {
        polls.delete(keyOf(chatJid, pollId));
        return null;
    }
    return entry;
}
