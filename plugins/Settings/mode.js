import { getSettings, updateSetting } from '../../database/config.js';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';

const MODES = {
    public:  { emoji: '🌐', label: 'PUBLIC',  desc: 'Everyone can use commands, anywhere.' },
    private: { emoji: '🔒', label: 'PRIVATE', desc: 'Only you (the owner) can use commands.' },
    group:   { emoji: '👥', label: 'GROUP',   desc: 'Commands work in groups only. DMs ignored.' },
    inbox:   { emoji: '📩', label: 'INBOX',   desc: 'Commands work in DMs only. Groups ignored.' } };

const CRANKY = {
    public:  "Fine. Everyone gets access. Don't complain when they break everything.",
    private: "Private mode. Nobody touches my commands but you. Finally some peace.",
    group:   "Group mode. DMs are off. If you want something, say it in a group like everyone else.",
    inbox:   "Inbox mode. Groups ignored. Slide into my DMs and we can talk." };

export default {
    name: 'mode',
    aliases: ['botmode', 'setmode', 'changemode', 'switchmode'],
    description: 'Control who can use the bot and where',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, args, prefix } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const fmt = (title, lines) => {
                const body = (Array.isArray(lines) ? lines : [lines]).map(l => `│ ${l}`).join('\n');
                return `╭─❏ 「 ${title}」
│
${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            };

            const sendModeButtons = async (currentMode) => {
                const sections = [{
                    title: 'Select Bot Mode',
                    highlight_label: '',
                    rows: [
                        { header: 'PUBLIC', title: `${currentMode === 'public' ? '> ' : ''}PUBLIC`, description: 'Everyone can use commands anywhere', id: `${prefix}mode public` },
                        { header: 'PRIVATE', title: `${currentMode === 'private' ? '> ' : ''}PRIVATE`, description: 'Only owner can use commands', id: `${prefix}mode private` },
                        { header: 'GROUP', title: `${currentMode === 'group' ? '> ' : ''}GROUP`, description: 'Groups only, DMs ignored', id: `${prefix}mode group` },
                        { header: 'INBOX', title: `${currentMode === 'inbox' ? '> ' : ''}INBOX`, description: 'DMs only, groups ignored', id: `${prefix}mode inbox` },
                    ]
                }];

                const bodyText = `Current: ${MODES[currentMode]?.emoji || '🌐'} ${(currentMode || 'public').toUpperCase()} — tap to switch`;
                const device = await getDeviceMode();

                if (device === 'ios') {
                    return await client.sendMessage(m.chat, {
                        text: fmt('BOT MODE', [
                            `Active: ${MODES[currentMode]?.emoji || '🌐'} ${(currentMode || 'public').toUpperCase()}`,
                            ``,
                            `PUBLIC  — Everyone can use commands everywhere`,
                            `PRIVATE — Only you can use commands`,
                            `GROUP   — Groups only, DMs ignored`,
                            `INBOX   — DMs only, groups ignored`,
                            ``,
                            `Use: *${prefix}mode public/private/group/inbox*`
                        ])
                    });
                }

                try {
                    const interactiveMsg = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
                        interactiveMessage: {
                            body: { text: bodyText },
                            footer: { text: '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' },
                            header: { hasMediaAttachment: false },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: 'single_select',
                                        buttonParamsJson: JSON.stringify({ title: 'Choose Mode', sections })
                                    }
                                ],
                                messageParamsJson: ''
                            }
                        }
                    }), { userJid: client.user.id });
                    await client.relayMessage(m.chat, interactiveMsg.message, { messageId: interactiveMsg.key.id });
                } catch {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    await client.sendMessage(m.chat, {
                        listMessage: {
                            title: 'BOT MODE',
                            description: `Current: ${(currentMode || 'public').toUpperCase()} — pick one to switch`,
                            buttonText: 'Choose Mode',
                            listType: 1,
                            sections: sections.map(s => ({ title: s.title, rows: s.rows.map(r => ({ title: r.title, description: r.description, rowId: r.id })) })),
                            footer: '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' } });
                }
            };

            try {
                const settings = await getSettings();
                const current = (settings.mode || 'public').toLowerCase();
                const input = (args[0] || '').toLowerCase();

                if (MODES[input]) {
                    if (current === input) {
                        await client.sendMessage(m.chat, {
                            text: fmt('BOT MODE', [
                                `${MODES[input].emoji} Already in ${MODES[input].label} mode.`,
                                `Nothing changed. Still the same.`,
                                `Pick a different one if you actually want to do something.`
                            ])
                        });
                        return sendModeButtons(current);
                    }
                    await updateSetting('mode', input);
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                    await client.sendMessage(m.chat, {
                        text: fmt('BOT MODE', [
                            `Switched to ${MODES[input].emoji} ${MODES[input].label}`,
                            ``,
                            CRANKY[input]
                        ])
                    });
                    return sendModeButtons(input);
                }

                const modeInfo = MODES[current] || MODES.public;
                await client.sendMessage(m.chat, {
                    text: fmt('BOT MODE', [
                        `Active: ${modeInfo.emoji} ${modeInfo.label}`,
                        ``,
                        `PUBLIC  — Everyone can use commands everywhere`,
                        `PRIVATE — Only you can use commands`,
                        `GROUP   — Groups only, DMs ignored`,
                        `INBOX   — DMs only, groups ignored`
                    ])
                });
                return sendModeButtons(current);

            } catch {
                client.sendMessage(m.chat, {
                    text: fmt('BOT MODE', 'Something broke. The database is sulking. Try again.')
                });
            }
        });
    }
};
