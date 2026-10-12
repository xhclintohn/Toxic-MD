const fetch = globalThis.fetch;

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'meta-llama/llama-4-scout-17b-16e-instruct'
];

export async function loadGroqKeys() {
  let km = {};
  try { km = await import('../keys.js'); } catch {}
  const keys = km.GROQ_API_KEYS?.length
    ? km.GROQ_API_KEYS
    : [km.GROQ_API_KEY || process.env.GROQ_KEY_1 || process.env.GROQ_API_KEY || process.env.GROQ_KEY || ''].filter(Boolean);
  return { km, keys };
}

export async function groqChat({ messages, temperature = 0.7, max_tokens = 1024, models = MODELS } = {}) {
  const { km, keys } = await loadGroqKeys();
  if (!keys.length) throw new Error('No GROQ key set. Add GROQ_KEY_1 to env vars.');

  let lastErr = null;
  for (const model of models) {
    const triedKeys = new Set();
    for (let i = 0; i < keys.length; i++) {
      const k = (km.getNextGroqKey?.()) || keys[i];
      if (!k || triedKeys.has(k)) continue;
      triedKeys.add(k);
      try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${k}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ model, messages, temperature, max_tokens })
        });
        const bodyText = await r.text();
        let data = null;
        try { data = JSON.parse(bodyText); } catch {}

        if (r.status === 429 || r.status === 401 || r.status === 403) {
          km.markKeyFailed?.(k);
          lastErr = new Error(`Groq API error: ${r.status}${data?.error?.message ? ' — ' + data.error.message : ''}`);
          continue;
        }
        if (r.status === 404 || r.status === 400) {
          lastErr = new Error(`Groq API error: ${r.status}${data?.error?.message ? ' — ' + data.error.message : ''}`);
          break;
        }
        if (!r.ok) {
          lastErr = new Error(`Groq API error: ${r.status}${data?.error?.message ? ' — ' + data.error.message : ''}`);
          continue;
        }
        const reply = data?.choices?.[0]?.message?.content?.trim();
        if (!reply) {
          lastErr = new Error('Empty response from Groq');
          continue;
        }
        return { reply, model, data };
      } catch (e) {
        lastErr = e;
      }
    }
  }
  throw lastErr || new Error('All Groq models/keys failed');
}

export default groqChat;
