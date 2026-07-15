import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveSenderJid } from '../../lib/lidResolver.js';

const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

const getDeviceId = (rawJid) => {
    const part = (rawJid || '').split('@')[0];
    if (part.includes(':')) return parseInt(part.split(':')[1] || '0', 10);
    return 0;
};

const getPlatform = (msgId, rawKeyJid) => {
    const id = msgId || '';
    if (id.startsWith('3EB0')) return 'Desktop / Web';
    if (id.startsWith('3A')) return 'iOS';
    if ((rawKeyJid || '').endsWith('@lid')) return 'iOS (Linked Device)';
    if (id.length === 16 && id.startsWith('BAE5')) return 'Baileys / Bot';
    return 'Android';
};

const runChecks = (id, rawKeyJid, resolvedSender, mtype) => {
    const tkFail = (id.startsWith('3EB0') || id.startsWith('BAE5')) && id.length <= 24;
    const dvFail = getDeviceId(rawKeyJid) > 0;

    const resolvedNum = _num(resolvedSender || '');
    const pfFail = resolvedNum.length > 13;

    const idFail = !/^[A-F0-9]{32}$/i.test(id);

    const isBotId = (id.startsWith('3EB0') || id.startsWith('BAE5')) && id.length <= 24;
    const isBotSender = resolvedNum.length > 13 || (resolvedSender || '').endsWith('@bot');
    
    let isBot = isBotId || isBotSender;
    
    if (mtype === 'conversation') {
        isBot = false;
    }
    
    const isUseDevice = getDeviceId(rawKeyJid) > 0;

    return { tkFail, dvFail, pfFail, idFail, isBot, isUseDevice };
};

export default {
    name: 'isbot',
    aliases: ['botcheck', 'checkbot', 'detectbot'],
    description: 'Check if a message or sender is from a bot',
    run: async (context) => {
        const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const isQuoted = !!m.quoted;

            let id, rawKeyJid, mtype, resolvedSender;

            if (isQuoted) {
                id = m.quoted?.id || '';
                rawKeyJid = m.msg?.contextInfo?.participant || '';
                mtype = m.quoted?.mtype || '';
                resolvedSender = m.quoted?.sender || rawKeyJid;
            } else {
                id = m.id || '';
                rawKeyJid = m.key?.participant || m.key?.participantAlt || '';
                mtype = m.mtype || '';
                resolvedSender = m.sender || rawKeyJid;
            }

            const isLid = (rawKeyJid || '').endsWith('@lid');
            let lidResolved = false;

            if (isLid && !(resolvedSender || '').endsWith('@lid')) {
                lidResolved = true;
            } else if (isLid) {
                try {
                    const r = await resolveSenderJid(rawKeyJid, m.chat, client);
                    if (r && !r.endsWith('@lid')) {
                        resolvedSender = r;
                        lidResolved = true;
                    }
                } catch {}
            }

            const displayNum = _num(resolvedSender);
            const platform = getPlatform(id, rawKeyJid);
            const deviceStatus = getDeviceId(rawKeyJid) > 0 ? 'Secondary' : 'Primary';
            const deviceId = getDeviceId(rawKeyJid);

            const { tkFail, dvFail, pfFail, idFail, isBot, isUseDevice } = runChecks(id, rawKeyJid, resolvedSender, mtype);

            const fmtCheck = (fail) => fail ? 'FAIL' : 'OK';
            const verdict = isBot ? '❌ BOT DETECTED' : '✅ HUMAN DETECTED';

            let lidTag = '';
            if (isLid) lidTag = lidResolved ? ' ✅ (LID resolved)' : ' ⚠️ (LID unresolved)';

            const report =
                `*「 ISBOT CHECKER 」*\n\n` +
                `*Target*\n` +
                `- Sender : @${displayNum}${lidTag}\n` +
                `- Platform : ${platform}\n` +
                `- Device Status : ${deviceStatus}\n` +
                `- Device ID : ${deviceId}\n` +
                `- Message Type : ${mtype || 'unknown'}\n` +
                `- Message ID : ${id || 'N/A'}\n` +
                `- ID Length : ${id.length}\n\n` +
                `*Engine*\n` +
                `- TK Check : ${fmtCheck(tkFail)}\n` +
                `- DV Check : ${fmtCheck(dvFail)}\n` +
                `- PF Check : ${fmtCheck(pfFail)}\n` +
                `- ID Check : ${fmtCheck(idFail)}\n\n` +
                `*Detection*\n` +
                `- isUseDevice : ${isUseDevice}\n` +
                `- isBot : ${isBot}\n\n` +
                `*Verdict*\n` +
                `${verdict}\n\n` +
                `#${id || 'UNKNOWN'}`;

            await client.sendMessage(m.chat, { react: { text: isBot ? '🤖' : '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, report);
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 ISBOT ERROR」\n│ ${e?.message || e}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};