import { getGroupSettings, addWarn, resetWarn, getWarnLimit } from '../database/config.js';
import { resolveTargetJid } from '../lib/lidResolver.js';

const DEV_NUMBER = '254114885159';
const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
const _pNum = (p) => {
    const phone = p.phoneNumber || p.phone_number || '';
    if (phone) return _num(phone);
    const base = p.id || p.jid || '';
    if (base && !base.endsWith('@lid')) return _num(base);
    return _num(p.lid || base);
};
const isDevJid = (jid) => _num(jid) === DEV_NUMBER;
const fmt = (msg) => `╭─❏ 「 ANTILINKGC 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const WA_LINK_RE = /(?:https?:\/\/)?(?:www\.)?(?:chat\.whatsapp\.com\/[A-Za-z0-9]+|whatsapp\.com\/channel\/[A-Za-z0-9_-]+)/i;

export default async (client, m) => {
    try {
        if (!m || !m.chat || !m.chat.endsWith('@g.us')) return;
        if (m.key?.fromMe) return;
        if (isDevJid(m.sender)) return;

        const groupSettings = await getGroupSettings(m.chat);
        const mode = (groupSettings.antilinkgc || 'off').toLowerCase();
        if (mode === 'off') return;

        const msg = m.message || {};
        const text = (m.text || msg.conversation || msg.extendedTextMessage?.text ||
            msg.imageMessage?.caption || msg.videoMessage?.caption ||
            msg.documentMessage?.caption || '');
        if (!WA_LINK_RE.test(text)) return;

        try {
            const ownCode = await client.groupInviteCode(m.chat);
            if (text.includes(ownCode) || text.includes(`chat.whatsapp.com/${ownCode}`)) return;
        } catch {}

        const groupMetadata = await client.groupMetadata(m.chat);
        const sender = resolveTargetJid(m.sender, groupMetadata.participants);
        if (!sender) return;

        const senderNum = _num(sender);
        const botRaw = client.decodeJid ? client.decodeJid(client.user.id) : (client.user?.id || '');
        const botNum = _num(botRaw);

        const isAdmin = groupMetadata.participants.some(p => {
            return _pNum(p) === senderNum && (p.admin === 'admin' || p.admin === 'superadmin');
        });
        const isBotAdmin = groupMetadata.participants.some(p => {
            return _pNum(p) === botNum && (p.admin === 'admin' || p.admin === 'superadmin');
        });
        if (isAdmin) return;

        const username = senderNum || sender.split('@')[0];

        if (!isBotAdmin) {
            await client.sendMessage(m.chat, {
                text: fmt(`@${username} sent a WhatsApp group/channel link.\nMake me admin so I can act.`),
                mentions: [sender]
            });
            return;
        }

        try {
            await client.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant || m.sender
                }
            });
        } catch {}

        if (mode === 'delete' || mode === 'on') {
            await client.sendMessage(m.chat, {
                text: fmt(`🚫 @${username}, WhatsApp group/channel links are not allowed here.\n│ Message deleted.`),
                mentions: [sender]
            });
            return;
        }

        if (mode === 'kick') {
            try {
                await client.groupParticipantsUpdate(m.chat, [sender], 'remove');
                await client.sendMessage(m.chat, {
                    text: fmt(`🚨 @${username} KICKED!\n│ Reason: WhatsApp group/channel links are not allowed here.`),
                    mentions: [sender]
                });
            } catch {}
            return;
        }

        const MAX_WARNS = await getWarnLimit(m.chat);
        const newCount = await addWarn(m.chat, username);
        const remaining = MAX_WARNS - newCount;

        if (newCount >= MAX_WARNS) {
            await resetWarn(m.chat, username);
            try { await client.groupParticipantsUpdate(m.chat, [sender], 'remove'); } catch {}
            await client.sendMessage(m.chat, {
                text: fmt(`🚨 @${username} KICKED!\n│ Reason: WhatsApp group/channel links are not allowed here.\n│ Warns: ${newCount}/${MAX_WARNS}`),
                mentions: [sender]
            });
        } else {
            await client.sendMessage(m.chat, {
                text: fmt(`⚠️ @${username}, warned!\n│ Reason: WhatsApp group/channel links are not allowed here.\n│ Message deleted.\n│ Warns: ${newCount}/${MAX_WARNS}\n│ ${remaining} more and you're GONE.`),
                mentions: [sender]
            });
        }
    } catch (e) {}
};
