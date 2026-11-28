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

const COLOR_PRESETS = {
    pink: 'ff69b4',
    blue: '1e90ff',
    purple: '9b59b6',
    black: '121212',
    green: '2ecc71',
    red: 'e74c3c',
    yellow: 'f1c40f',
    orange: 'e67e22',
    white: 'f5f6fa',
    grey: '7f8c8d',
    gray: '7f8c8d',
    gold: 'd4af37',
    teal: '008080',
    cyan: '00ffff',
    magenta: 'ff00ff',
    lime: 'a3e635',
    navy: '000080',
    maroon: '800000',
    olive: '808000',
    brown: '8b5a2b'
};

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
    if (input == null) return null;
    const key = String(input).trim().toLowerCase().replace(/^#/, '');
    const hex = COLOR_PRESETS[key] || key;
    if (!/^[0-9a-f]{6}$|^[0-9a-f]{8}$/.test(hex)) return null;
    const value = parseInt(hex, 16);
    return hex.length === 6 ? (0xff000000 | value) >>> 0 : value >>> 0;
};

const themeBlocked = async (client, jid) => {
    if (!jid || !jid.endsWith('@g.us')) return false;
    try {
        const meta = await client.groupMetadata(jid);
        if (!meta?.restrict) return false;
        const botIds = [client.user?.id, client.user?.lid]
            .filter(Boolean)
            .map((x) => String(x).split('@')[0].split(':')[0]);
        const me = (meta.participants || []).find((p) =>
            botIds.includes(String(p.id || '').split('@')[0].split(':')[0]) ||
            botIds.includes(String(p.lid || '').split('@')[0].split(':')[0]));
        return !(me && (me.admin === 'admin' || me.admin === 'superadmin'));
    } catch {
        return false;
    }
};

const BLOCKED_TEXT = 'WhatsApp will drop this theme in this group — only admins can edit group info here, and the bot is not an admin. Make the bot an admin, or set "Edit group info" to all participants, then run the command again.';

export default {
    name: 'settheme',
    aliases: ['theme'],
    description: 'Set a chat theme preset, solid background color, or clear the theme for a chat or group',
    run: async (context) => {
        const { client, m, prefix } = context;
        const pfx = prefix || '.';

        const fail = async (text) => {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, formatStylishReply(text));
        };
        const done = async (text) => {
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, formatStylishReply(text));
        };

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
                    return fail("That group link didn't work. Check it and try again.");
                }
            } else {
                targetJid = m.chat;
            }

            const words = rest.split(/\s+/).filter(Boolean);
            const action = (words[0] || '').toLowerCase();

            if (!action || action === 'list' || action === 'help') {
                const list = PRESETS.map((preset, index) => `${index + 1}. ${preset}`).join('\n│ ');
                const colors = Object.keys(COLOR_PRESETS).filter((c) => c !== 'gray').join(', ');
                return sendInteractive(client, m, formatStylishReply(`Chat themes:\n│ ${list}\n│ \n│ Pick by number: ${pfx}settheme 2\n│ Or by name: ${pfx}settheme emerald\n│ Solid color: ${pfx}settheme pink\n│ Any hex: ${pfx}settheme #ff69b4\n│ Light + dark: ${pfx}settheme blue navy\n│ Flat (no doodle): ${pfx}settheme blue nodoodle\n│ Colors: ${colors}\n│ Remove: ${pfx}settheme clear`));
            }

            if (typeof client.setChatTheme !== 'function' || typeof client.setChatThemeColor !== 'function') {
                return fail('Chat themes need the latest Baileys. Run .update first.');
            }

            if (await themeBlocked(client, targetJid)) {
                return fail(BLOCKED_TEXT);
            }

            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            if (action === 'clear' || action === 'reset' || action === 'default') {
                await client.clearChatTheme(targetJid);
                return done('Chat theme cleared');
            }

            if (action === 'scheme' || action === 'colorscheme') {
                if (!words[1]) return fail(`Give a scheme id, like ${pfx}settheme scheme Emerald@Minimal`);
                await client.setChatTheme(targetJid, words[1]);
                return done(`Theme set to *${words[1]}*`);
            }

            const colorWords = (action === 'color' || action === 'colour' || action === 'solid')
                ? words.slice(1)
                : words;
            const light = parseArgb(colorWords[0]);
            if (light !== null) {
                const doodleOff = colorWords.some((word) => /^(nodoodle|no-doodle|plain)$/i.test(word));
                const restWords = colorWords.slice(1).filter((word) => !/^(doodle|nodoodle|no-doodle|plain)$/i.test(word));
                const dark = restWords[0] !== undefined ? parseArgb(restWords[0]) : light;
                if (dark === null) {
                    return fail(`That dark color is not valid. Use a color name or hex, like ${pfx}settheme blue navy`);
                }
                await client.setChatThemeColor(targetJid, {
                    backgroundLightArgb: light,
                    backgroundDarkArgb: dark,
                    isDoodleEnabled: !doodleOff
                });
                return done(`Theme color set${doodleOff ? ' (flat, no doodle)' : ' with doodle'}`);
            }

            if (action === 'color' || action === 'colour' || action === 'solid') {
                return fail(`Give a color name or hex, like ${pfx}settheme pink or ${pfx}settheme #ff69b4`);
            }

            const byNumber = /^\d+$/.test(words[0] || '') ? PRESETS[Number(words[0]) - 1] : null;
            const preset = byNumber || matchPreset(rest);
            if (!preset) {
                return fail(`Unknown theme. Use ${pfx}settheme list to see them.`);
            }

            await client.setChatTheme(targetJid, preset);
            return done(`Theme set to *${preset}*`);
        } catch (error) {
            console.error('SetTheme error:', error);
            return fail('Failed to set the theme. Try again.');
        }
    }
};
