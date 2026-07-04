import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 CATBOX」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

function fmtSize(bytes) {
    if (!bytes) return '0 B';
    const s = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${s[i]}`;
}

export default {
    name: 'catbox',
    aliases: ['cb', 'catboxupload', 'uploadcatbox', 'catboxmoe', 'cbupload'],
    description: 'Upload media to catbox.moe and get a permanent link',
    run: async (context) => {
        const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const q = m.quoted ? m.quoted : m;
            if (!q.mimetype) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Reply to a media message to upload it to Catbox.'));
            }

            const buff = await q.download();
            const mime = q.mimetype || 'application/octet-stream';
            const ext = mime.split('/')[1]?.split(';')[0]?.replace('jpeg','jpg') || 'bin';
            const filename = `toxic_${Date.now()}.${ext}`;
            const size = fmtSize(buff.length);

            await sendInteractive(client, m, fmt(`Uploading ${filename} (${size}) to Catbox...`));

            let url = null;
            let permanent = true;

            try {
                const form = new FormData();
                form.append('reqtype', 'fileupload');
                form.append('fileToUpload', new Blob([buff], { type: mime }), filename);

                const res = await fetch('https://catbox.moe/user/api.php', {
                    method: 'POST',
                    body: form,
                    headers: { 'User-Agent': 'ToxicMD/1.0' }
                });

                const text = (await res.text()).trim();
                if (text.startsWith('https://files.catbox.moe/')) {
                    url = text;
                } else {
                    throw new Error(`Catbox error: ${text}`);
                }
            } catch (primaryErr) {
                try {
                    const fallbackForm = new FormData();
                    fallbackForm.append('reqtype', 'fileupload');
                    fallbackForm.append('time', '72h');
                    fallbackForm.append('fileToUpload', new Blob([buff], { type: mime }), filename);

                    const fallbackRes = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
                        method: 'POST',
                        body: fallbackForm,
                        headers: { 'User-Agent': 'ToxicMD/1.0' }
                    });

                    const fallbackText = (await fallbackRes.text()).trim();
                    if (fallbackText.startsWith('https://litter.catbox.moe/')) {
                        url = fallbackText;
                        permanent = false;
                    } else {
                        throw new Error(`Litterbox error: ${fallbackText}`);
                    }
                } catch (fallbackErr) {
                    throw primaryErr;
                }
            }

            await client.sendMessage(m.chat, {
                text: fmt(`✅ Upload complete!\n│ \n│ 🔗 URL: ${url}\n│ 💾 Size: ${size}\n│ \n│ ${permanent ? 'Permanent link — never expires!' : 'Temporary link — expires in 72 hours (Catbox blocked this upload, used fallback host).'}`)
            }, { quoted: m });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (err) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt(`Upload failed: ${err.message || err}`));
        }
    }
};
