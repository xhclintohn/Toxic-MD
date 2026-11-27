import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

function cleanPhone(input) {
    if (!input) return '';
    let s = String(input).trim();
    s = s.replace(/@s\.whatsapp\.net$/i, '').replace(/@lid$/i, '').split(':')[0];
    s = s.replace(/[^\d]/g, '');
    return s;
}

export default {
    name: 'xreport',
    aliases: ['xrp', 'interopspam'],
    description: 'Report a number for interop spam via Baileys reportInteropSpam (owner only)',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, args, sock } = context;
            const bot = sock || client;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

            let raw = '';
            if (m.quoted) {
                raw = m.quoted.sender || '';
            } else if (m.mentionedJid && m.mentionedJid.length) {
                raw = m.mentionedJid[0];
            } else {
                raw = (args || []).join('') || (args && args[0]) || '';
            }

            const number = cleanPhone(raw);
            if (!number || number.length < 7 || number.length > 15) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m,
`╭─❏ 「 XREPORT 」
│ Provide a valid WhatsApp number.
│ Example: *.xrp 254735342800*
│ Also works with quote / @mention.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                );
            }

            const targetJid = number + '@s.whatsapp.net';

            if (typeof bot.reportTarget !== 'function' && typeof bot.reportInteropSpam !== 'function') {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m,
`╭─❏ 「 XREPORT 」
│ Reporting is not available
│ on this Baileys build.
│ Update Baileys then try again.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                );
            }

            try {
                let reportId = null;
                if (typeof bot.reportTarget === 'function') {
                    const res = await bot.reportTarget(targetJid);
                    reportId = res?.reportId || null;
                } else {
                    await bot.reportInteropSpam(targetJid);
                }
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m,
`╭─❏ 「 XREPORT 」
│ Number *${number}* was reported for spam!!
│ JID: ${targetJid}
│ Status: success ✅${reportId ? `\n│ Report ID: ${reportId}` : ''}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                );
            } catch (error) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m,
`╭─❏ 「 XREPORT 」
│ Failed to report *${number}*
│ Error: ${error?.message || error}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                );
            }
        });
    }
};
