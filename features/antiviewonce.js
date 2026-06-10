import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { getCachedSettings } from '../lib/settingsCache.js';

const VIEW_ONCE_TYPES = new Set([
    'viewOnceMessage',
    'viewOnceMessageV2',
    'viewOnceMessageV2Extension'
]);

const AUDIO_TYPES = new Set([
    'audioMessage',
    'pttMessage'
]);

function isViewOnce(m) {
    if (!m?.message) return false;
    if (VIEW_ONCE_TYPES.has(m.mtype)) return true;
    const keys = Object.keys(m.message);
    if (keys.some(k => VIEW_ONCE_TYPES.has(k))) return true;
    if (m.msg?.viewOnce === true) return true;
    if (m.msg?.imageMessage?.viewOnce === true) return true;
    if (m.msg?.videoMessage?.viewOnce === true) return true;
    return false;
}

function extractMedia(m) {
    if (m.mtype === 'viewOnceMessage') {
        const inner = m.message?.viewOnceMessage?.message || {};
        const t = Object.keys(inner).find(k => k !== 'messageContextInfo') || '';
        if (t === 'imageMessage') return { image: m.msg || inner.imageMessage, video: null, audio: null };
        if (t === 'videoMessage') return { image: null, video: m.msg || inner.videoMessage, audio: null };
        if (AUDIO_TYPES.has(t)) return { image: null, video: null, audio: m.msg || inner[t] };
    }
    if (m.mtype === 'viewOnceMessageV2' || m.mtype === 'viewOnceMessageV2Extension') {
        const inner = m.msg?.message || {};
        return {
            image: inner.imageMessage || null,
            video: inner.videoMessage || null,
            audio: inner.audioMessage || inner.pttMessage || null
        };
    }
    for (const k of Object.keys(m.message || {})) {
        if (!VIEW_ONCE_TYPES.has(k)) continue;
        const wrapper = m.message[k];
        const inner = wrapper?.message || wrapper || {};
        if (inner.imageMessage) return { image: inner.imageMessage, video: null, audio: null };
        if (inner.videoMessage) return { image: null, video: inner.videoMessage, audio: null };
        if (inner.audioMessage) return { image: null, video: null, audio: inner.audioMessage };
    }
    if (m.msg?.viewOnce === true) {
        const mime = m.msg?.mimetype || '';
        if (mime.startsWith('video')) return { image: null, video: m.msg, audio: null };
        if (mime.startsWith('audio')) return { image: null, video: null, audio: m.msg };
        return { image: m.msg, video: null, audio: null };
    }
    return { image: null, video: null, audio: null };
}

async function tryDownload(client, mediaMsg, type) {
    try {
        const stream = await downloadContentFromMessage(mediaMsg, type);
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buf = Buffer.concat(chunks);
        if (buf.length > 0) return buf;
    } catch {}
    try {
        const buf = await client.downloadMediaMessage(mediaMsg);
        if (buf?.length > 0) return buf;
    } catch {}
    return null;
}

export default async (client, m) => {
    try {
        if (!m?.message || m.key?.fromMe) return;
        if (!isViewOnce(m)) return;

        const settings = await getCachedSettings();
        if (!settings?.antiviewonce) return;

        let dest = client.user?.id || '';
        if (dest.includes(':')) dest = dest.split(':')[0] + '@s.whatsapp.net';
        if (!dest) return;

        const { image: imageMsg, video: videoMsg, audio: audioMsg } = extractMedia(m);
        if (!imageMsg && !videoMsg && !audioMsg) return;

        const senderNum = (m.sender || m.key?.participant || m.key?.remoteJid || '').split('@')[0].split(':')[0] || 'Unknown';
        const chatType = (m.chat || m.key?.remoteJid || '').endsWith('@g.us') ? 'Group 👥' : 'DM 💬';
        const chatId = m.chat || m.key?.remoteJid || '';
        const ts = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
        const mentions = m.sender ? [m.sender] : [];

        const caption = `╭─❏ 「 VIEW ONCE RETRIEVED 👁」\n│ Sender: @${senderNum}\n│ Chat: ${chatType}\n│ Time: ${ts}\n│ \n│ Nothing slips past me. 😈\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (imageMsg) {
            const buf = await tryDownload(client, imageMsg, 'image');
            if (buf?.length > 0) {
                await client.sendMessage(dest, { image: buf, caption, mentions });
                if (chatId !== dest) {
                    await client.sendMessage(chatId, { image: buf, caption: `╭─❏ 「 ANTIVIEWONCE」\n│ View-once saved and forwarded. 😈\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`, mentions }).catch(() => {});
                }
            }
        } else if (videoMsg) {
            const buf = await tryDownload(client, videoMsg, 'video');
            if (buf?.length > 0) {
                await client.sendMessage(dest, { video: buf, caption, mentions });
                if (chatId !== dest) {
                    await client.sendMessage(chatId, { text: `╭─❏ 「 ANTIVIEWONCE」\n│ View-once video saved and forwarded. 😈\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`, mentions }).catch(() => {});
                }
            }
        } else if (audioMsg) {
            const buf = await tryDownload(client, audioMsg, 'audio');
            if (buf?.length > 0) {
                const mime = audioMsg.mimetype || 'audio/ogg; codecs=opus';
                const isPtt = mime.includes('ogg') || mime.includes('opus');
                await client.sendMessage(dest, { audio: buf, mimetype: mime, ptt: isPtt, caption, mentions });
            }
        }
    } catch {}
};
