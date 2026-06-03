import QRCode from 'qrcode';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'qr',
    alias: ['qrcode', 'qrgen'],
    description: 'Generate a QR code from text or link',
    run: async (context) => {
        const { client, m, text, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        if (!text) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ QR CODE ≪───\n├ \n├ Usage: ${prefix}qr <text or link>\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            const dataUrl = await QRCode.toDataURL(text.slice(0, 2000), { scale: 8, errorCorrectionLevel: 'H' });
            const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
            const imgBuffer = Buffer.from(base64, 'base64');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                image: imgBuffer,
                caption: `╭───(    TOXIC-MD    )───\n├───≫ QR CODE ≪───\n├ Scan with any QR reader.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            m.reply('Failed to generate QR code.');
        }
    }
};
