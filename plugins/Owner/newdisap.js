import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const GROUP_DURATIONS = {
  '60': 60,
  '5m': 300,
  '300': 300,
  '1h': 3600,
  '3600': 3600,
  '12h': 43200,
  '43200': 43200,
  '24h': 86400,
  '86400': 86400,
  '1d': 86400,
  '7d': 604800,
  '604800': 604800,
  '90d': 7776000,
  '7776000': 7776000,
  off: 0,
  '0': 0,
  false: 0,
  disable: 0
};

function parsePrivateSeconds(raw) {
  if (!raw) return 5;
  const s = String(raw).trim().toLowerCase();
  if (/^\d+$/.test(s)) return Math.max(1, Math.min(86400, parseInt(s, 10)));
  const m = s.match(/^(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours)$/);
  if (!m) return 5;
  const n = parseInt(m[1], 10);
  const u = m[2];
  if (u.startsWith('s')) return Math.max(1, Math.min(86400, n));
  if (u.startsWith('m')) return Math.max(1, Math.min(86400, n * 60));
  if (u.startsWith('h')) return Math.max(1, Math.min(86400, n * 3600));
  return 5;
}

function parseGroupExpiration(raw) {
  if (!raw) return 60;
  const s = String(raw).trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(GROUP_DURATIONS, s)) return GROUP_DURATIONS[s];
  if (/^\d+$/.test(s)) {
    const n = parseInt(s, 10);
    const allowed = [0, 60, 300, 3600, 43200, 86400, 604800, 7776000];
    if (allowed.includes(n)) return n;
    let best = 60;
    let bestDiff = Infinity;
    for (const a of allowed) {
      const d = Math.abs(a - n);
      if (d < bestDiff) {
        bestDiff = d;
        best = a;
      }
    }
    return best;
  }
  return 60;
}

function labelSeconds(sec) {
  if (!sec) return 'off';
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h`;
  if (sec < 604800) return `${Math.round(sec / 86400)}d`;
  if (sec === 604800) return '7d';
  if (sec === 7776000) return '90d';
  return `${sec}s`;
}

export default {
  name: 'newdisap',
  aliases: ['newdisappearing', 'customdisap', 'ephset', 'cdisap'],
  description: 'Custom ephemeral: after-read timer in private, disappearing messages in groups',
  run: async (context) => {
    await ownerMiddleware(context, async () => {
      const { client, m, text } = context;
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      const isGroup = !!(m.isGroup || String(m.chat).endsWith('@g.us'));
      const arg = String(text || '').trim();

      try {
        if (isGroup) {
          const expiration = parseGroupExpiration(arg);
          try {
            await client.sendMessage(m.chat, { disappearingMessagesInChat: expiration });
          } catch {
            await client.query({
              tag: 'iq',
              attrs: {
                type: 'set',
                xmlns: 'w:g2',
                to: m.chat
              },
              content: [
                {
                  tag: 'ephemeral',
                  attrs: {
                    expiration: String(expiration),
                    trigger: '1'
                  }
                }
              ]
            });
          }
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          await sendInteractive(
            client,
            m,
            `╭─❏ 「 NEWDISAP」\n│ Group disappearing messages set to *${labelSeconds(expiration)}*.\n│ Allowed: 60s, 5m, 1h, 12h, 24h, 7d, 90d, off\n╰───────────────`
          );
          return;
        }

        const secs = parsePrivateSeconds(arg);
        await client.relayMessage(
          m.chat,
          {
            protocolMessage: {
              type: 3,
              afterReadDuration: secs
            }
          },
          {}
        );
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await sendInteractive(
          client,
          m,
          `╭─❏ 「 NEWDISAP」\n│ Private after-read duration set to *${secs}s*.\n│ Messages auto-clear ${secs}s after being read.\n╰───────────────`
        );
      } catch (e) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        await sendInteractive(
          client,
          m,
          `╭─❏ 「 NEWDISAP」\n│ Failed.\n│ ${String(e?.message || e).slice(0, 180)}\n╰───────────────`
        );
      }
    });
  }
};
