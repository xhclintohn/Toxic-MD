import { getGroupSettings } from '../database/config.js';
import { resolveTargetJid } from '../lib/lidResolver.js';

const DEV_NUMBER = '254114885159';

const cleanNum = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

const _pNum = (p) => {
    if (typeof p === 'string') return cleanNum(p);
    const phone = p.phoneNumber || p.phone_number || '';
    if (phone) return cleanNum(phone);
    const base = p.id || p.jid || '';
    if (base && !base.endsWith('@lid')) return cleanNum(base);
    return cleanNum(p.lid || base);
};

const extractJid = (p) => {
    if (typeof p === 'string') return p;
    if (!p) return '';
    const phone = p.phoneNumber || p.phone_number || '';
    if (phone) return typeof phone === 'string' && phone.includes('@') ? phone : phone + '@s.whatsapp.net';
    return p.id || p.jid || '';
};

export default async (client, event) => {
    try {
        if (!event || event.action !== 'add') return;

        const groupSettings = await getGroupSettings(event.id);
        if (!groupSettings?.antiforeign) return;

        const metadata = await client.groupMetadata(event.id);
        const botRaw = client.decodeJid ? client.decodeJid(client.user.id) : (client.user?.id || '');
        const botNum = cleanNum(botRaw);

        const isBotAdmin = metadata.participants.some(p => {
            return _pNum(p) === botNum && (p.admin === 'admin' || p.admin === 'superadmin');
        });

        if (!isBotAdmin) return;

        const BOT_COUNTRY_CODE = botNum.slice(0, 3);

        for (const participant of event.participants) {
            const participantJid = extractJid(participant);
            if (!participantJid) continue;

            const resolvedJid = resolveTargetJid(participantJid, metadata.participants);
            if (!resolvedJid) continue; // can't resolve LID, skip safely

            const pNum = cleanNum(resolvedJid);
            if (!pNum) continue;
            if (pNum === DEV_NUMBER) continue;
            if (pNum === botNum) continue;

            const isForeign = !pNum.startsWith(BOT_COUNTRY_CODE.slice(0, 2));
            if (isForeign) {
                try {
                    await client.groupParticipantsUpdate(event.id, [resolvedJid], 'remove');
                    await client.sendMessage(event.id, {
                        text: `╭───(    TOXIC-MD    )───\n├───≫ ANTIFOREIGN ≪───\n├ \n├ 🚫 @${pNum} was removed.\n├ Foreign numbers not allowed here!\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
                        mentions: [resolvedJid]
                    });
                } catch {}
            }
        }
    } catch (err) {
        console.error('[ANTIFOREIGN] Error:', err.message);
    }
};
