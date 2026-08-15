const afkMap = new Map();

  function getAllMentioned(m) {
      const allMentions = new Set();
      const msg = m.message || {};
      for (const val of Object.values(msg)) {
          if (!val || typeof val !== 'object') continue;
          const ctx = val.contextInfo || val.message?.contextInfo;
          if (ctx?.mentionedJid) for (const j of ctx.mentionedJid) allMentions.add(j);
          if (ctx?.participant) allMentions.add(ctx.participant);
          if (ctx?.quotedMessage) {
              const qp = ctx.participant;
              if (qp) allMentions.add(qp);
          }
      }
      if (m.mentionedJid) for (const j of m.mentionedJid) allMentions.add(j);
      return [...allMentions].filter(Boolean);
  }

  export default async (client, m) => {
      if (!m || !m.sender) return;
      const senderNum = m.sender.split('@')[0].split(':')[0];

      if (afkMap.has(senderNum)) {
          const { reason, time } = afkMap.get(senderNum);
          const mins = Math.floor((Date.now() - time) / 60000);
          afkMap.delete(senderNum);
          try {
              await client.sendMessage(m.chat, {
                  text: `╭─❏ 「 BACK ONLINE」\n│ @${senderNum} finally crawled back.\n│ Was AFK for ${mins} min${mins !== 1 ? 's' : ''}.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                  mentions: [m.sender]
              });
          } catch {}
          return;
      }

      const mentioned = getAllMentioned(m);
      const alerted = new Set();

      for (const jid of mentioned) {
          const num = jid.split('@')[0].split(':')[0];
          if (!num || num === senderNum || alerted.has(num)) continue;

          if (afkMap.has(num)) {
              const { reason, time } = afkMap.get(num);
              const mins = Math.floor((Date.now() - time) / 60000);
              alerted.add(num);
              try {
                  await client.sendMessage(m.chat, {
                      text: `╭─❏ 「 AFK ALERT」\n│ @${num} is currently AFK.\n│ Reason: ${reason || 'none given 💀'}\n│ Since: ${mins} min${mins !== 1 ? 's' : ''} ago\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                      mentions: [jid, m.sender]
                  });
              } catch {}
          }
      }
  };

  export const setAfk    = (num, reason) => afkMap.set(num, { reason, time: Date.now() });
  export const removeAfk = (num) => afkMap.delete(num);
  export const isAfk     = (num) => afkMap.has(num);
  