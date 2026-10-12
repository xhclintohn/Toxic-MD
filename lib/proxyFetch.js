import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

const PROXY_URL = 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/https/data.json';
let _cache = { at: 0, list: [] };
const CACHE_MS = 5 * 60 * 1000;

export async function getProxies() {
  if (_cache.list.length && Date.now() - _cache.at < CACHE_MS) return _cache.list;
  try {
    const { data } = await axios.get(PROXY_URL, { timeout: 12000 });
    const list = (Array.isArray(data) ? data : [])
      .map((p) => (typeof p === 'string' ? p : p?.proxy))
      .filter((p) => typeof p === 'string' && p.startsWith('http'));
    if (list.length) {
      _cache = { at: Date.now(), list };
      return list;
    }
  } catch (e) {
    console.error('[proxy] list fetch failed', e?.message || e);
  }
  return _cache.list.slice();
}

export function pickProxy(list) {
  if (!list?.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * fetch with optional rotating HTTPS proxy.
 * Tries direct first, then up to maxProxyAttempts proxies on failure/timeout.
 */
export async function proxyFetch(url, options = {}, { maxProxyAttempts = 4, preferProxy = false } = {}) {
  const opts = { ...options };
  const timeout = options.timeout || 45000;

  const tryOnce = async (agent) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, {
        ...opts,
        signal: controller.signal,
        agent: agent || opts.agent,
      });
      return res;
    } finally {
      clearTimeout(t);
    }
  };

  if (!preferProxy) {
    try {
      return await tryOnce(null);
    } catch (e) {
      /* fall through to proxies */
    }
  }

  const proxies = await getProxies();
  let lastErr = null;
  for (let i = 0; i < Math.min(maxProxyAttempts, Math.max(proxies.length, 1)); i++) {
    const proxy = pickProxy(proxies);
    if (!proxy) break;
    try {
      const agent = new HttpsProxyAgent(proxy);
      return await tryOnce(agent);
    } catch (e) {
      lastErr = e;
    }
  }

  if (!preferProxy) throw lastErr || new Error('proxyFetch failed');
  return tryOnce(null);
}

export async function proxyFetchJson(url, options = {}, cfg = {}) {
  const res = await proxyFetch(url, options, cfg);
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: null, raw: text };
  }
}

export default proxyFetch;
