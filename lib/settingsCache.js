import { getSettings, getSudoUsers, getBannedUsers, getBannedGroups, registerSettingsListener, registerSudoListener, registerBannedListener } from '../database/config.js';

import { getAllowedUsers } from '../database/config.js';
const TTL = 300000;
const _DEFAULTS = { device: 'default', prefix: '.', mode: 'public', gcpresence: false, antitag: false, antidelete: true, antilink: 'off', chatbotpm: false, packname: 'Toxic-MD', author: 'xh_clinton', multiprefix: false, stealth: false, startmessage: true, autoview: false, autoai: false, toxicagent: false, warn_limit: 3, autobio: false, presence: 'off', autoread: false, autolike: false, anticall: false, antiviewonce: false };

let _s = null, _sTime = 0, _sP = null;
let _su = null, _suTime = 0, _suP = null;
let _b = null, _bTime = 0, _bP = null;
let _bg = null, _bgTime = 0, _bgP = null;

const _TIMEOUT_MS = 300;
function _withTimeout(p, fallback) {
    return Promise.race([p, new Promise(r => setTimeout(() => r(fallback), _TIMEOUT_MS))]);
}

async function getCachedSettings() {
    const now = Date.now();
    if (_s && (now - _sTime) < TTL) return _s;
    if (_sP) return _withTimeout(_sP, _DEFAULTS);
    _sP = (async () => {
        try { _s = await _withTimeout(getSettings(), null); _sTime = Date.now(); } catch {}
        _sP = null;
        return _s || _DEFAULTS;
    })();
    return _withTimeout(_sP, _DEFAULTS);
}

async function getCachedSudo() {
    const now = Date.now();
    if (_su && (now - _suTime) < TTL) return _su;
    if (_suP) return _withTimeout(_suP, []);
    _suP = (async () => {
        try { _su = await _withTimeout(getSudoUsers(), null); _suTime = Date.now(); } catch {}
        _suP = null;
        return _su || [];
    })();
    return _withTimeout(_suP, []);
}

async function getCachedBanned() {
    const now = Date.now();
    if (_b && (now - _bTime) < TTL) return _b;
    if (_bP) return _withTimeout(_bP, []);
    _bP = (async () => {
        try { _b = await _withTimeout(getBannedUsers(), null); _bTime = Date.now(); } catch {}
        _bP = null;
        return _b || [];
    })();
    return _withTimeout(_bP, []);
}


  let _al = null, _alTime = 0, _alP = null;

  async function getCachedAllowed() {
      const now = Date.now();
      if (_al && (now - _alTime) < 30000) return _al;
      if (_alP) return Promise.race([_alP, new Promise(r => setTimeout(() => r(_al || []), _TIMEOUT_MS))]);
      _alP = (async () => {
          try { _al = await _withTimeout(getAllowedUsers(), null); _alTime = Date.now(); } catch {}
          _alP = null;
          return _al || [];
      })();
      return Promise.race([_alP, new Promise(r => setTimeout(() => r(_al || []), _TIMEOUT_MS))]);
  }

  function invalidateAllowed() { _al = null; _alTime = 0; _alP = null; }

  function invalidateSettings() { _s = null; _sTime = 0; _sP = null; }
function invalidateSudo() { _su = null; _suTime = 0; _suP = null; }
function invalidateBanned() { _b = null; _bTime = 0; _bP = null; }

registerSettingsListener(invalidateSettings);
registerSudoListener(invalidateSudo);
registerBannedListener(invalidateBanned);

setInterval(() => {
    getCachedSettings().catch(() => {});
    getCachedSudo().catch(() => {});
    getCachedBanned().catch(() => {});
}, 60000);

async function getCachedBannedGroups() {
    const now = Date.now();
    if (_bg && (now - _bgTime) < 30000) return _bg;
    if (_bgP) return _withTimeout(_bgP, []);
    _bgP = (async () => {
        try { _bg = await _withTimeout(getBannedGroups(), null); _bgTime = Date.now(); } catch {}
        _bgP = null;
        return _bg || [];
    })();
    return _withTimeout(_bgP, []);
}

function invalidateBannedGroups() { _bg = null; _bgTime = 0; _bgP = null; }

function getCachedSettingsSync() { return _s || _DEFAULTS; }
function getCachedSudoSync() { return _su || []; }
function getCachedBannedSync() { return _b || []; }
function getCachedBannedGroupsSync() { return _bg || []; }

export { getCachedSettings, getCachedSudo, getCachedBanned, getCachedBannedGroups, getCachedAllowed, getCachedSettingsSync, getCachedSudoSync, getCachedBannedSync, getCachedBannedGroupsSync, invalidateSettings, invalidateSudo, invalidateBanned, invalidateBannedGroups, invalidateAllowed };
