let HttpsProxyAgent = null;
try {
  const mod = await import('https-proxy-agent');
  HttpsProxyAgent = mod.HttpsProxyAgent || mod.default;
} catch {}

const fetch = globalThis.fetch;

const PROXY_URL = 'https://cdn.jsdelivr.net/gh/proxifly/free-proxy-list@main/proxies/protocols/https/data.json';
let _cache = { at: 0, list: [] };
const CACHE_MS = 5 * 60 * 1000;

export async function getProxies() {
  if (_cache.list.length && Date.now() - _cache.at < CACHE_MS) return _cache.list;
  try {
    const res = await fetch(PROXY_URL, { signal: AbortSignal.timeout(12000) });
    const data = await res.json();
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

export async function proxyFetch(url, options = {}, { maxProxyAttempts = 4, preferProxy = false } = {}) {
  const timeout = options.timeout || 45000;
  const baseOpts = { ...options };
  delete baseOpts.timeout;
  delete baseOpts.agent;

  const tryOnce = async (agent) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeout);
    try {
      const init = {
        ...baseOpts,
        signal: controller.signal
      };
      if (agent) init.agent = agent;
      return await fetch(url, init);
    } finally {
      clearTimeout(t);
    }
  };

  let lastErr = null;

  if (!preferProxy) {
    try {
      return await tryOnce(null);
    } catch (e) {
      lastErr = e;
    }
  }

  if (HttpsProxyAgent) {
    const proxies = await getProxies();
    for (let i = 0; i < Math.min(maxProxyAttempts, proxies.length); i++) {
      const proxy = pickProxy(proxies);
      if (!proxy) break;
      try {
        const agent = new HttpsProxyAgent(proxy);
        return await tryOnce(agent);
      } catch (e) {
        lastErr = e;
      }
    }
  }

  if (preferProxy) {
    try {
      return await tryOnce(null);
    } catch (e) {
      lastErr = e;
    }
  }

  const msg = lastErr?.cause?.code || lastErr?.code || lastErr?.message || 'proxyFetch failed';
  throw new Error(String(msg));
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
