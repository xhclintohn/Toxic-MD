import fetch from 'node-fetch';
import { sendInteractive } from '../../lib/sendInteractive.js';

const SEARCH_API = 'https://api.snowping.cfd/api/search/pinterest';
const URL_API = 'https://api.ryuu-dev.my.id/downloader/pinterest';
const RYUU_KEY = 'ryuu-apis-9c049100c28fc39e1791732697814';

function isPinterestUrl(t) {
    return /pinterest\.com|pin\.it/i.test(String(t || ''));
}

export default async (context) => {
    const { client, m, text, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
    const fmt = (msg) => `╭─❏ 「 PINTEREST 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    if (!text) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Usage:\n│ ${prefix}pinterest Spider man\n│ ${prefix}pinterest https://pin.it/...`));
    }

    try {
        if (isPinterestUrl(text.trim())) {
            const r = await fetch(URL_API + '?url=' + encodeURIComponent(text.trim()), {
                headers: { 'X-RYUU-APIKEY': RYUU_KEY, 'User-Agent': 'Mozilla/5.0' },
                timeout: 25000
            });
            const d = await r.json();
            const res = d.result || d.data || d;
            const image = res.image || res.thumbnail || res.images?.orig?.url;
            const video = res.video || (res.is_video ? res.video : null);
            const title = res.title || res.description || 'Pinterest';
            if (!image && !video) throw new Error('No media found for that pin');

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            if (video) {
                await client.sendMessage(m.chat, {
                    video: { url: video },
                    caption: fmt(`*${title}*\n│ @${res.username || res.fullname || 'pin'}`)
                });
            } else {
                await client.sendMessage(m.chat, {
                    image: { url: image },
                    caption: fmt(`*${title}*\n│ @${res.username || res.fullname || 'pin'}`)
                });
            }
            return;
        }

        const r = await fetch(SEARCH_API + '?query=' + encodeURIComponent(text.trim()), {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 20000
        });
        const d = await r.json();
        const results = d.result || d.results || d.data || [];
        if (!Array.isArray(results) || !results.length) throw new Error('No images found');

        const picks = results.slice(0, 5);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
        for (const url of picks) {
            const img = typeof url === 'string' ? url : (url.url || url.image || url.thumbnail);
            if (!img) continue;
            await client.sendMessage(m.chat, {
                image: { url: img },
                caption: fmt(`Search: *${text}*`)
            }).catch(() => {});
        }
    } catch (e) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        sendInteractive(client, m, fmt(`Failed: ${e.message}`));
    }
};
