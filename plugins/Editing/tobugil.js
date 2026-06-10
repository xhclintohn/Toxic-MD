import axios from 'axios';

    import FormData from 'form-data';
import { sendInteractive } from '../../lib/sendInteractive.js';
async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'image.png' });

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 30000
    });

    if (!response.data || !response.data.includes('catbox')) {
        throw new Error('UPLOAD FAILED');
    }

    return response.data;
}

export default {
    name: 'tobugil',
    aliases: ['bugil', 'nudeedit', 'nude'],
    description: 'Apply tobugil filter to images',
    run: async (context) => {
        const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        if (!m.quoted) {
            return sendInteractive(client, m, `╭─❏ 「 TOBUGIL」
│ Quote an image, you blind moron.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || "";

        if (!mime.startsWith("image/")) {
            return sendInteractive(client, m, `╭─❏ 「 TOBUGIL」
│ That's not an image, you\n│ illiterate fool.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const mediaBuffer = await q.download();
            const uploadedURL = await uploadToCatbox(mediaBuffer);
            
            const encodedImageUrl = encodeURIComponent(uploadedURL);
            const apiUrl = `https://api.baguss.xyz/api/edits/tobugil?image=${encodedImageUrl}`;

            const response = await axios.get(apiUrl, {
                timeout: 120000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });

            if (!response.data?.success || !response.data?.url) {
                throw new Error('API returned invalid response');
            }

            const resultUrl = response.data.url;

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            await client.sendMessage(
                m.chat,
                {
                    image: { url: resultUrl },
                    caption: `╭─❏ 「 TOBUGIL」
│ Wkwk.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                }
            );

        } catch (error) {
            console.error('Tobugil error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

            let errorMessage = "Failed to process image, API probably hates your ugly picture. ";
            
            if (error.message.includes('UPLOAD FAILED')) {
                errorMessage += "Catbox upload failed.";
            } else if (error.message.includes('timeout')) {
                errorMessage += "Processing took too long, your image is trash.";
            } else if (error.message.includes('Invalid response')) {
                errorMessage += "API returned garbage.";
            } else if (error.message.includes('Network Error')) {
                errorMessage += "Network issue, check your connection.";
            } else {
                errorMessage += "Try again later.";
            }

            await sendInteractive(client, m, `╭─❏ 「 FAILED」
│ ${errorMessage}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    } };