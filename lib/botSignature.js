const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

const OFFICIAL_ID_RE = /^[A-F0-9]{32}$/i;

export function getDeviceId(rawJid) {
    const part = (rawJid || '').split('@')[0];
    if (part.includes(':')) return parseInt(part.split(':')[1] || '0', 10);
    return 0;
}

export function isBaileysStyleId(id) {
    const msgId = id || '';
    if (!msgId) return false;
    if (OFFICIAL_ID_RE.test(msgId)) return false;
    return (msgId.startsWith('3EB0') || msgId.startsWith('BAE5')) && msgId.length <= 24;
}

export function isLidSenderOversized(resolvedSender) {
    const resolvedNum = _num(resolvedSender || '');
    return resolvedNum.length > 13 || (resolvedSender || '').endsWith('@bot');
}

const STYLED_RANGES = [
    [0x1D400, 0x1D7FF],
    [0xFF00, 0xFFEF],
    [0x2460, 0x24FF],
    [0x1F100, 0x1F1FF],
    [0x0300, 0x036F]
];

export function isStyledFontHeavy(text) {
    const str = (text || '').trim();
    if (str.length < 12) return false;
    let styled = 0;
    for (const ch of str) {
        const cp = ch.codePointAt(0);
        if (STYLED_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)) styled++;
    }
    return (styled / str.length) > 0.3;
}

export function computeBotScore({ id, rawKeyJid, resolvedSender, text, isBurst }) {
    const signals = {
        baileysId: isBaileysStyleId(id),
        lidOversized: isLidSenderOversized(resolvedSender),
        styledFont: isStyledFontHeavy(text),
        burst: !!isBurst
    };
    const score = Object.values(signals).filter(Boolean).length;
    return { score, signals };
}
