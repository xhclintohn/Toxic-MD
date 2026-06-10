import { getSettings as _getSettings } from '../database/config.js';

let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 30000; // 30 second cache for plugin-level calls

async function getSettings() {
    const now = Date.now();
    if (_cache && (now - _cacheTime) < CACHE_TTL) return _cache;
    _cache = await _getSettings();
    _cacheTime = Date.now();
    return _cache;
}

function invalidateCache() { _cache = null; _cacheTime = 0; }

export { getSettings, invalidateCache };
