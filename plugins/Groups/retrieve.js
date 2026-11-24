import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => {
    const lines = String(body).split('\n').map(l => l.startsWith('│') ? l : `│ ${l}`).join('\n');
    return `╭─❏ 「 ${title} 」\n${lines}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

const unwrapVO = (msg) => {
    if (!msg) return null;
    const voKeys = ['viewOnceMessageV2Extension', 'viewOnceMessageV2', 'viewOnceMessage'];
    for (const k of voKeys) {
        if (msg[k]?.message) return msg[k].message;
    }
    return msg;
};

const mediaKind = (inner) => {
    if (!inner) return null;
    if (inner.imageMessage) return 'image';
    if (inner.videoMessage) return 'video';
    if (inner.audioMessage) return 'audio';
    return null;
};

const hasKeys = (mm) => !!(mm && (mm.url || mm.directPath || mm.mediaKey));

async function sendRetrieved(client, m, dest, buffer, kind, mediaMsg) {
    const senderNum = (m.quoted?.sender || '').split('@')[0].split(':')[0] || 'Unknown';
    const caption = box('VIEW ONCE RETRIEVED', `👁 Sender: @${senderNum}\n│ 📍 Chat: ${m.isGroup ? 'Group' : 'DM'}\n│ \n│ You sneaky little thing. 😈`);
    const mentions = m.quoted?.sender ? [m.quoted.sender] : [];
    if (kind === 'image') {
        await client.sendMessage(dest, { image: buffer, caption, mentions });
    } else if (kind === 'video') {
        await client.sendMessage(dest, { video: buffer, caption, mentions });
    } else {
        const mime = mediaMsg?.mimetype || 'audio/ogg; codecs=opus';
        const isPtt = mediaMsg?.ptt !== false;
        await client.sendMessage(dest, { audio: buffer, ptt: isPtt, mimetype: mime });
        await client.sendMessage(dest, { text: caption, mentions });
    }
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
}

export default async (context) => {
    const { client, m, store } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (!m.quoted) {
        return await sendInteractive(client, m, box('RETRIEVE', 'Reply to a view-once message, genius. 🙄'));
    }

    const log = (...a) => console.error('[RETRIEVE]', ...a);
    const fail = async (text) => {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, box('RETRIEVE', text));
    };

    try {
        let dest = client.user?.id || '';
        if (dest.includes(':')) dest = dest.split(':')[0] + '@s.whatsapp.net';
        if (!dest) dest = client.decodeJid ? client.decodeJid(client.user.id) : client.user.id;

        const mediaType = m.quoted?.mtype || '';
        const isImage = mediaType === 'imageMessage' || !!(m.quoted?.imageMessage);
        const isVideo = mediaType === 'videoMessage' || !!(m.quoted?.videoMessage);
        const isAudio = mediaType === 'audioMessage' || !!(m.quoted?.audioMessage);

        if (isImage || isVideo || isAudio) {
            const kind = isImage ? 'image' : isVideo ? 'video' : 'audio';
            try {
                const buffer = await m.quoted.download();
                if (buffer && buffer.length) {
                    return await sendRetrieved(client, m, dest, buffer, kind, m.quoted);
                }
            } catch (e) {
            }
        }

        const ctx = m.msg?.contextInfo || m.message?.extendedTextMessage?.contextInfo || {};
        const quotedMsg = ctx.quotedMessage || {};
        const inner = unwrapVO(quotedMsg);
        const kind = mediaKind(inner);

        if (!kind) {
            return await fail("That's not a view-once. Stop wasting my time. 😒");
        }

        const mediaMsg = inner[kind + 'Message'];

        let buffer = null;
        let lastErr = null;
        if (hasKeys(mediaMsg)) {
            try {
                buffer = await client.downloadMediaMessage(mediaMsg);
            } catch (e) {
                lastErr = e;
            }
        }

        if (!buffer || !buffer.length) {
            try {
                const full = await m.getQuotedObj?.();
                const fullInner = unwrapVO(full?.message || null);
                const fullKind = mediaKind(fullInner);
                const fullMedia = fullKind ? fullInner[fullKind + 'Message'] : null;
                if (fullMedia && hasKeys(fullMedia)) {
                    buffer = await client.downloadMediaMessage(fullMedia);
                }
            } catch (e) {
                lastErr = e;
            }
        }

        if (!buffer || !buffer.length) {
            try {
                const sender = m.quoted?.sender || '';
                const cache = Array.isArray(store?.chats?.[m.chat]) ? store.chats[m.chat] : [];
                const mediaOf = (x) => {
                    if (!x) return null;
                    if (x.msg) return x.msg;
                    const raw = x.message || null;
                    if (!raw) return null;
                    const inner = unwrapVO(raw);
                    const k = mediaKind(inner);
                    return k ? inner[k + 'Message'] : null;
                };
                const all = cache.map((x) => {
                    const mm = mediaOf(x);
                    const ts = x.timestamp || (x.messageTimestamp ? Number(x.messageTimestamp) * 1000 : 0);
                    return { id: x.key?.id, mtype: x.mtype, sender: x.sender || x.key?.participant || '', ts, hasKeys: hasKeys(mm), mm: mm || null };
                }).filter(c => c.hasKeys && (Date.now() - c.ts) < 300000);
                const mine = all.filter(c => c.sender === sender).sort((a, b) => b.ts - a.ts);
                if (mine.length) {
                    const pick = mine[0];
                    buffer = await client.downloadMediaMessage(pick.mm);
                }
            } catch (e) {
                lastErr = e;
            }
        }

        if (!buffer || !buffer.length) {
            if (!hasKeys(mediaMsg)) {
                return await fail("WhatsApp stripped the media from this view-once, so there's nothing to download. 😤\n│ Turn .antiviewonce on BEFORE someone sends one — then I'll save it the moment it arrives.");
            }
            return await fail(`Couldn't download it. WhatsApp already nuked it. 😤${lastErr ? '\n│ ' + String(lastErr.message || lastErr).slice(0, 80) : ''}`);
        }

        return await sendRetrieved(client, m, dest, buffer, kind, mediaMsg);
    } catch (e) {
        log('top-level error:', e?.message || e, e?.stack || '');
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await sendInteractive(client, m, box('RETRIEVE', `Something broke. WhatsApp's fault, not mine. 😤\n│ ${String(e?.message || e).slice(0, 80)}`));
    }
};
