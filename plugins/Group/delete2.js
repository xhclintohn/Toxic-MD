import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => {
    const lines = String(body).split('\n').map(l => l.startsWith('│') ? l : `│ ${l}`).join('\n');
    return `╭─❏ 「 ${title} 」\n${lines}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const forceDelete = async (client, chatId, targetId) => {
    const tempId = await client.relayMessage(chatId, {
        groupStatusMessageV2: {
            message: {
                extendedTextMessage: { text: '', contextInfo: { isGroupStatus: true } }
            }
        }
    }, {});

    const tempId2 = await client.relayMessage(chatId, {
        protocolMessage: {
            key: { remoteJid: chatId, fromMe: true, id: tempId },
            type: 14,
            editedMessage: {
                extendedTextMessage: { text: '\0', contextInfo: { isGroupStatus: false } }
            }
        }
    }, { messageId: targetId });

    await delay(100);

    await Promise.allSettled([
        client.sendMessage(chatId, { delete: { remoteJid: chatId, id: tempId, fromMe: true } }),
        client.sendMessage(chatId, { delete: { remoteJid: chatId, id: tempId2, fromMe: true } })
    ]);
};

export default {
    name: 'delete2',
    aliases: ['del2', 'dmsg2', 'delmsg2', 'delother2'],
    description: 'Force delete a message (owner only)',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, isGroup } = context;

            if (!isGroup) {
                return sendInteractive(client, m, box('DELETE2', 'This command only works in groups.'));
            }
            if (!m.quoted) {
                return sendInteractive(client, m, box('DELETE2', 'Reply to the message you want to delete.'));
            }

            const chatId = m.chat;
            const targetId = m.quoted.id || m.quoted.key?.id;
            if (!targetId) {
                return sendInteractive(client, m, box('DELETE2', 'Could not resolve the quoted message ID.'));
            }

            try {
                await forceDelete(client, chatId, targetId);
            } catch (err) {
                console.error('[delete2] part 1:', err);
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, box('DELETE2', `Error: ${String(err?.message || err).slice(0, 80)}`));
            }

            await delay(1000);

            try {
                const commandId = m.key?.id || m.id;
                if (commandId) {
                    await forceDelete(client, chatId, commandId);
                }
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            } catch (err) {
                console.error('[delete2] part 2:', err);
            }
        });
    }
};
