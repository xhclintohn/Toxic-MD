import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, args, participants, text } = context;
        const fq = getFakeQuoted(m);

await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
await client.sendMessage(m.chat, { text : text ? text : 'ᅠᅠᅠᅠ' , mentions: participants.map(a => a.id)}, { quoted: fq });
await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

});

}

