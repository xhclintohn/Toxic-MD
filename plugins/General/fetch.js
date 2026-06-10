import fetch from 'node-fetch';
import { sendInteractive } from '../../lib/sendInteractive.js';

const MIME_MAP = {
    'audio/mpeg': { type: 'audio', ext: 'mp3', mimetype: 'audio/mpeg' },
    'audio/mp4': { type: 'audio', ext: 'm4a', mimetype: 'audio/mp4' },
    'audio/ogg': { type: 'audio', ext: 'ogg', mimetype: 'audio/ogg' },
    'audio/wav': { type: 'audio', ext: 'wav', mimetype: 'audio/wav' },
    'audio/flac': { type: 'audio', ext: 'flac', mimetype: 'audio/flac' },
    'audio/aac': { type: 'audio', ext: 'aac', mimetype: 'audio/aac' },
    'audio/webm': { type: 'audio', ext: 'weba', mimetype: 'audio/webm' },
    'video/mp4': { type: 'video', ext: 'mp4', mimetype: 'video/mp4' },
    'video/webm': { type: 'video', ext: 'webm', mimetype: 'video/webm' },
    'video/x-matroska': { type: 'video', ext: 'mkv', mimetype: 'video/x-matroska' },
    'video/quicktime': { type: 'video', ext: 'mov', mimetype: 'video/quicktime' },
    'video/x-msvideo': { type: 'video', ext: 'avi', mimetype: 'video/x-msvideo' },
    'video/3gpp': { type: 'video', ext: '3gp', mimetype: 'video/3gpp' },
    'image/jpeg': { type: 'image', ext: 'jpg', mimetype: 'image/jpeg' },
    'image/png': { type: 'image', ext: 'png', mimetype: 'image/png' },
    'image/gif': { type: 'image', ext: 'gif', mimetype: 'image/gif' },
    'image/webp': { type: 'image', ext: 'webp', mimetype: 'image/webp' },
    'image/bmp': { type: 'image', ext: 'bmp', mimetype: 'image/bmp' },
    'image/svg+xml': { type: 'document', ext: 'svg', mimetype: 'image/svg+xml' },
    'application/pdf': { type: 'document', ext: 'pdf', mimetype: 'application/pdf' },
    'application/zip': { type: 'document', ext: 'zip', mimetype: 'application/zip' },
    'application/x-zip-compressed': { type: 'document', ext: 'zip', mimetype: 'application/zip' },
    'application/x-rar-compressed': { type: 'document', ext: 'rar', mimetype: 'application/x-rar-compressed' },
    'application/msword': { type: 'document', ext: 'doc', mimetype: 'application/msword' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { type: 'document', ext: 'docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    'application/vnd.ms-excel': { type: 'document', ext: 'xls', mimetype: 'application/vnd.ms-excel' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { type: 'document', ext: 'xlsx', mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    'application/vnd.ms-powerpoint': { type: 'document', ext: 'ppt', mimetype: 'application/vnd.ms-powerpoint' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { type: 'document', ext: 'pptx', mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
    'application/octet-stream': { type: 'document', ext: 'bin', mimetype: 'application/octet-stream' },
    'application/json': { type: 'json', ext: 'json', mimetype: 'application/json' },
    'text/html': { type: 'html', ext: 'html', mimetype: 'text/html' },
    'text/plain': { type: 'text', ext: 'txt', mimetype: 'text/plain' },
    'text/csv': { type: 'document', ext: 'csv', mimetype: 'text/csv' },
    'text/xml': { type: 'document', ext: 'xml', mimetype: 'text/xml' },
    'application/xml': { type: 'document', ext: 'xml', mimetype: 'application/xml' }
};

function getMimeInfo(contentType) {
    if (!contentType) return null;
    const base = contentType.split(';')[0].trim().toLowerCase();
    if (MIME_MAP[base]) return MIME_MAP[base];
    for (const [key, val] of Object.entries(MIME_MAP)) {
        if (base.startsWith(key.split('/')[0] + '/')) return val;
    }
    return null;
}

function detectByMagicBytes(buf) {
    if (!buf || buf.length < 4) return null;
    const b = buf;
    if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return MIME_MAP['image/jpeg'];
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return MIME_MAP['image/png'];
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return MIME_MAP['image/gif'];
    if (buf.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return MIME_MAP['image/webp'];
    if (b[0] === 0x42 && b[1] === 0x4D) return MIME_MAP['image/bmp'];
    if (buf.length >= 8 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return MIME_MAP['video/mp4'];
    if (b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3) return MIME_MAP['video/webm'];
    if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) return MIME_MAP['audio/mpeg'];
    if (b[0] === 0xFF && (b[1] & 0xE0) === 0xE0) return MIME_MAP['audio/mpeg'];
    if (buf.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x41 && b[10] === 0x56 && b[11] === 0x45) return MIME_MAP['audio/wav'];
    if (b[0] === 0x66 && b[1] === 0x4C && b[2] === 0x61 && b[3] === 0x43) return MIME_MAP['audio/flac'];
    if (b[0] === 0x4F && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53) return MIME_MAP['audio/ogg'];
    if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return MIME_MAP['application/pdf'];
    if (b[0] === 0x50 && b[1] === 0x4B && b[2] === 0x03 && b[3] === 0x04) return MIME_MAP['application/zip'];
    return null;
}

function getFilenameFromUrl(url, ext) {
    try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        const last = parts[parts.length - 1] || 'file';
        return last.includes('.') ? last : `${last}.${ext}`;
    } catch {
        return `file_${Date.now()}.${ext}`;
    }
}

export default {
    name: 'fetch',
    aliases: ['get', 'web', 'curl'],
    description: 'Fetches a URL and sends the result as the correct media type',
    run: async (context) => {
        const { client, m, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const quotedText = m.quoted && (m.quoted.text || m.quoted.caption || '');
        const bodyUrl = m.body.replace(new RegExp(`^${prefix}(fetch|get|url|web|curl)\\s*`, 'i'), '').trim();
        const raw = (bodyUrl || quotedText || '').trim();

        if (!raw) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return sendInteractive(client, m, `╭─❏ 「 FETCH」\n│ You forgot the URL, genius.\n│ Usage: ${prefix}fetch https://example.com\n│ Or reply to a message containing a URL.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const urlMatch = raw.match(/https?:\/\/[^\s]+/i) || raw.match(/[^\s]+\.[a-z]{2,}/i);
        let targetUrl = urlMatch ? urlMatch[0] : raw;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 30000,
                follow: 5
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const contentType = response.headers.get('content-type') || '';
            let mimeInfo = getMimeInfo(contentType);

            if (!mimeInfo || mimeInfo.type === 'document') {
                try {
                    const urlPath = new URL(targetUrl).pathname.toLowerCase().split('?')[0];
                    const extFallback = {
                        '.jpg': MIME_MAP['image/jpeg'], '.jpeg': MIME_MAP['image/jpeg'],
                        '.png': MIME_MAP['image/png'], '.gif': MIME_MAP['image/gif'],
                        '.webp': MIME_MAP['image/webp'], '.bmp': MIME_MAP['image/bmp'],
                        '.mp4': MIME_MAP['video/mp4'], '.webm': MIME_MAP['video/webm'],
                        '.mkv': MIME_MAP['video/x-matroska'], '.mov': MIME_MAP['video/quicktime'],
                        '.mp3': MIME_MAP['audio/mpeg'], '.m4a': MIME_MAP['audio/mp4'],
                        '.ogg': MIME_MAP['audio/ogg'], '.wav': MIME_MAP['audio/wav'],
                        '.flac': MIME_MAP['audio/flac'], '.aac': MIME_MAP['audio/aac'],
                        '.pdf': MIME_MAP['application/pdf'], '.zip': MIME_MAP['application/zip']
                    };
                    for (const [ext, info] of Object.entries(extFallback)) {
                        if (urlPath.endsWith(ext)) { mimeInfo = info; break; }
                    }
                } catch {}
            }

            const buffer = Buffer.from(await response.arrayBuffer());

            if (!mimeInfo || mimeInfo.type === 'document' || mimeInfo.ext === 'bin') {
                const detected = detectByMagicBytes(buffer);
                if (detected) mimeInfo = detected;
            }

            const fileName = getFilenameFromUrl(targetUrl, mimeInfo?.ext || 'bin');
            if ((!mimeInfo || mimeInfo.type === 'html') && buffer.length > 50000) {
                mimeInfo = { type: 'document', ext: 'bin', mimetype: contentType.split(';')[0].trim() || 'application/octet-stream' };
            }

            if (mimeInfo?.type === 'audio') {
                await client.sendMessage(m.chat, {
                    audio: buffer,
                    mimetype: mimeInfo.mimetype,
                    fileName,
                    ptt: false
                });

            } else if (mimeInfo?.type === 'video') {
                await client.sendMessage(m.chat, {
                    video: buffer,
                    mimetype: mimeInfo.mimetype,
                    fileName,
                    caption: `╭─❏ 「 FETCH RESULT」\n│ URL: ${targetUrl}\n│ Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                });

            } else if (mimeInfo?.type === 'image') {
                await client.sendMessage(m.chat, {
                    image: buffer,
                    caption: `╭─❏ 「 FETCH RESULT」\n│ URL: ${targetUrl}\n│ Type: ${contentType.split(';')[0]}\n│ Size: ${(buffer.length / 1024).toFixed(2)} KB\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                });

            } else if (mimeInfo?.type === 'document') {
                await client.sendMessage(m.chat, {
                    document: buffer,
                    mimetype: mimeInfo.mimetype,
                    fileName,
                    caption: `╭─❏ 「 FETCH RESULT」\n│ URL: ${targetUrl}\n│ Type: ${contentType.split(';')[0]}\n│ Size: ${(buffer.length / 1024).toFixed(2)} KB\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                });

            } else if (mimeInfo?.type === 'json') {
                let pretty;
                try { pretty = JSON.stringify(JSON.parse(buffer.toString()), null, 2); } catch { pretty = buffer.toString(); }
                if (pretty.length > 3000) {
                    await client.sendMessage(m.chat, {
                        document: Buffer.from(pretty),
                        mimetype: 'application/json',
                        fileName: `fetch_${Date.now()}.json`,
                        caption: `╭─❏ 「 FETCH RESULT」\n│ URL: ${targetUrl}\n│ Type: JSON (too large for text)\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                    });
                } else {
                    await sendInteractive(client, m, `╭─❏ 「 FETCH RESULT」\n│ URL: ${targetUrl}\n│ Type: JSON\n│ \n${pretty}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }

            } else if (mimeInfo?.type === 'html') {
                const html = buffer.toString();
                const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
                const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : 'No title';
                const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300);
                await sendInteractive(client, m, `╭─❏ 「 FETCH RESULT」\n│ URL: ${targetUrl}\n│ Status: ${response.status}\n│ Type: HTML\n│ Title: ${title}\n│ Preview: ${plain}...\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

            } else if (mimeInfo?.type === 'text') {
                const text = buffer.toString();
                if (text.length > 3000) {
                    await client.sendMessage(m.chat, {
                        document: Buffer.from(text),
                        mimetype: 'text/plain',
                        fileName: `fetch_${Date.now()}.txt`,
                        caption: `╭─❏ 「 FETCH RESULT」\n│ URL: ${targetUrl}\n│ Type: Plain text (too large, sent as file)\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                    });
                } else {
                    await sendInteractive(client, m, `╭─❏ 「 FETCH RESULT」\n│ URL: ${targetUrl}\n│ Type: Plain Text\n│ \n${text}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }

            } else {
                const ext = (contentType.split('/')[1] || 'bin').split(';')[0].trim();
                await client.sendMessage(m.chat, {
                    document: buffer,
                    mimetype: contentType.split(';')[0].trim() || 'application/octet-stream',
                    fileName: `fetch_${Date.now()}.${ext}`,
                    caption: `╭─❏ 「 FETCH RESULT」\n│ URL: ${targetUrl}\n│ Type: ${contentType.split(';')[0]}\n│ Size: ${(buffer.length / 1024).toFixed(2)} KB\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                });
            }

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            console.error('Fetch command error:', error);
            let errorMessage = error.message;
            if (error.name === 'FetchError' && error.type === 'request-timeout') errorMessage = 'Request timed out after 30 seconds.';
            else if (error.code === 'ENOTFOUND') errorMessage = 'Could not resolve the URL. That domain doesn\'t exist.';
            else if (error.code === 'ECONNREFUSED') errorMessage = 'Connection refused. Server is probably dead.';
            await sendInteractive(client, m, `╭─❏ 「 FETCH FAILED」\n│ ${errorMessage}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
