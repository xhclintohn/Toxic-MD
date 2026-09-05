import { getCachedSettings } from './settingsCache.js';

export async function getDeviceMode() {
    try {
        const settings = await getCachedSettings();
        const val = (settings?.device || process.env.DEVICE || 'default').toLowerCase().trim();
        return val === 'ios' ? 'ios' : 'android';
    } catch {
        const envVal = (process.env.DEVICE || 'default').toLowerCase().trim();
        return envVal === 'ios' ? 'ios' : 'android';
    }
}
