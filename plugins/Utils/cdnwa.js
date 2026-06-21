import { prepareWAMessageMedia } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

function expiryToDate(url) {
    try {
        const oe = new URL(url).searchParams.get('oe');
        if (!oe) return 'Unknown';
        return new Date(parseInt(oe, 16) * 1000).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
    } catch { return 'Unknown'; }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export default {
    name: 'cdnwa',
    aliases: ['cdn', 'waurl', 'uploadwa'],
    description: 'Upload media to WhatsApp CDN and get a direct URL',
    run: async (context) => {
        const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 CDNWA」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            const q = m.quoted ? m.quoted : m;
            if (!q.mimetype) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Reply to a media message (image, video, audio, document) to upload it to WhatsApp CDN.'));
            }

            const buff = await q.download();
            const formattedSize = formatFileSize(buff.length);
            const mediaType = (q.mtype || 'document').replace('Message', '') || 'document';

            const media = await prepareWAMessageMedia(
                { [mediaType]: buff },
                { upload: conn.waUploadToServer, jid: m.chat }
            );

            const link = Object.values(media)[0]?.url;
            if (!link) throw new Error('Failed to get URL from WhatsApp CDN');

            await client.sendMessage(m.chat, {
                text: fmt(`📁 URL : ${link}\n💾 Size : ${formattedSize}\n📅 Expires : ${expiryToDate(link)}`)
            });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt(`Failed to upload: ${error.message || error}`));
        }
    }
};
