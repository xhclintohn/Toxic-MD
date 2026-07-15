import { getSettings, updateSetting, getGroupSettings, updateGroupSetting } from '../../database/config.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 ENABLE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

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
    antilink: { label: 'Anti-Link', on: 'warn' },
    antistatusmention: { label: 'Anti-Status Mention', on: 'warn' },
    antibadword: { label: 'Anti-Bad Word', on: 'warn' },
    antigroupstatus: { label: 'Anti-Group Status', on: 'warn' },
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
    name: 'on',
    aliases: ['enable', 'activate', 'turnon', 'turn_on'],
    description: 'Enable a setting. Usage: .on <setting> | .on alone shows all settings',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const key = (args[0] || '').toLowerCase().trim();
        const isGroup = m.chat?.endsWith('@g.us');

        if (!key) {
            const botLines = Object.entries(BOT).map(([k, l]) => `│ • *${prefix}on ${k}*`).join('\n');
            const grpLines = isGroup
                ? '\n│ \n│ 🔷 *Group Settings*\n' + [...Object.entries(GROUP), ...Object.entries(GROUP_MODE)].map(([k, v]) => `│ • *${prefix}on ${k}*  (${typeof v === 'string' ? v : v.label})`).join('\n')
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
            await updateSetting(key, true);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`*${BOT[key]}* has been *ENABLED* ✅`));
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
            await updateGroupSetting(m.chat, key, true);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`*${GROUP[key]}* has been *ENABLED* ✅`));
        }

        if (GROUP_MODE[key]) {
            if (!isGroupAdmin(m) && !_isOwner(m, settings)) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Only group admins can change group settings.'));
            }
            const cfg = GROUP_MODE[key];
            await updateGroupSetting(m.chat, key, cfg.on);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`*${cfg.label}* has been *ENABLED* (${cfg.on} mode) ✅`));
        }

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt(`Unknown setting: *${key}*\nType *${prefix}on* to see all toggleable settings.`));
    }
};
