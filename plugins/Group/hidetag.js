import middleware from '../../utils/botUtil/middleware.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, args, participants, text } = context;

await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
await client.sendMessage(m.chat, { text : text ? text : 'ᅠᅠᅠᅠ' , mentions: participants.map(a => a.id)});
await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

});

}

