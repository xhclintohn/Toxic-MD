import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const MODES = {
    all: ['on', 'all', 'everywhere', 'enable', 'enabled', 'activate', 'activated', 'true', '1', 'yes', 'start'],
    dm: ['dm', 'dms', 'private', 'pm', 'direct'],
    gc: ['gc', 'group', 'groups', 'groupchat'],
    off: ['off', 'disable', 'disabled', 'deactivate', 'deactivated', 'false', '0', 'no', 'stop']
};

const LABEL = { all: 'ALL', dm: 'DM ONLY', gc: 'GC ONLY', off: 'OFF' };
const DESC = {
    all: 'I will react to every message with a different emoji. 😈',
    dm: 'I will only react to DM messages with a different emoji. 😈',
    gc: 'I will only react to group messages with a different emoji. 😈',
    off: 'No more auto reactions.'
};

const modeOf = (value) => {
    const v = String(value || '').toLowerCase().trim();
    for (const [mode, words] of Object.entries(MODES)) {
        if (words.includes(v)) return mode;
    }
    return null;
};

const currentMode = (settings) => {
    const v = settings?.autoreact;
    if (v === true || v === 1) return 'all';
    if (typeof v === 'string') {
        const s = v.toLowerCase().trim();
        if (s === 'true' || s === '1' || s === 'on' || s === 'all') return 'all';
        if (s === 'dm') return 'dm';
        if (s === 'gc') return 'gc';
    }
    return 'off';
};

const statusLine = (mode) => mode === 'off' ? 'OFF ❌' : `ON (${LABEL[mode]}) ✅`;

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (title, msg) =>
            `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            const settings = await getSettings();
            const value = args.join(' ').toLowerCase();
            const mode = modeOf(value);

            if (mode) {
                if (currentMode(settings) === mode) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return await sendInteractive(client, m, fmt('AUTOREACT', `Autoreact is already ${LABEL[mode]}, genius. Stop wasting my time.\n│ \n│ 📌 Usage: ${prefix}autoreact on | ${prefix}autoreact dm | ${prefix}autoreact gc | ${prefix}autoreact off`));
                }
                await updateSetting('autoreact', mode === 'off' ? false : mode);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await sendInteractive(client, m, fmt('AUTOREACT', `Autoreact ${LABEL[mode]}! ${DESC[mode]}\n│ \n│ 📌 Usage: ${prefix}autoreact on | ${prefix}autoreact dm | ${prefix}autoreact gc | ${prefix}autoreact off`));
            }

            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
            await sendInteractive(client, m, `╭─❏ 「 AUTOREACT」\n│ Status: ${statusLine(currentMode(settings))}\n│ \n│ React everywhere:  ${prefix}autoreact on\n│ React in DMs only:   ${prefix}autoreact dm\n│ React in groups only: ${prefix}autoreact gc\n│ Turn OFF: ${prefix}autoreact off\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt('AUTOREACT', `Something broke: ${error.message || 'Try again later.'}`));
        }
    });
};
