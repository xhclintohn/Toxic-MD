import { uploadToUrl } from '../../lib/toUrl.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
    const { client, m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const quoted = m.quoted ? m.quoted : m;
    const mime = quoted.mimetype || m.mimetype || '';

    if (!/image/.test(mime)) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 Mɪssɪɴɢ Iᴍᴀɢᴇ」
│ Give me an image you dumbass\n│ Reply to an image first\n╰───────────────\n> ©𝐏𝐨𝐰𝐞᠊ʀᴇᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭ᴏɴ`);
    }

    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    try {
        const media = await quoted.download();
        const imgUrl = await uploadToUrl(media);
        
        const formData = new FormData();
        const imageResponse = await fetch(imgUrl);
        const imageBlob = await imageResponse.blob();
        formData.append('image', imageBlob, 'image.png');
        formData.append('scale', '2');
        formData.append('apikey', 'tIdZJ');

        const resultResponse = await fetch('https://api.theresav.biz.id/tools/hd', {
            method: 'POST',
            body: formData
        });

        const resultBuffer = await resultResponse.buffer();

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await client.sendMessage(m.chat, {
            image: resultBuffer,
            caption: `╭─❏ 「 Eɴʜᴀɴᴄᴇᴅ Iᴍᴀɢᴇ」
│ Your shitty image is now HD.\n│ Still looks like garbage though.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞᠊ʀᴇᴅ 𝐁ʏ 𝐱𝐡_𝐜𝐥ɪɴᴛᴏɴ`
        });
    } catch {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        await sendInteractive(client, m, `╭─❏ 「 Fᴀɪʟᴇᴅ」
│ Enhancement failed. Try again.\n╰───────────────\n> ©𝐏ᴏᴡᴇ᠊ʀᴇᴅ 𝐁ʏ 𝐱ʜ_ᴄʟɪɴᴛᴏɴ`);
    }
};