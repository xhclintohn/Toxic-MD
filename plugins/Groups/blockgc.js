import { addBannedGroup, removeBannedGroup, getBannedGroups } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default [
    {
        name: 'blockgc',
        aliases: ['bangc', 'silencegc', 'mutegc'],
        description: 'Ban/silence the bot in a group (bot ignores all messages from that group)',
        run: async (context) => {
            await ownerMiddleware(context, async () => {
                const { client, m, text, isGroup } = context;
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

                let targetJid = '';

                if (text && text.trim()) {
                    const t = text.trim();
                    if (t.endsWith('@g.us')) {
                        targetJid = t;
                    } else if (/^\d+$/.test(t)) {
                        targetJid = t + '@g.us';
                    } else {
                        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                        return sendInteractive(client, m, fmt("BLOCKGC", "Provide a valid group JID (e.g. 1234567890-12345@g.us) or just the numeric ID."));
                    }
                } else if (isGroup) {
                    targetJid = m.chat;
                } else {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("BLOCKGC", "Provide a group JID, or run this inside the group you want to block."));
                }

                const banned = await getBannedGroups();
                if (banned.includes(targetJid)) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("BLOCKGC", `Group \`${targetJid}\` is already blocked.`));
                }

                await addBannedGroup(targetJid);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("BLOCKGC", `Group blocked: \`${targetJid}\`\n│ Bot will ignore all messages from that group.`));
            });
        }
    },
    {
        name: 'unblockgc',
        aliases: ['ungc', 'unbangc', 'unsilencegc'],
        description: 'Unblock/unsilence the bot in a previously blocked group',
        run: async (context) => {
            await ownerMiddleware(context, async () => {
                const { client, m, text, isGroup } = context;
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

                let targetJid = '';

                if (text && text.trim()) {
                    const t = text.trim();
                    if (t.endsWith('@g.us')) {
                        targetJid = t;
                    } else if (/^\d+$/.test(t)) {
                        targetJid = t + '@g.us';
                    } else {
                        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                        return sendInteractive(client, m, fmt("UNBLOCKGC", "Provide a valid group JID or numeric ID."));
                    }
                } else if (isGroup) {
                    targetJid = m.chat;
                } else {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("UNBLOCKGC", "Provide a group JID, or run inside the group."));
                }

                const banned = await getBannedGroups();
                if (!banned.includes(targetJid)) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("UNBLOCKGC", `Group \`${targetJid}\` is not blocked.`));
                }

                await removeBannedGroup(targetJid);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("UNBLOCKGC", `Group unblocked: \`${targetJid}\`\n│ Bot will resume responding in that group.`));
            });
        }
    },
    {
        name: 'blockedgcs',
        aliases: ['listblockedgc', 'bannedgcs', 'blockedgroups'],
        description: 'List all blocked/silenced groups',
        run: async (context) => {
            await ownerMiddleware(context, async () => {
                const { client, m } = context;
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                const banned = await getBannedGroups();
                if (!banned || banned.length === 0) {
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                    return sendInteractive(client, m, fmt("BLOCKED GCS", "No groups are currently blocked."));
                }
                const list = banned.map((jid, i) => `${i + 1}. \`${jid}\``).join('\n│ ');
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("BLOCKED GCS", `${banned.length} blocked group(s):\n│ ${list}`));
            });
        }
    }
];
