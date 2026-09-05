import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { downloadContentFromMessage, downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp-legacy';

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
};

const grabImage = async (client, m) => {
    const quoted = m.quoted;
    const isQuotedImage = quoted && (quoted.mtype === 'imageMessage' || quoted.msg?.mimetype?.startsWith('image/'));

    if (isQuotedImage) {
        if (typeof quoted.download === 'function') {
            try {
                const buf = await quoted.download();
                if (buf?.length) return buf;
            } catch {}
        }
        const target = quoted.fakeObj || quoted.message || quoted;
        try {
            const buf = await downloadMediaMessage(target, 'buffer', {}, {
                reuploadRequest: client.updateMediaMessage
            });
            if (buf?.length) return buf;
        } catch {}
        try {
            const buf = await streamToBuffer(await downloadContentFromMessage(quoted.msg || quoted, 'image'));
            if (buf?.length) return buf;
        } catch {}
    }

    if (m.message?.imageMessage) {
        try {
            const buf = await downloadMediaMessage(m, 'buffer', {}, {
                reuploadRequest: client.updateMediaMessage
            });
            if (buf?.length) return buf;
        } catch {}
        try {
            const buf = await streamToBuffer(await downloadContentFromMessage(m.message.imageMessage, 'image'));
            if (buf?.length) return buf;
        } catch {}
    }

    return null;
};

const buildFullImage = async (buffer) => {
    const image = await Jimp.read(buffer);
    image.scaleToFit(720, 720);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
};

const applyPicture = async (client, imageBuffer) => {
    try {
        await client.query({
            tag: 'iq',
            attrs: {
                to: 's.whatsapp.net',
                type: 'set',
                xmlns: 'w:profile:picture'
            },
            content: [
                {
                    tag: 'picture',
                    attrs: { type: 'image' },
                    content: imageBuffer
                }
            ]
        });
        return true;
    } catch {
        await client.updateProfilePicture(client.user.id, imageBuffer);
        return true;
    }
};

export default {
    name: 'fullpp',
    aliases: ['pp', 'setpp', 'setprofile', 'setbotpp', 'profilepic', 'botpfp'],
    description: "Update the bot's profile picture without cropping",
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m } = context;
            client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

            try {
                const raw = await grabImage(client, m);
                if (!raw?.length) {
                    client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt('FULLPP', 'Reply to an image or send one with the command.'));
                }

                const imageBuffer = await buildFullImage(raw);
                await applyPicture(client, imageBuffer);

                client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                await sendInteractive(client, m, fmt('FULLPP', 'Profile picture updated — full image, no cropping.'));
            } catch (error) {
                client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                await sendInteractive(client, m, fmt('FULLPP', `Failed: ${error.message}`));
            }
        });
    }
};
