import { prepareWAMessageMedia } from '@whiskeysockets/baileys';
import sharp from 'sharp';
import { DateTime } from 'luxon';
import { getCommandCategories } from '../../lib/menuCommands.js';

const HOSTING_URL = 'https://hosting.nyxtechs.net';

const toFancyFont = (text) => {
    const fonts = {
        'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝙿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈',
        'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
        'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢',
        'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
    };
    return text.toLowerCase().split('').map(char => fonts[char] || char).join('');
};

export default {
    name: 'menu2',
    aliases: ['menufull'],
    description: 'Show all commands grouped by category (link preview style)',
    run: async (context) => {
        const { client, m, pict, botname, prefix, mode } = context;

        await client.sendMessage(m.chat, { react: { text: '🤖', key: m.key } });

        const { categories, total } = await getCommandCategories();

        const hour = DateTime.now().setZone('Africa/Nairobi').hour;
        const greeting = hour >= 5 && hour < 12 ? 'Good Morning' : hour >= 12 && hour < 18 ? 'Good Afternoon' : hour >= 18 && hour < 22 ? 'Good Evening' : 'Good Night';
        const time = DateTime.now().setZone('Africa/Nairobi').toLocaleString(DateTime.TIME_SIMPLE);

        let menuText = `${HOSTING_URL}\n\n` +
            `╭─❏ 「 Fᴜʟʟ Mᴇɴᴜ」\n` +
            `│ ${greeting}, @${m.sender.split('@')[0].split(':')[0]}\n` +
            `│ \n` +
            `│ Bot: ${botname}\n` +
            `│ Total Commands: ${total}\n` +
            `│ Time: ${time}\n` +
            `│ Prefix: ${prefix || 'None'}\n` +
            `│ Mode: ${mode}\n` +
            `│ Library: Baileys\n` +
            `╰───────────────\n\n`;

        categories.forEach(cat => {
            menuText += `╭─❏ 「 ${cat.name}」\n`;
            menuText += cat.commands.map(cmd => `│ *${toFancyFont(cmd)}*`).join('\n');
            menuText += `\n╰───────────────\n\n`;
        });

        menuText += `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            if (!pict?.length) throw new Error('no menu image');
            const resized = await sharp(pict)
                .resize(736, 1308, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 90 })
                .toBuffer();

            const media = await prepareWAMessageMedia(
                { image: resized },
                { upload: client.waUploadToServer }
            );

            const payload = {
                extendedTextMessage: {
                    endCardTiles: [],
                    text: menuText.trim(),
                    matchedText: HOSTING_URL,
                    description: `Powered by ${botname || 'Toxic-MD'}`,
                    title: botname || 'Menu',
                    previewType: 0,
                    jpegThumbnail: media.imageMessage.jpegThumbnail,
                    thumbnailDirectPath: media.imageMessage.directPath,
                    thumbnailSha256: media.imageMessage.fileSha256,
                    thumbnailEncSha256: media.imageMessage.fileEncSha256,
                    mediaKey: media.imageMessage.mediaKey,
                    mediaKeyTimestamp: media.imageMessage.mediaKeyTimestamp,
                    thumbnailHeight: 1308,
                    thumbnailWidth: 736,
                    inviteLinkGroupTypeV2: 0,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        groupMentions: [],
                        statusAttributions: [],
                        forwardingScore: 1,
                        isForwarded: true
                    }
                }
            };

            await client.relayMessage(m.chat, payload, {});
        } catch {
            await client.sendMessage(m.chat, {
                text: menuText.trim(),
                mentions: [m.sender]
            });
        }
    }
};
