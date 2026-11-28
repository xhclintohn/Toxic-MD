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

const themeBlocked = async (client, jid) => {
    if (!jid || !jid.endsWith('@g.us')) return false;
    try {
        const meta = await client.groupMetadata(jid);
        if (!meta?.restrict) return false;
        const botIds = [client.user?.id, client.user?.lid]
            .filter(Boolean)
            .map((x) => String(x).split('@')[0].split(':')[0]);
        const me = (meta.participants || []).find((p) =>
            botIds.includes(String(p.id || '').split('@')[0].split(':')[0]) ||
            botIds.includes(String(p.lid || '').split('@')[0].split(':')[0]));
        return !(me && (me.admin === 'admin' || me.admin === 'superadmin'));
    } catch {
        return false;
    }
};

export default {
    name: 'setwallpaper',
    aliases: ['setwall'],
    description: 'Set a chat wallpaper from an image',
    run: async (context) => {
        const { client, m, prefix } = context;
        const quoted = context.quoted || m.quoted;
        const pfx = prefix || '.';

        const fail = async (text) => {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, formatStylishReply(text));
        };

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            let imageBuffer = null;
            if (quoted && (quoted.mimetype?.startsWith('image/') || quoted.mtype === 'imageMessage' || quoted.msg?.mimetype?.startsWith('image/') || quoted.message?.imageMessage)) {
                imageBuffer = await quoted.download().catch(() => null);
            } else if (m.message?.imageMessage || m.mtype === 'imageMessage') {
                imageBuffer = await m.download().catch(() => null);
            }
            if (!imageBuffer) {
                return fail(`Send an image with the caption ${pfx}setwallpaper, or reply to an image with ${pfx}setwallpaper`);
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
                    return fail("That group link didn't work. Check it and try again.");
                }
            } else {
                targetJid = m.chat;
            }

            let subject = null;
            if (targetJid.endsWith('@g.us')) {
                let meta = null;
                try {
                    meta = await client.groupMetadata(targetJid);
                } catch {
                    meta = null;
                }
                if (!meta) {
                    return fail("I'm not in that group, so I can't set its wallpaper. Add me first.");
                }
                subject = meta.subject;
                if (await themeBlocked(client, targetJid)) {
                    return fail('WhatsApp will drop this wallpaper in this group — only admins can edit group info here, and the bot is not an admin. Make the bot an admin, or set "Edit group info" to all participants, then run the command again.');
                }
            }

            const fitted = await fitWallpaper(imageBuffer);
            if (typeof client.setChatWallpaper === 'function') {
                await client.setChatWallpaper(targetJid, fitted);
            } else {
                await setGroupWallpaper(client, targetJid, fitted);
            }
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, formatStylishReply(`Wallpaper set${subject ? ` for *${subject}*` : ' for this chat'}`));
        } catch (error) {
            console.error('SetWallpaper error:', error);
            return fail('Failed to set the wallpaper. Try again.');
        }
    }
};
