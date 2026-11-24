import { getCachedSettings } from '../lib/settingsCache.js';

const EMOJIS = ['❤️', '🔥', '😂', '😮', '😢', '🙏', '👍', '🎉', '😍', '🤔', '😎', '💯', '✨', '🌟', '👏', '🥰', '😅', '😭', '🤩', '🫡', '😁', '🥳', '😱', '🤗', '👀', '💪', '🙌', '😴', '🤣', '😘', '😉', '🥺', '😆', '🤝', '👌', '🫶', '😌', '🤯', '🥲', '😜'];

let _lastEmoji = '';

function normalizeMode(val) {
    if (val === true || val === 1) return 'all';
    if (typeof val === 'string') {
        const v = val.toLowerCase().trim();
        if (v === 'true' || v === '1' || v === 'on' || v === 'all' || v === 'everywhere') return 'all';
        if (v === 'dm' || v === 'dms' || v === 'private' || v === 'pm') return 'dm';
        if (v === 'gc' || v === 'group' || v === 'groups') return 'gc';
    }
    return 'off';
}

export default async (client, m) => {
    try {
        if (!m?.key?.id || m.key?.fromMe) return;
        const remoteJid = m.key?.remoteJid || m.chat || '';
        if (remoteJid.includes('@broadcast') || remoteJid.includes('@newsletter')) return;
        const settings = await getCachedSettings();
        const mode = normalizeMode(settings?.autoreact);
        if (mode === 'off') return;
        const isGroup = m.isGroup === true || String(m.chat || '').endsWith('@g.us');
        if (mode === 'dm' && isGroup) return;
        if (mode === 'gc' && !isGroup) return;
        let emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        if (emoji === _lastEmoji) emoji = EMOJIS[(EMOJIS.indexOf(emoji) + 1) % EMOJIS.length];
        _lastEmoji = emoji;
        await client.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    } catch (e) {
        console.log('❌ [AUTOREACT]:', e?.message || e);
    }
};
