import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

function cleanPhone(input) {
    if (!input) return '';
    let s = String(input).trim();
    s = s.replace(/@s\.whatsapp\.net$/i, '').replace(/@lid$/i, '').split(':')[0];
    s = s.replace(/[^\d]/g, '');
    if (s.startsWith('00')) s = s.slice(2);
    return s;
}

const box = (lines) => {
    const body = (Array.isArray(lines) ? lines : [lines]).map(l => `│ ${l}`).join('\n');
    return `╭─❏ 「 Rᴇᴘᴏʀᴛ」
│
${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

async function sendResult(client, m, lines, reportId) {
    const text = box(lines);
    if (reportId) {
        try {
            const ctaMsg = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
                interactiveMessage: {
                    body: { text },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        messageVersion: 1,
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'Copy Report ID',
                                    copy_code: reportId
                                })
                            }
                        ],
                        messageParamsJson: ''
                    }
                }
            }), { userJid: client.user?.id });
            await client.relayMessage(m.chat, ctaMsg.message, { messageId: ctaMsg.key.id });
            return;
        } catch {}
    }
    return sendInteractive(client, m, text);
}

export default {
    name: 'report',
    aliases: ['spamreport', 'reportspam'],
    description: 'Report spam to WhatsApp (reply to a message, or give a number). Owner only',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, args, sock, store, prefix } = context;
            const bot = sock || client;
            const p = prefix || '.';
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

            const fail = async (lines) => {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, box(lines));
            };

            if (typeof bot.reportSpam !== 'function' || typeof bot.reportTarget !== 'function') {
                return fail([
                    `Reporting is not available`,
                    `on this Baileys build.`,
                    `Update Baileys then try again.`
                ]);
            }

            const rawArgs = (args || []).map(a => String(a));
            const wantBlock = rawArgs.some(a => a.toLowerCase() === 'block');
            const argText = rawArgs.filter(a => a.toLowerCase() !== 'block').join(' ');

            try {
                if (m.quoted && m.quoted.id) {
                    const senderJid = m.quoted.sender || '';
                    if (m.quoted.fromMe) {
                        return fail([`That is my own message.`, `I can't report myself.`]);
                    }

                    let waMsg = null;
                    try {
                        waMsg = store?.loadMessage ? store.loadMessage(m.chat, m.quoted.id) : null;
                    } catch {}
                    if (!waMsg && m.quoted.fakeObj) {
                        const fake = m.quoted.fakeObj;
                        waMsg = {
                            key: {
                                remoteJid: fake.key?.remoteJid || m.chat,
                                fromMe: !!fake.key?.fromMe,
                                id: fake.key?.id || m.quoted.id,
                                ...(m.isGroup && senderJid ? { participant: senderJid } : {})
                            },
                            message: fake.message,
                            messageTimestamp: fake.messageTimestamp || 0
                        };
                    }

                    const targetNum = cleanPhone(senderJid);
                    let results;
                    if (waMsg && waMsg.message) {
                        if (m.isGroup) {
                            results = await bot.reportGroup(m.chat, [waMsg], senderJid ? { source: senderJid } : {});
                            if (wantBlock && senderJid && typeof bot.updateBlockStatus === 'function') {
                                await bot.updateBlockStatus(senderJid, 'block').catch(() => {});
                            }
                        } else if (wantBlock) {
                            results = await bot.reportAndBlock(senderJid, [waMsg]);
                        } else {
                            results = await bot.reportContact(senderJid, [waMsg]);
                        }
                    } else {
                        const res = await bot.reportTarget(senderJid);
                        results = [{ reportId: res.reportId, messageId: m.quoted.id }];
                        if (wantBlock && typeof bot.updateBlockStatus === 'function') {
                            await bot.updateBlockStatus(senderJid, 'block').catch(() => {});
                        }
                    }

                    const reportId = results?.[0]?.reportId || null;
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                    return sendResult(client, m, [
                        `Message reported to WhatsApp ✅`,
                        ``,
                        `*Sender:* ${targetNum || senderJid}`,
                        `*Chat:* ${m.isGroup ? 'Group' : 'DM'}`,
                        wantBlock ? `*Blocked:* Yes` : `*Blocked:* No`,
                        reportId ? `*Report ID:* ${reportId}` : `*Report ID:* not returned`,
                        ``,
                        `WhatsApp will review it.`
                    ], reportId);
                }

                let targetJid = '';
                const number = cleanPhone(argText);
                if (number && number.length >= 7 && number.length <= 15) {
                    targetJid = number + '@s.whatsapp.net';
                } else if (m.mentionedJid && m.mentionedJid.length) {
                    targetJid = m.mentionedJid[0];
                    if (targetJid.endsWith('@lid') && typeof bot.getPNForLID === 'function') {
                        try {
                            const pn = await bot.getPNForLID(targetJid);
                            if (pn) targetJid = pn.includes('@') ? pn : pn + '@s.whatsapp.net';
                        } catch {}
                    }
                }

                if (!targetJid) {
                    return fail([
                        `Usage:`,
                        `*${p}report* — reply to a spam message`,
                        `*${p}report 2547xxxxxxxx* — report a number`,
                        `*${p}report @user* — report a mention`,
                        `Add *block* to also block them.`,
                        ``,
                        `Bug reports moved to *${p}bug*`
                    ]);
                }

                const res = await bot.reportTarget(targetJid);
                if (wantBlock && typeof bot.updateBlockStatus === 'function') {
                    await bot.updateBlockStatus(targetJid, 'block').catch(() => {});
                }

                const reportId = res?.reportId || null;
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                return sendResult(client, m, [
                    `Number reported to WhatsApp ✅`,
                    ``,
                    `*Number:* ${cleanPhone(targetJid) || targetJid}`,
                    wantBlock ? `*Blocked:* Yes` : `*Blocked:* No`,
                    reportId ? `*Report ID:* ${reportId}` : `*Report ID:* not returned`,
                    ``,
                    `WhatsApp will review it.`
                ], reportId);
            } catch (error) {
                const msg = String(error?.message || error || 'Unknown error').slice(0, 120);
                return fail([
                    `Report failed.`,
                    `Error: ${msg}`,
                    ``,
                    `Try again in a moment.`
                ]);
            }
        });
    }
};
