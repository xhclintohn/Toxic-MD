import { sendInteractive } from '../../lib/sendInteractive.js';
import { checkTempInbox, formatInboxText, resolveSessionCode } from '../../lib/tempMail.js';

export default {
    name: 'tempinbox',
    aliases: ['checkinbox', 'tempmailinbox', 'tempcheck'],
    description: 'Check your temporary email inbox',
    run: async (context) => {
        const { client, m, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const rawArg = context.args?.[0] || m.body?.split(" ")?.[1];
        const sessionId = rawArg ? (resolveSessionCode(rawArg) || rawArg) : null;

        if (!sessionId) {
            return sendInteractive(client, m, `╭─❏ 「 Tᴇᴍᴘ Iɴʙᴏx」
│ Yo, where's the session ID?
│ You created the temp mail, right?
│ Usage: ${prefix}tempinbox YOUR_SESSION_ID
│ Create one first with ${prefix}tempmail
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        try {
            const { total, emails } = await checkTempInbox(sessionId);

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            if (total === 0) {
                return sendInteractive(client, m, `╭─❏ 「 Tᴇᴍᴘ Iɴʙᴏx」
│ Inbox is empty, genius.
│ No emails yet.
│ Use your temp email somewhere
│ and check back.
│ Total Emails: 0
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const inboxText = formatInboxText(total, emails);

            if (inboxText.length > 4000) {
                const firstPart = inboxText.substring(0, 4000);
                const secondPart = inboxText.substring(4000);

                await client.sendMessage(m.chat, { text: firstPart });
                await client.sendMessage(m.chat, { text: secondPart });
            } else {
                await client.sendMessage(m.chat, { text: inboxText });
            }

        } catch (error) {
            console.error('TempInbox error:', error.message);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

            const errorMessage = error.message.includes('Invalid session')
                ? 'That session ID is trash. Create a new email with tempmail first.'
                : 'Failed to check inbox. The email provider is not responding, try again in a bit.';

            await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ ${errorMessage}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    } };
