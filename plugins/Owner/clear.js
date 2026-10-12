import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, store } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        if (!m?.chat) return;

        if (m.chat.endsWith('@broadcast') || m.chat.endsWith('@newsletter')) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 CLEAR 」
│ Cannot clear this type of chat.
╰───────────────
> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        try {
            let lastMessages;
            if (store?.chats?.[m.chat] && Array.isArray(store.chats[m.chat]) && store.chats[m.chat].length) {
                lastMessages = store.chats[m.chat].slice(-1);
            }

            await client.chatModify({ delete: true, lastMessages }, m.chat);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, `╭─❏ 「 CLEARED 」
│ Chat cleared.
╰───────────────
> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch (err) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            const msg = String(err?.message || err || '');
            if (msg.includes('myAppStateKey') || msg.includes('App state not ready') || msg.includes('app-state') || err?.output?.statusCode === 404) {
                return sendInteractive(client, m, `╭─❏ 「 NOT READY 」
│ App state still syncing after connect.
│ Wait a few seconds then try again.
╰───────────────
> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
            await sendInteractive(client, m, `╭─❏ 「 ERROR 」
│ Failed to clear chat.
╰───────────────
> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    });
};
