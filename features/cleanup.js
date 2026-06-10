import { readdirSync, statSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const TMP_DIRS      = ['./tmp', './temp'];
const MAX_AGE_MS    = 60 * 60 * 1000;
const INTERVAL_MS   = 60 * 60 * 1000;
const MEM_CHECK_MS  = 5 * 60 * 1000;

const MAX_GROUP_CACHE   = 150;
const TRIM_GROUP_CACHE  = 75;
const MAX_PRESENCE_MAP  = 300;
const TRIM_PRESENCE_MAP = 150;

function cleanTmp(maxAgeMs = MAX_AGE_MS) {
    const now = Date.now();
    for (const dir of TMP_DIRS) {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
            continue;
        }
        for (const file of readdirSync(dir)) {
            const fp = join(dir, file);
            try {
                const stat = statSync(fp);
                if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
                    unlinkSync(fp);
                }
            } catch {}
        }
    }
}

function cleanMemory() {
    try {
        if (global._toxicGroupMetaCache instanceof Map && global._toxicGroupMetaCache.size > MAX_GROUP_CACHE) {
            const entries = [...global._toxicGroupMetaCache.entries()]
                .sort((a, b) => (a[1].time || 0) - (b[1].time || 0));
            global._toxicGroupMetaCache.clear();
            entries.slice(-TRIM_GROUP_CACHE).forEach(([k, v]) => global._toxicGroupMetaCache.set(k, v));
        }
    } catch {}

    try {
        if (global._toxicPresenceMap instanceof Map && global._toxicPresenceMap.size > MAX_PRESENCE_MAP) {
            const entries = [...global._toxicPresenceMap.entries()]
                .sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));
            global._toxicPresenceMap.clear();
            entries.slice(-TRIM_PRESENCE_MAP).forEach(([k, v]) => global._toxicPresenceMap.set(k, v));
        }
    } catch {}

    try {
        if (global._statusSeen instanceof Set && global._statusSeen.size > 200) {
            global._statusSeen.clear();
        }
    } catch {}

    if (typeof global.gc === 'function') {
        try { global.gc(); } catch {}
    }
}

function startCleanupScheduler() {
    cleanTmp();
    cleanMemory();

    setInterval(() => cleanTmp(), INTERVAL_MS);

    setInterval(() => {
        cleanMemory();
        cleanTmp(30 * 60 * 1000);
    }, MEM_CHECK_MS);
}

export { cleanTmp, cleanMemory, startCleanupScheduler };

startCleanupScheduler();
