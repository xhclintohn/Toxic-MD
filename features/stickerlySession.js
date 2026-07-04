import crypto from 'crypto';
import https from 'https';
import JSZip from 'jszip';
import { getCachedSettings } from '../lib/settingsCache.js';

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

function toB64Url(buffer) {
    return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function isWebP(buffer) {
    return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
}

function isAnimatedWebP(buffer) {
    if (!isWebP(buffer)) return false;
    let offset = 12;
    while (offset < buffer.length - 8) {
        const chunk = buffer.toString('ascii', offset, offset + 4);
        const size = buffer.readUInt32LE(offset + 4);
        if (chunk === 'VP8X' && (buffer[offset + 8] & 0x02)) return true;
        if (chunk === 'ANIM' || chunk === 'ANMF') return true;
        offset += 8 + size + (size % 2);
    }
    return false;
}

function classifySticker(buffer) {
    return { ext: 'webp', mimetype: 'image/webp', isAnimated: isAnimatedWebP(buffer), isLottie: false };
}

async function makeTrayWebp(buffer) {
    const sharpMod = await import('sharp').catch(() => null);
    if (!sharpMod?.default) throw new Error('Install sharp first:\nnpm i sharp');
    return await sharpMod.default(buffer, { animated: false }).resize(252, 252, { fit: 'cover' }).webp().toBuffer();
}

async function makeBlankTrayWebp() {
    const sharpMod = await import('sharp').catch(() => null);
    if (!sharpMod?.default) throw new Error('Install sharp first:\nnpm i sharp');
    return await sharpMod.default({ create: { width: 252, height: 252, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).webp().toBuffer();
}

async function makeThumbnailJpeg(buffer) {
    const sharpMod = await import('sharp').catch(() => null);
    if (!sharpMod?.default) throw new Error('Install sharp first:\nnpm i sharp');
    return await sharpMod.default(buffer).resize(252, 252, { fit: 'cover' }).jpeg().toBuffer();
}

async function uploadToServer(client, buffer, { hkdf, mediaPath, mediaKey = crypto.randomBytes(32) }) {
    const expanded = Buffer.from(crypto.hkdfSync('sha256', mediaKey, Buffer.alloc(32), Buffer.from(hkdf), 112));
    const iv = expanded.subarray(0, 16);
    const cipherKey = expanded.subarray(16, 48);
    const macKey = expanded.subarray(48, 80);

    const cipher = crypto.createCipheriv('aes-256-cbc', cipherKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const mac = crypto.createHmac('sha256', macKey).update(iv).update(encrypted).digest().subarray(0, 10);
    const encBuffer = Buffer.concat([encrypted, mac]);

    const fileSha256 = sha256(buffer);
    const fileEncSha256 = sha256(encBuffer);

    const iq = await client.query({
        tag: 'iq',
        attrs: { id: client.generateMessageTag?.() ?? Date.now().toString(), to: 's.whatsapp.net', type: 'set', xmlns: 'w:m' },
        content: [{ tag: 'media_conn', attrs: {} }]
    });

    const mediaConn = iq.content?.find(v => v.tag === 'media_conn');
    if (!mediaConn) throw new Error('media_conn not found');
    const auth = mediaConn.attrs?.auth;
    if (!auth) throw new Error('media_conn auth not found');

    const hosts = (mediaConn.content || []).filter(v => v.tag === 'host').map(v => v.attrs?.hostname).filter(Boolean);
    if (!hosts.length) throw new Error('no upload hosts found');

    const token = encodeURIComponent(fileEncSha256.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''));

    let lastError;
    for (const host of hosts) {
        try {
            const json = await new Promise((resolve, reject) => {
                const url = new URL(`https://${host}${mediaPath}/${token}?auth=${encodeURIComponent(auth)}&token=${token}`);
                const req = https.request({
                    hostname: url.hostname,
                    port: 443,
                    path: url.pathname + url.search,
                    method: 'POST',
                    headers: { Origin: 'https://web.whatsapp.com', Referer: 'https://web.whatsapp.com/', 'Content-Type': 'application/octet-stream', 'Content-Length': encBuffer.length }
                }, (res) => {
                    let body = '';
                    res.on('data', c => body += c);
                    res.on('end', () => {
                        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`Upload failed ${res.statusCode}: ${body}`));
                        try { resolve(JSON.parse(body)); } catch { reject(new Error(`Response not JSON: ${body}`)); }
                    });
                });
                req.on('error', reject);
                req.write(encBuffer);
                req.end();
            });

            const directPath = json.direct_path ?? json.directPath ?? json.url ?? json.path;
            if (!directPath) throw new Error('directPath not found');
            return { mediaKey, fileLength: buffer.length, fileSha256, fileEncSha256, directPath, ...json };
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError ?? new Error('all upload hosts failed');
}

async function sendCustomStickerPack(client, m, pack, meta) {
    const zip = new JSZip();
    const stickersMetadata = [];

    for (const item of pack) {
        const fileName = `${toB64Url(sha256(item.buffer))}.${item.ext}`;
        zip.file(fileName, item.buffer);
        stickersMetadata.push({ fileName, isAnimated: item.isAnimated, emojis: [''], accessibilityLabel: '', isLottie: item.isLottie, mimetype: item.mimetype });
    }

    const trayIconFileName = 'tray_icon.webp';
    const traySource = pack.find(v => !v.isLottie)?.buffer;
    const trayBuffer = traySource ? await makeTrayWebp(traySource) : await makeBlankTrayWebp();
    zip.file(trayIconFileName, trayBuffer);

    const archive = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
    const packUpload = await uploadToServer(client, archive, { hkdf: 'WhatsApp Sticker Pack Keys', mediaPath: '/mms/sticker-pack' });

    const thumbnailBuffer = await makeThumbnailJpeg(trayBuffer);
    const thumbUpload = await uploadToServer(client, thumbnailBuffer, { hkdf: 'WhatsApp Sticker Pack Thumbnail Keys', mediaPath: '/mms/thumbnail-sticker-pack', mediaKey: packUpload.mediaKey });

    await client.relayMessage(m.chat, {
        messageContextInfo: { messageSecret: crypto.randomBytes(32) },
        stickerPackMessage: {
            stickerPackId: 'Pack_' + crypto.randomBytes(8).toString('hex'),
            name: meta.name,
            publisher: meta.publisher,
            packDescription: meta.description,
            stickers: stickersMetadata,
            fileLength: packUpload.fileLength,
            fileSha256: packUpload.fileSha256,
            fileEncSha256: packUpload.fileEncSha256,
            mediaKey: packUpload.mediaKey,
            directPath: packUpload.directPath,
            mediaKeyTimestamp: Math.floor(Date.now() / 1000),
            stickerPackSize: packUpload.fileLength,
            stickerPackOrigin: 2,
            trayIconFileName,
            thumbnailDirectPath: thumbUpload.directPath,
            thumbnailSha256: thumbUpload.fileSha256,
            thumbnailEncSha256: thumbUpload.fileEncSha256,
            thumbnailHeight: 252,
            thumbnailWidth: 252,
            imageDataHash: thumbUpload.fileSha256.toString('base64')
        }
    }, { quoted: m });
}

async function sendStickerPack(client, m, urls, meta) {
    const size = 30;
    const chunks = [];
    for (let i = 0; i < urls.length; i += size) chunks.push(urls.slice(i, i + size));

    for (const chunk of chunks) {
        const pack = [];
        for (const item of chunk) {
            try {
                const res = await fetch(item.image);
                if (!res.ok) continue;
                const buffer = Buffer.from(await res.arrayBuffer());
                pack.push({ buffer, ...classifySticker(buffer) });
            } catch (e) {
                console.log('[STICKERLY] fetch error:', e.message);
            }
        }
        if (!pack.length) continue;
        await sendCustomStickerPack(client, m, pack, meta);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

export default async (client, m) => {
    try {
        if (!m?.text || m.key?.fromMe) return;
        const picked = m.text.trim();
        if (!/^(10|[1-9])$/.test(picked)) return;

        const session = globalThis.stickerlySession?.[m.sender];
        if (!session) return;
        if (session.chat && session.chat !== m.chat) return;
        if (session.expiresAt && Date.now() > session.expiresAt) {
            delete globalThis.stickerlySession[m.sender];
            return;
        }

        const pick = session.packs[Number(picked) - 1];
        delete globalThis.stickerlySession[m.sender];
        if (!pick) return;

        await client.sendMessage(m.chat, {
            text: `❀ Sending *${pick.name}*\n❀ Total stickers: ${pick.files.length}\n❀ Sending: ${Math.min(pick.files.length, 30)}\n❀ ${pick.url}`
        }, { quoted: m });

        const urls = pick.files.slice(0, 30).map(file => ({ image: pick.prefix + file }));
        if (!urls.length) {
            await client.sendMessage(m.chat, { text: '❌ That pack has no stickers.' }, { quoted: m });
            return;
        }

        const settings = await getCachedSettings();
        await sendStickerPack(client, m, urls, {
            name: pick.name,
            publisher: settings?.packname || 'Toxic-MD',
            description: settings?.author || 'xh_clinton'
        });
    } catch (e) {
        console.log('[STICKERLY] error:', e.message);
    }
};
