import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

if (!global._toxicPinPending) global._toxicPinPending = new Map();

const parseDuration = (input) => {
    const m = String(input).toLowerCase().match(/^(\d+)\s*(s|m|h|d)$/);
    if (m) {
        const n = parseInt(m[1], 10);
        if (m[2] === 's') return n;
        if (m[2] === 'm') return n * 60;
        if (m[2] === 'h') return n * 3600;
        if (m[2] === 'd') return n * 86400;
    }
    if (/^\d+$/.test(input)) return parseInt(input, 10);
    return null;
};

const durationLabel = (secs) => {
    if (secs >= 86400 && secs % 86400 === 0) return `${secs / 86400}d`;
    if (secs >= 3600 && secs % 3600 === 0) return `${secs / 3600}h`;
    if (secs >= 60 && secs % 60 === 0) return `${secs / 60}m`;
    return `${secs}s`;
};

async function sendPinButtons(client, m, fq, prefix) {
    const p = prefix || '.';
    const bodyText =
        `` +
        `╭─❏ 「 PIN MESSAGE」
│
` +
        `│ How long should it stay pinned?\n│
` +
        `╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    const _dev = await getDeviceMode();
    if (_dev === 'ios') {
        return sendInteractive(client, m, `${bodyText}\n\n│ Use:\n│ ${p}pinm 24h\n│ ${p}pinm 7d\n│ ${p}pinm 30d`);
    }
    try {
        const msg = generateWAMessageFromContent(m.chat, {
            interactiveMessage: {
                body: { text: bodyText },
                footer: { text: '' },
                nativeFlowMessage: {
                    buttons: [{
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: 'Pin Duration',
                            sections: [{
                                title: 'How long?',
                                rows: [
                                    { header: '⏱️ 24 Hours', title: 'Pin for 1 day',   id: `${p}pinm 24h` },
                                    { header: '📅 7 Days',   title: 'Pin for 1 week',  id: `${p}pinm 7d`  },
                                    { header: '🗓️ 30 Days',  title: 'Pin for 1 month', id: `${p}pinm 30d` },
                                ]
                            }]
                        })
                    }]
                }
            }
        });
        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } catch {
        await sendInteractive(client, m, `${bodyText}\n\n│ Use:\n│ ${p}pinm 24h\n│ ${p}pinm 7d\n│ ${p}pinm 30d`);
    }
}

export default {
    name: 'pinm',
    aliases: ['pinmessage', 'pinmsg'],
    description: 'Pin a replied-to message. Reply to message, then pick duration.',
    run: async (context) => {
        const { client, m, prefix, IsGroup, args } = context;

        if (!IsGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `│ \n│ Groups only.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const rawInput = args[0] || '';
        const time = rawInput ? parseDuration(rawInput) : null;

        if (m.quoted) {
            const pendingKey = {
                remoteJid: m.chat,
                id: m.quoted.id,
                fromMe: m.quoted.fromMe || false,
                participant: m.quoted.sender
            };
            global._toxicPinPending.set(m.chat, { key: pendingKey, ts: Date.now() });
            setTimeout(() => {
                const p = global._toxicPinPending.get(m.chat);
                if (p && Date.now() - p.ts > 5 * 60 * 1000) global._toxicPinPending.delete(m.chat);
            }, 5 * 60 * 1000);

            if (!time) {
                await client.sendMessage(m.chat, { react: { text: '📌', key: m.reactKey } });
                return sendPinButtons(client, m, fq, prefix);
            }
        }

        const pending = global._toxicPinPending.get(m.chat);
        const messageKey = pending?.key || (m.quoted ? {
            remoteJid: m.chat,
            id: m.quoted.id,
            fromMe: m.quoted.fromMe || false,
            participant: m.quoted.sender
        } : null);

        if (!messageKey) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `│ \n│ Reply to a message first, then use ${prefix}pinm.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const pinTime = time || 86400;

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            await client.sendMessage(m.chat, { pin: messageKey, type: 1, time: pinTime });
            global._toxicPinPending.delete(m.chat);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await sendInteractive(client, m, `│ \n│ 📌 Message pinned!\n│ Duration: ${durationLabel(pinTime)}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, `│ \n│ ❌ Failed to pin: ${error.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
