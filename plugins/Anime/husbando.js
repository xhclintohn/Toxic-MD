import { getAnime } from '../../lib/toxicApi.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'husbando',
    aliases: ['animeguy', 'husbandopic'],
    description: 'Get a random husbando image',
    run: async (context) => {
        const { client, m } = context;
        const fq = getFakeQuoted(m);
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            const url = await getAnime('husbando');
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.sendMessage(m.chat, {
                image: { url },
                caption: '╭───(    TOXIC-MD    )───\n├───≫ Hᴜsʙᴀɴᴅᴏ ≪───\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞ᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧'
            }, { quoted: fq });
        } catch (error) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await m.reply('╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ Husbando fled!\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧');
        }
    }
};
