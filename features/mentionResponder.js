import { getMentionAsync } from '../lib/mentionStore.js';
import { sendJson } from '../lib/botFunctions.js';

const revive = (x) => Array.isArray(x) ? x.map(revive) : (x && typeof x === 'object') ? (typeof x.__b64__ === 'string' ? Buffer.from(x.__b64__, 'base64') : (typeof x.b64 === 'string' ? Buffer.from(x.b64, 'base64') : Object.fromEntries(Object.entries(x).map(([k,v]) => [k, revive(v)])))) : x;

const _cooldown = new Map();
const COOLDOWN_MS = 20000;

export default async (client, m) => {
    try {
        if (!m?.message || m.key?.fromMe) return;
        if (!m.chat?.endsWith('@g.us')) return;

        const _rawBotId = client.user?.id || '';
        const botNum = _rawBotId.split('@')[0].split(':')[0];
        const botLid = (client.user?.lid || '').split('@')[0].split(':')[0];
        if (!botNum) return;

        const bodyStr = m.body || m.text || '';
        const _allMentioned = [
            ...(m.mentionedJid || []),
            ...(m.msg?.contextInfo?.mentionedJid || []),
            ...(m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []),
            ...(m.message?.imageMessage?.contextInfo?.mentionedJid || []),
            ...(m.message?.videoMessage?.contextInfo?.mentionedJid || []),
        ];

        const _numMatch = (j) => {
            const jk = (j || '').split('@')[0].split(':')[0];
            return (botNum && jk === botNum) || (botLid && jk === botLid);
        };

        const isMentionedInBody = (botNum.length > 4 && bodyStr.includes('@' + botNum)) ||
            (botLid.length > 4 && bodyStr.includes('@' + botLid));
        const isMentionedInList = _allMentioned.some(_numMatch);

        if (!isMentionedInBody && !isMentionedInList) return;

        const entry = await getMentionAsync(botNum);
        if (!entry) return;

        const key = m.chat + ':' + botNum;
        const last = _cooldown.get(key) || 0;
        if (Date.now() - last < COOLDOWN_MS) return;
        _cooldown.set(key, Date.now());

        if (entry.kind === 'text' && entry.text) {
            await client.sendMessage(m.chat, { text: entry.text }, { quoted: m });
        } else if (entry.kind === 'json' && entry.data) {
            try { await sendJson(client, m.chat, revive(entry.data), { quoted: m }); } catch (e) {}
        }
    } catch (e) {}
};
