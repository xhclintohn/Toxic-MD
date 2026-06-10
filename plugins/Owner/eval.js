import util from 'util';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const BLOCKED_PATTERNS = [
    /process\.env/,
    /config\/settings/,
    /require\s*\(\s*['"].*settings['`]/
];

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, isAdmin, isBotAdmin, Owner, isDev, isSudo, itsMe, store, settings, botNumber, args, pushname, mode, pict, botname, totalCommands, sock, conn } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const raw = (text || (m.quoted && (m.quoted.text || m.quoted.caption)) || '').trim();

        try {
            if (!raw) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return sendInteractive(client, m, `╭─❏ 「 EVAL 」\n│ You sent nothing.\n│ What am I supposed to eval,\n│ your disappointment?\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
            for (const pattern of BLOCKED_PATTERNS) {
                if (pattern.test(raw)) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    return sendInteractive(client, m, `╭─❏ 「 BLOCKED 」\n│ That eval is blocked for security.\n│ Nice try though.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }
            }

            let evaled;
            try {
                evaled = await eval(`(async () => { return (${raw}) })()`);
            } catch {
                evaled = await eval(`(async () => { ${raw} })()`);
            }
            if (typeof evaled !== 'string') evaled = util.inspect(evaled, { depth: 4 });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await sendInteractive(client, m, String(evaled ?? 'undefined'));
        } catch (err) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await sendInteractive(client, m, `╭─❏ 「 EVAL ERROR 」\n│ ${String(err)}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    });
};