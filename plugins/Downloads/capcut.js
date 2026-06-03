import axios from 'axios';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'capcut',
    alias: ['cc', 'capcutdl'],
    description: 'Download CapCut videos',
    run: async (context) => {
        const { client, m, text, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        if (!text) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ CAPCUT DL ≪───\n├ \n├ Usage: ${prefix}capcut <url>\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
        if (!text.match(/capcut\.com/i)) return m.reply('That doesn\'t look like a CapCut link.');
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            const { data } = await axios.get(`https://api.siputzx.my.id/api/d/capcut?url=${encodeURIComponent(text)}`, { timeout: 15000 });
            if (!data?.data?.play) throw new Error('no data');
            const result = data.data;
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                video: { url: result.play },
                caption: `╭───(    TOXIC-MD    )───\n├───≫ CAPCUT VIDEO ≪───\n├ Title: ${result.title || 'Unknown'}\n├ Author: ${result.author || 'Unknown'}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            m.reply('╭───(    TOXIC-MD    )───\n├ Failed to download. Check the link and try again.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
        }
    }
};
