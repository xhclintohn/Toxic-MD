import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { getCachedSettings } from '../lib/settingsCache.js';

const VO_WRAPPERS = ['viewOnceMessageV2Extension', 'viewOnceMessageV2', 'viewOnceMessage'];
const TRANSPORT = ['ephemeralMessage', 'documentWithCaptionMessage', 'deviceSentMessage', 'editedMessage', 'futureProofMessage'];

function deepUnwrap(message) {
    let cur = message;
    let guard = 0;
    while (cur && guard < 25) {
        const t = TRANSPORT.find((k) => cur[k]?.message);
        const v = VO_WRAPPERS.find((k) => cur[k]?.message);
        if (t) cur = cur[t].message;
        else if (v) cur = cur[v].message;
        else break;
        guard++;
    }
    return cur || message;
}

function isViewOnceRaw(message) {
    if (!message) return false;
    if (VO_WRAPPERS.some((k) => message[k])) return true;
    const inner = deepUnwrap(message);
    if (inner?.imageMessage?.viewOnce === true) return true;
    if (inner?.videoMessage?.viewOnce === true) return true;
    if (inner?.audioMessage?.viewOnce === true) return true;
    return false;
}

function pickMedia(inner) {
    if (!inner) return null;
    if (inner.imageMessage) return { type: 'image', msg: inner.imageMessage };
    if (inner.videoMessage) return { type: 'video', msg: inner.videoMessage };
    if (inner.audioMessage) return { type: 'audio', msg: inner.audioMessage };
    if (inner.pttMessage) return { type: 'audio', msg: inner.pttMessage };
    return null;
}

async function grab(client, mediaMsg, type) {
    try {
        const stream = await downloadContentFromMessage(mediaMsg, type);
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        const buf = Buffer.concat(chunks);
        if (buf?.length) return buf;
    } catch (e) {
        console.log('[ANTIVIEWONCE] stream download failed:', e.message);
    }
    try {
        const buf = await client.downloadMediaMessage(mediaMsg);
        if (buf?.length) return buf;
    } catch (e) {
        console.log('[ANTIVIEWONCE] fallback download failed:', e.message);
    }
    return null;
}

export default async (client, m) => {
    try {
        if (!m?.message || m.key?.fromMe) return;

        const settings = await getCachedSettings();
        if (!settings?.antiviewonce) return;

        if (!isViewOnceRaw(m.message)) return;

        const inner = deepUnwrap(m.message);
        const media = pickMedia(inner);
        if (!media) return;

        let dest = client.user?.id || '';
        if (dest.includes(':')) dest = dest.split(':')[0] + '@s.whatsapp.net';
        if (!dest) return;

        const buf = await grab(client, media.msg, media.type);
        if (!buf?.length) {
            console.log('[ANTIVIEWONCE] media could not be downloaded');
            return;
        }

        const senderNum = (m.sender || m.key?.participant || m.key?.remoteJid || '').split('@')[0].split(':')[0] || 'Unknown';
        const chatType = (m.chat || m.key?.remoteJid || '').endsWith('@g.us') ? 'Group 👥' : 'DM 💬';
        const ts = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
        const extra = (media.msg.caption || '').trim();
        const mentions = m.sender ? [m.sender] : [];
        const caption = `╭─❏ 「 VIEW ONCE RETRIEVED 👁」\n│ Sender: @${senderNum}\n│ Chat: ${chatType}\n│ Time: ${ts}\n${extra ? '│ Caption: ' + extra + '\n' : ''}│ \n│ Nothing slips past me. 😈\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (media.type === 'image') {
            await client.sendMessage(dest, { image: buf, caption, mentions });
        } else if (media.type === 'video') {
            await client.sendMessage(dest, { video: buf, caption, mentions });
        } else {
            const mime = media.msg.mimetype || 'audio/ogg; codecs=opus';
            await client.sendMessage(dest, { audio: buf, mimetype: mime, ptt: media.msg.ptt !== false });
            await client.sendMessage(dest, { text: caption, mentions });
        }
    } catch (e) {
        console.log('[ANTIVIEWONCE] error:', e.message);
    }
};
