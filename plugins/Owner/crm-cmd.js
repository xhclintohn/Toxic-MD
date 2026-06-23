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
    if (Buffer.isBuffer(val)) return { __b64__: val.toString('base64') };
    if (val instanceof Uint8Array) return { __b64__: Buffer.from(val).toString('base64') };
    if (Array.isArray(val)) return val.map(encode);
    if (typeof val === 'object') {
        if (val.type === 'Buffer' && Array.isArray(val.data)) return { __b64__: Buffer.from(val.data).toString('base64') };
        if (val.constructor?.name === 'Long') return val.toNumber?.() ?? val.low ?? 0;
        const out = {};
        for (const [k, v] of Object.entries(val)) out[k] = encode(v);
        return out;
    }
    return val;
};

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, store } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 CRM-CMD」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (!m.quoted) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('Reply to a message, button or interactive media to convert it into a command file.'));
        }

        try {
            const sources = [
                () => m.quoted?.fakeObj?.message,
                () => m.msg?.contextInfo?.quotedMessage,
                () => m.quoted?.message,
                () => m.quoted?.fakeObj,
            ];
            let raw = null;
            for (const fn of sources) {
                try { const r = fn(); if (r && typeof r === 'object' && Object.keys(r).length > 0) { raw = r; break; } } catch {}
            }

            if (!raw) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Could not read that message. Reply directly to it and try again.'));
            }

            const core = unwrap(raw) || raw;
            const contextInfo = m.msg?.contextInfo || m.quoted?.contextInfo || null;
            const messageContextInfo = raw?.messageContextInfo || m.quoted?.fakeObj?.messageContextInfo || null;

            const capture = {
                message: encode(core),
                ...(contextInfo ? { capturedContextInfo: encode(contextInfo) } : {}),
                ...(messageContextInfo ? { messageContextInfo: encode(messageContextInfo) } : {}),
            };

            const payload = JSON.stringify(capture, null, 2);

            const fileBody =
                'const capture = ' + payload + ';\n' +
                'const revive = (x) => { if (x === null || x === undefined) return x; if (Array.isArray(x)) return x.map(revive); if (typeof x === "object") { if (typeof x.__b64__ === "string") return Buffer.from(x.__b64__, "base64"); if (typeof x.b64 === "string") return Buffer.from(x.b64, "base64"); return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, revive(v)])); } return x; };\n' +
                'export default async (context) => {\n' +
                '    const { client, m } = context;\n' +
                '    await client.sendMessage(m.chat, revive(capture.message), { quoted: m });\n' +
                '};\n';

            const id = (m.quoted?.id || Date.now().toString(36)).toString().slice(-8);
            await client.sendMessage(m.chat, {
                document: Buffer.from(fileBody, 'utf8'),
                fileName: 'cmd_' + id + '.js',
                mimetype: 'application/javascript',
                caption: fmt('Converted into a command file.\n│ Reply to this file with .addcmd <name>\n│ to install it into the General folder.')
            });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt('Failed to convert: ' + (e?.message || e)));
        }
    });
};
