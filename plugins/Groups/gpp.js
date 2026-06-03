import { getSettings } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

const formatStylishReply = (message) => {
    return `╭───(    TOXIC-MD    )───\n├ \n├ ${message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, quoted, isBotAdmin, IsGroup } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        
        if (!IsGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(formatStylishReply("Group only command idiot"));
        }
        
        if (!isBotAdmin) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(formatStylishReply("I need to be *admin* to change group picture. Please make me admin first."));
        }
        
        const isAdmin = m.isAdmin;
        if (!isAdmin) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(formatStylishReply("You're not admin!"));
        }
        
        let imageBuffer;
        
        if (quoted && quoted.mimetype && quoted.mimetype.startsWith('image/')) {
            try {
                imageBuffer = await quoted.download();
            } catch {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply(formatStylishReply("Can't download image"));
            }
        }
        else if (m.message?.imageMessage) {
            try {
                imageBuffer = await m.download();
            } catch {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply(formatStylishReply("Can't download image"));
            }
        }
        else {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(formatStylishReply("Send or reply with image"));
        }
        
        if (!imageBuffer) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(formatStylishReply("Invalid image"));
        }
        
        try {
            await client.updateProfilePicture(m.chat, imageBuffer);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return m.reply(formatStylishReply("Group picture updated"));
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return m.reply(formatStylishReply("Failed to update picture"));
        }
    });
};
