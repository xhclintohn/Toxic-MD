const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

function getDeviceId(rawJid) {
    const part = (rawJid || '').split('@')[0];
    if (part.includes(':')) return parseInt(part.split(':')[1] || '0', 10);
    return 0;
}

export function isLikelyBotMessage(id, rawKeyJid, resolvedSender) {
    const resolvedNum = _num(resolvedSender || '');
    return resolvedNum.length > 13 || (resolvedSender || '').endsWith('@bot');
}

export { getDeviceId };
