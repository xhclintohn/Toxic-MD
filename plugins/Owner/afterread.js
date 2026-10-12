import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

function parseDurationAndText(raw) {
  const s = String(raw || '').trim();
  if (!s) return { secs: 5, body: '' };

  const lead = s.match(/^(\d+)\s*(s|sec|secs|m|min|mins)?\s+([\s\S]+)$/i);
  if (lead) {
    let secs = parseInt(lead[1], 10);
    const u = (lead[2] || 's').toLowerCase();
    if (u.startsWith('m')) secs = secs * 60;
    secs = Math.max(1, Math.min(86400, secs));
    return { secs, body: lead[3].trim() };
  }

  const onlyNum = s.match(/^(\d+)\s*(s|sec|secs|m|min|mins)?$/i);
  if (onlyNum) {
    let secs = parseInt(onlyNum[1], 10);
    const u = (onlyNum[2] || 's').toLowerCase();
    if (u.startsWith('m')) secs = secs * 60;
    secs = Math.max(1, Math.min(86400, secs));
    return { secs, body: '' };
  }

  return { secs: 5, body: s };
}

export default {
  name: 'afterread',
  aliases: ['afr'],
  description: 'Send a message that disappears N seconds after being read',
  run: async (context) => {
    await ownerMiddleware(context, async () => {
      const { client, m, text } = context;
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      const { secs, body } = parseDurationAndText(text);
      if (!body) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(
          client,
          m,
          `╭─❏ 「 AFTERREAD」\n│ Provide text.\n│ Example: .afterread Hello\n│ Example: .afr 10 This vanishes after read\n│ Example: .afr 2m Read me then I go\n╰───────────────`
        );
      }

      try {
        await client.relayMessage(
          m.chat,
          {
            extendedTextMessage: {
              text: body,
              previewType: 0,
              contextInfo: {
                expiration: 0,
                ephemeralSettingTimestamp: Date.now(),
                disappearingMode: {
                  initiator: 0,
                  trigger: 1
                },
                afterReadDuration: secs
              },
              inviteLinkGroupTypeV2: 0
            }
          },
          {}
        );
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      } catch (e) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        await sendInteractive(
          client,
          m,
          `╭─❏ 「 AFTERREAD」\n│ Failed.\n│ ${String(e?.message || e).slice(0, 180)}\n╰───────────────`
        );
      }
    });
  }
};
