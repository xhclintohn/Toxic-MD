import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { sendJson } from '../../lib/botFunctions.js';

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

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m } = context;
        const sock = client, conn = client, bot = client, xh = client, clint = client, wa = client;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 RUN」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (!m.quoted) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('Reply to a .js file from .crm, or to any message/buttons/interactive media to recreate and send it.'));
        }

        try {
            const isDoc = m.quoted?.mtype === 'documentMessage' || !!m.quoted?.documentMessage || !!m.quoted?.fileName;

            if (isDoc) {
                const buf = await m.quoted.download();
                const code = (buf || Buffer.from('')).toString('utf8').trim().replace(/\r/g, '');
                if (!code) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt('That file is empty.'));
                }

                let lastErr;
                const attempts = [
                    `(async () => { ${code}\n })()`,
                    `(async () => { return (${code})\n })()`,
                ];
                let ran = false;
                for (const attempt of attempts) {
                    try {
                        await eval(attempt);
                        ran = true;
                        break;
                    } catch (e) {
                        lastErr = e;
                    }
                }
                if (!ran) throw lastErr;
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return;
            }

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
                return sendInteractive(client, m, fmt('Could not read that message.'));
            }
            const core = unwrap(raw) || raw;
            await sendJson(client, m.chat, core);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt('Run failed: ' + (e?.message || e)));
        }
    });
};
