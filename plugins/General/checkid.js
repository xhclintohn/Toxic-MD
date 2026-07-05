import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default {
    name: 'checkid',
    aliases: ['cekid', 'getid', 'id', 'idch', 'getjid', 'jid', 'groupjid', 'gcid', 'gjid'],
    description: 'Get JID from group or channel invite link',
    run: async (context) => {
        const { client, m, prefix } = context;

        try {
            const text = m.body.trim();
            const linkMatch = text.match(/https?:\/\/(chat\.whatsapp\.com|whatsapp\.com\/channel)\/[^\s]+/i);
            const link = linkMatch ? linkMatch[0] : null;

            if (!link) {
                if (m.chat.endsWith('@g.us')) {
                    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                    const groupId = m.chat;
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                    const bodyText = `╭─❏ 「 GROUP JID」\n│ *Group ID:* \`${groupId}\`\n╰───────────────`;
                    try {
                        const msg = generateWAMessageFromContent(
                            m.chat,
                            {
                                interactiveMessage: {
                                    body: { text: bodyText },
                                    footer: { text: `` },
                                    nativeFlowMessage: {
                                        messageVersion: 1,
                                        buttons: [
                                            {
                                                name: `cta_copy`,
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: "Copy Group ID",
                                                    copy_code: groupId
                                                })
                                            }
                                        ]
                                    }
                                }
                            },
                            { userJid: client.user?.id }
                        );
                        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                    } catch {
                        await sendInteractive(client, m, bodyText + `\n\nCopy this ID: \`${groupId}\``);
                    }
                    return;
                }
                await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」\n│ Where\`s the link?\n│ Example: ` + prefix + "checkid https://chat.whatsapp.com/xxxxx\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
            }

            await client.sendMessage(m.chat, { react: { text: `⌛`, key: m.reactKey } });

            let url;
            try {
                url = new URL(link);
            } catch {
                await client.sendMessage(m.chat, { react: { text: ``, key: m.reactKey } });
                return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」\n│ That\`s not a valid URL.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            let id = '';
            let type = '';

            if (url.hostname === 'chat.whatsapp.com') {
                const code = url.pathname.replace(/^\/+/, '');
                const res = await client.groupGetInviteInfo(code);
                id = res.id;
                type = 'Group';
            } else if (url.hostname === 'whatsapp.com' && url.pathname.startsWith('/channel/')) {
                const code = url.pathname.split('/channel/')[1]?.split('/')[0];
                const res = await client.newsletterMetadata('invite', code, 'GUEST');
                id = res.id;
                type = 'Channel';
            } else {
                await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } });
                return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」\n│ That\`s not a WhatsApp group or channel link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            await client.sendMessage(m.chat, { react: { text: ``, key: m.reactKey } });

            const bodyText = "╭─❏ 「 " + type + ` JID」\n│ *Link:* ` + link + "\n│ *" + type + " ID:* \`" + id + "\`\n╰───────────────";
            try {
                const msg = generateWAMessageFromContent(
                    m.chat,
                    {
                        interactiveMessage: {
                            body: { text: bodyText },
                            footer: { text: `` },
                            nativeFlowMessage: {
                                messageVersion: 1,
                                buttons: [
                                    {
                                        name: `cta_copy`,
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Copy " + type + " ID",
                                            copy_code: id
                                        })
                                    }
                                ]
                            }
                        }
                    },
                    { userJid: client.user?.id }
                );
                await client.sendMessage(m.chat, { react: { text: `✅`, key: m.reactKey } });
                await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            } catch {
                await sendInteractive(client, m, bodyText + "\n\nCopy this ID: \`" + id + "\`");
            }

        } catch (error) {
            console.error(`CheckID error:`, error);
            await client.sendMessage(m.chat, { react: { text: ``, key: m.reactKey } });
            await sendInteractive(client, m, `╭─❏ 「 Cʀᴀsʜᴇᴅ」\n│ Error: ` + error.message + "\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
        }
    }
};
