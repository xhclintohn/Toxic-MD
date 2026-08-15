import { getMentionEntry, setMentionEntry, removeMentionEntry } from '../database/config.js';

  // In-memory cache: populated on setMention and loaded from DB on first getMentionAsync call
  const _cache = new Map();
  let _cacheLoaded = false;

  async function _ensureLoaded() {
      if (_cacheLoaded) return;
      _cacheLoaded = true;
  }

  // Sync set — writes to cache immediately AND persists to DB async
  export function setMention(num, entry) {
      if (!num) return;
      _cache.set(String(num), entry);
      setMentionEntry(String(num), entry).catch(e => console.log('[MENTIONSTORE] persist error:', e.message));
  }

  // Sync get from cache only (fast path for real-time use)
  export function getMention(num) {
      if (!num) return null;
      return _cache.get(String(num)) || null;
  }

  // Async get: checks cache first, falls back to DB (handles restarts where cache was empty)
  export async function getMentionAsync(num) {
      if (!num) return null;
      const cached = _cache.get(String(num));
      if (cached !== undefined) return cached;
      try {
          const entry = await getMentionEntry(String(num));
          if (entry !== null && entry !== undefined) {
              _cache.set(String(num), entry);
              return entry;
          }
      } catch (e) {
          console.log('[MENTIONSTORE] db read error:', e.message);
      }
      return null;
  }

  export function removeMention(num) {
      if (!num) return;
      _cache.delete(String(num));
      removeMentionEntry(String(num)).catch(() => {});
  }
  