const _timers = new Map();

function parseDelay(input) {
    if (!input) return null;
    const m = String(input).toLowerCase().match(/^(\d+)\s*(s|m|h)$/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    if (n <= 0) return null;
    if (m[2] === 's') return n * 1000;
    if (m[2] === 'm') return n * 60 * 1000;
    if (m[2] === 'h') return n * 3600 * 1000;
    return null;
}

function scheduleAction(jid, action, delayMs, executeFn) {
    const key = `${jid}:${action}`;
    const existing = _timers.get(key);
    if (existing) clearTimeout(existing.timeout);
    const executeAt = Date.now() + delayMs;
    const timeout = setTimeout(async () => {
        _timers.delete(key);
        try { await executeFn(); } catch {}
    }, delayMs);
    _timers.set(key, { timeout, executeAt, action, jid });
}

function cancelScheduled(jid, action) {
    const key = `${jid}:${action}`;
    const t = _timers.get(key);
    if (t) { clearTimeout(t.timeout); _timers.delete(key); return true; }
    return false;
}

function getScheduled(jid) {
    const result = [];
    for (const [key, val] of _timers.entries()) {
        if (key.startsWith(jid + ':')) result.push({ ...val, key });
    }
    return result;
}

export { parseDelay, scheduleAction, cancelScheduled, getScheduled };
