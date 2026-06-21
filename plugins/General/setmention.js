import { setMention, removeMention } from '../../lib/mentionStore.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const STRUCT_KEYS = ['ephemeralMessage', 'viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension', 'documentWithCaptionMessage', 'editedMessage', 'deviceSentMessage', 'futureProofMessage', 'commentMessage', 'botInvokeMessage', 'botForwardedMessage', 'associatedChildMessage'];

const unwrap = (msg) => {
    let cur = msg;
    let guard = 0;
    while (cur && guard < 25) {
        const k = STRUCT_KEYS.find((key) => cur[key]);
        if (!k) break;
        cur = cur[k].message || cur[k];
        guard++;
    }
    return cur;
};

const encode = (val) => {
    if (val === null || val === undefined) return val;
    if (Buffer.isBuffer(val)) return { __b64__: val.toString('base64') };
    if (val instanceof Uint8Array) return { __b64__: Buffer.from(val).toString('base64') };
    if (Array.isArray(val)) return val.map(encode);
    if (typeof val === 'object') {
        if (val.type === 'Buffer' && Array.isArray(val.data)) return { __b64__: Buffer.from(val.data).toString('base64') };
        const out = {};
        for (const [k, v] of Object.entries(val)) out[k] = encode(v);
        return out;
    }
    return val;
};

export default async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const fmt = (msg) => `╭─❏ 「 SETMENTION」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    const senderNum = (m.sender || '').split('@')[0].split(':')[0];

    const arg = (text || '').trim();
    if (['off', 'remove', 'clear', 'delete', 'none', 'stop'].includes(arg.toLowerCase())) {
        removeMention(senderNum);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('Your mention auto-reply has been removed.'));
    }

    let entry = null;

    if (m.quoted) {
        const raw = m.quoted?.fakeObj?.message || m.msg?.contextInfo?.quotedMessage || null;
        if (raw) {
            const core = unwrap(raw) || raw;
            const data = encode(core);
            if (JSON.stringify(data).length > 3000000) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('That media is too large to save. Try a smaller one or use text.'));
            }
            entry = { kind: 'json', data };
        }
    }

    if (!entry && arg) {
        entry = { kind: 'text', text: arg };
    }

    if (!entry) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('Reply to a message, sticker or image with .setmention, or type .setmention <text>.\n│ Use .setmention off to clear it.'));
    }

    setMention(senderNum, entry);
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    return sendInteractive(client, m, fmt('Saved. I will send this whenever someone mentions you in a group.'));
};
