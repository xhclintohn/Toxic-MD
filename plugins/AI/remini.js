import { uploadToUrl } from '../../lib/toUrl.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { enhanceImage } from '../../lib/toxicApi.js';

export default async (context) => {
    const { client, m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const quoted = m.quoted ? m.quoted : m;
    const mime = quoted.mimetype || m.mimetype || '';

    if (!/image/.test(mime)) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 Mɪssɪɴɢ Iᴍᴀɢᴇ」\n│ Give me an image first\n│ Reply to an image with .remini\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    try {
        const media = await quoted.download();
        const imgUrl = await uploadToUrl(media);
        const enhancedUrl = await enhanceImage(imgUrl);

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await client.sendMessage(m.chat, {
            image: { url: enhancedUrl },
            caption: `╭─❏ 「 Eɴʜᴀɴᴄᴇᴅ Iᴍᴀɢᴇ」\n│ Your image is now HD.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        });
    } catch (e) {
        console.error('remini error:', e);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        await sendInteractive(client, m, `╭─❏ 「 Fᴀɪʟᴇᴅ」\n│ Enhancement failed. Try again.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};
