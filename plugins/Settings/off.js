import { getSettings, updateSetting, getGroupSettings, updateGroupSetting } from '../../database/config.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 DISABLE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const BOT = {
    autolike: 'Auto Status Like',
    autoread: 'Auto Read',
    autoview: 'Auto View Status',
    anticall: 'Anti-Call',
    antidelete: 'Anti-Delete',
    antiedit: 'Anti-Edit',
    antiviewonce: 'Anti-View Once',
    chatbotpm: 'Chatbot PM',
    autoai: 'Auto AI Reply',
    stealth: 'Stealth Mode',
    startmessage: 'Start Message',
};

const GROUP = {
    welcome: 'Welcome Message',
    goodbye: 'Goodbye Message',
    antisticker: 'Anti-Sticker',
    antispam: 'Anti-Spam',
    antibot: 'Anti-Bot',
    antiforeign: 'Anti-Foreign',
    antidemote: 'Anti-Demote',
    antipromote: 'Anti-Promote',
    gcpresence: 'Group Presence',
    events: 'Group Events',
    antidelete: 'Anti-Delete (Group)',
    antitag: 'Anti-Tag (Group)',
};

const GROUP_MODE = {
    antilink: { label: 'Anti-Link' },
    antistatusmention: { label: 'Anti-Status Mention' },
};

const _isOwner = (m, settings) => {
    const ownerEnv = (process.env.OWNER_NUMBER || '').replace(/\D/g, '').slice(-12);
    const senderNum = (m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '');
    const devNum = '254114885159';
    const sudoNums = (settings.sudo_users || []).map(n => String(n).replace(/\D/g, '').slice(-12));
    return senderNum === ownerEnv || senderNum === devNum || sudoNums.includes(senderNum.slice(-12));
};

const isGroupAdmin = (m) => m.isAdmin || m.isBotAdmin || false;

export default {
    name: 'off',
    aliases: ['disable', 'deactivate', 'turnoff', 'turn_off'],
    description: 'Disable a setting. Usage: .off <setting> | .off alone shows all settings',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const key = (args[0] || '').toLowerCase().trim();
        const isGroup = m.chat?.endsWith('@g.us');

        if (!key) {
            const botLines = Object.entries(BOT).map(([k, l]) => `│ • *${prefix}off ${k}*`).join('\n');
            const grpLines = isGroup
                ? '\n│ \n│ 🔷 *Group Settings*\n' + [...Object.entries(GROUP), ...Object.entries(GROUP_MODE)].map(([k, v]) => `│ • *${prefix}off ${k}*  (${typeof v === 'string' ? v : v.label})`).join('\n')
                : '';
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`🔷 *Bot Settings*\n${botLines}${grpLines}`));
        }

        const settings = await getSettings();

        if (BOT[key] !== undefined) {
            if (!_isOwner(m, settings)) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Only the bot owner can change bot settings.'));
            }
            await updateSetting(key, false);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`*${BOT[key]}* has been *DISABLED* ❌`));
        }

        if (!isGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`*${key}* is a group setting — use this command inside a group.`));
        }

        if (GROUP[key] !== undefined) {
            if (!isGroupAdmin(m) && !_isOwner(m, settings)) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Only group admins can change group settings.'));
            }
            await updateGroupSetting(m.chat, key, false);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`*${GROUP[key]}* has been *DISABLED* ❌`));
        }

        if (GROUP_MODE[key]) {
            if (!isGroupAdmin(m) && !_isOwner(m, settings)) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Only group admins can change group settings.'));
            }
            await updateGroupSetting(m.chat, key, 'off');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`*${GROUP_MODE[key].label}* has been *DISABLED* ❌`));
        }

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Unknown setting: *${key}*\nType *${prefix}off* to see all toggleable settings.`));
    }
};
