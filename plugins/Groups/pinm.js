import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getDeviceMode } from '../../lib/deviceMode.js';

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
        `╭───(    TOXIC-MD    )───\n` +
        `├───≫ PIN MESSAGE ≪───\n├\n` +
        `├ How long should it stay pinned?\n├\n` +
        `╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    const _dev = await getDeviceMode();
    if (_dev === 'ios') {
        return client.sendMessage(m.chat, {
            text: `${bodyText}\n\n├ Use:\n├ ${p}pinm 24h\n├ ${p}pinm 7d\n├ ${p}pinm 30d`
        }, { quoted: fq });
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
        }, { quoted: fq });
        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } catch {
        await client.sendMessage(m.chat, {
            text: `${bodyText}\n\n├ Use:\n├ ${p}pinm 24h\n├ ${p}pinm 7d\n├ ${p}pinm 30d`
        }, { quoted: fq });
    }
}

export default {
    name: 'pinm',
    aliases: ['pinmessage', 'pinmsg'],
    description: 'Pin a replied-to message. Reply to message, then pick duration.',
    run: async (context) => {
        const { client, m, prefix, IsGroup, args } = context;
        const fq = getFakeQuoted(m);

        if (!IsGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├ \n├ Groups only.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
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
            return client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├ \n├ Reply to a message first, then use ${prefix}pinm.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        }

        const pinTime = time || 86400;

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            await client.sendMessage(m.chat, { pin: messageKey, type: 1, time: pinTime });
            global._toxicPinPending.delete(m.chat);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├ \n├ 📌 Message pinned!\n├ Duration: ${durationLabel(pinTime)}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await client.sendMessage(m.chat, {
                text: `╭───(    TOXIC-MD    )───\n├ \n├ ❌ Failed to pin: ${error.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        }
    }
};
