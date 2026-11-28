import { getCommandCategories } from '../../lib/menuCommands.js';
import { getGreeting } from '../../lib/language.js';

const activeMenus = new Map();

const locationQuoted = (pushName) => ({
    key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
    message: {
        locationMessage: {
            name: `Hi ${pushName || 'User'}`,
            jpegThumbnail: ''
        }
    }
});

const getCategoryText = (category) => {
    const cmds = category.commands || [];
    return (
        `╭─❏ 「 ${category.name}」\n` +
        cmds.map(cmd => `│ *${cmd}*`).join('\n') +
        `\n╰───────────────\n` +
        `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
    );
};

export default {
    name: 'menu3',
    description: 'Interactive category-based menu (reply with number)',
    run: async (context) => {
        const { client, m, pict, botname, prefix, mode } = context;
        const userId = m.sender;

        await client.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

        if (activeMenus.has(userId)) {
            const { handler } = activeMenus.get(userId);
            client.ev.off('messages.upsert', handler);
            activeMenus.delete(userId);
        }

        const { categories, total } = await getCommandCategories();

        let greeting = 'Hello';
        try { greeting = getGreeting(); } catch {}

        const menuText =
            `╭─❏ 「 Mᴇɴᴜ」\n` +
            `│ \n` +
            `│ ${greeting}, @${m.sender.split('@')[0].split(':')[0]}\n` +
            `│ \n` +
            `│ Bot: TOXIC-MD\n` +
            `│ Prefix: ${prefix}\n` +
            `│ Mode: ${mode}\n` +
            `│ Total Commands: ${total}\n` +
            `│ \n` +
            `│ Reply with a number:\n` +
            categories.map((cat, i) => `│ ${i + 1}. ${cat.name}`).join('\n') + '\n' +
            `╰───────────────\n` +
            `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        const quoted = locationQuoted(m.pushName);

        const sentMessage = await client.sendMessage(m.chat, {
            image: pict,
            caption: menuText,
            mentions: [m.sender],
            contextInfo: {
                quotedMessage: quoted.message,
                participant: quoted.key.participant,
                stanzaId: 'status@broadcast'
            }
        });

        const unwrap = (rawMsg) => {
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

        const chatIds = new Set([m.chat]);
        try {
            const lm = client.signalRepository?.lidMapping;
            if (lm?.getPNForLID && m.chat.endsWith('@lid')) {
                const pn = await lm.getPNForLID(m.chat);
                if (pn) chatIds.add(pn);
            }
            if (lm?.getLIDForPN && m.chat.endsWith('@s.whatsapp.net')) {
                const lid = await lm.getLIDForPN(m.chat);
                if (lid) chatIds.add(lid);
            }
        } catch {}

        const replyHandler = async (update) => {
            try {
                const message = update.messages?.[0];
                if (!message?.message || !chatIds.has(message.key.remoteJid)) return;

                const content = unwrap(message);
                const text = content?.extendedTextMessage?.text || content?.conversation || '';
                const stanzaId = content?.extendedTextMessage?.contextInfo?.stanzaId;

                const isReplyToMenu = stanzaId === sentMessage.key.id;
                const isReplyToCategory = activeMenus.get(userId)?.lastCategoryMessage === message.key.id;
                const userInput = text.trim();
                const isPlainNumber = !stanzaId && /^\d+$/.test(userInput);
                if (!isReplyToMenu && !isReplyToCategory && !isPlainNumber) return;

                const selectedNumber = parseInt(userInput);

                if (userInput === '0') {
                    const quotedMsg = locationQuoted(m.pushName);
                    await client.sendMessage(m.chat, {
                        image: pict,
                        caption: menuText,
                        mentions: [m.sender],
                        contextInfo: {
                            quotedMessage: quotedMsg.message,
                            participant: quotedMsg.key.participant,
                            stanzaId: 'status@broadcast'
                        }
                    });
                    activeMenus.set(userId, {
                        sentMessage,
                        handler: replyHandler,
                        lastCategoryMessage: null
                    });
                    return;
                }

                if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > categories.length) {
                    return;
                }

                const category = categories[selectedNumber - 1];
                const commandsText = getCategoryText(category);
                if (!commandsText) return;

                const quotedMsg = locationQuoted(m.pushName);
                const categoryMessage = await client.sendMessage(m.chat, {
                    image: pict,
                    caption: commandsText,
                    mentions: [m.sender],
                    contextInfo: {
                        quotedMessage: quotedMsg.message,
                        participant: quotedMsg.key.participant,
                        stanzaId: 'status@broadcast'
                    }
                });

                activeMenus.set(userId, {
                    sentMessage,
                    handler: replyHandler,
                    lastCategoryMessage: categoryMessage.key.id
                });
            } catch (e) {
            }
        };

        client.ev.on('messages.upsert', replyHandler);
        activeMenus.set(userId, {
            sentMessage,
            handler: replyHandler,
            lastCategoryMessage: null
        });

        setTimeout(() => {
            if (activeMenus.has(userId)) {
                client.ev.off('messages.upsert', activeMenus.get(userId).handler);
                activeMenus.delete(userId);
            }
        }, 600000);
    }
};
