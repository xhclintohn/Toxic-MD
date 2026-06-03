import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';


  export default async (context) => {
      const { client, m, text } = context;
      const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      if (!text) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ Provide a query, you walnut.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
      let _km = {};
      try { _km = await import('../../keys.js'); } catch {}
      const _groqKeys = _km.GROQ_API_KEYS?.length ? _km.GROQ_API_KEYS : [_km.GROQ_API_KEY || process.env.GROQ_KEY_1 || process.env.GROQ_API_KEY || ''].filter(Boolean);
      if (!_groqKeys.length) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ No GROQ key set. Add GROQ_KEY_1 to env vars.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
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
                      { role: 'system', content: 'You are a helpful AI assistant powered by Groq\'s ultra-fast inference. Answer simply and clearly.' },
                      { role: 'user', content: text }
                  ],
                  max_tokens: 1024, temperature: 0.7
              });
          if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (!content) throw new Error('No response received.');
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ Gʀᴏǫ Rᴇsᴘᴏɴsᴇ ≪───\n├ \n├ ${content}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
      } catch (error) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ ${error.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
  };
  