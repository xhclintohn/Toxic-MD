import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => {
    const lines = String(body).split('\n').map(l => l.startsWith('│') ? l : `│ ${l}`).join('\n');
    return `╭─❏ 「 ${title} 」\n${lines}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export default {
    name: 'fakemsg',
    aliases: ['editfake', 'fakeedit'],
    description: 'Fake edit someone else\'s message',
    run: async (context) => {
        const { client, m, text, isGroup, prefix } = context;

        if (!isGroup) {
            return sendInteractive(client, m, box('FAKEMSG', 'This command only works in groups.'));
        }
        if (!m.quoted) {
            return sendInteractive(client, m, box('FAKEMSG', `Reply to the message you want to edit.\n│ Usage: ${prefix}fakemsg <new text>`));
        }
        if (!text) {
            return sendInteractive(client, m, box('FAKEMSG', `Enter the replacement text.\n│ Usage: ${prefix}fakemsg <new text>`));
        }

        const stanzaId = m.quoted.key?.id || m.quoted.id;
        if (!stanzaId) {
            return sendInteractive(client, m, box('FAKEMSG', 'Could not resolve the quoted message ID.'));
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

            const tempId = await client.relayMessage(m.chat, {
                extendedTextMessage: {
                    text: '',
                    contextInfo: { isGroupStatus: true }
                }
            }, {});

            const tempId2 = await client.relayMessage(m.chat, {
                protocolMessage: {
                    key: { remoteJid: m.chat, fromMe: true, id: tempId },
                    type: 14,
                    editedMessage: {
                        extendedTextMessage: {
                            text,
                            contextInfo: { isGroupStatus: false }
                        }
                    }
                }
            }, { messageId: stanzaId });

            await delay(200);

            await Promise.allSettled([
                client.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: tempId, fromMe: true } }),
                client.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: tempId2, fromMe: true } })
            ]);

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
        } catch (e) {
            console.error('[fakemsg]', e);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, box('FAKEMSG', `Error: ${String(e?.message || e).slice(0, 80)}`));
        }
    }
};
