import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { promises as fs } from 'fs';
import path from 'path';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const GENERAL_DIR = path.join(__dirname, '..', 'General');

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

const sanitizeName = (s) => (s || '').toLowerCase().replace(/\.js$/i, '').replace(/[^a-z0-9_-]/g, '').slice(0, 40);

const buildFromMessage = (raw) => {
    const core = unwrap(raw) || raw;
    const payload = JSON.stringify(encode(core), null, 2);
    return 'const data = ' + payload + ';\n' +
        'const revive = (x) => Array.isArray(x) ? x.map(revive) : (x && typeof x === "object") ? (typeof x.__b64__ === "string" ? Buffer.from(x.__b64__, "base64") : Object.fromEntries(Object.entries(x).map(([k, v]) => [k, revive(v)]))) : x;\n' +
        'export default async (context) => {\n' +
        '    const { client, m } = context;\n' +
        '    await client.sendJson(m.chat, revive(data));\n' +
        '};\n';
};

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 ADDCMD」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        const trimmed = (text || '').trim();
        const firstSpace = trimmed.search(/\s/);
        const nameToken = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace);
        const inlineRest = firstSpace === -1 ? '' : trimmed.slice(firstSpace + 1).trim();

        let name = sanitizeName(nameToken);
        let code = '';

        if (inlineRest && /export\s+default|module\.exports|=>/.test(inlineRest)) {
            code = inlineRest;
        } else if (m.quoted) {
            const isDoc = m.quoted?.mtype === 'documentMessage' || !!m.quoted?.documentMessage || !!m.quoted?.fileName;
            if (isDoc) {
                const buf = await m.quoted.download();
                code = (buf || Buffer.from('')).toString('utf8').trim();
                if (!name) name = sanitizeName((m.quoted?.fileName || '').replace(/\.js$/i, ''));
            } else {
                const raw = m.quoted?.fakeObj?.message || m.msg?.contextInfo?.quotedMessage || null;
                if (raw) code = buildFromMessage(raw);
            }
        } else if (inlineRest) {
            code = inlineRest;
        }

        if (!name) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('Provide a name. Usage: addcmd <name> <code>, or reply to a .js file or a message with addcmd <name>.'));
        }
        if (!code) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('No code found. Add code after the name, or reply to a .js file or a message/buttons to convert.'));
        }
        if (!/export\s+default/.test(code)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('The code needs an "export default" so it can load as a command.'));
        }

        const targetPath = path.join(GENERAL_DIR, `${name}.js`);
        let exists = false;
        try { await fs.access(targetPath); exists = true; } catch {}
        if (exists) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`A command named "${name}" already exists in General.\n│ Use delcmd ${name} first to replace it.`));
        }

        try {
            await fs.mkdir(GENERAL_DIR, { recursive: true });
            await fs.writeFile(targetPath, code, 'utf8');
            await import(`file://${targetPath}?t=${Date.now()}`);
        } catch (e) {
            await fs.unlink(targetPath).catch(() => {});
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('Invalid command code, nothing was added: ' + String(e?.message || e).split('\n')[0]));
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await sendInteractive(client, m, fmt(`Command "${name}" added to General.\n│ Restarting to load it...`));
        setTimeout(() => { process.exit(0); }, 2000);
    });
};
