import { getMention } from '../lib/mentionStore.js';
  import { sendJson } from '../lib/botFunctions.js';

  const revive = (x) => Array.isArray(x) ? x.map(revive) : (x && typeof x === 'object') ? (typeof x.__b64__ === 'string' ? Buffer.from(x.__b64__, 'base64') : (typeof x.b64 === 'string' ? Buffer.from(x.b64, 'base64') : Object.fromEntries(Object.entries(x).map(([k,v]) => [k, revive(v)])))) : x;

  const _cooldown = new Map();
  const COOLDOWN_MS = 20000;

  export default async (client, m) => {
      try {
          if (!m?.message || m.key?.fromMe) return;
          if (!m.chat?.endsWith('@g.us')) return;

          const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
                            m.message?.imageMessage?.contextInfo?.mentionedJid ||
                            m.message?.videoMessage?.contextInfo?.mentionedJid ||
                            m.mentionedJid || [];
          if (!Array.isArray(mentioned) || !mentioned.length) return;

          const botNum    = (client.user?.id || '').split('@')[0].split(':')[0];
          const senderNum = (m.sender || '').split('@')[0].split(':')[0];

          for (const jid of mentioned) {
              const rawNum = (jid || '').split('@')[0].split(':')[0];
              if (!rawNum) continue;

              const isBot = rawNum === botNum;

              if (!isBot && rawNum === senderNum) continue;

              const lookupNum = isBot ? botNum : rawNum;
              const entry = getMention(lookupNum);
              if (!entry) continue;

              const key  = m.chat + ':' + lookupNum;
              const last = _cooldown.get(key) || 0;
              if (Date.now() - last < COOLDOWN_MS) continue;
              _cooldown.set(key, Date.now());

              if (entry.kind === 'text' && entry.text) {
                  await client.sendMessage(m.chat, { text: entry.text, mentions: [jid] }, { quoted: m });
              } else if (entry.kind === 'json' && entry.data) {
                  try { await sendJson(client, m.chat, revive(entry.data)); } catch (e) {
                      console.log('[MENTIONRESPONDER] sendJson error:', e.message);
                  }
              }
          }
      } catch (e) {
          console.log('[MENTIONRESPONDER] error:', e.message);
      }
  };
  