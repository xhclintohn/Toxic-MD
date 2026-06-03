import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';

let Database = null;
let _sqliteDriver = null;
try {
    Database = require('better-sqlite3');
    _sqliteDriver = 'better-sqlite3';
} catch {
    try {
        _sqliteDriver = 'node:sqlite';
        Database = class NodeSQLiteCompat {
            constructor(filepath) { this._db = new DatabaseSync(filepath); }
            pragma(str) { try { this._db.exec('PRAGMA ' + str); } catch {} }
            exec(sql) { return this._db.exec(sql); }
            prepare(sql) { return this._db.prepare(sql); }
        };
    } catch { Database = null; }
}

const _mem = {
    settings: new Map(),
    sudo: new Set(),
    banned: new Set(),
    groups: new Map(),
    history: [],
    warns: new Map(),
    msgs: new Map(),
    allowed: new Set(),
    lidPhone: new Map()
};

function initMemory() {
    _backend = 'memory';
    console.log('⚠️ [DB] No SQLite/PG/JSON available — using in-memory storage (data resets on restart).');
}

function _memOp(type, sql, params) {
    const s = (sql || '').toLowerCase().trim();
    if (s.includes('allowed_users')) {
        if (type === 'all') return [..._mem.allowed].map(num => ({ num }));
        if (type === 'run' && s.includes('delete')) { _mem.allowed.delete(params[0]); return; }
        if (type === 'run') { _mem.allowed.add(params[0]); return; }
    }
    if (s.includes('settings') && !s.includes('group_settings')) {
        if (type === 'all') { const r = []; _mem.settings.forEach((v, k) => r.push({ key: k, value: v })); return r; }
        if (type === 'run') { _mem.settings.set(params[0], params[1]); return; }
    }
    if (s.includes('sudo_users')) {
        if (type === 'all') return [..._mem.sudo].map(num => ({ num }));
        if (type === 'run' && s.includes('delete')) { _mem.sudo.delete(params[0]); return; }
        if (type === 'run') { _mem.sudo.add(params[0]); return; }
    }
    if (s.includes('banned_users')) {
        if (type === 'all') return [..._mem.banned].map(num => ({ num }));
        if (type === 'run' && s.includes('delete')) { _mem.banned.delete(params[0]); return; }
        if (type === 'run') { _mem.banned.add(params[0]); return; }
    }
    if (s.includes('group_settings')) {
        if (type === 'get') return _mem.groups.get(params[0]) || null;
        if (type === 'run' && s.includes('insert') && params[0] && !_mem.groups.has(params[0])) {
            _mem.groups.set(params[0], { jid: params[0], antidelete: 1, gcpresence: 0, events: 0, antidemote: 0, antipromote: 0, antilink: 'off', antistatusmention: 'off', antitag: 0, welcome: 0, goodbye: 0, warn_limit: 3, antiforeign: 0 });
        }
        return;
    }
    if (s.includes('conversation_history')) {
        if (type === 'all') { const num = params[0]; const lim = params[1] || 20; return _mem.history.filter(r => r.num === num).slice(-lim); }
        if (type === 'run' && s.includes('insert')) { _mem.history.push({ num: params[0], role: params[1], message: params[2], timestamp: Math.floor(Date.now() / 1000) }); if (_mem.history.length > 2000) _mem.history = _mem.history.slice(-1000); return; }
        if (type === 'run' && s.includes('delete') && params.length === 1) { _mem.history = _mem.history.filter(r => r.num !== params[0]); return; }
        if (type === 'run') { const cutoff = params[0]; _mem.history = _mem.history.filter(r => (r.timestamp || 0) > cutoff); return; }
    }
    if (s.includes('warn_data')) {
        const key = (params[0] || '') + '|' + (params[1] || '');
        if (type === 'get') return { warns: _mem.warns.get(key) || 0 };
        if (type === 'run' && s.includes('delete')) { _mem.warns.delete(key); return; }
        if (type === 'run' && s.includes('insert')) { _mem.warns.set(key, 1); return; }
        if (type === 'run' && s.includes('update')) { _mem.warns.set(key, (_mem.warns.get(key) || 0) + 1); return; }
    }
    if (s.includes('msg_store')) {
        if (type === 'get') return _mem.msgs.get(params[0]) || null;
        if (type === 'run' && s.includes('insert')) { _mem.msgs.set(params[0], { id: params[0], jid: params[1], sender: params[2], message: params[3], timestamp: params[4] }); if (_mem.msgs.size > 1000) { const oldest = _mem.msgs.keys().next().value; _mem.msgs.delete(oldest); } return; }
        if (type === 'run' && s.includes('delete') && params.length >= 2) { _mem.msgs.delete(params[0]); return; }
        if (type === 'run' && s.includes('delete')) { const cutoff = params[0]; for (const [k, v] of _mem.msgs) { if ((v.timestamp || 0) < cutoff) _mem.msgs.delete(k); } return; }
    }
    if (s.includes('lid_phone')) {
        if (type === 'get') return _mem.lidPhone.get(params[0]) ? { phone: _mem.lidPhone.get(params[0]) } : null;
        if (type === 'run' && s.includes('insert')) { _mem.lidPhone.set(params[0], params[1]); if (_mem.lidPhone.size > 500) { const oldest = _mem.lidPhone.keys().next().value; _mem.lidPhone.delete(oldest); } return; }
    }
    return type === 'all' ? [] : null;
}

const _jsonDefaults = () => ({
    settings: {},
    group_settings: {},
    conversation_history: [],
    sudo_users: [],
    banned_users: [],
    allowed_users: [],
    warn_data: {},
    msg_store: {},
    lid_phone: {}
});

let _jsonData = null;
let _jsonSaveTimer = null;
const _jsonPath = path.resolve('./whatsasena.json');

function _jsonFlush() {
    try { fs.writeFileSync(_jsonPath, JSON.stringify(_jsonData, null, 2)); } catch {}
}

function _jsonSave() {
    if (_jsonSaveTimer) clearTimeout(_jsonSaveTimer);
    _jsonSaveTimer = setTimeout(_jsonFlush, 400);
}

function initJson() {
    try {
        if (fs.existsSync(_jsonPath)) {
            const raw = fs.readFileSync(_jsonPath, 'utf-8');
            _jsonData = Object.assign(_jsonDefaults(), JSON.parse(raw));
        } else {
            _jsonData = _jsonDefaults();
        }
        _backend = 'json';
        console.log('✅ [DB] Using JSON file database (whatsasena.json)');
    } catch (e) {
        console.log('⚠️ [DB] JSON init failed:', e.message);
        throw e;
    }
}

function _jsonOp(type, sql, params) {
    const s = (sql || '').toLowerCase().trim();
    if (s.includes('allowed_users')) {
        const arr = _jsonData.allowed_users;
        if (type === 'all') return arr.map(num => ({ num }));
        if (type === 'run' && s.includes('delete')) { const i = arr.indexOf(params[0]); if (i > -1) arr.splice(i, 1); _jsonSave(); return; }
        if (type === 'run') { if (!arr.includes(params[0])) arr.push(params[0]); _jsonSave(); return; }
    }
    if (s.includes('sudo_users')) {
        const arr = _jsonData.sudo_users;
        if (type === 'all') return arr.map(num => ({ num }));
        if (type === 'run' && s.includes('delete')) { const i = arr.indexOf(params[0]); if (i > -1) arr.splice(i, 1); _jsonSave(); return; }
        if (type === 'run') { if (!arr.includes(params[0])) arr.push(params[0]); _jsonSave(); return; }
    }
    if (s.includes('banned_users')) {
        const arr = _jsonData.banned_users;
        if (type === 'all') return arr.map(num => ({ num }));
        if (type === 'run' && s.includes('delete')) { const i = arr.indexOf(params[0]); if (i > -1) arr.splice(i, 1); _jsonSave(); return; }
        if (type === 'run') { if (!arr.includes(params[0])) arr.push(params[0]); _jsonSave(); return; }
    }
    if (s.includes('settings') && !s.includes('group_settings')) {
        const obj = _jsonData.settings;
        if (type === 'all') return Object.entries(obj).map(([key, value]) => ({ key, value }));
        if (type === 'run') { obj[params[0]] = params[1]; _jsonSave(); return; }
    }
    if (s.includes('group_settings')) {
        const obj = _jsonData.group_settings;
        if (type === 'get') return obj[params[0]] || null;
        if (type === 'run' && s.includes('insert') && params[0] && !obj[params[0]]) {
            obj[params[0]] = { jid: params[0], antidelete: 1, gcpresence: 0, events: 0, antidemote: 0, antipromote: 0, antilink: 'off', antistatusmention: 'off', antitag: 0, welcome: 0, goodbye: 0, warn_limit: 3, antiforeign: 0 };
            _jsonSave();
        }
        return;
    }
    if (s.includes('conversation_history')) {
        const arr = _jsonData.conversation_history;
        if (type === 'all') { const num = params[0]; const lim = params[1] || 20; return arr.filter(r => r.num === num).slice(-lim); }
        if (type === 'run' && s.includes('insert')) { arr.push({ num: params[0], role: params[1], message: params[2], timestamp: Math.floor(Date.now() / 1000) }); if (arr.length > 2000) arr.splice(0, arr.length - 1000); _jsonSave(); return; }
        if (type === 'run' && s.includes('delete') && params.length === 1) { _jsonData.conversation_history = arr.filter(r => r.num !== params[0]); _jsonSave(); return; }
        if (type === 'run') { const cutoff = params[0]; _jsonData.conversation_history = arr.filter(r => (r.timestamp || 0) > cutoff); _jsonSave(); return; }
    }
    if (s.includes('warn_data')) {
        const obj = _jsonData.warn_data;
        const key = (params[0] || '') + '|' + (params[1] || '');
        if (type === 'get') return obj[key] !== undefined ? { warns: obj[key] } : null;
        if (type === 'run' && s.includes('delete')) { delete obj[key]; _jsonSave(); return; }
        if (type === 'run' && s.includes('insert')) { obj[key] = 1; _jsonSave(); return; }
        if (type === 'run' && s.includes('update')) { obj[key] = (obj[key] || 0) + 1; _jsonSave(); return; }
    }
    if (s.includes('msg_store')) {
        const obj = _jsonData.msg_store;
        if (type === 'get') return obj[params[0]] || null;
        if (type === 'run' && s.includes('insert')) {
            obj[params[0]] = { id: params[0], jid: params[1], sender: params[2], message: params[3], timestamp: params[4] };
            const keys = Object.keys(obj);
            if (keys.length > 1000) delete obj[keys[0]];
            _jsonSave(); return;
        }
        if (type === 'run' && s.includes('delete') && params.length >= 2) { delete obj[params[0]]; _jsonSave(); return; }
        if (type === 'run' && s.includes('delete')) { const cutoff = params[0]; for (const [k, v] of Object.entries(obj)) { if ((v.timestamp || 0) < cutoff) delete obj[k]; } _jsonSave(); return; }
    }
    if (s.includes('lid_phone')) {
        const obj = _jsonData.lid_phone;
        if (type === 'get') return obj[params[0]] ? { phone: obj[params[0]] } : null;
        if (type === 'run' && s.includes('insert')) {
            obj[params[0]] = params[1];
            const keys = Object.keys(obj);
            if (keys.length > 500) delete obj[keys[0]];
            _jsonSave(); return;
        }
    }
    return type === 'all' ? [] : null;
}

let _backend = null;
let _db = null;
let _pg = null;
let _ready = null;

const cache = {
    settings: { data: null, time: 0, ttl: 30000 },
    sudoUsers: { data: null, time: 0, ttl: 60000 },
    bannedUsers: { data: null, time: 0, ttl: 60000 },
    groupSettings: new Map()
};
const GS_TTL = 60000;
function isCacheValid(e) { return e.data !== null && (Date.now() - e.time) < e.ttl; }

const _settingsListeners = [];
const _sudoListeners = [];
const _bannedListeners = [];
function registerSettingsListener(fn) { _settingsListeners.push(fn); }
function registerSudoListener(fn) { _sudoListeners.push(fn); }
function registerBannedListener(fn) { _bannedListeners.push(fn); }
function _notify(list) { list.forEach(fn => { try { fn(); } catch {} }); }
function getBackend() { return _backend; }

const SQLITE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS group_settings (
        jid TEXT PRIMARY KEY, antidelete INTEGER DEFAULT 1, gcpresence INTEGER DEFAULT 0,
        events INTEGER DEFAULT 0, antidemote INTEGER DEFAULT 0, antipromote INTEGER DEFAULT 0,
        antilink TEXT DEFAULT 'off', antistatusmention TEXT DEFAULT 'off', antitag INTEGER DEFAULT 0,
        welcome INTEGER DEFAULT 0, goodbye INTEGER DEFAULT 0, warn_limit INTEGER DEFAULT 3,
        antiforeign INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS conversation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT, num TEXT NOT NULL, role TEXT NOT NULL,
        message TEXT NOT NULL, timestamp INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS sudo_users (num TEXT PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS banned_users (num TEXT PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS allowed_users (num TEXT PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS warn_data (jid TEXT NOT NULL, user TEXT NOT NULL, warns INTEGER DEFAULT 0, PRIMARY KEY (jid, user));
    CREATE TABLE IF NOT EXISTS msg_store (
        id TEXT NOT NULL, jid TEXT NOT NULL, sender TEXT, message TEXT NOT NULL,
        timestamp INTEGER NOT NULL, PRIMARY KEY (id, jid)
    );
    CREATE TABLE IF NOT EXISTS lid_phone (lid TEXT PRIMARY KEY, phone TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_ch_num ON conversation_history(num);
    CREATE INDEX IF NOT EXISTS idx_ms_id ON msg_store(id);
    CREATE INDEX IF NOT EXISTS idx_ms_ts ON msg_store(timestamp);
`;

const PG_SCHEMA = [
    `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS group_settings (
        jid TEXT PRIMARY KEY, antidelete INTEGER DEFAULT 1, gcpresence INTEGER DEFAULT 0,
        events INTEGER DEFAULT 0, antidemote INTEGER DEFAULT 0, antipromote INTEGER DEFAULT 0,
        antilink TEXT DEFAULT 'off', antistatusmention TEXT DEFAULT 'off', antitag INTEGER DEFAULT 0,
        welcome INTEGER DEFAULT 0, goodbye INTEGER DEFAULT 0, warn_limit INTEGER DEFAULT 3,
        antiforeign INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS conversation_history (
        id SERIAL PRIMARY KEY, num TEXT NOT NULL, role TEXT NOT NULL,
        message TEXT NOT NULL, timestamp BIGINT DEFAULT EXTRACT(epoch FROM NOW())::BIGINT
    )`,
    `CREATE TABLE IF NOT EXISTS sudo_users (num TEXT PRIMARY KEY)`,
    `CREATE TABLE IF NOT EXISTS banned_users (num TEXT PRIMARY KEY)`,
    `CREATE TABLE IF NOT EXISTS allowed_users (num TEXT PRIMARY KEY)`,
    `CREATE TABLE IF NOT EXISTS warn_data (jid TEXT NOT NULL, "user" TEXT NOT NULL, warns INTEGER DEFAULT 0, PRIMARY KEY (jid, "user"))`,
    `CREATE TABLE IF NOT EXISTS msg_store (
        id TEXT NOT NULL, jid TEXT NOT NULL, sender TEXT, message TEXT NOT NULL,
        timestamp BIGINT NOT NULL, PRIMARY KEY (id, jid)
    )`,
    `CREATE TABLE IF NOT EXISTS lid_phone (lid TEXT PRIMARY KEY, phone TEXT NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_ch_num ON conversation_history(num)`,
    `CREATE INDEX IF NOT EXISTS idx_ms_ts ON msg_store(timestamp)`
];

function initSqlite() {
    _db = new Database(path.resolve('./whatsasena.db'));
    _db.pragma('journal_mode = WAL');
    _db.pragma('synchronous = NORMAL');
    _db.pragma('cache_size = -64000');
    _db.pragma('temp_store = MEMORY');
    _db.pragma('busy_timeout = 5000');
    _db.pragma('mmap_size = 268435456');
    _db.exec(SQLITE_SCHEMA);
    try { _db.prepare('ALTER TABLE group_settings ADD COLUMN antiforeign INTEGER DEFAULT 0').run(); } catch {}
    _backend = 'sqlite';
    console.log(`✅ [DB] Using SQLite (${_sqliteDriver})`);
}

async function tryInitPg() {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 300000,
            max: 5,
            min: 1,
            allowExitOnIdle: false,
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000
        });
        pool.on('error', (err) => { console.log('⚠️ [PG POOL ERROR]:', err.message); });
        await Promise.race([
            pool.query('SELECT 1'),
            new Promise((_, rej) => setTimeout(() => rej(new Error('PG connect timeout')), 20000))
        ]);
        for (const sql of PG_SCHEMA) { try { await pool.query(sql); } catch {} }
        const PG_MIGRATIONS = [
            `ALTER TABLE group_settings ADD COLUMN IF NOT EXISTS antiforeign INTEGER DEFAULT 0`,
        ];
        for (const sql of PG_MIGRATIONS) { try { await pool.query(sql); } catch {} }
        setInterval(() => { pool.query('SELECT 1').catch(() => {}); }, 3 * 60 * 1000);
        _pg = pool;
        _backend = 'pg';
        console.log('✅ [DB] Using Heroku PostgreSQL');
        return true;
    } catch (e) {
        console.log(`⚠️ [DB] PostgreSQL unavailable (${e.message}) — trying next option`);
        return false;
    }
}

_ready = (async () => {
    if (process.env.DATABASE_URL) {
        const ok = await tryInitPg();
        if (!ok) {
            if (Database) {
                try { initSqlite(); } catch { initJson(); }
            } else {
                try { initJson(); } catch { initMemory(); }
            }
        }
    } else {
        if (Database) {
            try { initSqlite(); } catch {
                try { initJson(); } catch { initMemory(); }
            }
        } else {
            console.log('⚠️ [DB] No SQLite backend available and no DATABASE_URL — trying PG...');
            const ok = await tryInitPg();
            if (!ok) {
                try { initJson(); } catch { initMemory(); }
            }
        }
    }
})();

async function ensureReady() { await _ready; }

async function qAll(sqlLite, sqlPg, params = []) {
    await ensureReady();
    if (_backend === 'pg') return (await _pg.query(sqlPg, params)).rows;
    if (_backend === 'json') return _jsonOp('all', sqlLite, params) || [];
    if (_backend === 'memory') return _memOp('all', sqlLite, params) || [];
    return _db.prepare(sqlLite).all(...params);
}

async function qGet(sqlLite, sqlPg, params = []) {
    await ensureReady();
    if (_backend === 'pg') return (await _pg.query(sqlPg, params)).rows[0] || null;
    if (_backend === 'json') return _jsonOp('get', sqlLite, params) || null;
    if (_backend === 'memory') return _memOp('get', sqlLite, params) || null;
    return _db.prepare(sqlLite).get(...params) || null;
}

async function qRun(sqlLite, sqlPg, params = []) {
    await ensureReady();
    if (_backend === 'pg') { await _pg.query(sqlPg, params); return; }
    if (_backend === 'json') { _jsonOp('run', sqlLite, params); return; }
    if (_backend === 'memory') { _memOp('run', sqlLite, params); return; }
    _db.prepare(sqlLite).run(...params);
}

async function initializeDatabase() { await ensureReady(); }

async function getSettings() {
    if (isCacheValid(cache.settings)) return cache.settings.data;
    const rows = await qAll(
        'SELECT key, value FROM settings',
        'SELECT key, value FROM settings'
    );
    const defaults = {
        prefix: '.', mode: 'public', botname: 'TOXIC-MD', startmessage: true,
        chatbotpm: false, autoview: true, autoread: false, antidelete: false, stealth: false,
        autoai: false, toxicagent: false, anticall: false, antiviewonce: false
    };
    const s = { ...defaults };
    for (const r of rows) {
        try { s[r.key] = JSON.parse(r.value); } catch { s[r.key] = r.value; }
    }
    cache.settings.data = s;
    cache.settings.time = Date.now();
    return s;
}

async function updateSetting(key, value) {
    const v = JSON.stringify(value);
    await qRun(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, v]
    );
    cache.settings.data = null;
    _notify(_settingsListeners);
}

async function getGroupSettings(jid) {
    const cached = cache.groupSettings.get(jid);
    if (cached && (Date.now() - cached.time) < GS_TTL) return cached.data;
    const row = await qGet(
        'SELECT * FROM group_settings WHERE jid = ?',
        'SELECT * FROM group_settings WHERE jid = $1',
        [jid]
    );
    const data = row ? {
        antidelete: !!row.antidelete, gcpresence: !!row.gcpresence, events: !!row.events,
        antidemote: !!row.antidemote, antipromote: !!row.antipromote, antilink: row.antilink || 'off',
        antistatusmention: row.antistatusmention || 'off', antitag: !!row.antitag,
        welcome: !!row.welcome, goodbye: !!row.goodbye, warn_limit: row.warn_limit || 3,
        antiforeign: !!row.antiforeign
    } : {
        antidelete: true, gcpresence: false, events: false, antidemote: false, antipromote: false,
        antilink: 'off', antistatusmention: 'off', antitag: false, welcome: false, goodbye: false,
        warn_limit: 3, antiforeign: false
    };
    cache.groupSettings.set(jid, { data, time: Date.now() });
    return data;
}

async function updateGroupSetting(jid, key, value) {
    await ensureReady();
    const _sv = (value === true || value === 'true') ? 1 : (value === false || value === 'false') ? 0 : value;
    if (_backend === 'pg') {
        await _pg.query('INSERT INTO group_settings (jid) VALUES ($1) ON CONFLICT (jid) DO NOTHING', [jid]);
        await _pg.query(`UPDATE group_settings SET ${key} = $1 WHERE jid = $2`, [_sv, jid]);
    } else if (_backend === 'json') {
        if (!_jsonData.group_settings[jid]) {
            _jsonData.group_settings[jid] = { jid, antidelete: 1, gcpresence: 0, events: 0, antidemote: 0, antipromote: 0, antilink: 'off', antistatusmention: 'off', antitag: 0, welcome: 0, goodbye: 0, warn_limit: 3, antiforeign: 0 };
        }
        _jsonData.group_settings[jid][key] = _sv;
        _jsonSave();
    } else if (_backend === 'memory') {
        if (!_mem.groups.has(jid)) _mem.groups.set(jid, { jid, antidelete: 1, gcpresence: 0, events: 0, antidemote: 0, antipromote: 0, antilink: 'off', antistatusmention: 'off', antitag: 0, welcome: 0, goodbye: 0, warn_limit: 3, antiforeign: 0 });
        const g = _mem.groups.get(jid);
        g[key] = _sv;
    } else {
        _db.prepare('INSERT OR IGNORE INTO group_settings (jid) VALUES (?)').run(jid);
        _db.prepare(`UPDATE group_settings SET ${key} = ? WHERE jid = ?`).run(_sv, jid);
    }
    cache.groupSettings.delete(jid);
}

async function banUser(num) {
    await qRun(
        'INSERT OR IGNORE INTO banned_users (num) VALUES (?)',
        'INSERT INTO banned_users (num) VALUES ($1) ON CONFLICT DO NOTHING',
        [num]
    );
    cache.bannedUsers.data = null;
    _notify(_bannedListeners);
}

async function unbanUser(num) {
    await qRun('DELETE FROM banned_users WHERE num = ?', 'DELETE FROM banned_users WHERE num = $1', [num]);
    cache.bannedUsers.data = null;
    _notify(_bannedListeners);
}

async function getBannedUsers() {
    if (isCacheValid(cache.bannedUsers)) return cache.bannedUsers.data;
    const rows = await qAll('SELECT num FROM banned_users', 'SELECT num FROM banned_users');
    const data = rows.map(r => r.num);
    cache.bannedUsers.data = data;
    cache.bannedUsers.time = Date.now();
    return data;
}

async function addSudoUser(num) {
    await qRun(
        'INSERT OR IGNORE INTO sudo_users (num) VALUES (?)',
        'INSERT INTO sudo_users (num) VALUES ($1) ON CONFLICT DO NOTHING',
        [num]
    );
    cache.sudoUsers.data = null;
    _notify(_sudoListeners);
}

async function removeSudoUser(num) {
    await qRun('DELETE FROM sudo_users WHERE num = ?', 'DELETE FROM sudo_users WHERE num = $1', [num]);
    cache.sudoUsers.data = null;
    _notify(_sudoListeners);
}

async function getSudoUsers() {
    if (isCacheValid(cache.sudoUsers)) return cache.sudoUsers.data;
    const rows = await qAll('SELECT num FROM sudo_users', 'SELECT num FROM sudo_users');
    const data = rows.map(r => r.num);
    cache.sudoUsers.data = data;
    cache.sudoUsers.time = Date.now();
    return data;
}

async function getAllowedUsers() {
    const rows = await qAll('SELECT num FROM allowed_users', 'SELECT num FROM allowed_users');
    return rows.map(r => r.num);
}

async function addAllowedUser(num) {
    await qRun(
        'INSERT OR IGNORE INTO allowed_users (num) VALUES (?)',
        'INSERT INTO allowed_users (num) VALUES ($1) ON CONFLICT DO NOTHING',
        [num]
    );
}

async function removeAllowedUser(num) {
    await qRun('DELETE FROM allowed_users WHERE num = ?', 'DELETE FROM allowed_users WHERE num = $1', [num]);
}

async function getConversationHistory(num, limit = 20) {
    const rows = await qAll(
        'SELECT role, message FROM conversation_history WHERE num = ? ORDER BY timestamp DESC LIMIT ?',
        'SELECT role, message FROM conversation_history WHERE num = $1 ORDER BY timestamp DESC LIMIT $2',
        [num, limit]
    );
    return rows.reverse();
}

async function addConversationMessage(num, role, message) {
    await qRun(
        'INSERT INTO conversation_history (num, role, message) VALUES (?, ?, ?)',
        'INSERT INTO conversation_history (num, role, message) VALUES ($1, $2, $3)',
        [num, role, message]
    );
    if (_backend === 'sqlite' && _db) {
        try { _db.prepare('DELETE FROM conversation_history WHERE num = ? AND id NOT IN (SELECT id FROM conversation_history WHERE num = ? ORDER BY timestamp DESC LIMIT 50)').run(num, num); } catch {}
    } else if (_backend === 'pg') {
        _pg.query('DELETE FROM conversation_history WHERE num = $1 AND id NOT IN (SELECT id FROM conversation_history WHERE num = $1 ORDER BY timestamp DESC LIMIT 50)', [num]).catch(() => {});
    } else if (_backend === 'json') {
        const arr = _jsonData.conversation_history;
        const userMsgs = arr.filter(r => r.num === num);
        if (userMsgs.length > 50) {
            const toRemove = userMsgs.slice(0, userMsgs.length - 50);
            _jsonData.conversation_history = arr.filter(r => !toRemove.includes(r));
            _jsonSave();
        }
    }
}

async function clearConversationHistory(num) {
    await qRun(
        'DELETE FROM conversation_history WHERE num = ?',
        'DELETE FROM conversation_history WHERE num = $1',
        [num]
    );
}

function clearOldConversationHistory(hoursOld = 5) {
    const cutoff = Math.floor(Date.now() / 1000) - hoursOld * 3600;
    if (_backend === 'pg') {
        _pg.query('DELETE FROM conversation_history WHERE timestamp < $1', [cutoff]).catch(() => {});
    } else if (_backend === 'json') {
        _jsonData.conversation_history = _jsonData.conversation_history.filter(r => (r.timestamp || 0) > cutoff);
        _jsonSave();
    } else if (_backend === 'memory') {
        _mem.history = _mem.history.filter(r => (r.timestamp || 0) > cutoff);
    } else if (_db) {
        try { _db.prepare('DELETE FROM conversation_history WHERE timestamp < ?').run(cutoff); } catch {}
    }
}

async function getWarnCount(jid, user) {
    const row = await qGet(
        'SELECT warns FROM warn_data WHERE jid = ? AND user = ?',
        'SELECT warns FROM warn_data WHERE jid = $1 AND "user" = $2',
        [jid, user]
    );
    return row ? row.warns : 0;
}

async function addWarn(jid, user) {
    try {
        await ensureReady();
        if (_backend === 'pg') {
            const res = await _pg.query(
                'INSERT INTO warn_data (jid, "user", warns) VALUES ($1, $2, 1) ON CONFLICT (jid, "user") DO UPDATE SET warns = warn_data.warns + 1 RETURNING warns',
                [jid, user]
            );
            return res.rows[0]?.warns || 1;
        }
        if (_backend === 'json') {
            const key = jid + '|' + user;
            const obj = _jsonData.warn_data;
            obj[key] = (obj[key] || 0) + 1;
            _jsonSave();
            return obj[key];
        }
        const row = await qGet(
            'SELECT warns FROM warn_data WHERE jid = ? AND user = ?',
            'SELECT warns FROM warn_data WHERE jid = $1 AND user = $2',
            [jid, user]
        );
        if (row) {
            await qRun(
                'UPDATE warn_data SET warns = warns + 1 WHERE jid = ? AND user = ?',
                'UPDATE warn_data SET warns = warns + 1 WHERE jid = $1 AND "user" = $2',
                [jid, user]
            );
            return row.warns + 1;
        }
        await qRun(
            'INSERT INTO warn_data (jid, user, warns) VALUES (?, ?, 1)',
            'INSERT INTO warn_data (jid, "user", warns) VALUES ($1, $2, 1)',
            [jid, user]
        );
        return 1;
    } catch (e) { console.log('❌ [ADDWARN]:', e.message); return 0; }
}

async function resetWarn(jid, user) {
    await qRun(
        'DELETE FROM warn_data WHERE jid = ? AND user = ?',
        'DELETE FROM warn_data WHERE jid = $1 AND "user" = $2',
        [jid, user]
    );
}

async function setWarnLimit(jid, limit) {
    await updateGroupSetting(jid, 'warn_limit', parseInt(limit) || 3);
}

async function getWarnLimit(jid) {
    const gs = await getGroupSettings(jid);
    return gs.warn_limit || 3;
}

async function saveMessage(id, jid, sender, messageObj) {
    await qRun(
        'INSERT OR REPLACE INTO msg_store (id, jid, sender, message, timestamp) VALUES (?, ?, ?, ?, ?)',
        'INSERT INTO msg_store (id, jid, sender, message, timestamp) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id, jid) DO UPDATE SET message = $4, timestamp = $5',
        [id, jid, sender || '', JSON.stringify(messageObj), Date.now()]
    );
}

async function getMessage(id) {
    const row = await qGet(
        'SELECT * FROM msg_store WHERE id = ? LIMIT 1',
        'SELECT * FROM msg_store WHERE id = $1 LIMIT 1',
        [id]
    );
    if (!row) return null;
    try { return { id: row.id, jid: row.jid, sender: row.sender, message: JSON.parse(row.message), timestamp: row.timestamp }; }
    catch { return null; }
}

async function deleteMessage(id, jid) {
    await qRun(
        'DELETE FROM msg_store WHERE id = ? AND jid = ?',
        'DELETE FROM msg_store WHERE id = $1 AND jid = $2',
        [id, jid]
    );
}

async function cleanupOldMsgStore(maxAgeMs = 12 * 60 * 60 * 1000) {
    const cutoff = Date.now() - maxAgeMs;
    await qRun(
        'DELETE FROM msg_store WHERE timestamp < ?',
        'DELETE FROM msg_store WHERE timestamp < $1',
        [cutoff]
    );
}

setInterval(() => cleanupOldMsgStore(), 12 * 60 * 60 * 1000);
setInterval(() => clearOldConversationHistory(1), 60 * 60 * 1000);

async function mapLidToPhone(lid, phone) {
    if (!lid || !phone) return;
    await qRun(
        'INSERT OR REPLACE INTO lid_phone (lid, phone) VALUES (?, ?)',
        'INSERT INTO lid_phone (lid, phone) VALUES ($1, $2) ON CONFLICT (lid) DO UPDATE SET phone = $2',
        [lid, phone]
    );
}

async function getPhoneFromLid(lid) {
    if (!lid) return null;
    const row = await qGet(
        'SELECT phone FROM lid_phone WHERE lid = ? LIMIT 1',
        'SELECT phone FROM lid_phone WHERE lid = $1 LIMIT 1',
        [lid]
    );
    return row?.phone || null;
}

export {
    getBackend,
    registerSettingsListener, registerSudoListener, registerBannedListener,
    initializeDatabase, getSettings, updateSetting,
    getGroupSettings, updateGroupSetting,
    banUser, unbanUser, getBannedUsers,
    addSudoUser, removeSudoUser, getSudoUsers,
    getAllowedUsers, addAllowedUser, removeAllowedUser,
    getConversationHistory, addConversationMessage, clearConversationHistory, clearOldConversationHistory,
    getWarnCount, addWarn, resetWarn, setWarnLimit, getWarnLimit,
    saveMessage, getMessage, deleteMessage, cleanupOldMsgStore,
    mapLidToPhone, getPhoneFromLid
};

export { _db as db };
