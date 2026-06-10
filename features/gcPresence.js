import { getGroupSettings } from '../database/config.js';

export default async (client, m) => {
    if (!m.isGroup) return;

    const groupSettings = await getGroupSettings(m.chat);
    const gcpresence = groupSettings?.gcpresence;
    if (gcpresence) {
        let presenceTypes = ["recording", "composing"];
        let selectedPresence = presenceTypes[Math.floor(Math.random() * presenceTypes.length)];
        try {
            await client.sendPresenceUpdate(selectedPresence, m.chat);
        } catch (e) {
        }
    }
};