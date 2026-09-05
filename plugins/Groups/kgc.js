import { pickActionableJid, primeGroupUsernames } from '../../lib/usernameResolver.js';

const DEV_NUMBER = '254114885159';
const BATCH_SIZE = 30;
const BATCH_DELAY = 600;

const BOX = (title, lines) => {
    const body = (Array.isArray(lines) ? lines : [lines]).map(l => `│ ${l}`).join('\n');
    return `╭─❏ 「 ${title} 」\n│\n${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

const digits = (value) => String(value || '').split('@')[0].split(':')[0].replace(/\D/g, '');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default {
    name: 'kgc',
    aliases: ['kam'],
    description: 'Removes every member from a group',
    run: async (context) => {
        const { client, m, args, Owner, isBotAdmin, isAdmin } = context;

        const remoteArg = (args || []).find(a => typeof a === 'string' && a.endsWith('@g.us'));
        const isRemote = !!remoteArg;
        const targetChat = isRemote ? remoteArg : m.chat;

        if (isRemote && !Owner) {
            return client.sendMessage(m.chat, { text: BOX('KGC', ['Remote purge is owner only.']) }, { quoted: m });
        }

        if (!isRemote) {
            if (!m.isGroup) {
                return client.sendMessage(m.chat, { text: BOX('KGC', ['This command works in groups only.']) }, { quoted: m });
            }
            if (!Owner && !isAdmin) {
                return client.sendMessage(m.chat, { text: BOX('KGC', ['Admins only.']) }, { quoted: m });
            }
            if (!isBotAdmin) {
                return client.sendMessage(m.chat, { text: BOX('KGC', ['Make me admin first.']) }, { quoted: m });
            }
        }

        let metadata;
        try {
            metadata = await client.groupMetadata(targetChat);
        } catch {
            return client.sendMessage(m.chat, { text: BOX('KGC', ['Could not read that group.']) }, { quoted: m });
        }

        const participants = metadata?.participants || [];
        primeGroupUsernames(client, metadata, { chat: targetChat }).catch(() => {});

        const botNum = digits(client.user?.id);
        const botLid = digits(client.user?.lid);
        const senderNum = digits(m.sender);
        const skip = new Set([botNum, botLid, senderNum, DEV_NUMBER].filter(Boolean));

        const targets = [];
        const seen = new Set();
        for (const p of participants) {
            const base = p?.id || p?.jid || '';
            const jid = base || pickActionableJid(base, participants);
            if (!jid) continue;
            const num = digits(p?.phoneNumber || p?.phone_number || p?.pn || '') || digits(jid);
            if (num && skip.has(num)) continue;
            if (digits(base) && skip.has(digits(base))) continue;
            if (seen.has(jid)) continue;
            seen.add(jid);
            targets.push(jid);
        }

        if (!targets.length) {
            if (isRemote) return client.sendMessage(m.chat, { text: BOX('KGC', ['Nothing left to remove there.']) }, { quoted: m });
            return;
        }

        let removed = 0;
        let failed = 0;
        for (let i = 0; i < targets.length; i += BATCH_SIZE) {
            const batch = targets.slice(i, i + BATCH_SIZE);
            try {
                const res = await client.groupParticipantsUpdate(targetChat, batch, 'remove');
                if (Array.isArray(res)) {
                    for (const entry of res) {
                        const status = String(entry?.status ?? entry?.code ?? '200');
                        if (status === '200') removed++;
                        else failed++;
                    }
                } else {
                    removed += batch.length;
                }
            } catch {
                failed += batch.length;
            }
            if (i + BATCH_SIZE < targets.length) await sleep(BATCH_DELAY);
        }

        if (isRemote) {
            await client.sendMessage(m.chat, {
                text: BOX('KGC', [
                    `Group: ${metadata.subject || targetChat}`,
                    `Removed: ${removed}`,
                    `Failed: ${failed}`
                ])
            }, { quoted: m });
        }
    }
};
