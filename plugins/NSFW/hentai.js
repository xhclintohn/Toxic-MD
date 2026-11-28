import fetch from 'node-fetch';
import { sendInteractive } from '../../lib/sendInteractive.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const PROVIDERS = [
    { name: 'Konachan', base: 'https://konachan.com/post.json', random: true },
    { name: 'Yande.re', base: 'https://yande.re/post.json', random: false }
];

async function searchProvider(provider, tags) {
    const query = provider.random ? `${tags}+order:random` : tags;
    const response = await fetch(`${provider.base}?tags=${encodeURIComponent(query)}&limit=30`, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        timeout: 20000
    });
    if (!response.ok) throw new Error(`${provider.name} failed with status ${response.status}`);
    const posts = await response.json();
    if (!Array.isArray(posts)) return [];
    return posts.filter((post) => post.file_url && /\.(jpe?g|png)$/i.test(post.file_url));
}

async function searchHentai(term) {
    const tag = term.trim().toLowerCase().replace(/\s+/g, '_');
    const attempts = [`${tag} rating:explicit`, `*${tag}* rating:explicit`];
    for (const provider of PROVIDERS) {
        for (const tags of attempts) {
            try {
                const posts = await searchProvider(provider, tags);
                if (posts.length) return { provider: provider.name, posts };
            } catch {}
        }
    }
    return null;
}

export default async (context) => {
    const { client, m, text } = context;

    const formatStylishReply = (message) => {
        return `╭─❏ 「 HENTAI 」
│ ${message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    };

    if (!text) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, formatStylishReply("Yo, drop a search query, fam! 🔍 Ex: .hentai hinata"));
    }

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    try {
        const result = await searchHentai(text);
        if (!result) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, formatStylishReply("No results found for your query, fam! 😢 Try a different search term."));
        }

        const picked = [...result.posts].sort(() => Math.random() - 0.5).slice(0, 2);

        for (const post of picked) {
            const tags = (post.tags || '').split(' ').slice(0, 8).join(', ');
            await client.sendMessage(m.chat, {
                image: { url: post.file_url },
                caption: formatStylishReply(`🎨 Hentai Content\n\n🔍 *Search:* ${text}\n🏷️ *Tags:* ${tags}\n📦 *Source:* ${result.provider}`)
            });
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    } catch (e) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        console.error('Hentai fetch error:', e.message);
        return sendInteractive(client, m, formatStylishReply('Something went wrong. Check your query and try again! 😎'));
    }
};
