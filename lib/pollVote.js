const PREFIX = 'pv';

import { getPollSecret } from './pollSecrets.js';

const b64urlEncode = (input) => {
    const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
    return buf.toString('base64url');
};

const b64urlDecode = (str) => Buffer.from(String(str), 'base64url');

export function encodePollVoteButton(pollId, creatorJid, messageSecret, optionName) {
    return [PREFIX, pollId, creatorJid, b64urlEncode(messageSecret), b64urlEncode(optionName)].join('|');
}

export function decodePollVoteButton(id) {
    if (typeof id !== 'string' || !id.startsWith(PREFIX + '|')) return null;
    const parts = id.split('|');
    if (parts.length !== 5) return null;
    const [, pollId, creatorJid, secretB64, optionB64] = parts;
    if (!pollId || !creatorJid || !secretB64 || !optionB64) return null;
    let secret;
    let optionName;
    try {
        secret = b64urlDecode(secretB64);
        optionName = b64urlDecode(optionB64).toString('utf8');
    } catch {
        return null;
    }
    if (!secret || !secret.length || !optionName) return null;
    return { pollId, creatorJid, secret, optionName };
}

export function extractPollVoteId(m) {
    const id = m?.message?.templateButtonReplyMessage?.selectedId
        || m?.message?.buttonsResponseMessage?.selectedButtonId
        || m?.message?.listResponseMessage?.singleSelectReply?.selectedRowId
        || m?.msg?.selectedId
        || m?.msg?.selectedButtonId
        || m?.msg?.singleSelectReply?.selectedRowId
        || m?.text
        || m?.body
        || '';
    return String(id).trim();
}

export async function handlePollVoteTap(client, m, resolveLid) {
    const body = extractPollVoteId(m);
    const parsed = decodePollVoteButton(body);
    if (!parsed) return false;
    const { pollId, creatorJid, secret, optionName } = parsed;
    const reactKey = m.reactKey || m.key;
    try {
        const botJid = client.decodeJid ? client.decodeJid(client.user?.id) : client.user?.id;
        let useCreator = creatorJid;
        let useSecret = secret;
        let useKey = null;
        let live = null;
        try {
            live = getPollSecret(m.chat, pollId);
            if (live) {
                if (live.secret?.length) useSecret = live.secret;
                if (live.creatorJid) useCreator = live.creatorJid;
                if (live.participantAlt) useCreator = live.participantAlt;
                useKey = { remoteJid: m.chat, id: pollId, participant: live.creatorJid || creatorJid };
                if (live.participantAlt) useKey.participantAlt = live.participantAlt;
                if (live.remoteJidAlt) useKey.remoteJidAlt = live.remoteJidAlt;
                if (live.addressingMode) useKey.addressingMode = live.addressingMode;
            }
        } catch {}
        if (!live?.participantAlt && String(useCreator).endsWith('@lid') && typeof resolveLid === 'function') {
            try {
                const pn = await resolveLid(useCreator);
                if (pn && !String(pn).endsWith('@lid')) useCreator = pn;
            } catch {}
        }
        const creatorIsBot = !!botJid && (useCreator === botJid || String(useCreator).split(':')[0] === String(botJid).split(':')[0]);
        if (!useKey) {
            useKey = { remoteJid: m.chat, fromMe: creatorIsBot, id: pollId };
            if (!creatorIsBot) useKey.participant = useCreator;
        } else {
            useKey.fromMe = creatorIsBot;
            if (creatorIsBot) delete useKey.participant;
        }
        await client.sendPollVote(m.chat, useKey, [optionName], { messageSecret: useSecret, creatorJid: useCreator });
        if (reactKey) await client.sendMessage(m.chat, { react: { text: '✅', key: reactKey } }).catch(() => {});
        console.log('[POLLVOTE] voted', pollId, '->', optionName, 'in', m.chat);
        return true;
    } catch (e) {
        console.error('[POLLVOTE] vote failed:', e?.message || e);
        if (reactKey) await client.sendMessage(m.chat, { react: { text: '❌', key: reactKey } }).catch(() => {});
        await client.sendMessage(m.chat, { text: `╭─❏ 「 VOTE 」\n│ Couldn't cast that vote: ${String(e?.message || e).slice(0, 100)}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }).catch(() => {});
        return true;
    }
}
