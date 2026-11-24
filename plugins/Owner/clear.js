import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => {
    const lines = String(body).split('\n').map(l => l.startsWith('│') ? l : `│ ${l}`).join('\n');
    return `╭─❏ 「 ${title} 」\n${lines}\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, store, args } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        if (!m?.chat) return;

        const restArgs = (args || []).filter((a) => String(a).toLowerCase() !== 'keepstarred');
        const target = (restArgs[0] || '').trim();

        if (!target) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, box('CLEAR', 'Which chat should I clear?\n│ .clear <number> — clear a DM\n│ .clear <group JID> — clear a group\n│ .clear here — clear this chat'));
        }

        let targetJid = null;
        const low = target.toLowerCase();
        if (low === 'here') {
            targetJid = m.chat;
        } else if (target.endsWith('@g.us') || target.endsWith('@s.whatsapp.net') || target.endsWith('@lid')) {
            targetJid = target;
        } else if (/^\+?\d{7,15}$/.test(target)) {
            targetJid = target.replace(/^\+/, '') + '@s.whatsapp.net';
        } else if (target.includes('chat.whatsapp.com')) {
            try {
                const url = new URL(target);
                const code = url.pathname.replace(/^\/+/, '');
                const res = await client.groupGetInviteInfo(code);
                targetJid = res?.id || res?.groupId || res?.gid || null;
            } catch {
                targetJid = null;
            }
            if (!targetJid) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, box('CLEAR', 'Invalid or expired group link.'));
            }
        }

        if (!targetJid) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, box('CLEAR', 'Give me a number or a group JID.\n│ Example: .clear 254712345678\n│ Example: .clear 120363@g.us'));
        }

        if (targetJid.endsWith('@broadcast') || targetJid.endsWith('@newsletter')) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, box('CLEAR', 'Cannot clear this type of chat.'));
        }

        try {
            let lastMessages;
            if (store?.chats?.[targetJid] && Array.isArray(store.chats[targetJid]) && store.chats[targetJid].length) {
                lastMessages = store.chats[targetJid].slice(-1);
            }

            const keepStarred = Array.isArray(args) && args.some((a) => String(a).toLowerCase() === 'keepstarred');
            if (typeof client.clearChat === 'function') {
                await client.clearChat(targetJid, lastMessages, keepStarred ? { deleteStarred: false } : undefined);
            } else {
                await client.chatModify({ clear: true, lastMessages, deleteStarred: keepStarred ? false : undefined }, targetJid);
            }
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            const label = targetJid === m.chat ? 'this chat' : targetJid;
            await sendInteractive(client, m, box('CLEARED', `Chat cleared: ${label}`));
        } catch (err) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            const msg = String(err?.message || err || '');
            if (msg.includes('myAppStateKey') || msg.includes('App state not ready') || msg.includes('app-state') || err?.output?.statusCode === 404) {
                return sendInteractive(client, m, box('NOT READY', 'App state still syncing after connect.\n│ Wait a few seconds then try again.'));
            }
            await sendInteractive(client, m, box('ERROR', 'Failed to clear chat.'));
        }
    });
};
