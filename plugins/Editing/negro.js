import sharp from 'sharp';
import { sendInteractive } from '../../lib/sendInteractive.js';

async function blackFilter(buffer) {
    const image = sharp(buffer);
    const meta = await image.metadata();
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const out = Buffer.from(data);
    for (let i = 0; i < out.length; i += 4) {
        const r = out[i], g = out[i + 1], b = out[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const isSkin = r > 95 && g > 40 && b > 20 && r > g && r > b && (r - g) > 15 && (max - min) > 15;
        if (isSkin) {
            out[i] = Math.round(r * 0.42);
            out[i + 1] = Math.round(g * 0.4);
            out[i + 2] = Math.round(b * 0.38);
        }
    }
    return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

export default async (context) => {
    const { client, mime, m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (m.quoted && /image/.test(mime)) {
        try {
            const buffer = await m.quoted.download();
            const resultBuffer = await blackFilter(buffer);

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            await client.sendMessage(m.chat, {
                image: resultBuffer,
                caption: `╭─❏ 「 NEGRO FILTER」
│ Done! Your image now has the\n│ *black* filter applied.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            });
        } catch (error) {
            console.error('Error while processing image:', error.message);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, `╭─❏ 「 ERROR」
│ Image processing failed. Try again.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    } else {
        await sendInteractive(client, m, `╭─❏ 「 NEGRO」
│ Quote an image and type *negro*\n│ to apply the black filter, genius.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
};
