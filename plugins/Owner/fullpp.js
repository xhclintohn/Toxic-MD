import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
    name: 'fullpp',
    aliases: ['pp', 'setpp', 'setprofile'],
    description: "Update the bot's profile picture from a replied image",
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            try {
                let imageBuffer = null;

                const quoted = m.quoted;
                if (quoted && (quoted.mtype === 'imageMessage' || quoted.msg?.mimetype?.startsWith('image/'))) {
                    try {
                        const imgMsg = quoted.msg || quoted;
                        const stream = await downloadContentFromMessage(imgMsg, 'image');
                        const chunks = [];
                        for await (const chunk of stream) chunks.push(chunk);
                        imageBuffer = Buffer.concat(chunks);
                    } catch {
                        try { imageBuffer = await client.downloadMediaMessage(quoted.msg || quoted); } catch {}
                    }
                } else if (m.message?.imageMessage) {
                    try {
                        const stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
                        const chunks = [];
                        for await (const chunk of stream) chunks.push(chunk);
                        imageBuffer = Buffer.concat(chunks);
                    } catch {
                        try { imageBuffer = await client.downloadMediaMessage(m.message.imageMessage); } catch {}
                    }
                }

                if (!imageBuffer || imageBuffer.length === 0) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("FULLPP", "Reply to an image or send an image with the command."));
                }

                await client.updateProfilePicture(client.user.id, imageBuffer);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await sendInteractive(client, m, fmt("FULLPP", "Bot profile picture updated with full quality."));
            } catch (error) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                await sendInteractive(client, m, fmt("FULLPP", `Failed to update profile picture.\n│ Error: ${error.message}`));
            }
        });
    }
};
