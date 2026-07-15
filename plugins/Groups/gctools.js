import middleware from '../../utils/botUtil/middleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ButtonV2 } from '@whiskeysockets/baileys';

const H = (title) => `╭─❏ 「 ${title}」\n├`;
const F = `╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
const box = (title, lines) => `${H(title)}\n${lines.map(l => `│ ${l}`).join('\n')}\n│\n${F}`;

async function sendSelectButtons(client, m, fq, bodyText, title, rows) {
    const _dev = await getDeviceMode();
    if (_dev === 'ios') {
        return client.sendMessage(m.chat, { text: bodyText });
    }
    try {
        const btnV2 = new ButtonV2(client);
        btnV2.setBody(bodyText).setFooter('> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
        for (const row of rows.slice(0, 3)) {
            btnV2.addButton(row.header || row.title, row.id);
        }
        await btnV2.send(m.chat, { userJid: client.user?.id || '' });
    } catch {
        await client.sendMessage(m.chat, { text: bodyText });
    }
}

export default [

    {
        name: 'ngc',
        aliases: ['newgc', 'groupcreate', 'creategc', 'newgroup', 'creategroup'],
        description: 'Create a new WhatsApp group',
        run: async (context) => {
            const { client, m, text, isOwner, isSudo } = context;
            if (!isOwner && !isSudo) {
                return client.sendMessage(m.chat, { text: box('ERROR', ['❌ Owner only command.']) });
            }
            const name = text?.trim();
            if (!name) {
                return client.sendMessage(m.chat, {
                    text: box('USAGE', [
                        '📋 .ngc <group name>',
                        '📌 Tag members to add them',
                        '',
                        '  .ngc Toxic Squad @user',
                        '  .newgc My Group',
                    ])
                });
            }
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            try {
                const mentioned = m.mentionedJid?.filter(j => j !== client.user?.id) || [];
                const group = await client.groupCreate(name, mentioned);
                const gid = group?.id || group?.gid || '';
                let inviteLink = '';
                if (gid) {
                    try {
                        const code = await client.groupInviteCode(gid);
                        if (code) inviteLink = `https://chat.whatsapp.com/${code}`;
                    } catch {}
                }
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await client.sendMessage(m.chat, {
                    text: box('GROUP CREATED', [
                        `✅ *Name:* ${name}`,
                        `👥 *Members added:* ${mentioned.length}`,
                        `🔗 *JID:* ${gid}`,
                        ...(inviteLink ? [`🔑 *Link:* ${inviteLink}`] : []),
                    ])
                });
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                await client.sendMessage(m.chat, { text: box('ERROR', [`❌ ${e.message}`]) });
            }
        }
    },

    {
        name: 'ginfo',
        aliases: ['groupinfo', 'gcinfo', 'groupmeta', 'gmetadata', 'gcmeta'],
        description: 'Show group info and metadata',
        run: async (context) => {
            await middleware(context, async () => {
                const { client, m } = context;
                if (!m.isGroup) {
                    return client.sendMessage(m.chat, { text: box('ERROR', ['❌ Use this inside a group.']) });
                }
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                try {
                    const meta = await client.groupMetadata(m.chat);
                    const name    = meta?.subject || 'Unknown';
                    const desc    = meta?.desc || meta?.description || 'None';
                    const rawOwner = meta?.owner || '';
                    let ownerDisplay = 'Unknown';
                    if (rawOwner) {
                        if (rawOwner.endsWith('@lid')) {
                            const lidNum = rawOwner.split('@')[0].split(':')[0];
                            const cached = globalThis.lidPhoneCache?.get(lidNum);
                            if (cached) {
                                ownerDisplay = `+${cached}`;
                            } else {
                                const resolved = globalThis.resolvePhoneFromLidAsync
                                    ? await globalThis.resolvePhoneFromLidAsync(rawOwner).catch(() => null)
                                    : null;
                                ownerDisplay = resolved ? `+${resolved}` : `+${lidNum}`;
                            }
                        } else {
                            ownerDisplay = `+${rawOwner.split('@')[0]}`;
                        }
                    }
                    const created = meta?.creation
                        ? new Date(meta.creation * 1000).toLocaleDateString('en-GB')
                        : 'Unknown';
                    const members = meta?.participants?.length ?? 0;
                    const admins  = (meta?.participants || []).filter(p => p.admin).length;
                    const ephDur  = meta?.ephemeralDuration;
                    const eph     = ephDur
                        ? (ephDur === 86400 ? '24 hours' : ephDur === 604800 ? '7 days' : ephDur === 7776000 ? '90 days' : `${ephDur}s`)
                        : 'Off';
                    await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
                    await client.sendMessage(m.chat, {
                        text: box('GROUP INFO', [
                            `📛 *Name:* ${name}`,
                            `👑 *Owner:* ${ownerDisplay}`,
                            `📅 *Created:* ${created}`,
                            `👥 *Members:* ${members}`,
                            `🛡️ *Admins:* ${admins}`,
                            `⏳ *Disappearing:* ${eph}`,
                            `📝 *Desc:* ${desc.slice(0, 80)}${desc.length > 80 ? '...' : ''}`,
                        ])
                    });
                } catch (e) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    await client.sendMessage(m.chat, { text: box('ERROR', [`❌ ${e.message}`]) });
                }
            });
        }
    },

    {
        name: 'wabot',
        aliases: ['addaibot', 'addwabot', 'gcaibot', 'addwhatsappbot'],
        description: 'Add the WhatsApp AI bot to this group',
        run: async (context) => {
            const { client, m, isOwner, isSudo } = context;
            if (!isOwner && !isSudo) {
                return client.sendMessage(m.chat, { text: box('ERROR', ['❌ Owner only command.']) });
            }
            if (!m.isGroup) {
                return client.sendMessage(m.chat, { text: box('ERROR', ['❌ Use this inside a group.']) });
            }
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            try {
                await client.aiGroupAddBot(m.chat);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await client.sendMessage(m.chat, {
                    text: box('AI BOT ADDED', ['✅ WhatsApp AI bot has been added to this group!'])
                });
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                await client.sendMessage(m.chat, { text: box('ERROR', [`❌ ${e.message}`]) });
            }
        }
    },

    {
        name: 'disappearing',
        aliases: ['disappear', 'disap', 'dsp', 'gvanish', 'timer', 'ephemeral', 'vanish', 'gcvanish'],
        description: 'Set disappearing messages. No args = show picker.',
        run: async (context) => {
            await middleware(context, async () => {
                const { client, m, args, prefix } = context;
                if (!m.isGroup) {
                    return client.sendMessage(m.chat, { text: box('ERROR', ['❌ Use this inside a group.']) });
                }

                const MAP = {
                    'off': 0, '0': 0, 'no': 0, 'none': 0, 'disable': 0,
                    '24h': 86400, '24': 86400, '1d': 86400, 'day': 86400,
                    '7d': 604800, '7': 604800, 'week': 604800, '1w': 604800,
                    '90d': 7776000, '90': 7776000, '3m': 7776000, 'month': 7776000 };

                const arg = (args?.[0] || '').toLowerCase();

                if (!arg || !(arg in MAP)) {
                    const p = prefix || '.';
                    const bodyText = box('DISAPPEARING MESSAGES', [
                        '⏳ Pick a timer for this group:',
                        '',
                        `  🚫 off  — Disable`,
                        `  ⏰ 24h — 24 hours`,
                        `  📅 7d  — 7 days`,
                        `  🗓️ 90d — 90 days`,
                    ]);
                    return sendSelectButtons(
                        client, m, null,
                        bodyText,
                        'Set Timer',
                        [
                            { header: '🚫 Off',      title: 'Disable disappearing messages', id: `${p}disappearing off` },
                            { header: '⏰ 24 Hours', title: 'Messages vanish after 24h',      id: `${p}disappearing 24h` },
                            { header: '📅 7 Days',   title: 'Messages vanish after 7 days',   id: `${p}disappearing 7d`  },
                        ]
                    );
                }

                const seconds = MAP[arg];
                const label   = seconds === 0 ? 'Off' : seconds === 86400 ? '24 hours' : seconds === 604800 ? '7 days' : '90 days';

                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                try {
                    await client.groupToggleEphemeral(m.chat, seconds);
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                    await client.sendMessage(m.chat, {
                        text: box('DISAPPEARING MESSAGES', [`⏳ *Set to:* ${label}`])
                    });
                } catch (e) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    await client.sendMessage(m.chat, { text: box('ERROR', [`❌ ${e.message}`]) });
                }
            });
        }
    },

];
