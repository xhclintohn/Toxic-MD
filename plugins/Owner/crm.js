import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
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
    if (Buffer.isBuffer(val)) return { b64: val.toString('base64') };
    if (val instanceof Uint8Array) return { b64: Buffer.from(val).toString('base64') };
    if (Array.isArray(val)) return val.map(encode);
    if (typeof val === 'object') {
        if (val.type === 'Buffer' && Array.isArray(val.data)) return { b64: Buffer.from(val.data).toString('base64') };
        if (val.constructor?.name === 'Long') return val.toNumber?.() ?? val.low ?? 0;
        const out = {};
        for (const [k, v] of Object.entries(val)) out[k] = encode(v);
        return out;
    }
    return val;
};

const deepGetMessage = (m, store) => {
    const sources = [
        () => m.quoted?.fakeObj?.message,
        () => m.msg?.contextInfo?.quotedMessage,
        () => m.quoted?.message,
        () => {
            if (!store?.messages?.[m.chat]) return null;
            const msgs = store.messages[m.chat];
            return msgs.get?.({ id: m.quoted?.id })?.message || null;
        },
        () => m.quoted?.fakeObj,
    ];
    for (const fn of sources) {
        try {
            const r = fn();
            if (r && typeof r === 'object' && Object.keys(r).length > 0) return r;
        } catch {}
    }
    return null;
};

const buildFullCapture = (raw, m) => {
    const core = unwrap(raw) || raw;
    const contextInfo = m.msg?.contextInfo || m.quoted?.contextInfo || null;
    const messageContextInfo = raw?.messageContextInfo || m.quoted?.fakeObj?.messageContextInfo || null;

    const payload = {
        message: encode(core),
        ...(contextInfo ? { capturedContextInfo: encode(contextInfo) } : {}),
        ...(messageContextInfo ? { messageContextInfo: encode(messageContextInfo) } : {}),
    };

    return payload;
};

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, store } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 CRM」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (!m.quoted) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('Reply to a message, button or interactive media to compile it'));
        }

        try {
            const raw = deepGetMessage(m, store);
            if (!raw) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Could not read that message. Reply directly to it and try again.'));
            }

            const capture = buildFullCapture(raw, m);
            const payload = JSON.stringify(capture, null, 2);

            const reviveFn = `const revive = (x) => {
    if (x === null || x === undefined) return x;
    if (Array.isArray(x)) return x.map(revive);
    if (typeof x === 'object') {
        if (typeof x.b64 === 'string') return Buffer.from(x.b64, 'base64');
        if (typeof x.__b64__ === 'string') return Buffer.from(x.__b64__, 'base64');
        return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, revive(v)]));
    }
    return x;
};`;

            const fileBody =
                'const capture = ' + payload + ';\n' +
                reviveFn + '\n' +
                'const msg = revive(capture.message);\n' +
                'await client.relayMessage(m.chat, msg, {});\n';

            const id = (m.quoted?.id || Date.now().toString(36)).toString().slice(-8);
            await client.sendMessage(m.chat, {
                document: Buffer.from(fileBody, 'utf8'),
                fileName: 'crm_' + id + '.js',
                mimetype: 'application/javascript',
                caption: fmt('Compiled✅')
            });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt('Failed to compile: ' + (e?.message || e)));
        }
    });
};
