import fetch from 'node-fetch';
import { sendInteractive } from '../../lib/sendInteractive.js';


export default async (context) => {
    const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (!text) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Type a prompt, genius.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
        let _km = {};
        try { _km = await import('../../keys.js'); } catch {}
        const _groqKeys = _km.GROQ_API_KEYS?.length ? _km.GROQ_API_KEYS : [_km.GROQ_API_KEY || process.env.GROQ_KEY_1 || process.env.GROQ_API_KEY || ''].filter(Boolean);
        if (!_groqKeys.length) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ No GROQ key set. Add GROQ_KEY_1 to env vars.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
        const _callGroq = async (payload) => {
            const tried = new Set();
            for (let i = 0; i < _groqKeys.length; i++) {
                const k = (_km.getNextGroqKey?.()) || _groqKeys[i];
                if (!k || tried.has(k)) continue;
                tried.add(k);
                const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${k}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if ((r.status === 429 || r.status === 401 || r.status === 403) && _groqKeys.length > 1) {
                    _km.markKeyFailed?.(k);
                    continue;
                }
                return r;
            }
            throw new Error('All GROQ keys exhausted');
        };

    try {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const res = await _callGroq({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a highly capable AI assistant. Answer accurately and concisely.' },
                    { role: 'user', content: text }
                ],
                max_tokens: 1024,
                temperature: 0.7
            });

        if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new Error('Empty response from AI.');

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await sendInteractive(client, m, `╭─❏ 「 Gᴘᴛ Rᴇsᴘᴏɴsᴇ」
│ ${reply}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

    } catch (error) {
        console.error('GPT error:', error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ AI choked. Classic.\n│ ${error.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};
