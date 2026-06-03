import https from 'https';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

const GH_OWNER = 'xhclintohn';
const GH_REPO  = 'Toxic-v2';
const GH_BRANCH = 'main';
const GH_ASSET_DIR = 'assets/reactions';

const BOX = (title, lines) => {
    const body = (Array.isArray(lines) ? lines : [lines]).map(l => `├ ${l}`).join('\n');
    return `╭───(    TOXIC-MD    )───\n├───≫ ${title} ≪───\n├\n${body}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

async function ghApiPut(token, path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const req = https.request({
            hostname: 'api.github.com',
            path: `/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`,
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Toxic-MD-Bot',
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let raw = '';
            res.on('data', c => raw += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, body: raw }); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function ghApiGet(token, path) {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.github.com',
            path: `/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`,
            method: 'GET',
            headers: { 'Authorization': `token ${token}`, 'User-Agent': 'Toxic-MD-Bot' }
        }, (res) => {
            let raw = '';
            res.on('data', c => raw += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, body: {} }); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

export default {
    name: 'upx',
    aliases: ['uploadmedia', 'ghupload'],
    description: 'Upload replied sticker/image/video to GitHub and get the link',
    run: async (context) => {
        const { client, m, args } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let token = '';
        try { const _k = await import('../../keys.js'); token = _k.GITHUB_TOKEN || ''; } catch {}
        if (!token) token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
        if (!token) {
            return client.sendMessage(m.chat, {
                text: BOX('UPX ERROR', ['No GITHUB_TOKEN set. Add it to keys.js or environment variables.'])
            }, { quoted: fq });
        }

        if (!m.quoted) {
            return client.sendMessage(m.chat, {
                text: BOX('UPX USAGE', [
                    'Reply to a sticker, image, or video with:',
                    '.upx [optional-filename]',
                    '',
                    'Example: .upx slap_sticker'
                ])
            }, { quoted: fq });
        }

        const msgType = m.quoted?.mtype;
        if (!['imageMessage', 'videoMessage', 'stickerMessage'].includes(msgType)) {
            return client.sendMessage(m.chat, {
                text: BOX('UPX ERROR', ['Reply must be a sticker, image, or video.'])
            }, { quoted: fq });
        }

        await client.sendMessage(m.chat, { react: { text: '⏳', key: m.reactKey } });

        try {
            const buffer = m.quoted.download ? await m.quoted.download() : await client.downloadMediaMessage(m.quoted);
            if (!buffer || !buffer.length) throw new Error('Download failed — empty buffer');

            const extMap = { imageMessage: 'jpg', videoMessage: 'mp4', stickerMessage: 'webp' };
            const ext = extMap[msgType] || 'bin';
            const customName = (args[0] || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
            const filename = customName ? `${customName}.${ext}` : `media_${Date.now()}.${ext}`;
            const ghPath = `${GH_ASSET_DIR}/${filename}`;
            const b64 = buffer.toString('base64');

            let sha = null;
            const existing = await ghApiGet(token, ghPath);
            if (existing.status === 200 && existing.body?.sha) sha = existing.body.sha;

            const putBody = {
                message: `upx: add ${filename}`,
                content: b64,
                branch: GH_BRANCH,
                ...(sha ? { sha } : {})
            };
            const result = await ghApiPut(token, ghPath, putBody);

            if (result.status !== 200 && result.status !== 201) {
                throw new Error(`GitHub API returned ${result.status}: ${JSON.stringify(result.body).slice(0, 100)}`);
            }

            const rawUrl = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${ghPath}`;

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                text: BOX('UPX DONE', [
                    `File: ${filename}`,
                    `Type: ${msgType.replace('Message', '')}`,
                    ``,
                    `Raw link (copy this):`,
                    rawUrl,
                    ``,
                    `Paste in reaction plugin as the sticker URL.`
                ])
            }, { quoted: fq });
        } catch (err) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                text: BOX('UPX ERROR', [`Upload failed: ${err.message?.slice(0, 80)}`])
            }, { quoted: fq });
        }
    }
};
