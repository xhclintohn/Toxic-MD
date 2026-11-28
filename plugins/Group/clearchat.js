import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'clearchat',
    aliases: ['wipe', 'clearview'],
    description: 'Clears all messages in a chat from the bot view',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, store } = context;

            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            try {
                let lastMessages;
                if (store?.chats?.[m.chat] && Array.isArray(store.chats[m.chat]) && store.chats[m.chat].length) {
                    lastMessages = store.chats[m.chat].slice(-1);
                }
                if (typeof client.clearChat === 'function') {
                    await client.clearChat(m.chat, lastMessages);
                } else {
                    await client.chatModify({ clear: true, lastMessages }, m.chat);
                }
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await sendInteractive(client, m, '╭─❏ 「 CLEARED 」\n│ \n│ Chat cleared from my view.\n│ Gone. All of it. 🧹\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
            } catch (error) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                await sendInteractive(client, m, '╭─❏ 「 ERROR 」\n│ \n│ Couldn\'t clear this chat.\n│ Try again, genius.\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
            }
        });
    }
};
