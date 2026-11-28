import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { createTempMail, checkTempInbox, formatInboxText, registerSessionCode, resolveSessionCode } from '../../lib/tempMail.js';

const handledTaps = new Set();
let tapListenerRegistered = false;

const unwrapContent = (rawMsg) => {
    let content = rawMsg?.message;
    while (content) {
        if (content.deviceSentMessage?.message) { content = content.deviceSentMessage.message; continue; }
        if (content.ephemeralMessage?.message) { content = content.ephemeralMessage.message; continue; }
        if (content.viewOnceMessage?.message) { content = content.viewOnceMessage.message; continue; }
        if (content.viewOnceMessageV2?.message) { content = content.viewOnceMessageV2.message; continue; }
        if (content.viewOnceMessageV2Extension?.message) { content = content.viewOnceMessageV2Extension.message; continue; }
        break;
    }
    return content;
};

const registerTapListener = (client) => {
    if (tapListenerRegistered) return;
    tapListenerRegistered = true;
    client.ev.on('messages.upsert', async (update) => {
        try {
            for (const msg of update.messages || []) {
                try {
                    if (!msg.message) continue;
                    if (handledTaps.has(msg.key.id)) continue;
                    const content = unwrapContent(msg);
                    let tapId = '';
                    const resp = content?.interactiveResponseMessage?.nativeFlowResponseMessage;
                    if (resp) {
                        try {
                            const params = typeof resp.paramsJson === 'string' ? JSON.parse(resp.paramsJson || '{}') : (resp.paramsJson || {});
                            tapId = params.id || params.selectedId || '';
                        } catch {}
                    }
                    if (!tapId && content?.templateButtonReplyMessage?.selectedId) {
                        tapId = content.templateButtonReplyMessage.selectedId;
                    }
                    const match = typeof tapId === 'string' ? tapId.match(/^tempinbox_([a-z0-9]+)$/) : null;
                    if (!match) continue;
                    handledTaps.add(msg.key.id);
                    const chat = msg.key.remoteJid;
                    const sessionId = resolveSessionCode(match[1]);
                    if (!sessionId) {
                        await client.sendMessage(chat, { text: `╭─❏ 「 Eʀʀᴏʀ」
│ That mail session expired. Create a new one with tempmail.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
                        continue;
                    }
                    try {
                        const { total, emails } = await checkTempInbox(sessionId);
                        await client.sendMessage(chat, { text: formatInboxText(total, emails) });
                    } catch (error) {
                        const errorMessage = error.message.includes('Invalid session')
                            ? 'That session ID is trash. Create a new email with tempmail first.'
                            : 'Failed to check inbox. The email provider is not responding, try again in a bit.';
                        await client.sendMessage(chat, { text: `╭─❏ 「 Eʀʀᴏʀ」
│ ${errorMessage}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
                    }
                } catch {}
            }
        } catch {}
    });
};

export default {
    name: 'tempmail',
    aliases: ['tempemail', 'tempmailcreate'],
    description: 'Create temporary email for disposable inbox',
    run: async (context) => {
        const { client, m, prefix } = context;

        registerTapListener(client);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const { email, sessionId } = await createTempMail();
            const code = registerSessionCode(sessionId);

            await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });

            const bodyText = `╭─❏ 「 Tᴇᴍᴘ Mᴀɪʟ」
│ TEMPORARY EMAIL CREATED!
│ 
│ YOUR EMAIL:
│ ${email}
│ 
│ Tap Check Inbox below to view your mails
╰───────────────`;

            try {
                const msg = generateWAMessageFromContent(
                    m.chat,
                    {
                        interactiveMessage: {
                            body: { text: bodyText },
                            footer: { text: '> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' },
                            header: { title: 'Temp Mail', subtitle: '', hasMediaAttachment: false },
                            nativeFlowMessage: {
                                messageParamsJson: '{}',
                                buttons: [
                                    {
                                        name: 'cta_copy',
                                        buttonParamsJson: JSON.stringify({
                                            display_text: 'Copy Email',
                                            copy_code: email
                                        })
                                    },
                                    {
                                        name: 'quick_reply',
                                        buttonParamsJson: JSON.stringify({
                                            display_text: 'Check Inbox',
                                            id: `tempinbox_${code}`
                                        })
                                    }
                                ]
                            },
                            contextInfo: {}
                        }
                    },
                    { userJid: client.user?.id }
                );
                await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            } catch {
                await sendInteractive(client, m, `╭─❏ 「 Tᴇᴍᴘ Mᴀɪʟ」
│ TEMPORARY EMAIL CREATED!
│ 
│ YOUR EMAIL:
│ ${email}
│ 
│ SESSION ID:
│ ${sessionId}
│ 
│ HOW TO CHECK INBOX:
│ ${prefix}tempinbox ${sessionId}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

        } catch (error) {
            console.error('TempMail error:', error.message);
            await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });

            await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Failed to create temporary email. All email providers are down right now, try again in a bit.
╰───────────────
> ©𝐏𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    } };
