import axios from 'axios';
import { sendInteractive } from '../../lib/sendInteractive.js';

const sendRichCode = async (client, m, introText, code, language) => {
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
    const { client, m, text, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const fmt = (msg) => `╭─❏ 「 CLONEWEB」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    if (!text) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Get the raw source code of a website.\n│ Example: ${prefix}cloneweb https://example.com`));
    }

    try {
        let url = text.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 60000,
            maxContentLength: 1024 * 1024 * 10,
            maxBodyLength: 1024 * 1024 * 10,
            responseType: 'text',
            transformResponse: [(d) => d]
        });

        const source = typeof res.data === 'string' ? res.data : String(res.data ?? '');
        if (!source) throw new Error('Empty response from the server.');

        let host = url;
        try { host = new URL(url).hostname; } catch {}

        const preview = source.length > 12000 ? source.slice(0, 12000) + '\n... [truncated, full source attached below]' : source;
        const introText = `╭─❏ 「 CLONEWEB」\n│ Source: ${host}\n│ Status: ${res.status}\n│ Size: ${source.length} chars\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        await sendRichCode(client, m, introText, preview, 'html');
        await client.sendMessage(m.chat, {
            document: Buffer.from(source, 'utf8'),
            fileName: host.replace(/[^a-z0-9.-]/gi, '_') + '.html',
            mimetype: 'text/html',
            caption: fmt(`📄 Full source of ${host}\n│ ${source.length} chars`)
        });
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    } catch (e) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        const detail = e?.response?.status ? ('HTTP ' + e.response.status) : (e?.message || String(e));
        await sendInteractive(client, m, fmt('Failed to fetch source: ' + detail));
    }
};
