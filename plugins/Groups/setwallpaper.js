import sharp from 'sharp';
import { setGroupWallpaper } from '../../lib/setGroupWallpaper.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const formatStylishReply = (message) => {
    return `╭─❏ 「 SETWALLPAPER 」\n│ \n│ ${message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
};

async function fitWallpaper(buffer) {
    try {
        const W = 1080;
        const H = 1920;
        const meta = await sharp(buffer).metadata();
        if (!meta.width || !meta.height) return buffer;
        const ratio = meta.width / meta.height;
        if (Math.abs(ratio - W / H) < 0.05) return buffer;
        const background = await sharp(buffer).resize(W, H, { fit: 'cover' }).blur(30).toBuffer();
        const foreground = await sharp(buffer).resize(W, H, { fit: 'inside' }).toBuffer();
        const fgMeta = await sharp(foreground).metadata();
        return await sharp(background)
            .composite([{ input: foreground, top: Math.round((H - (fgMeta.height || H)) / 2), left: Math.round((W - (fgMeta.width || W)) / 2) }])
            .jpeg({ quality: 88 })
            .toBuffer();
    } catch {
        return buffer;
    }
}

export default {
    name: 'setwallpaper',
    aliases: ['setwall'],
    description: 'Set a group chat wallpaper from an image',
    run: async (context) => {
        const { client, m, IsGroup, prefix } = context;
        const quoted = context.quoted || m.quoted;
        const pfx = prefix || '.';

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            let imageBuffer = null;
            if (quoted && (quoted.mimetype?.startsWith('image/') || quoted.mtype === 'imageMessage' || quoted.msg?.mimetype?.startsWith('image/') || quoted.message?.imageMessage)) {
                imageBuffer = await quoted.download().catch(() => null);
            } else if (m.message?.imageMessage || m.mtype === 'imageMessage') {
                imageBuffer = await m.download().catch(() => null);
            }
            if (!imageBuffer) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, formatStylishReply(`Send an image with the caption ${pfx}setwallpaper, or reply to an image with ${pfx}setwallpaper`));
            }

            const body = (m.body || '').trim();
            let targetJid = null;
            const jidMatch = body.match(/\d+@g\.us/);
            const linkMatch = body.match(/https?:\/\/chat\.whatsapp\.com\/[^\s]+/i);
            if (jidMatch) {
                targetJid = jidMatch[0];
            } else if (linkMatch) {
                try {
                    const url = new URL(linkMatch[0]);
                    const code = url.pathname.replace(/^\/+/, '');
                    const info = await client.groupGetInviteInfo(code);
                    targetJid = info.id;
                } catch {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, formatStylishReply("That group link didn't work. Check it and try again."));
                }
            } else if (IsGroup || m.chat.endsWith('@g.us')) {
                targetJid = m.chat;
            }
            if (!targetJid) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, formatStylishReply(`You're not in a group. Add the group JID or invite link, like ${pfx}setwall 120363000000000000@g.us`));
            }

            let meta = null;
            try {
                meta = await client.groupMetadata(targetJid);
            } catch {
                meta = null;
            }
            if (!meta) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, formatStylishReply("I'm not in that group, so I can't set its wallpaper. Add me first."));
            }

            const fitted = await fitWallpaper(imageBuffer);
            await setGroupWallpaper(client, targetJid, fitted);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, formatStylishReply(`Wallpaper set for *${meta.subject || 'the group'}*`));
        } catch (error) {
            console.error('SetWallpaper error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, formatStylishReply('Failed to set the wallpaper. Try again.'));
        }
    }
};
