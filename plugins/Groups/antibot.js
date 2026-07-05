import { getGroupSettings, updateGroupSetting, getGroupSettingsFresh, getKnownBots, addKnownBot, removeKnownBot } from '../../database/config.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { computeBotScore } from '../../lib/botSignature.js';

const fmt = (msg) => `╭─❏ 「 ANTIBOT」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const _ON  = new Set(['on','enable','enabled','activate','activated','true','1','yes','start']);
const _OFF = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);
const _CHECK = new Set(['check','debug','test','scan']);
const _MARK = new Set(['markbot','mark']);
const _UNMARK = new Set(['unmarkbot','unmark']);
const _num = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

export default {
    name: 'antibot',
    aliases: ['nobot', 'blockbot', 'botblock', 'antibots', 'removebots'],
    description: 'Toggle anti-bot: blocks bots in the group. Usage: .antibot on|off',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        if (!m.chat?.endsWith('@g.us')) {
            return sendInteractive(client, m, fmt('This command is for groups only.'));
        }
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const val = (args[0] || '').toLowerCase();
        const gs = await getGroupSettings(m.chat);
        const current = gs?.antibot || 0;
        const isOn = current === 1 || current === true || current === 'true';

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
            return sendInteractive(client, m, fmt(`Message ID: ${qId || '(none)'}\n│ Sender: @${(qSender||'').split('@')[0]}\n│ \n│ non-standard message ID: ${signals.baileysId ? 'YES' : 'no'}\n│ fake sender ID: ${signals.lidOversized ? 'YES' : 'no'}\n│ spammy stylized text: ${signals.styledFont ? 'YES' : 'no'}\n│ message flooding: ${signals.burst ? 'YES' : 'no'}\n│ \n│ Score: ${score}/4 (kicks at 2, warns at 1)`), { mentions: [qSender].filter(Boolean) });
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

        if (!val) {
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Status: *${isOn ? 'ON ✅' : 'OFF ❌'}*\n│ \n│ Detects bot-style message IDs, fake\n│ sender IDs, stylized spam text, and\n│ message flooding (10+ msgs/3s).\n│ \n│ Usage:\n│ *${prefix}antibot on*  → kick detected bots\n│ *${prefix}antibot off* → disable\n│ *${prefix}antibot check* (reply to a msg) → debug\n│ *${prefix}antibot markbot* (reply) → force-flag a sender as a bot\n│ *${prefix}antibot unmarkbot* (reply) → unflag\n│ *${prefix}antibot botlist* → show flagged numbers\n│ \n│ Aliases: on/enable/off/disable`));
        }

        if (_ON.has(val)) {
            await updateGroupSetting(m.chat, 'antibot', 1);
            const verify = await getGroupSettingsFresh(m.chat);
            const verified = verify?.antibot === true || verify?.antibot === 1;
            console.log('[ANTIBOT DEBUG] toggle ON for', m.chat, '-> verified as', verify?.antibot);
            await client.sendMessage(m.chat, { react: { text: verified ? '✅' : '⚠️', key: m.reactKey } }).catch(() => {});
            if (!verified) {
                return sendInteractive(client, m, fmt(`⚠️ Wrote ENABLED but the database read\n│ it back as OFF right after. This means\n│ the write isn't sticking (DB/permission\n│ issue). Check your server console for\n│ the [ANTIBOT DEBUG] toggle line.`));
            }
            return sendInteractive(client, m, fmt(`Anti-Bot *ENABLED* ✅ (verified)\n│ \n│ Bots with fake message signatures,\n│ suspicious sender IDs, spam-style text,\n│ or 10+ msgs/3s flooding will be\n│ warned then auto-kicked. 🤖❌`));
        }
        if (_OFF.has(val)) {
            await updateGroupSetting(m.chat, 'antibot', 0);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Anti-Bot *DISABLED* ❌`));
        }

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Invalid option: *${val}*\nUse: *on* or *off*`));
    }
};
