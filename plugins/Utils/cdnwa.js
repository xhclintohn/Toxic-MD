import { prepareWAMessageMedia } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 CDNWA」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const MEDIA_TYPES = new Set(['image','video','audio','sticker','document']);

function expiryToDate(url) {
    try {
        const oe = new URL(url).searchParams.get('oe');
        if (!oe) return 'Unknown';
        return new Date(parseInt(oe, 16) * 1000).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    } catch { return 'Unknown'; }
}

function fmtSize(bytes) {
    if (!bytes) return '0 B';
    const s = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${s[i]}`;
}

export default {
    name: 'cdnwa',
    aliases: ['cdn', 'waurl', 'uploadwa', 'wamedia', 'wacdn'],
    description: 'Upload media to WhatsApp CDN and get a direct link',
    run: async (context) => {
        const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const q = m.quoted ? m.quoted : m;
            if (!q.mimetype) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Reply to a media message (image, video, audio, sticker, document).'));
            }

            const buff = await q.download();
            const formattedSize = fmtSize(buff.length);

            let mediaType = (q.mtype || '').replace(/Message$/i, '').toLowerCase();
            if (!MEDIA_TYPES.has(mediaType)) mediaType = 'document';

            const mime = q.mimetype || 'application/octet-stream';
            const ext = mime.split('/')[1]?.split(';')[0]?.replace('jpeg','jpg') || 'bin';

            const uploadPayload = mediaType === 'document'
                ? { document: buff, mimetype: mime, fileName: `file_${Date.now()}.${ext}` }
                : { [mediaType]: buff };

            const media = await prepareWAMessageMedia(
                uploadPayload,
                { upload: client.waUploadToServer, jid: '120363425667150709@newsletter' }
            );

            const mediaObj = Object.values(media)[0];
            const link = mediaObj?.url || mediaObj?.directPath;
            if (!link) throw new Error('Failed to get URL from WhatsApp CDN');

            await client.sendMessage(m.chat, {
                text: fmt(`📁 URL:\n│ ${link}\n│ \n│ 💾 Size: ${formattedSize}\n│ 📅 Expires: ${expiryToDate(link)}`)
            }, { quoted: m });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (err) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt(`Failed: ${err.message || err}`));
        }
    }
};
