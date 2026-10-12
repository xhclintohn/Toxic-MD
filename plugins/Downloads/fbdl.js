import fetch from 'node-fetch';
import { sendInteractive } from '../../lib/sendInteractive.js';

const API = 'https://api.ryuu-dev.my.id/downloader/facebook';
const KEY = 'ryuu-apis-9c049100c28fc39e1791732697814';

export default async (context) => {
    const { client, m, text, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    const fmt = (msg) => `╭─❏ 「 Facebook DL」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    if (!text) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Example: ${prefix}fbdl https://fb.watch/xxxxx`));
    }
    if (!text.includes('facebook.com') && !text.includes('fb.watch')) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt("That's not a Facebook link."));
    }

    try {
        const r = await fetch(API + '?url=' + encodeURIComponent(text.trim()), {
            headers: { 'X-RYUU-APIKEY': KEY, 'User-Agent': 'Mozilla/5.0' },
            timeout: 25000
        });
        const d = await r.json();
        if (!d?.success && !d?.result) throw new Error(d?.message || 'API failed');
        const res = d.result?.result || d.result || {};
        const title = res.title || 'Facebook Video';
        const videoUrl = res.hd || res.sd || res.video_hd || res.video_sd;
        if (!videoUrl) throw new Error('No video URL found');

        const dlRes = await fetch(videoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 45000 });
        if (!dlRes.ok) throw new Error('Download failed: ' + dlRes.status);
        const buf = Buffer.from(await dlRes.arrayBuffer());

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
        await client.sendMessage(m.chat, {
            video: buf,
            mimetype: 'video/mp4',
            caption: fmt(`${title}\n│ Quality: ${res.hd ? 'HD' : 'SD'}`)
        });
    } catch (e) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        sendInteractive(client, m, fmt(`Failed: ${e.message}`));
    }
};
