import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ButtonV2 } from '../../lib/WABuilder.js';

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

const fmt = (msg) => `╭─❏ 「 PIN MESSAGE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

async function sendPinButtons(client, m, prefix) {
    const p = prefix || '.';
    const bodyText = fmt(`How long should it stay pinned?\n\n│ Use: ${p}pinm 24h / ${p}pinm 7d / ${p}pinm 30d`);
    const _dev = await getDeviceMode();
    if (_dev === 'ios') {
        return sendInteractive(client, m, bodyText);
    }
    try {
        const btnV2 = new ButtonV2(client);
        btnV2.setBody(bodyText)

            .addButton('⏱️ 24 Hours', `${p}pinm 24h`)
            .addButton('📅 7 Days', `${p}pinm 7d`)
            .addButton('🗓️ 30 Days', `${p}pinm 30d`);
        await btnV2.send(m.chat, { userJid: client.user?.id || '' });
    } catch {
        await sendInteractive(client, m, bodyText);
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
            return sendInteractive(client, m, fmt('Groups only.'));
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
                return sendPinButtons(client, m, prefix);
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
            return sendInteractive(client, m, fmt(`Reply to a message first, then use ${prefix}pinm.`));
        }

        const pinTime = time || 86400;

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            await client.sendMessage(m.chat, { pin: messageKey, type: 1, time: pinTime });
            global._toxicPinPending.delete(m.chat);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await sendInteractive(client, m, fmt(`📌 Message pinned!\nDuration: ${durationLabel(pinTime)}`));
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt(`❌ Failed to pin: ${error.message}`));
        }
    }
};
