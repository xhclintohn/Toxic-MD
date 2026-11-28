import { getGroupSettings, updateGroupSetting, getGroupSettingsFresh, getKnownBots, addKnownBot, removeKnownBot } from '../../database/config.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { computeBotScore } from '../../lib/botSignature.js';

const fmt = (msg) => `╭─❏ 「 ANTIBOT」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const _CHECK = new Set(['check', 'debug', 'test', 'scan']);
const _MARK = new Set(['markbot', 'mark']);
const _UNMARK = new Set(['unmarkbot', 'unmark']);
const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

export default {
    name: 'antibot',
    aliases: ['nobot', 'blockbot', 'botblock', 'antibots', 'removebots'],
    description: 'Toggle anti-bot protection. Usage: .antibot warn|remove|off',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        if (!m.chat?.endsWith('@g.us')) {
            return sendInteractive(client, m, fmt('This command is for groups only.'));
        }
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const val = (args[0] || '').toLowerCase();
        const gs = await getGroupSettings(m.chat);
        const current = gs?.antibot || 'off';

        if (_CHECK.has(val)) {
            if (!m.quoted) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt(`Reply to a suspected bot's message with\n│ *${prefix}antibot check* to see what\n│ ANTIBOT sees for that message.`));
            }
            const qId = m.quoted.id || '';
            const qSender = m.quoted.sender || '';
            const qText = m.quoted.text || '';
            const { score, signals } = computeBotScore({ id: qId, rawKeyJid: m.msg?.contextInfo?.participant || '', resolvedSender: qSender, text: qText, isBurst: false });
            await client.sendMessage(m.chat, { react: { text: '🔍', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Message ID: ${qId || '(none)'}\n│ Sender: @${(qSender || '').split('@')[0]}\n│ \n│ non-standard message ID: ${signals.baileysId ? 'YES' : 'no'}\n│ fake sender ID: ${signals.lidOversized ? 'YES' : 'no'}\n│ spammy stylized text: ${signals.styledFont ? 'YES' : 'no'}\n│ message flooding: ${signals.burst ? 'YES' : 'no'}\n│ \n│ Score: ${score}/4 (kicks at 2, warns at 1)`), { mentions: [qSender].filter(Boolean) });
        }

        if (_MARK.has(val) || _UNMARK.has(val)) {
            if (!m.quoted) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt(`Reply to the bot's message with\n│ *${prefix}antibot markbot* to permanently\n│ flag that sender as a bot everywhere.`));
            }
            const qSender = m.quoted.sender || m.msg?.contextInfo?.participant || '';
            const qNum = _num(qSender);
            if (!qNum) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Could not resolve a sender number from that message.'));
            }
            if (_MARK.has(val)) {
                await addKnownBot(qNum);
                await client.sendMessage(m.chat, { react: { text: '🤖', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt(`@${qNum} is now permanently flagged as a\n│ known bot. Every message from this\n│ number in any group with ANTIBOT ON\n│ will be auto-kicked, no scoring needed.`), { mentions: [qSender].filter(Boolean) });
            }
            await removeKnownBot(qNum);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`@${qNum} removed from the known-bots list.`), { mentions: [qSender].filter(Boolean) });
        }

        if (val === 'botlist') {
            const bots = await getKnownBots();
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
            if (!bots.length) return sendInteractive(client, m, fmt('No numbers are flagged as known bots yet.'));
            return sendInteractive(client, m, fmt(`Known bots:\n│ ${bots.map(n => '@' + n).join('\n│ ')}`), { mentions: bots.map(n => n + '@s.whatsapp.net') });
        }

        const modeLabel =
            current === 'warn'   ? 'WARN ⚠️'   :
            current === 'remove' ? 'REMOVE 🚫' : 'OFF ❌';

        if (!val) {
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(
                `Status: *${modeLabel}*\n│ \n│ Detects bot-style message IDs, fake\n│ sender IDs, stylized spam text, and\n│ message flooding (10+ msgs/3s).\n│ \n│ Usage:\n│ *${prefix}antibot warn*   → warn first, kick on repeat\n│ *${prefix}antibot remove* → kick instantly, no warning\n│ *${prefix}antibot off*   → disable\n│ \n│ *${prefix}antibot check* (reply to a msg) → debug score\n│ *${prefix}antibot markbot* (reply) → force-flag as bot\n│ *${prefix}antibot unmarkbot* (reply) → unflag\n│ *${prefix}antibot botlist* → show flagged numbers`
            ));
        }

        const normalised =
            val === 'on' || val === 'enable' || val === 'enabled' || val === 'activate' ? 'warn' :
            val === 'disable' || val === 'disabled' || val === 'deactivate' || val === 'false' || val === '0' || val === 'no' || val === 'stop' ? 'off' :
            val;

        const validModes = ['off', 'warn', 'remove'];
        if (!validModes.includes(normalised)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Invalid option: *${val}*\n│ Use: *warn*, *remove*, or *off*`));
        }

        if (current === normalised) {
            await client.sendMessage(m.chat, { react: { text: '⚠️', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Antibot is already *${normalised.toUpperCase()}*. Pay attention.`));
        }

        await updateGroupSetting(m.chat, 'antibot', normalised);
        await getGroupSettingsFresh(m.chat);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});

        const desc =
            normalised === 'off'    ? 'Anti-Bot *DISABLED ❌*\n│ Bots are now allowed in this group.' :
            normalised === 'warn'   ? 'Anti-Bot set to *WARN ⚠️*\n│ First offence → warning.\n│ Repeat → kicked. 🤖❌' :
                                     'Anti-Bot set to *REMOVE 🚫*\n│ Any bot detected is kicked instantly.\n│ No second chances. 😈';
        return sendInteractive(client, m, fmt(desc));
    }
};
