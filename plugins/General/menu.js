import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ButtonV2 } from '@whiskeysockets/baileys';
import { getGreeting } from '../../lib/language.js';
import { getCommandCategories } from '../../lib/menuCommands.js';

const getTimeGreeting = () => {
    try { return getGreeting(); } catch {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 21) return 'Good evening';
        return 'Good night';
    }
};

const HOSTING_URL = 'https://hosting.nyxtechs.net';

const locationQuoted = (pushName) => ({
    key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
    message: {
        locationMessage: {
            name: `Hi ${pushName || 'User'}`,
            jpegThumbnail: ''
        }
    }
});

const activeCatMenus = new Map();

const unwrapContent = (rawMsg) => {
    let content = rawMsg?.message;
    while (content) {
        if (content.deviceSentMessage?.message) { content = content.deviceSentMessage.message; continue; }
        if (content.ephemeralMessage?.message) { content = content.ephemeralMessage.message; continue; }
        if (content.viewOnceMessage?.message) { content = content.viewOnceMessage.message; continue; }
        if (content.viewOnceMessageV2?.message) { content = content.viewOnceMessageV2.message; continue; }
        if (content.viewOnceMessageV2Extension?.message) { content = content.viewOnceMessageV2Extension.message; continue; }
        break;
    }
    return content;
};

const resolveChatIds = async (client, chat) => {
    const ids = new Set([chat]);
    try {
        const lm = client.signalRepository?.lidMapping;
        if (lm?.getPNForLID && chat.endsWith('@lid')) {
            const pn = await lm.getPNForLID(chat);
            if (pn) ids.add(pn);
        }
        if (lm?.getLIDForPN && chat.endsWith('@s.whatsapp.net')) {
            const lid = await lm.getLIDForPN(chat);
            if (lid) ids.add(lid);
        }
    } catch {}
    return ids;
};

const registerCategoryHandler = async (client, m, pict, categories) => {
    const key = m.chat + '|' + m.sender;
    if (activeCatMenus.has(key)) {
        client.ev.off('messages.upsert', activeCatMenus.get(key).handler);
        activeCatMenus.delete(key);
    }
    const chatIds = await resolveChatIds(client, m.chat);
    const handler = async (update) => {
        try {
            const msg = update.messages?.[0];
            if (!msg?.message || !chatIds.has(msg.key.remoteJid)) return;
            const content = unwrapContent(msg);
            const resp = content?.interactiveResponseMessage?.nativeFlowResponseMessage;
            if (!resp) return;
            let params = {};
            try { params = JSON.parse(resp.paramsJson || '{}'); } catch { return; }
            const selectedId = params.id || params.selectedId;
            if (!selectedId?.startsWith('menu_cat_')) return;
            const catName = selectedId.replace('menu_cat_', '');
            const cat = categories.find(c => c.name === catName);
            if (!cat) return;
            const text = `╭─❏ 「 ${cat.name}」\n` + cat.commands.map(c => `│ *${c}*`).join('\n') + `\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            await client.sendMessage(m.chat, { image: pict, caption: text, mentions: [m.sender] }, { quoted: msg });
        } catch (e) {
        }
    };
    client.ev.on('messages.upsert', handler);
    activeCatMenus.set(key, { handler });
    setTimeout(() => {
        if (activeCatMenus.has(key)) {
            client.ev.off('messages.upsert', activeCatMenus.get(key).handler);
            activeCatMenus.delete(key);
        }
    }, 600000);
};

export default {
    name: 'menu',
    aliases: ['commands', 'list', 'cmds', 'm', 'cmd', 'commandlist', 'allcmds'],
    description: 'Displays the Toxic-MD command menu',
    run: async (context) => {
        const { client, m, mode, pict, botname, prefix, totalCommands } = context;

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
                    { title: '𝐑𝐞𝐩𝐨𝐫𝐭', description: 'Report a bug to dev', id: `${prefix}bug` },
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
                `│ ${prefix}bug — Report a bug to dev\n` +
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

        let sentFancy = false;
        try {
            if (!pict?.length) throw new Error('no menu image');
            const resized = await sharp(pict)
                .resize(800, 436, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 90 })
                .toBuffer();
            const media = await prepareWAMessageMedia(
                { image: resized },
                { upload: client.waUploadToServer }
            );
            const { categories } = await getCommandCategories();
            const catSections = categories.map(cat => ({
                rows: [
                    {
                        title: cat.name,
                        description: `There are ${cat.commands.length} commands`,
                        id: `menu_cat_${cat.name}`
                    }
                ]
            }));
            const quoted = locationQuoted(m.pushName);
            const caption =
                `╭─❏ 「 Mᴇɴᴜ」\n` +
                `│ \n` +
                `│ ${greeting}, @${m.sender.split('@')[0].split(':')[0]}\n` +
                `│ \n` +
                `│ Bot: TOXIC-MD\n` +
                `│ Prefix: ${prefix}\n` +
                `│ Mode: ${mode}\n` +
                `│ Total Commands: ${totalCommands}\n` +
                `│ \n` +
                `│ Select a category below.\n` +
                `╰───────────────`;
            const payload = {
                interactiveMessage: {
                    header: {
                        title: botname || 'Menu',
                        subtitle: '',
                        hasMediaAttachment: true,
                        productMessage: {
                            product: {
                                productImage: media.imageMessage,
                                title: botname || 'Menu',
                                description: 'Click to open hosting site',
                                currencyCode: '',
                                retailerId: '',
                                url: HOSTING_URL,
                                productImageCount: 1
                            },
                            businessOwnerJid: '0@s.whatsapp.net'
                        }
                    },
                    body: { text: caption },
                    footer: {
                        text: `You can as well use:
> ${prefix}menu2 (Full Text List)
> ${prefix}menu3 (Interactive Reply Menu)
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: '{"has_multiple_buttons":true}'
                            },
                            {
                                name: 'call_permission_request',
                                buttonParamsJson: '{"has_multiple_buttons":true}'
                            },
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'Hosting Site',
                                    url: HOSTING_URL,
                                    merchant_url: HOSTING_URL,
                                    has_multiple_buttons: true
                                })
                            },
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Browse Categories',
                                    sections: catSections,
                                    has_multiple_buttons: true
                                })
                            }
                        ],
                        messageParamsJson: JSON.stringify({
                            limited_time_offer: {
                                text: 'Advert: Nyx Hosting — host your WhatsApp bot at affordable price',
                                url: HOSTING_URL,
                                copy_code: 'hosting.nyxtechs.net',
                                expiration_time: Date.now() + (24 * 60 * 60 * 1000)
                            },
                            bottom_sheet: {
                                in_thread_buttons_limit: 2,
                                divider_indices: [1, 2, 3, 4, 5, 999],
                                list_title: 'Select Menu',
                                button_title: 'Tap Here!'
                            },
                            tap_target_configuration: {
                                title: botname || 'Menu',
                                description: 'WhatsApp Bot',
                                canonical_url: HOSTING_URL,
                                domain: HOSTING_URL,
                                button_index: 0
                            }
                        })
                    },
                    contextInfo: {
                        mentionedJid: [m.sender],
                        groupMentions: [],
                        statusAttributions: [],
                        forwardingScore: 1,
                        isForwarded: true,
                        quotedMessage: quoted.message,
                        participant: quoted.key.participant,
                        stanzaId: 'status@broadcast'
                    }
                }
            };
            await client.relayMessage(m.chat, payload, {
                messageId: randomUUID()
            });
            await registerCategoryHandler(client, m, pict, categories);
            sentFancy = true;
        } catch (e) {
            sentFancy = false;
        }

        if (!sentFancy) {
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
