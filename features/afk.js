const afkMap = new Map();

export default async (client, m) => {
    if (!m || !m.sender) return;
    const senderNum = m.sender.split('@')[0].split(':')[0];

    if (afkMap.has(senderNum)) {
        const { reason, time } = afkMap.get(senderNum);
        const mins = Math.floor((Date.now() - time) / 60000);
        afkMap.delete(senderNum);
        try {
            await client.sendMessage(m.chat, {
                text: `╭─❏ 「 BACK ONLINE」
│ @${senderNum} finally crawled back.\n│ Was AFK for ${mins} min${mins !== 1 ? 's' : ''}.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                mentions: [m.sender]
            });
        } catch {}
        return;
    }

    const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
                     m.message?.imageMessage?.contextInfo?.mentionedJid ||
                     m.message?.videoMessage?.contextInfo?.mentionedJid || [];
    for (const jid of mentions) {
        const num = jid.split('@')[0].split(':')[0];
        if (afkMap.has(num)) {
            const { reason, time } = afkMap.get(num);
            const mins = Math.floor((Date.now() - time) / 60000);
            try {
                await client.sendMessage(m.chat, {
                    text: `╭─❏ 「 AFK ALERT」
│ @${num} is currently ghosting everyone.\n│ Reason: ${reason || 'none given 💀'}\n│ Since: ${mins} min${mins !== 1 ? 's' : ''} ago\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                    mentions: [jid, m.sender]
                });
            } catch {}
        }
    }
};

export const setAfk = (num, reason) => afkMap.set(num, { reason, time: Date.now() });
export const removeAfk = (num) => afkMap.delete(num);
export const isAfk = (num) => afkMap.has(num);