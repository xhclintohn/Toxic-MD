import { getGroupSettings } from '../database/config.js';
import { resolveTargetJid } from '../lib/lidResolver.js';

const DEV_NUMBER = '254114885159';

const isDevJid = (jid) => {
    if (!jid) return false;
    return jid.split('@')[0].split(':')[0].replace(/\D/g, '') === DEV_NUMBER;
};

export default async (client, m, isBotAdmin, itsMe, isAdmin, Owner, body) => {
    if (!m.isGroup) return;
    if (isDevJid(m.sender)) return;

    const groupSettings = await getGroupSettings(m.chat);
    const antitag = groupSettings?.antitag;

    if (antitag && !Owner && isBotAdmin && !isAdmin && m.mentionedJid && m.mentionedJid.length > 10) {
        if (itsMe) return;

        const groupMetadata = await client.groupMetadata(m.chat);
        const sender = resolveTargetJid(m.sender, groupMetadata.participants);
        if (!sender) return;
        const username = sender.split('@')[0];

        try {
            await client.sendMessage(m.chat, {
                text: `@${username}, do not mass tag!`,
                contextInfo: { mentionedJid: [sender] }
            }, { quoted: m });
            await client.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant || m.sender
                }
            });
            await client.groupParticipantsUpdate(m.chat, [sender], 'remove');
        } catch (e) {}
    }
};
