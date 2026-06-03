import axios from 'axios';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default async (context) => {
    const { client, mime, m, text, botname } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (m.quoted && /image/.test(mime)) {
        const buffer = await m.quoted.download();
        const base64Image = buffer.toString('base64');

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const response = await axios.post("https://negro.consulting/api/process-image", {
                filter: "hitam",
                imageData: "data:image/png;base64," + base64Image
            });

            const resultBuffer = Buffer.from(
                response.data.processedImageUrl.replace("data:image/png;base64,", ""),
                "base64"
            );

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            await client.sendMessage(m.chat, {
                image: resultBuffer,
                caption: `╭───(    TOXIC-MD    )───\n├───≫ NEGRO FILTER ≪───\n├ \n├ Done! Your image now has the\n├ *black* filter applied.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        } catch (error) {
            console.error('Error while processing image:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await m.reply('╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Image processing failed. Try again.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
        }
    } else {
        await m.reply('╭───(    TOXIC-MD    )───\n├───≫ NEGRO ≪───\n├ \n├ Quote an image and type *negro*\n├ to apply the black filter, genius.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
    }
};
