import axios from 'axios';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'joke',
    aliases: ['jokes', 'lol', 'funny'],
    description: 'Get a random joke',
    run: async (context) => {
        const { client, m } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            const res = await axios.get('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist&type=twopart', { timeout: 8000 });
            const j = res.data;
            const setup = j.setup || '';
            const delivery = j.delivery || '';
            if (!setup) throw new Error('no joke');
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            return client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├───≫ Jᴏᴋᴇ ≪───\n├\n├ 😐 ${setup}\n├\n├ 😂 ${delivery}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return client.sendMessage(m.chat, { text: '╭───(    TOXIC-MD    )───\n├───≫ Jᴏᴋᴇ ≪───\n├\n├ Your life is the joke, I\'m too tired to think of another one.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' }, { quoted: fq });
        }
    }
};
