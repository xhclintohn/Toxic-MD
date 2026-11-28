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

export default async (context) => {
    const { client, m, store } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (!m.quoted) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, box('VIEW ONCE', 'Reply to a view-once image or video.'));
    }

    const log = (...a) => console.error('[VVX]', ...a);
    const fail = async (text) => {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, box('VIEW ONCE', text));
    };

    try {
        const quoted = m.msg?.contextInfo?.quotedMessage || null;
        const viewOnce = quoted?.viewOnceMessageV2?.message || quoted?.viewOnceMessageV2Extension?.message || quoted?.viewOnceMessage || quoted;
        const imageMsg = viewOnce?.imageMessage || viewOnce?.imageMessageV2 || viewOnce?.imageMessageV1;
        const videoMsg = viewOnce?.videoMessage || viewOnce?.videoMessageV2 || viewOnce?.videoMessageV1;
        const audioMsg = viewOnce?.audioMessage || viewOnce?.audioMessageV2 || viewOnce?.audioMessageV1;
        const mediaMessage = imageMsg || videoMsg || audioMsg;
        let kind = imageMsg ? 'image' : videoMsg ? 'video' : audioMsg ? 'audio' : null;
        let pickedMedia = null;

        if (!mediaMessage) {
            return await fail('This message does not contain\n│ view-once media.');
        }

        let buffer = null;
        let lastErr = null;
        if (hasKeys(mediaMessage)) {
            try {
                buffer = await client.downloadMediaMessage(mediaMessage);
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
                const handler = client.viewOnceHandler;
                if (handler?.downloadSenderCopy) {
                    const got = await handler.downloadSenderCopy(m.quoted?.sender || '', kind);
                    if (got?.buffer?.length) {
                        buffer = got.buffer;
                        kind = got.type === 'ptv' ? 'video' : (got.type || kind);
                        pickedMedia = { mimetype: got.mimetype, ptt: true };
                    }
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
                const kindOf = (x) => {
                    if (x.mtype) return x.mtype.replace('Message', '');
                    return mediaKind(unwrapVO(x.message || null));
                };
                const all = cache.map((x) => {
                    const mm = mediaOf(x);
                    const ts = x.timestamp || (x.messageTimestamp ? Number(x.messageTimestamp) * 1000 : 0);
                    return { id: x.key?.id, mtype: x.mtype, sender: x.sender || x.key?.participant || '', ts, hasKeys: hasKeys(mm), mm: mm || null, kind: kindOf(x) };
                }).filter(c => c.hasKeys && (Date.now() - c.ts) < 86400000);
                const mine = all.filter(c => c.sender === sender).sort((a, b) => b.ts - a.ts);
                if (mine.length) {
                    const pick = mine[0];
                    buffer = await client.downloadMediaMessage(pick.mm);
                    if (buffer && buffer.length) {
                        kind = pick.kind || kind;
                        pickedMedia = pick.mm;
                    }
                }
            } catch (e) {
                lastErr = e;
            }
        }

        if (!buffer || !buffer.length) {
            if (!hasKeys(mediaMessage)) {
                return await fail("WhatsApp stripped the media from this view-once, so there's nothing to download. 😤\n│ Turn .antiviewonce on BEFORE someone sends one — then I'll save it the moment it arrives.");
            }
            return await fail(`Failed to download media.${lastErr ? '\n│ ' + String(lastErr.message || lastErr).slice(0, 80) : ''}`);
        }

        const dest = m.chat;
        const caption = box('VIEW ONCE', "Here's your media, perv.");

        if (kind === 'image') {
            await client.sendMessage(dest, { image: buffer, caption });
        } else if (kind === 'video') {
            await client.sendMessage(dest, { video: buffer, caption });
        } else {
            const mime = (pickedMedia || audioMsg)?.mimetype || 'audio/ogg; codecs=opus';
            const isPtt = (pickedMedia || audioMsg)?.ptt !== false;
            await client.sendMessage(dest, { audio: buffer, ptt: isPtt, mimetype: mime });
        }
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    } catch (error) {
        log('top-level error:', error?.message || error, error?.stack || '');
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        sendInteractive(client, m, box('ERROR', `Failed to retrieve view-once media.\n│ ${String(error?.message || error).slice(0, 80)}`));
    }
};
