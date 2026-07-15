import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ButtonV2 } from '@whiskeysockets/baileys';
import { getGreeting } from '../../lib/language.js';

const getTimeGreeting = () => {
    try { return getGreeting(); } catch {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 21) return 'Good evening';
        return 'Good night';
    }
};

export default {
    name: 'menu',
    aliases: ['commands', 'list', 'cmds', 'm', 'cmd', 'commandlist', 'allcmds'],
    description: 'Displays the Toxic-MD command menu',
    run: async (context) => {
        const { client, m, mode, pict, botname, prefix } = context;

        await client.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

        const bodyText = m.body || '';
        const cleanText = bodyText.trimStart().slice(prefix.length).trimStart();
        const firstWord = cleanText.split(' ')[0].toLowerCase();

        if (cleanText !== '' && !['menu', 'commands', 'list', 'cmds', 'm', 'help', 'cmd', 'commandlist', 'allcmds'].includes(firstWord)) {
            const commandName = cleanText.split(' ')[0];
            return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」\n│ Yo ${m.pushName}, what's with the\n│ extra bullshit after "${commandName}"?\n│ Just type *${prefix}menu* properly, moron.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const greeting = getTimeGreeting();
        const menuText =
            `╭─❏ 「 Mᴇɴᴜ」\n` +
            `│ \n` +
            `│ ${greeting}, @${m.sender.split('@')[0].split(':')[0]}\n` +
            `│ \n` +
            `│ Bot: TOXIC-MD\n` +
            `│ Prefix: ${prefix}\n` +
            `│ Mode: ${mode}\n` +
            `│ \n` +
            `│ Select a category below.\n` +
            `╰───────────────`;

        const sections = [
            {
                title: '⌜ 𝘾𝙤𝙧𝙚 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨 ⌟',
                highlight_label: '© 丨几匚',
                rows: [
                    { title: '𝐅𝐮𝐥𝐥𝐌𝐞𝐧𝐮', description: 'Display all commands', id: `${prefix}fullmenu` },
                    { title: '𝐃𝐞𝐯', description: 'Send developer contact', id: `${prefix}dev` },
                    { title: '𝐑𝐞𝐩𝐨𝐫𝐭', description: 'Report a bug to dev', id: `${prefix}report` },
                ] },
            {
                title: '𝙄𝙣𝙛𝙤 𝘽𝙤𝙩',
                highlight_label: '© 丨几匚',
                rows: [
                    { title: '𝐏𝐢𝐧𝐠', description: 'Check bot speed', id: `${prefix}ping` },
                    { title: '𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬', description: 'Show bot settings', id: `${prefix}settings` },
                    { title: '𝐌𝐨𝐝𝐞', description: 'Toggle bot mode', id: `${prefix}mode` },
                    { title: '𝐔𝐩𝐭𝐢𝐦𝐞', description: 'Check how long bot has been running', id: `${prefix}uptime` },
                ] },
            {
                title: '𝘾𝙖𝙩𝙚𝙜𝙤𝙧𝙮 𝙈𝙚𝙣𝙪𝙨',
                highlight_label: '© 丨几匚',
                rows: [
                    { title: '𝐆𝐞𝐧𝐞𝐫𝐚𝐥𝐌𝐞𝐧𝐮', description: 'General commands', id: `${prefix}generalmenu` },
                    { title: '𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬𝐌𝐞𝐧𝐮', description: 'Bot settings commands', id: `${prefix}settingsmenu` },
                    { title: '𝐎𝐰𝐧𝐞𝐫𝐌𝐞𝐧𝐮', description: 'Owner only commands', id: `${prefix}ownermenu` },
                    { title: '𝐆𝐫𝐨𝐮𝐩𝐌𝐞𝐧𝐮', description: 'Group management', id: `${prefix}groupmenu` },
                    { title: '𝐀𝐈𝐌𝐞𝐧𝐮', description: 'AI & chat commands', id: `${prefix}aimenu` },
                    { title: '𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐌𝐞𝐧𝐮', description: 'Media downloaders', id: `${prefix}downloadmenu` },
                    { title: '𝐄𝐝𝐢𝐭𝐢𝐧𝐠𝐌𝐞𝐧𝐮', description: 'Media editing tools', id: `${prefix}editingmenu` },
                    { title: '𝐄𝐟𝐟𝐞𝐜𝐭𝐬𝐌𝐞𝐧𝐮', description: 'Text effect commands', id: `${prefix}effectsmenu` },
                    { title: '𝐔𝐭𝐢𝐥𝐬𝐌𝐞𝐧𝐮', description: 'Utility commands', id: `${prefix}utilsmenu` },
                    { title: '𝐏𝐫𝐢𝐯𝐚𝐜𝐲𝐌𝐞𝐧𝐮', description: 'Privacy commands', id: `${prefix}privacymenu` },
                ] },
        ];

        const device = await getDeviceMode();

        if (device === 'ios') {
            const iosMenuText =
                `╭─❏ 「 Mᴇɴᴜ」\n` +
                `│ \n` +
                `│ ${greeting}, @${m.sender.split('@')[0].split(':')[0]}\n` +
                `│ \n` +
                `│ Bot: TOXIC-MD\n` +
                `│ Prefix: ${prefix}\n` +
                `│ Mode: ${mode}\n` +
                `│ \n` +
                `│ ⌜ 𝘾𝙤𝙧𝙚 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨 ⌟\n` +
                `│ ${prefix}fullmenu — Display all commands\n` +
                `│ ${prefix}dev — Send developer contact\n` +
                `│ ${prefix}report — Report a bug to dev\n` +
                `│ \n` +
                `│ 𝙄𝙣𝙛𝙤 𝘽𝙤𝙩\n` +
                `│ ${prefix}ping — Check bot speed\n` +
                `│ ${prefix}settings — Show bot settings\n` +
                `│ ${prefix}mode — Toggle bot mode\n` +
                `│ ${prefix}uptime — Check bot uptime\n` +
                `│ \n` +
                `│ 𝘾𝙖𝙩𝙚𝙜𝙤𝙧𝙮 𝙈𝙚𝙣𝙪𝙨\n` +
                `│ ${prefix}generalmenu — General commands\n` +
                `│ ${prefix}settingsmenu — Bot settings commands\n` +
                `│ ${prefix}ownermenu — Owner only commands\n` +
                `│ ${prefix}groupmenu — Group management\n` +
                `│ ${prefix}aimenu — AI & chat commands\n` +
                `│ ${prefix}downloadmenu — Media downloaders\n` +
                `│ ${prefix}editingmenu — Media editing tools\n` +
                `│ ${prefix}effectsmenu — Text effect commands\n` +
                `│ ${prefix}utilsmenu — Utility commands\n` +
                `│ ${prefix}privacymenu — Privacy commands\n` +
                `╰───────────────\n` +
                `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            await client.sendMessage(m.chat, {
                text: iosMenuText, mentions: [m.sender]
            });
            return;
        }

        try {
            const btnV2 = new ButtonV2(client);
            btnV2.setBody(menuText)
                .setFooter('> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧')
                .setThumbnail(pict)
                .addButton('𝐅𝐮𝐥𝐥𝐌𝐞𝐧𝐮', `${prefix}fullmenu`)
                .addButton('𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬', `${prefix}settings`)
                .addButton('𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫', `${prefix}dev`);
            await btnV2.send(m.chat, { userJid: client.user.id, mentions: [m.sender] });
        } catch {
            try {
                const msg = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
                    interactiveMessage: {
                        body: { text: menuText },
                        footer: { text: '> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' },
                        header: { hasMediaAttachment: false },
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                title: `${botname}`,
                                body: `Yo, ${m.pushName}! Ready to fuck shit up?`,
                                mediaType: 1,
                                thumbnail: pict,
                                mediaUrl: '',
                                sourceUrl: 'https://github.com/xhclintohn/Toxic-MD',
                                showAdAttribution: false,
                                renderLargerThumbnail: true }
                        },
                        nativeFlowMessage: {
                            messageVersion: 1,
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'GitHub Repo',
                                        url: 'https://github.com/xhclintohn/Toxic-MD',
                                        merchant_url: 'https://github.com/xhclintohn/Toxic-MD'
                                    })
                                },
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: 'Browse Commands',
                                        sections: sections
                                    })
                                }
                            ]
                        }
                    }
                }), { userJid: client.user.id });
                if (!msg?.key?.id) throw new Error('null key');
                await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            } catch {
                await client.sendMessage(m.chat, {
                    image: pict,
                    caption: menuText + '\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧',
                    mentions: [m.sender],
                    contextInfo: {
                        externalAdReply: {
                            title: `${botname}`,
                            body: `Yo, ${m.pushName}! Ready to fuck shit up?`,
                            mediaType: 1,
                            thumbnail: pict,
                            mediaUrl: '',
                            sourceUrl: 'https://github.com/xhclintohn/Toxic-MD',
                            showAdAttribution: false,
                            renderLargerThumbnail: true }
                    }
                });
                await client.sendMessage(m.chat, {
                    listMessage: {
                        title: '𝐕𝐈𝐄𝐖 𝐎𝐏𝐓𝐈𝐎𝐍𝐒',
                        description: 'Select a category to view its commands.',
                        buttonText: 'Browse Commands',
                        listType: 1,
                        sections: sections.map(s => ({
                            title: s.title,
                            rows: s.rows.map(r => ({ title: r.title, description: r.description, rowId: r.id }))
                        })),
                        footer: '' } });
            }
        }

        const xhClintonPaths = [
            path.join(__dirname, 'xh_clinton'),
            path.join(process.cwd(), 'xh_clinton'),
            path.join(__dirname, '..', 'xh_clinton')
        ];
        let audioFolder = null;
        for (const folderPath of xhClintonPaths) {
            if (fs.existsSync(folderPath)) { audioFolder = folderPath; break; }
        }
        if (!audioFolder) return;
        const menuFiles = ['menu1.mp3', 'menu2.mp3', 'menu3.mp3', 'menu4.mp3'];
        const possibleFiles = menuFiles.map(f => path.join(audioFolder, f)).filter(f => fs.existsSync(f));
        if (possibleFiles.length === 0) return;
        const randomFile = possibleFiles[Math.floor(Math.random() * possibleFiles.length)];
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
            const audioBuffer = fs.readFileSync(randomFile);
            await client.sendMessage(m.chat, { audio: audioBuffer, ptt: true, mimetype: 'audio/mpeg', fileName: 'toxic-menu.m4a' });
        } catch {
            await client.sendMessage(m.chat, { audio: { url: randomFile }, ptt: true, mimetype: 'audio/mpeg', fileName: 'toxic-menu.m4a' });
        }
    } };
