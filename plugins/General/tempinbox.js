import axios from 'axios';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'tempinbox',
    aliases: ['checkinbox', 'tempmailinbox', 'tempcheck'],
    description: 'Check your temporary email inbox',
    run: async (context) => {
        const { client, m, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const args = m.body?.split(" ") || [];
        const sessionId = args[1];

        if (!sessionId) {
            return sendInteractive(client, m, `╭─❏ 「 Tᴇᴍᴘ Iɴʙᴏx」
│ Yo, where's the session ID?\n│ You created the temp mail, right?\n│ Usage: ${prefix}tempinbox YOUR_SESSION_ID\n│ Example: ${prefix}tempinbox U2Vzc2lvbjoc5LI1OhFHh4tv21skV965\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const response = await axios.get(`https://api.nekolabs.web.id/tools/tempmail/v3/inbox?id=${sessionId}`, {
                timeout: 30000
            });

            if (!response.data.success) {
                throw new Error('Invalid session ID or inbox expired');
            }

            const { totalEmails, emails } = response.data.result;

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            if (totalEmails === 0) {
                return sendInteractive(client, m, `╭─❏ 「 Tᴇᴍᴘ Iɴʙᴏx」
│ Inbox is empty, genius.\n│ No emails yet.\n│ Use your temp email somewhere\n│ and check back.\n│ Total Emails: 0\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            let inboxText = `╭─❏ 「 Tᴇᴍᴘ Iɴʙᴏx」
│ Inbox: ${totalEmails} email${totalEmails > 1 ? 's' : ''} found\n`;

            emails.forEach((email, index) => {
                inboxText += `╭─❏ 「 TEMPINBOX 」
│ \n│ Email ${index + 1}:\n│ From: ${email.from || 'Unknown'}\n│ Subject: ${email.subject || 'No Subject'}\n`;
                
                if (email.text && email.text.trim()) {
                    const cleanText = email.text.replace(/\r\n/g, '\n').trim();
                    inboxText += `╭─❏ 「 TEMPINBOX 」
│ Content: ${cleanText.substring(0, 50)}${cleanText.length > 50 ? '...' : ''}\n`;
                }
                
                if (email.downloadUrl) {
                    inboxText += `╭─❏ 「 TEMPINBOX 」
│ Attachment URL available\n`;
                }
            });

            inboxText += `╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

            if (inboxText.length > 4000) {
                const firstPart = inboxText.substring(0, 4000);
                const secondPart = inboxText.substring(4000);

                await client.sendMessage(m.chat, { text: firstPart });
                await client.sendMessage(m.chat, { text: secondPart });
            } else {
                await client.sendMessage(m.chat, { text: inboxText });
            }

        } catch (error) {
            console.error('TempInbox error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

            let errorMessage = `Failed to check inbox, your session ID is probably trash. `;
            if (error.message.includes('Invalid session') || error.message.includes('404') || error.message.includes('Not Found')) {
                errorMessage += "Session expired or invalid. Create a new email.";
            } else if (error.message.includes('timeout')) {
                errorMessage += "API timeout. Try again.";
            } else if (error.message.includes('Network Error')) {
                errorMessage += "Network issue. Check your connection.";
            } else {
                errorMessage += `Error: ${error.message}`;
            }

            await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ ${errorMessage}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    } };
