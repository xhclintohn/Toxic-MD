import { CHAT_THEMES } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

const PRESETS = Array.isArray(CHAT_THEMES) && CHAT_THEMES.length ? CHAT_THEMES : [
    'Default-Blue@Minimal',
    'Default-Blue@Tonal@Minimal',
    'Emerald@Minimal',
    'Emerald@Tonal@Minimal',
    'Pink@Minimal',
    'Red@Minimal',
    'Royal-Blue@Minimal',
    'Tyrian-Purple@Minimal',
    'WhatsApp-Green@Minimal'
];

const formatStylishReply = (message) => {
    return `╭─❏ 「 SETTHEME 」\n│ \n│ ${message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const matchPreset = (input) => {
    const wanted = normalize(input);
    if (!wanted) return null;
    const exact = PRESETS.find((preset) => normalize(preset) === wanted);
    if (exact) return exact;
    const starts = PRESETS.filter((preset) => normalize(preset).startsWith(wanted));
    if (starts.length === 1) return starts[0];
    const contains = PRESETS.filter((preset) => normalize(preset).includes(wanted));
    if (contains.length === 1) return contains[0];
    return starts[0] || contains[0] || null;
};

const parseArgb = (input) => {
    const cleaned = String(input || '').replace(/^#/, '').trim();
    if (!/^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(cleaned)) return null;
    const value = parseInt(cleaned, 16);
    return cleaned.length === 6 ? (0xff000000 | value) >>> 0 : value >>> 0;
};

export default {
    name: 'settheme',
    aliases: ['theme'],
    description: 'Set a chat theme preset or solid color for a chat or group',
    run: async (context) => {
        const { client, m, IsGroup, prefix } = context;
        const pfx = prefix || '.';

        try {
            const body = (m.body || '').trim();
            const argsText = body.replace(/^\S+\s*/, '').trim();

            let targetJid = null;
            const jidMatch = argsText.match(/\d+@g\.us/);
            const linkMatch = argsText.match(/https?:\/\/chat\.whatsapp\.com\/[^\s]+/i);
            let rest = argsText;
            if (jidMatch) {
                targetJid = jidMatch[0];
                rest = rest.replace(jidMatch[0], '').trim();
            } else if (linkMatch) {
                try {
                    const url = new URL(linkMatch[0]);
                    const code = url.pathname.replace(/^\/+/, '');
                    const info = await client.groupGetInviteInfo(code);
                    targetJid = info.id;
                    rest = rest.replace(linkMatch[0], '').trim();
                } catch {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, formatStylishReply("That group link didn't work. Check it and try again."));
                }
            } else {
                targetJid = m.chat;
            }

            const words = rest.split(/\s+/).filter(Boolean);
            const action = (words[0] || '').toLowerCase();

            if (!action || action === 'list') {
                const list = PRESETS.map((preset, index) => `${index + 1}. ${preset}`).join('\n│ ');
                return sendInteractive(client, m, formatStylishReply(`Chat themes:\n│ ${list}\n│ \n│ Pick by number: ${pfx}settheme 2\n│ Or by name: ${pfx}settheme emerald\n│ Color: ${pfx}settheme color FF0000\n│ Remove: ${pfx}settheme clear`));
            }

            if (typeof client.setChatTheme !== 'function' || typeof client.setChatThemeColor !== 'function') {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, formatStylishReply('Chat themes need the latest Baileys. Run .update first.'));
            }

            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            if (action === 'clear' || action === 'reset' || action === 'default') {
                await client.clearChatTheme(targetJid);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, formatStylishReply('Chat theme cleared'));
            }

            if (action === 'color' || action === 'colour') {
                const light = parseArgb(words[1]);
                if (light === null) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, formatStylishReply(`Give a hex color, like ${pfx}settheme color FF0000`));
                }
                const dark = parseArgb(words[2]) ?? light;
                const doodle = words.some((word) => word.toLowerCase() === 'doodle');
                await client.setChatThemeColor(targetJid, {
                    backgroundLightArgb: light,
                    backgroundDarkArgb: dark,
                    isDoodleEnabled: doodle
                });
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, formatStylishReply(`Theme color set${doodle ? ' with doodle' : ''}`));
            }

            const byNumber = /^\d+$/.test(words[0] || '') ? PRESETS[Number(words[0]) - 1] : null;
            const preset = byNumber || matchPreset(rest);
            if (!preset) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, formatStylishReply(`Unknown theme. Use ${pfx}settheme list to see them.`));
            }

            await client.setChatTheme(targetJid, preset);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, formatStylishReply(`Theme set to *${preset}*`));
        } catch (error) {
            console.error('SetTheme error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, formatStylishReply('Failed to set the theme. Try again.'));
        }
    }
};
