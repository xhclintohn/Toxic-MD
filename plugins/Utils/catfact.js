import axios from 'axios';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default async (context) => {
    const { client, m } = context;
    const fq = getFakeQuoted(m);
    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const { data } = await axios.get('https://catfact.ninja/fact', { timeout: 8000 });
        const fact = data?.fact;
        if (!fact) throw new Error('no fact');
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ CAT FACT ≪───\n├ \n├ ${fact}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    } catch {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        m.reply(`╭───(    TOXIC-MD    )───\n├ API down. Even the cats went offline.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};
