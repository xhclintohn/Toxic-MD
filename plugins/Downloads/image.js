import { sendInteractive } from '../../lib/sendInteractive.js';
import { searchImages } from '../../lib/googleImages.js';

export default {
    name: 'image',
    aliases: ['img', 'pic', 'searchimage'],
    description: 'Search and send images',
    run: async (context) => {
        const { client, m, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const query = m.body.replace(new RegExp(`^${prefix}(image|img|pic|searchimage)\\s*`, 'i'), '').trim();
        if (!query) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 IMAGE 」\n│ Give me something to search!\n│ Example: ${prefix}img cats\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        try {
            const items = await searchImages(query, 5);

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                try {
                    await client.sendMessage(m.chat, {
                        image: { url: item.image },
                        caption: `╭─❏ 「 IMAGE ${i + 1}/${items.length}」\n│ ${(item.title || query).slice(0, 80)}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                    });
                    if (i < items.length - 1) await new Promise(r => setTimeout(r, 1200));
                } catch (imgErr) {
                    console.warn(`Image ${i + 1} skipped: ${imgErr.message}`);
                }
            }
        } catch (error) {
            console.error('Image search error:', error.message);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await sendInteractive(client, m, `╭─❏ 「 IMAGE 」\n│ Image search failed. Try again later.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
