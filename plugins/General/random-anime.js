import axios from 'axios';
import { sendInteractive } from '../../lib/sendInteractive.js';

const QUERY = `query ($page: Int) { Page(page: $page, perPage: 1) { media(type: ANIME, sort: POPULARITY_DESC) { title { romaji english } coverImage { large } averageScore episodes status format seasonYear description siteUrl } } }`;

export default async (context) => {
    const { client, m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    try {
        const page = Math.floor(Math.random() * 300) + 1;
        const response = await axios.post('https://graphql.anilist.co', {
            query: QUERY,
            variables: { page }
        }, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, timeout: 20000 });

        const data = response.data?.data?.Page?.media?.[0];
        if (!data) throw new Error('No anime returned');

        const title = data.title?.english || data.title?.romaji || 'Unknown';
        const synopsis = (data.description || 'No synopsis available.').replace(/<[^>]*>/g, '').trim();
        const imageUrl = data.coverImage?.large;
        const episodes = data.episodes ?? 'Unknown';
        const status = data.status || 'Unknown';
        const score = data.averageScore ? `${data.averageScore}%` : 'Unknown';

        const message = `╭─❏ 「 Rᴀɴᴅᴏᴍ Aɴɪᴍᴇ」
│ Title: ${title}
│ Episodes: ${episodes}
│ Status: ${status}
│ Score: ${score}
│ Synopsis: ${synopsis}
│ URL: ${data.siteUrl}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (imageUrl) {
            await client.sendMessage(m.chat, { image: { url: imageUrl }, caption: message });
        } else {
            await client.sendMessage(m.chat, { text: message });
        }
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ An error occurred fetching anime.\n│ Try again, weeb.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};
