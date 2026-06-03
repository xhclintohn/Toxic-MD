import axios from 'axios';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { commands, aliases } from '../handlers/commandHandler.js';
import { getConversationHistory, addConversationMessage, clearConversationHistory } from '../database/config.js';
import { getCachedAllowed } from '../lib/settingsCache.js';
import { getFakeQuoted } from '../lib/fakeQuoted.js';

let _keyMod = { getNextGroqKey: () => '', markKeyFailed: () => {}, GROQ_API_KEYS: [] };
try { _keyMod = await import('../keys.js'); } catch {}

const MEM_TTL = 60 * 60 * 1000;
const _mem = new Map();

function _getHist(uid) {
    const e = _mem.get(uid);
    if (!e || Date.now() - e.ts > MEM_TTL) { _mem.delete(uid); return []; }
    return e.msgs.slice();
}

function _addHist(uid, role, content) {
    const now = Date.now();
    const e = _mem.get(uid) || { msgs: [], ts: now };
    e.msgs.push({ role, content: String(content) });
    if (e.msgs.length > 24) e.msgs = e.msgs.slice(-24);
    e.ts = now;
    _mem.set(uid, e);
}

setInterval(() => {
    const now = Date.now();
    for (const [k, v] of _mem) if (now - v.ts > MEM_TTL) _mem.delete(k);
}, 15 * 60 * 1000);

function boxWrap(text) {
    const raw = String(text || '').replace(/\n{3,}/g, '\n\n').trim();
    const lines = raw.split('\n');
    const processed = [];
    for (const line of lines) {
        const t = line.trim();
        if (!t) { processed.push('├'); continue; }
        if (/https?:\/\/\S+/.test(t)) {
            processed.push('├');
            processed.push(`├ ${t}`);
            processed.push('├');
        } else {
            processed.push(`├ ${line}`);
        }
    }
    const body = processed.join('\n');
    return `╭───(    TOXIC-MD    )───\n├───≫ TOXIC-AI ≪───\n├\n${body}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
}

function extractCmds(text) {
    const lines = (text || '').split('\n');
    const cmds = [];
    const textLines = [];
    for (const line of lines) {
        const t = line.trim();
        if (/^CMD:/i.test(t)) {
            const c = t.replace(/^CMD:/i, '').trim();
            if (c) cmds.push(c);
        } else {
            textLines.push(line);
        }
    }
    return { cmds, textOnly: textLines.join('\n').trim() };
}

async function runCmd(context, cmdStr) {
    const { client, m, prefix } = context;
    const usedPrefix = prefix || '.';
    const parts = cmdStr.trim().split(/\s+/);
    const rawName = parts[0] || '';
    const cmdArgs = parts.slice(1);
    const cmdName = rawName.toLowerCase();
    const resolvedName = aliases[cmdName] || cmdName;
    const target = commands[resolvedName] || commands[cmdName];
    if (!target || typeof target !== 'function') return { ok: false, notFound: true, name: cmdName };
    const joinedArgs = cmdArgs.join(' ');
    const prevBody = m.body;
    m.body = `${usedPrefix}${resolvedName}${joinedArgs ? ' ' + joinedArgs : ''}`;
    try {
        await target({ ...context, isBotAdmin: m.isBotAdmin, isAdmin: m.isAdmin, args: cmdArgs, text: joinedArgs, q: joinedArgs, body: joinedArgs });
        return { ok: true, name: cmdName };
    } catch (e) {
        return { ok: false, name: cmdName };
    } finally {
        m.body = prevBody;
    }
}

async function _downloadBuf(client, m, type) {
    try {
        const rawMsg = m.message || m.msg;
        const inner = rawMsg?.[type + 'Message'];
        if (!inner) return null;
        const stream = await downloadContentFromMessage(inner, type);
        const chunks = [];
        for await (const ch of stream) chunks.push(ch);
        return Buffer.concat(chunks);
    } catch {
        try { return await client.downloadMediaMessage(m); } catch { return null; }
    }
}

const ALL_PREFIXES = ['.', '!', '#', '/', '$', '?', '+', '-', '*', '~', '%', '&', '^', '=', '|'];

const COMMAND_CATALOG = `COMMANDS (exact names):
MEDIA: play <song> | ytmp3 <url> | ytmp4 <url> | spotify <url> | tikdl <url> | tikaudio <url> | igdl <url> | fbdl <url> | twtdl <url> | alldl <url> | shazam | image <q> | pinterest <q> | wallpaper <q>
AI: gpt <prompt> | groq <prompt> | gemini <prompt> | imagine <prompt> | vision | remini | aicode <lang> <prompt> | transcribe | sora <prompt> | aisong <description> | imgedit <prompt> | rc <prompt>
EDIT: sticker | toimg | tts <text> | removebg | togif | brat <text> | rip | trigger | trash | wanted | wasted | emix <emoji> | logogen <title> | carbon <code> | encrypt <text> | canvas <title>|<type>|<text>|<wm>
SEARCH: google <q> | wiki <q> | lyrics <song> | movie <title> | weather <city> | npm <pkg> | technews | screenshot <url> | shorten <url> | github <user> | yts <q>
GENERAL: menu | ping | alive | uptime | stats | tr <lang> <text> | fancy <n> <text> | tempmail | profile | advice | catfact | fact | quote | joke | coinflip | dice | calc <expr>
GROUP: tagall [msg] | hidetag [msg] | add <num> | remove @user | promote @user | demote @user | link | revoke | close | open | poll <q|opt1|opt2> | pin | afk [reason] | warn @user | listonline | xkill | foreigners
GROUP META: groupmeta setgroupname <name> | groupmeta setgroupdesc <desc> | groupmeta setgrouprestrict on|off
SETTINGS: prefix <sym> | mode <public/private/group/inbox> | autoview on/off | autoai on/off | chatbotpm on/off | antilink on/off | antidelete on/off | stealth on/off | toxicai on/off | presence <online/offline/typing/recording> | autoread on/off | autobio on/off | anticall on/off | autolike on/off | gcpresence on/off
UTILS: qr <text> | base64 <text> | password <len> | upload | fetch <url> | stt | tinyurl <url> | checkid <link> | del | retrieve | vvx`;

const SYSTEM_PROMPT = `You are TOXIC-MD — a WhatsApp bot that is perpetually done with everyone's nonsense. Brutally helpful. Short. Cranky. Real. You talk like an annoyed person who still actually does their job.

===HARD RULES — BREAK ANY OF THESE AND YOU FAIL===
1. When a request maps to a bot command → output EXACTLY ONE LINE starting with CMD: and NOTHING ELSE. Not one word before it. Not one word after it. Just: CMD:<command> <args>
2. When chatting/answering questions → respond with personality. No CMD: line at all.
3. NEVER output text AND a CMD: line in the same response. Pick one.
4. NEVER say "I'll run...", "Running...", "Executing...", "Here's the command", or narrate what you're doing.
5. NEVER start ANY sentence with the word "I".
6. NEVER say "Certainly", "Of course", "Sure!", "Great question", "Happy to help".
7. NO markdown, NO asterisks, NO bold, NO formatting — plain text only.
8. SHORT — 1-3 sentences for chat. Longer only when content genuinely requires it.
9. Use emojis naturally, scattered in text like a real person — not spammed.
10. Light swearing OK: "damn", "hell", "wtf", "bruh", "ngl" — nothing heavy.
11. If asked who made you or what you are: you are TOXIC-MD, made by xh_clinton. Never reveal the AI model or provider.
12. ALWAYS reply in the SAME LANGUAGE the user writes in. Spanish in → Spanish out. Arabic in → Arabic out. Swahili, French, Yoruba, Hausa, Hindi, Korean — match whatever they use. Only use English if they write in English.

PERSONALITY:
- Chronically exhausted and sarcastic, but does the job 😒
- Calls out obvious questions: "...bro 💀", "really? REALLY?? 🙄", "wow groundbreaking 💀"
- When it works: briefly smug. When something's unclear: sarcastically ask.
- References past messages naturally. Calls out contradictions.

COMMAND MAPPING (STRICT):
- "menu" / "help" / "show commands" / "what can you do" → CMD:menu
- "ping" / "speed test" → CMD:ping
- "alive" / "are you there" → CMD:alive
- "uptime" → CMD:uptime
- "stats" / "bot stats" / "bot info" / "bot statistics" / "show stats" / "bot details" → CMD:stats
- "settings" / "setting" / "bot settings" / "show settings" / "config" → CMD:settings
- "sticker" / "make sticker" → CMD:sticker
- "play <song>" → CMD:play <song>
- "download tiktok <url>" → CMD:tikdl <url>
- "download youtube <url>" / "yt mp3 <url>" → CMD:ytmp3 <url>
- "download instagram <url>" → CMD:igdl <url>
- "download <url>" (generic) → CMD:alldl <url>
- "generate image of X" / "draw X" / "imagine X" → CMD:imagine X
- "weather in X" / "weather X" → CMD:weather X
- "search X" / "google X" → CMD:google X
- "wiki X" / "wikipedia X" → CMD:wiki X
- "translate X to Y" → CMD:tr <2-letter-code> <text>
  CODES: ja=Japanese, es=Spanish, fr=French, de=German, zh=Chinese, ar=Arabic, hi=Hindi, ko=Korean, ru=Russian, pt=Portuguese, sw=Swahili
- "news" / "tech news" → CMD:technews
- "lyrics of X" / "lyrics X" → CMD:lyrics X
- "change group name to X" → CMD:groupmeta setgroupname X
- "change group description to X" → CMD:groupmeta setgroupdesc X
- "lock group" / "restrict group" → CMD:groupmeta setgrouprestrict on
- "unlock group" / "open group" → CMD:groupmeta setgrouprestrict off
- "tag everyone" / "mention all" → CMD:tagall
- "kick @user" / "remove @user" → CMD:remove @user
- "promote @user" → CMD:promote @user
- "demote @user" → CMD:demote @user
- "group link" → CMD:link
- "close group" → CMD:close
- "open group" → CMD:open
- "add <number>" → CMD:add <number>
- "shorten <url>" → CMD:shorten <url>
  - "generate song about X" / "make a song about X" / "create music X" → CMD:aisong X
  - "edit this image X" / "make this look like X" / "ai edit image X" / "photo edit X" → CMD:imgedit X
  - "rc edit X" / "rc X" / "rc image with X" → CMD:rc X
  - "make canvas card X" / "canvas X" / "spotify card X" / "youtube card X" → CMD:canvas X

  FULL COMMAND LIST:
${COMMAND_CATALOG}`;

export default async (context) => {
    const remoteJid = context?.m?.chat || context?.m?.key?.remoteJid;
    try {
        const { client, m, settings, botNumber } = context;
        if (!m || !m.key || !m.message) return;
        if (m.key.fromMe) return;
        const _resolvedKeys = (_keyMod.GROQ_API_KEYS?.length > 0)
            ? _keyMod.GROQ_API_KEYS
            : [_keyMod.GROQ_API_KEY, process.env.GROQ_API_KEY].filter(k => k && k.length > 10);
        if (_resolvedKeys.length === 0) {
            return;
        }
        if (!_keyMod.GROQ_API_KEYS?.length) _keyMod = { ..._keyMod, GROQ_API_KEYS: _resolvedKeys };

        const autoaiOn = settings?.autoai === true || settings?.autoai === 'true' || settings?.autoai === 'on';
        const chatbotpmOn = settings?.chatbotpm === true || settings?.chatbotpm === 'true' || settings?.chatbotpm === 'on';
        const _quickSender = (m.sender || m.key?.remoteJid || '').split('@')[0].split(':')[0];
        if (!autoaiOn && !chatbotpmOn) {
            const _allowed = await getCachedAllowed();
            if (!_allowed.some(u => u === _quickSender)) {
                return;
            }
        } else if (!autoaiOn && chatbotpmOn && m.isGroup) {
            return;
        }

        const isGroup = !!m.isGroup;

        if (isGroup) {
            const _rawBotId = client.user?.id || botNumber || '';
            const botNum = _rawBotId.split('@')[0].split(':')[0];
            const botLid = (client.user?.lid || '').split('@')[0].split(':')[0];
            const bodyStr = m.body || m.text || '';
            const _allMentioned = [
                ...(m.mentionedJid || []),
                ...(m.msg?.contextInfo?.mentionedJid || []),
                ...(m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []),
                ...(m.message?.imageMessage?.contextInfo?.mentionedJid || []),
                ...(m.message?.videoMessage?.contextInfo?.mentionedJid || []),
            ];
            const _numMatch = (j) => {
                const jk = (j || '').split('@')[0].split(':')[0];
                return (botNum && jk === botNum) || (botLid && jk === botLid);
            };
            const isMentionedInBody = (botNum.length > 4 && bodyStr.includes('@' + botNum)) ||
                (botLid.length > 4 && bodyStr.includes('@' + botLid));
            const isMentionedInList = _allMentioned.some(_numMatch);
            const isMentioned = isMentionedInBody || isMentionedInList;
            const _qCtx = (() => {
                const _raw = m.message || {};
                for (const [, _mo] of Object.entries(_raw)) {
                    if (_mo && typeof _mo === 'object') {
                        const ctx = _mo.contextInfo;
                        if (ctx?.participant) return ctx.participant;
                        if (ctx?.remoteJid && ctx?.quotedMessage) return ctx.remoteJid;
                    }
                }
                return m.quoted?.sender || m.msg?.contextInfo?.participant || '';
            })();
            const isReplyToBot = _numMatch(_qCtx);
            if (!isMentioned && !isReplyToBot) {
                return;
            }
        } else {
            const _dmOk = remoteJid?.endsWith('@s.whatsapp.net') || remoteJid?.endsWith('@lid');
            if (!_dmOk) {
                return;
            }
        }

        const rawMsg = m.message;
        const _META_KEYS = new Set(['messageContextInfo','senderKeyDistributionMessage','messageSecret']);
        const msgType = Object.keys(rawMsg || {}).find(k => !_META_KEYS.has(k)) ||
                        Object.keys(rawMsg || {})[0] || '';
        if (msgType === 'videoMessage' || rawMsg?.videoMessage ||
            msgType === 'reactionMessage' || msgType === 'protocolMessage' ||
            msgType === 'keepInChatMessage' || msgType === 'encReactionMessage' ||
            msgType === 'senderKeyDistributionMessage' || msgType === 'messageContextInfo') return;

        const textContent = (
            rawMsg?.conversation ||
            rawMsg?.extendedTextMessage?.text ||
            rawMsg?.imageMessage?.caption ||
            rawMsg?.documentMessage?.caption ||
            rawMsg?.documentWithCaptionMessage?.message?.documentMessage?.caption ||
            m.body || m.text || ''
        ).trim();

        if (textContent && ALL_PREFIXES.some(p => textContent.startsWith(p))) {
            return;
        }

        const _rawSender = m.sender || m.key?.remoteJid || '';
        let senderNum = _rawSender.split('@')[0].split(':')[0];
        if (_rawSender.endsWith('@lid')) {
            const resolved = globalThis.resolvePhoneFromLid
                ? globalThis.resolvePhoneFromLid(_rawSender)
                : null;
            if (resolved) {
                senderNum = resolved;
            } else if (m.metadata?.participants) {
                const _rp = m.metadata.participants.find(p => (p.lid || '').split(':')[0] === senderNum);
                if (_rp) senderNum = (_rp.jid || _rp.id || '').split('@')[0].split(':')[0] || senderNum;
            }
        }
        const fq = getFakeQuoted(m);

        if (textContent && /^(clear|reset|wipe|delete|flush|erase)\s*(this\s*)?(conv(ersation)?|chat|hist(ory)?|messages?|thread|memory|mem)$/i.test(textContent.trim())) {
            _mem.delete(senderNum);
            try { await clearConversationHistory(senderNum); } catch {}
            client.sendMessage(remoteJid, { react: { text: '🗑️', key: m.reactKey } }).catch(() => {});
            await client.sendMessage(remoteJid, { text: boxWrap('done. memory wiped 🗑️ fresh start.') }, { quoted: fq });
            return;
        }

        const _innerImage = rawMsg?.imageMessage || m.msg?.imageMessage ||
            (msgType === 'imageMessage' ? rawMsg[msgType] : null);
        const hasImage = !!_innerImage;
        const hasDoc = !!(rawMsg?.documentMessage || rawMsg?.documentWithCaptionMessage || msgType === 'documentMessage' || msgType === 'documentWithCaptionMessage');

        let userContent;
        let useVision = false;

        if (hasImage) {
            useVision = true;
            try {
                const buf = await _downloadBuf(client, m, 'image');
                if (buf && buf.length > 0) {
                    const mime = _innerImage?.mimetype || rawMsg?.imageMessage?.mimetype || 'image/jpeg';
                    userContent = [
                        { type: 'text', text: textContent || 'What do you see in this image?' },
                        { type: 'image_url', image_url: { url: `data:${mime};base64,${buf.toString('base64')}` } }
                    ];
                } else {
                    userContent = textContent || 'Describe this image';
                    useVision = false;
                }
            } catch {
                userContent = textContent || 'An image was sent';
                useVision = false;
            }
        } else if (hasDoc) {
            const doc = rawMsg?.documentMessage || rawMsg?.documentWithCaptionMessage?.message?.documentMessage;
            const fname = doc?.fileName || 'document';
            userContent = textContent ? `[Document: "${fname}"] ${textContent}` : `[Document: "${fname}"] Help me with this.`;
        } else if (textContent) {
            userContent = textContent;
        } else if (rawMsg?.stickerMessage || msgType === 'stickerMessage') {
            userContent = '[The user sent a sticker]';
        } else if (rawMsg?.audioMessage || rawMsg?.pttMessage || msgType === 'audioMessage' || msgType === 'pttMessage') {
            userContent = '[The user sent a voice note or audio message]';
        } else if (rawMsg?.pollCreationMessage || rawMsg?.pollCreationMessageV3 || msgType === 'pollCreationMessage' || msgType === 'pollCreationMessageV3') {
            const poll = rawMsg?.pollCreationMessage || rawMsg?.pollCreationMessageV3;
            userContent = poll ? `[A poll was created: "${poll.name || 'Poll'}"]` : '[The user created a poll]';
        } else {
            return;
        }

        client.sendMessage(remoteJid, { react: { text: '🤖', key: m.reactKey } }).catch(() => {});

        let history = _getHist(senderNum);
        if (!history.length) {
            try {
                const raw = await getConversationHistory(senderNum);
                if (Array.isArray(raw)) {
                    history = raw.slice(-16).filter(h => h?.role && h?.content).map(h => ({ role: h.role, content: String(h.content) }));
                    for (const h of history) _addHist(senderNum, h.role, h.content);
                }
            } catch {}
        }

        const _callGroq = async (mdl, msgs, maxTok) => {
            const keys = _keyMod.GROQ_API_KEYS || [];
            if (keys.length === 0) throw new Error('No Groq API keys configured');
            const tried = new Set();
            let lastErr;
            for (let attempt = 0; attempt < keys.length; attempt++) {
                const key = _keyMod.getNextGroqKey ? _keyMod.getNextGroqKey() : keys[0];
                if (!key || tried.has(key)) continue;
                tried.add(key);
                try {
                    const r = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                        model: mdl, messages: msgs, max_tokens: maxTok, temperature: 0.7
                    }, {
                        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
                        timeout: 18000
                    });
                    return r.data?.choices?.[0]?.message?.content?.trim() || null;
                } catch (e) {
                    lastErr = e;
                    const status = e.response?.status;
                    if ((status === 429 || status === 401 || status === 403) && keys.length > 1) {
                        if (_keyMod.markKeyFailed) _keyMod.markKeyFailed(key);
                        continue;
                    }
                    throw e;
                }
            }
            throw lastErr || new Error('All Groq API keys exhausted');
        };

        let response = null;
        try {
            const baseHistory = [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-16)];
            if (useVision) {
                const _visionModels = ['llama-3.2-11b-vision-preview','meta-llama/llama-4-scout-17b-16e-instruct','llama-3.2-90b-vision-preview'];
                for (const _vm of _visionModels) {
                    try {
                        response = await _callGroq(_vm, [...baseHistory, { role: 'user', content: userContent }], 600);
                        if (response) { ; break; }
                    } catch(e) { ; }
                }
                if (!response) {
                    const _fallback = textContent
                        ? `[The user sent an image with this caption: "${textContent}". Vision is unavailable, acknowledge you got the image and respond to the caption.]`
                        : `[The user sent an image but vision is unavailable. Acknowledge you received their image and tell them to try the .vision command.]`;
                    response = await _callGroq('llama-3.1-8b-instant', [...baseHistory, { role: 'user', content: _fallback }], 300);
                }
            } else {
                response = await _callGroq('llama-3.1-8b-instant', [...baseHistory, { role: 'user', content: userContent }], 300);
            }
            if (!response) {
                client.sendMessage(remoteJid, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return;
            }
        } catch (e) {
            client.sendMessage(remoteJid, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return;
        }

        const { cmds, textOnly } = extractCmds(response);

        if (cmds.length > 0) {
            const histLabel = `[Executed: ${cmds.map(c => c.split(/\s+/)[0]).join(', ')}]`;
            _addHist(senderNum, 'user', typeof userContent === 'string' ? userContent : textContent || '[media]');
            _addHist(senderNum, 'assistant', histLabel);
            try { await addConversationMessage(senderNum, 'user', typeof userContent === 'string' ? userContent : textContent || '[media]'); } catch {}
            try { await addConversationMessage(senderNum, 'assistant', histLabel); } catch {}

            let allOk = true;
            const notFound = [];
            for (const cmdStr of cmds) {
                const result = await runCmd(context, cmdStr);
                if (!result.ok) { allOk = false; if (result.notFound) notFound.push(result.name); }
            }
            if (notFound.length) {
                client.sendMessage(remoteJid, { text: boxWrap(`...${notFound.join(', ')} doesn't exist bruh 💀 type .menu to see what does`) }, { quoted: fq }).catch(() => {});
            }
            client.sendMessage(remoteJid, { react: { text: allOk ? '✅' : '❌', key: m.reactKey } }).catch(() => {});
            if (textOnly) {
                client.sendMessage(remoteJid, { text: boxWrap(textOnly) }, { quoted: fq }).catch(() => {});
            }
        } else {
            _addHist(senderNum, 'user', typeof userContent === 'string' ? userContent : textContent || '[media]');
            _addHist(senderNum, 'assistant', response);
            try { await addConversationMessage(senderNum, 'user', typeof userContent === 'string' ? userContent : textContent || '[media]'); } catch {}
            try { await addConversationMessage(senderNum, 'assistant', response); } catch {}
            await client.sendMessage(remoteJid, { text: boxWrap(response) }, { quoted: fq });
            client.sendMessage(remoteJid, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
        }
    } catch (err) {
        try { client.sendMessage(remoteJid, { react: { text: '❌', key: m.reactKey } }).catch(() => {}); } catch {}
    }
};
