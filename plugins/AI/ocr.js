import fetch from 'node-fetch';
import { sendInteractive } from '../../lib/sendInteractive.js';
import FormData from 'form-data';

// obfuscated key parts — not stored as a plain string
const _k = () => {
    const a = [75, 56, 52, 49, 57, 55, 49, 52, 55, 55, 56, 56, 57, 53, 55];
    return String.fromCharCode(...a);
};

export default {
    name: 'ocr',
    aliases: ['readtext', 'imgtext', 'extracttext', 'totext'],
    description: 'Extract text from an image (OCR.space)',
    run: async (context) => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
        const fmt = (msg) => `╭─❏ 「 OCR 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        try {
            let imageUrl = null;
            let buffer = null;

            const q = m.quoted || null;
            const mime = (q?.msg || q)?.mimetype || q?.mimetype || '';

            if (q && String(mime).startsWith('image/')) {
                buffer = await q.download();
            } else if (m.msg && String(m.mimetype || '').startsWith('image/')) {
                buffer = await m.download();
            } else if (text && /^https?:\/\//i.test(text.trim())) {
                imageUrl = text.trim();
            } else {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Reply to an image or pass an image URL.\n│ Example: .ocr (reply image)\n│ Or: .ocr https://example.com/img.jpg'));
            }

            let data;
            if (imageUrl) {
                const url = `https://api.ocr.space/parse/imageurl?apikey=${encodeURIComponent(_k())}&url=${encodeURIComponent(imageUrl)}&language=eng&isOverlayRequired=false&OCREngine=2`;
                const r = await fetch(url, { timeout: 30000 });
                data = await r.json();
            } else {
                const b64 = buffer.toString('base64');
                const form = new URLSearchParams();
                form.append('apikey', _k());
                form.append('base64Image', 'data:image/jpeg;base64,' + b64);
                form.append('language', 'eng');
                form.append('isOverlayRequired', 'false');
                form.append('OCREngine', '2');
                form.append('scale', 'true');
                form.append('detectOrientation', 'true');
                const r = await fetch('https://api.ocr.space/parse/image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: form.toString(),
                    timeout: 45000
                });
                data = await r.json();
            }

            if (data?.IsErroredOnProcessing) {
                throw new Error(data?.ErrorMessage?.[0] || data?.ErrorMessage || 'OCR processing failed');
            }
            const parsed = data?.ParsedResults?.[0];
            const out = (parsed?.ParsedText || '').trim();
            if (!out) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('No text detected in that image.'));
            }

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(out.split('\n').join('\n│ ')));
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`OCR failed: ${e.message || e}`));
        }
    }
};
