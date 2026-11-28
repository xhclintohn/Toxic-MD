import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title} 」\n│ \n│ ${body}\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const runPinChat = (pin) => async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args } = context;

        if ((args[0] || '').toLowerCase() === 'help') {
            return sendInteractive(client, m, box('PIN CHAT', `${pin ? '.pinchat' : '.unpinchat'} pins this chat to the top of my chat list.\n│ \n│ Usage: ${pin ? '.pinchat' : '.unpinchat'}\n│ Works in groups and DMs.`));
        }

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            if (typeof client.pinChat === 'function') {
                await client.pinChat(m.chat, pin);
            } else {
                await client.chatModify({ pin }, m.chat);
            }
            await client.sendMessage(m.chat, { react: { text: '📌', key: m.reactKey } });
            await sendInteractive(client, m, box(pin ? 'PINNED' : 'UNPINNED', pin ? 'Chat pinned to the top. 📌' : 'Chat unpinned.'));
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            console.error('[PINCHAT ERROR]', error?.message || error);
            await sendInteractive(client, m, box('ERROR', `Couldn't ${pin ? 'pin' : 'unpin'} this chat.\n│ ${String(error?.message || error).slice(0, 80)}`));
        }
    });
};

export default [
    {
        name: 'pinchat',
        aliases: ['pinthischat'],
        description: 'Pin this chat to the top of the bot chat list',
        run: runPinChat(true)
    },
    {
        name: 'unpinchat',
        aliases: ['unpinthischat'],
        description: 'Unpin this chat from the top of the bot chat list',
        run: runPinChat(false)
    }
];
