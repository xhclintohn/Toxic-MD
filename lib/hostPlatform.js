import { getCachedSettings } from './settingsCache.js';
import { updateSetting } from '../database/config.js';

const TOXIC_HOSTING_PREFIX = 'txhost';

export async function isToxicHosting() {
    const settings = await getCachedSettings();
    if (settings?.hostplatform === 'toxichosting') return true;

    const marker = (process.env.TOXICHOSTING || '').toLowerCase().trim();
    const appName = (process.env.HEROKU_APP_NAME || '').toLowerCase();
    const detected = marker === '1' || marker === 'true' || appName.startsWith(TOXIC_HOSTING_PREFIX);

    if (detected) {
        try { await updateSetting('hostplatform', 'toxichosting'); } catch {}
        return true;
    }

    return false;
}

export async function detectHostingPlatform(fallbackLabel) {
    const hosted = await isToxicHosting();
    return hosted ? 'Toxic-Hosting 🟣' : fallbackLabel;
}
