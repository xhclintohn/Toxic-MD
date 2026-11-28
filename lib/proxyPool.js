import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const cacheFile = path.join(dataDir, 'proxyPool.json');
const userFile = path.join(dataDir, 'proxies.txt');

const LIST_URLS = [
  'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
  'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt'
];
const REFRESH_MS = 6 * 60 * 60 * 1000;
const MAX_TEST = 200;
const TEST_TIMEOUT = 8000;

let pool = [];
let loaded = false;
let refreshing = null;
let ProxyAgentClass = null;

async function loadUndici() {
  if (ProxyAgentClass !== null) return ProxyAgentClass;
  try {
    const m = await import('undici');
    ProxyAgentClass = m.ProxyAgent || false;
  } catch {
    ProxyAgentClass = false;
  }
  return ProxyAgentClass;
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  } catch {
    return null;
  }
}

function writeCache() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify({ at: Date.now(), pool }));
  } catch {}
}

function parseList(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map(s => s.trim().replace(/^https?:\/\//i, '').split(/\s/)[0])
    .filter(p => /^\d{1,3}(\.\d{1,3}){3}:\d{2,5}$/.test(p));
}

async function fetchCandidates() {
  const seen = new Set();
  const out = [];
  const add = (arr) => {
    for (const p of arr) {
      if (!seen.has(p)) {
        seen.add(p);
        out.push(p);
      }
    }
  };
  try {
    add(parseList(fs.readFileSync(userFile, 'utf8')));
  } catch {}
  for (const url of LIST_URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (res.ok) add(parseList(await res.text()));
    } catch {}
  }
  return out.slice(0, MAX_TEST);
}

async function testProxy(proxy, PA) {
  const start = Date.now();
  let agent;
  try {
    agent = new PA(`http://${proxy}`);
    const res = await fetch('https://www.youtube.com/', {
      dispatcher: agent,
      signal: AbortSignal.timeout(TEST_TIMEOUT),
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    await res.arrayBuffer().catch(() => {});
    return res.status < 400 ? { proxy, ms: Date.now() - start } : null;
  } catch {
    return null;
  } finally {
    if (agent) agent.close().catch(() => {});
  }
}

function ytVerifyOne(proxy) {
  return new Promise((resolve) => {
    const bin = path.join(rootDir, 'database', 'bin', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
    if (!fs.existsSync(bin)) return resolve(false);
    execFile(bin, [
      '--simulate', '-f', 'bestaudio', '--print', '%(urls)s',
      '--proxy', `http://${proxy}`,
      '--extractor-args', 'youtube:player_client=default,tv_embedded',
      '--no-warnings', '--socket-timeout', '20',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    ], { timeout: 90000 }, (err, stdout) => {
      resolve(!err && String(stdout || '').trim().length > 0);
    });
  });
}

async function ytVerify(alive) {
  const top = alive.slice(0, 8);
  for (let i = 0; i < top.length; i += 3) {
    const batch = top.slice(i, i + 3);
    const results = await Promise.all(batch.map(p => ytVerifyOne(p.proxy)));
    batch.forEach((p, j) => { p.yt = results[j]; });
  }
  const pass = alive.filter(p => p.yt);
  const rest = alive.filter(p => !p.yt);
  return [...pass, ...rest];
}

export async function refreshProxies() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const PA = await loadUndici();
    if (!PA) return pool;
    const candidates = await fetchCandidates();
    const alive = [];
    for (let i = 0; i < candidates.length; i += 16) {
      const batch = await Promise.all(candidates.slice(i, i + 16).map(p => testProxy(p, PA)));
      for (const r of batch) if (r) alive.push(r);
    }
    alive.sort((a, b) => a.ms - b.ms);
    if (alive.length) {
      pool = await ytVerify(alive);
      writeCache();
      const ytCount = pool.filter(p => p.yt).length;
      console.log(`[PROXY] pool refreshed: ${pool.length} alive (${ytCount} yt-dlp verified), fastest ${pool[0].proxy} (${pool[0].ms}ms)`);
    }
    return pool;
  })();
  try {
    return await refreshing;
  } finally {
    refreshing = null;
  }
}

export async function getProxy() {
  if (!loaded) {
    const c = readCache();
    if (c?.pool?.length) pool = c.pool;
    loaded = true;
    if (!c || Date.now() - (c.at || 0) > REFRESH_MS) {
      refreshProxies().catch(() => {});
    }
  }
  return pool.length ? `http://${pool[0].proxy}` : null;
}

export function markBad(proxyUrl) {
  const p = String(proxyUrl || '').replace(/^https?:\/\//i, '');
  const before = pool.length;
  pool = pool.filter(x => x.proxy !== p);
  if (pool.length !== before) writeCache();
}

export async function proxyDispatcher(proxyUrl) {
  const PA = await loadUndici();
  return PA ? new PA(proxyUrl) : null;
}
