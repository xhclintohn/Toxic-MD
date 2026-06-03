import axios from 'axios';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'technews',
    aliases: ['techupdates', 'latestnews'],
    description: 'Get latest tech news headlines',
    run: async (context) => {
        const { client, m } = context;
        const fq = getFakeQuoted(m);
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            const res = await axios.get('https://techcrunch.com/wp-json/wp/v2/posts?per_page=5&_fields=title,link,date', { timeout: 10000 });
            const articles = res.data || [];
            if (!articles.length) throw new Error('No articles');
            const headlines = articles.map((a, i) =>
                `├ [${i+1}] ${(a.title?.rendered||'').replace(/&amp;/g,'&').replace(/&#8217;/g,"'").replace(/&#8216;/g,"'")}\n├     🔗 ${a.link||''}`
            ).join('\n├\n');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├───≫ Tᴇᴄʜ Nᴇᴡs ≪───\n├\n${headlines}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return client.sendMessage(m.chat, { text: '╭───(    TOXIC-MD    )───\n├───≫ Tᴇᴄʜ Nᴇᴡs ≪───\n├\n├ Tech world went offline. How ironic.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' }, { quoted: fq });
        }
    }
};
