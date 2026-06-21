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
        const out = {};
        for (const [k, v] of Object.entries(val)) out[k] = encode(v);
        return out;
    }
    return val;
};

const sendRichCode = async (client, m, introText, code, language = 'javascript') => {
    const responseId = Math.random().toString(36).substring(2);
    const encodedData = Buffer.from(JSON.stringify({
        "response_id": responseId,
        "sections": [
            { "view_model": { "primitive": { "text": introText, "__typename": "GenAIMarkdownTextUXPrimitive" }, "__typename": "GenAISingleLayoutViewModel" } },
            { "view_model": { "primitive": { "language": language, "code_blocks": [ { "content": code, "type": "DEFAULT" } ], "__typename": "GenAICodeUXPrimitive" }, "__typename": "GenAISingleLayoutViewModel" } }
        ]
    })).toString('base64');

    const content = {
        messageContextInfo: {
            threadId: [],
            deviceListMetadata: { senderKeyIndexes: [], recipientKeyIndexes: [] },
            deviceListMetadataVersion: 2,
            botMetadata: { pluginMetadata: {}, richResponseSourcesMetadata: { sources: [] } }
        },
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    submessages: [
                        { messageType: 2, messageText: introText },
                        { messageType: 3, codeMetadata: { codeLanguage: language, codeBlocks: [ { highlightType: 0, codeContent: code } ] } }
                    ],
                    messageType: 1,
                    unifiedResponse: { data: encodedData },
                    contextInfo: { mentionedJid: [], groupMentions: [], statusAttributions: [], forwardingScore: 743, isForwarded: true, forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" }, forwardOrigin: 4 }
                }
            }
        }
    };
    await client.relayMessage(m.chat, content, {});
};

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 CRM-SNIP」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (!m.quoted) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('Reply to a message, button or interactive media to compile it into an AI-rich code snippet.'));
        }

        try {
            const raw = m.quoted?.fakeObj?.message || m.msg?.contextInfo?.quotedMessage || null;
            if (!raw) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Could not read that message. Reply directly to it and try again.'));
            }

            const core = unwrap(raw) || raw;
            const payload = JSON.stringify(encode(core), null, 2);

            const fileBody =
                'const data = ' + payload + ';\n' +
                'const revive = (x) => Array.isArray(x) ? x.map(revive) : (x && typeof x === "object") ? (typeof x.__b64__ === "string" ? Buffer.from(x.__b64__, "base64") : Object.fromEntries(Object.entries(x).map(([k, v]) => [k, revive(v)]))) : x;\n' +
                'await client.sendJson(m.chat, revive(data));\n';

            const introText = `╭─❏ 「 CRM-SNIP」\n│ Compiled snippet (${fileBody.length} chars)\n│ Shown as an AI-rich code block.\n│ Use .crm on the original for a runnable file.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

            await sendRichCode(client, m, introText, fileBody, 'javascript');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt('Failed to compile: ' + (e?.message || e)));
        }
    });
};
