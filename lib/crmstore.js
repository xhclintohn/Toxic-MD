import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'crmstore.json');

const MAX_MESSAGES = typeof global !== 'undefined' && global.MESSAGE_CACHE_LIMIT
    ? global.MESSAGE_CACHE_LIMIT
    : 50000;
const MAX_NODES = 10000;
const WRITE_INTERVAL_MS = 45000;
const CLEANUP_MAX_AGE_MS = 24 * 60 * 60 * 1000;

fs.mkdirSync(dataDir, { recursive: true });

const USE_PG = !!(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim());

let _pg = null;
let _pgReady = false;
const messages = new Map();
const nodes = new Map();
const messageIndex = new Map();
let dirty = false;
let writeTimer = null;
let boundConns = new WeakSet();

function nodeKey(id, chat) {
    return `${id || ''}|${chat || ''}`;
}

function safeParse(raw) {
    try { return JSON.parse(raw); } catch { return null; }
}

async function initPg() {
    if (!USE_PG || _pgReady) return _pgReady;
    try {
        const { Pool } = await import('pg');
        _pg = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 300000,
            max: 5
        });
        await Promise.race([
            _pg.query('SELECT 1'),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000))
        ]);
        await _pg.query(`
            CREATE TABLE IF NOT EXISTS crm_messages (
                id TEXT NOT NULL,
                chat TEXT NOT NULL,
                sender TEXT,
                timestamp BIGINT,
                data JSONB NOT NULL,
                PRIMARY KEY (id, chat)
            )
        `);
        await _pg.query(`CREATE INDEX IF NOT EXISTS idx_crm_msg_chat ON crm_messages(chat)`);
        await _pg.query(`CREATE INDEX IF NOT EXISTS idx_crm_msg_ts ON crm_messages(timestamp)`);
        await _pg.query(`
            CREATE TABLE IF NOT EXISTS crm_nodes (
                id TEXT NOT NULL,
                chat TEXT NOT NULL,
                data JSONB NOT NULL,
                created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT),
                PRIMARY KEY (id, chat)
            )
        `);
        await _pg.query(`CREATE INDEX IF NOT EXISTS idx_crm_nodes_chat ON crm_nodes(chat)`);
        _pgReady = true;
        console.log('✅ [CRM] Using PostgreSQL (Heroku DATABASE_URL)');
        return true;
    } catch (e) {
        console.log('⚠️ [CRM] Postgres unavailable, falling back to JSON:', e.message);
        _pg = null;
        _pgReady = false;
        return false;
    }
}

function loadFromDisk() {
    if (USE_PG) return;
    try {
        if (!fs.existsSync(dbPath)) return;
        const data = safeParse(fs.readFileSync(dbPath, 'utf8'));
        if (!data || typeof data !== 'object') return;
        if (Array.isArray(data.messages)) {
            for (const row of data.messages) {
                if (!row?.id) continue;
                const key = nodeKey(row.id, row.chat);
                messages.set(key, row);
                if (!messageIndex.has(row.id)) messageIndex.set(row.id, []);
                messageIndex.get(row.id).push(key);
            }
        }
        if (Array.isArray(data.nodes)) {
            for (const row of data.nodes) {
                if (!row?.id) continue;
                nodes.set(nodeKey(row.id, row.chat), row);
            }
        }
        trimToLimit();
    } catch {}
}

function trimToLimit() {
    if (messages.size > MAX_MESSAGES) {
        const entries = [...messages.entries()].sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));
        const remove = entries.slice(0, messages.size - Math.floor(MAX_MESSAGES * 0.85));
        for (const [key, row] of remove) {
            messages.delete(key);
            const list = messageIndex.get(row.id);
            if (list) {
                const idx = list.indexOf(key);
                if (idx >= 0) list.splice(idx, 1);
                if (!list.length) messageIndex.delete(row.id);
            }
        }
    }
    if (nodes.size > MAX_NODES) {
        const entries = [...nodes.entries()].sort((a, b) => (a[1].created_at || 0) - (b[1].created_at || 0));
        for (const [key] of entries.slice(0, nodes.size - Math.floor(MAX_NODES * 0.85))) nodes.delete(key);
    }
}

function scheduleWrite() {
    if (USE_PG) return;
    dirty = true;
    if (writeTimer) return;
    writeTimer = setTimeout(() => { writeTimer = null; flush(); }, WRITE_INTERVAL_MS);
}

function flush() {
    if (USE_PG || !dirty) return;
    dirty = false;
    try {
        const payload = {
            version: 1,
            savedAt: Date.now(),
            messages: [...messages.values()],
            nodes: [...nodes.values()]
        };
        const tmp = dbPath + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(payload));
        fs.renameSync(tmp, dbPath);
    } catch {}
}

function encodeMessage(message) {
    try {
        return JSON.parse(JSON.stringify(message, (_, v) => {
            if (Buffer.isBuffer(v)) return { type: 'Buffer', data: v.toString('base64') };
            if (v instanceof Uint8Array) return { type: 'Buffer', data: Buffer.from(v).toString('base64') };
            if (v && typeof v === 'object' && v.constructor?.name === 'Long') {
                return typeof v.toNumber === 'function' ? v.toNumber() : (v.low ?? 0);
            }
            return v;
        }));
    } catch { return null; }
}

function decodeMessage(data) {
    if (!data) return null;
    try {
        return JSON.parse(JSON.stringify(data), (_, v) => {
            if (v && v.type === 'Buffer' && typeof v.data === 'string') return Buffer.from(v.data, 'base64');
            return v;
        });
    } catch { return data; }
}

function saveMessage(message, chat) {
    try {
        if (!message?.key?.id) return false;
        const id = message.key.id;
        const chatId = chat || message.key.remoteJid || '';
        if (!chatId) return false;
        const encoded = encodeMessage(message);
        if (!encoded) return false;
        const ts = Number(message.messageTimestamp) || Math.floor(Date.now() / 1000);
        const sender = message.key.participant || message.key.remoteJid || '';

        if (_pgReady && _pg) {
            _pg.query(
                `INSERT INTO crm_messages (id, chat, sender, timestamp, data)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id, chat) DO UPDATE SET sender = $3, timestamp = $4, data = $5`,
                [id, chatId, sender, ts, JSON.stringify(encoded)]
            ).catch(() => {});
            return true;
        }

        const key = nodeKey(id, chatId);
        messages.set(key, { id, chat: chatId, sender, timestamp: ts, data: encoded });
        if (!messageIndex.has(id)) messageIndex.set(id, []);
        const list = messageIndex.get(id);
        if (!list.includes(key)) list.push(key);
        trimToLimit();
        scheduleWrite();
        return true;
    } catch { return false; }
}

function loadMessage(id, chat) {
    if (!id) return null;
    try {
        if (_pgReady && _pg) {
            return null;
        }
        if (chat) {
            const row = messages.get(nodeKey(id, chat));
            if (row) return decodeMessage(row.data);
        }
        for (const k of (messageIndex.get(id) || [])) {
            const row = messages.get(k);
            if (row) return decodeMessage(row.data);
        }
        return null;
    } catch { return null; }
}

async function loadMessageAsync(id, chat) {
    if (!id) return null;
    if (_pgReady && _pg) {
        try {
            let res;
            if (chat) {
                res = await _pg.query('SELECT data FROM crm_messages WHERE id = $1 AND chat = $2 LIMIT 1', [id, chat]);
            } else {
                res = await _pg.query('SELECT data FROM crm_messages WHERE id = $1 ORDER BY timestamp DESC LIMIT 1', [id]);
            }
            if (res.rows[0]) return decodeMessage(res.rows[0].data);
        } catch {}
        return null;
    }
    return loadMessage(id, chat);
}

function loadMessageById(id) {
    return loadMessage(id, null);
}

function saveNode(id, chat, node) {
    try {
        if (!id || !chat) return false;
        const payload = typeof node === 'string' ? node : JSON.stringify(node);
        if (_pgReady && _pg) {
            _pg.query(
                `INSERT INTO crm_nodes (id, chat, data, created_at)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id, chat) DO UPDATE SET data = $3, created_at = $4`,
                [id, chat, payload, Math.floor(Date.now() / 1000)]
            ).catch(() => {});
            return true;
        }
        nodes.set(nodeKey(id, chat), {
            id, chat, data: payload, created_at: Math.floor(Date.now() / 1000)
        });
        trimToLimit();
        scheduleWrite();
        return true;
    } catch { return false; }
}

function loadNode(messageId, jid) {
    if (!messageId) return null;
    try {
        if (_pgReady && _pg) return null;
        if (jid) {
            const row = nodes.get(nodeKey(messageId, jid));
            if (row) {
                try { return typeof row.data === 'string' ? JSON.parse(row.data) : row.data; } catch { return row.data; }
            }
        }
        for (const row of nodes.values()) {
            if (row.id === messageId) {
                try { return typeof row.data === 'string' ? JSON.parse(row.data) : row.data; } catch { return row.data; }
            }
        }
        return null;
    } catch { return null; }
}

function saveAdditionalNode(id, chat, content, attrs = {}) {
    return saveNode(id, chat, { content, attrs });
}

function loadAdditionalNode(id, chat) {
    return loadNode(id, chat);
}

function hasMessage(id, chat) {
    if (!id) return false;
    if (_pgReady) return true;
    if (chat) return messages.has(nodeKey(id, chat));
    return (messageIndex.get(id) || []).length > 0;
}

function deleteMessage(id, chat) {
    try {
        if (_pgReady && _pg) {
            if (chat) _pg.query('DELETE FROM crm_messages WHERE id = $1 AND chat = $2', [id, chat]).catch(() => {});
            else _pg.query('DELETE FROM crm_messages WHERE id = $1', [id]).catch(() => {});
            return true;
        }
        if (chat) {
            const key = nodeKey(id, chat);
            messages.delete(key);
            const list = messageIndex.get(id);
            if (list) {
                const idx = list.indexOf(key);
                if (idx >= 0) list.splice(idx, 1);
                if (!list.length) messageIndex.delete(id);
            }
        } else {
            for (const k of (messageIndex.get(id) || [])) messages.delete(k);
            messageIndex.delete(id);
        }
        scheduleWrite();
        return true;
    } catch { return false; }
}

function getMessages(chat, limit = 100) {
    if (_pgReady) return [];
    const out = [];
    for (const row of messages.values()) {
        if (row.chat === chat) out.push(row);
    }
    out.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return out.slice(0, limit).map(r => ({
        rowid: r.id, id: r.id, chat: r.chat, sender: r.sender, timestamp: r.timestamp, data: r.data
    }));
}

function getAllMessages(limit = 100) {
    if (_pgReady) return [];
    return [...messages.values()]
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, limit)
        .map(r => ({ rowid: r.id, id: r.id, chat: r.chat, sender: r.sender, timestamp: r.timestamp, data: r.data }));
}

function countMessages() {
    return messages.size;
}

function cleanup() {
    if (_pgReady && _pg) {
        const cutoff = Math.floor((Date.now() - CLEANUP_MAX_AGE_MS) / 1000);
        _pg.query('DELETE FROM crm_messages WHERE timestamp < $1', [cutoff]).catch(() => {});
        _pg.query('DELETE FROM crm_nodes WHERE created_at < $1', [cutoff]).catch(() => {});
        return 0;
    }
    const cutoff = Math.floor((Date.now() - CLEANUP_MAX_AGE_MS) / 1000);
    let removed = 0;
    for (const [key, row] of messages) {
        if ((row.timestamp || 0) < cutoff) {
            messages.delete(key);
            const list = messageIndex.get(row.id);
            if (list) {
                const idx = list.indexOf(key);
                if (idx >= 0) list.splice(idx, 1);
                if (!list.length) messageIndex.delete(row.id);
            }
            removed++;
        }
    }
    for (const [key, row] of nodes) {
        if ((row.created_at || 0) < cutoff) { nodes.delete(key); removed++; }
    }
    if (removed) scheduleWrite();
    return removed;
}

function getStats() {
    let size = 0;
    try { if (fs.existsSync(dbPath)) size = fs.statSync(dbPath).size; } catch {}
    return {
        backend: _pgReady ? 'postgres' : 'json',
        messages: messages.size,
        nodes: nodes.size,
        totalMessages: messages.size,
        limit: MAX_MESSAGES,
        dbSize: size,
        file: _pgReady ? 'DATABASE_URL' : dbPath
    };
}

function loadFullMessage(id, chat) {
    return {
        message: loadMessage(id, chat),
        additionalNode: loadNode(id, chat)?.content ?? loadNode(id, chat) ?? null
    };
}

function bind(conn) {
    if (!conn) return conn;
    if (boundConns.has(conn)) return conn;
    boundConns.add(conn);
    try {
        conn.ev.on('messages.upsert', ({ messages: msgs }) => {
            try {
                for (const message of msgs || []) {
                    if (!message?.key?.id) continue;
                    const chat = message.key.remoteJid;
                    if (!chat) continue;
                    saveMessage(message, chat);
                }
            } catch {}
        });
    } catch {}
    return conn;
}

loadFromDisk();
if (USE_PG) {
    initPg().catch(() => {});
} else {
    console.log('✅ [CRM] Using JSON store →', dbPath);
}

if (!global.__crmStoreDailyClear) {
    global.__crmStoreDailyClear = setInterval(() => {
        try {
            clearAll();
            console.log('🧹 [CRM] Store cleared (24h rotation)');
        } catch {}
    }, 24 * 60 * 60 * 1000);
}

if (!global.__crmStoreCleanupTimer) {
    global.__crmStoreCleanupTimer = setInterval(() => {
        try { cleanup(); flush(); } catch {}
    }, 5 * 60 * 1000);
}

process.on('beforeExit', () => { try { flush(); } catch {} });
process.on('SIGINT', () => { try { flush(); } catch {} });
process.on('SIGTERM', () => { try { flush(); } catch {} });


function clearAll() {
    try {
        if (_pgReady && _pg) {
            _pg.query('DELETE FROM crm_messages').catch(() => {});
            _pg.query('DELETE FROM crm_nodes').catch(() => {});
            return true;
        }
        messages.clear();
        nodes.clear();
        messageIndex.clear();
        dirty = true;
        flush();
        try {
            if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
        } catch {}
        return true;
    } catch {
        return false;
    }
}

const crmstore = {
    db: null,
    bind,
    saveMessage,
    loadMessage,
    loadMessageAsync,
    loadMessageById,
    saveNode,
    loadNode,
    saveAdditionalNode,
    loadAdditionalNode,
    hasMessage,
    deleteMessage,
    getMessages,
    getAllMessages,
    countMessages,
    cleanup,
    getStats,
    loadFullMessage,
    flush,
    clearAll,
    initPg
};

export {
    bind, saveMessage, loadMessage, loadMessageAsync, loadMessageById,
    saveNode, loadNode, saveAdditionalNode, loadAdditionalNode,
    hasMessage, deleteMessage, getMessages, getAllMessages,
    countMessages, cleanup, getStats, loadFullMessage, clearAll
};

export default crmstore;
