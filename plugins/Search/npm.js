import fetch from 'node-fetch';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'npm',
    aliases: ['npmsearch', 'npmjs'],
    description: 'Search for NPM packages',
    run: async (context) => {
        const { client, m, text } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const query = (text || '').trim();
            if (!query) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return m.reply("╭───(    TOXIC-MD    )───\n├ Give me a package name, you useless human.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
            }

            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=5`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const data = await response.json();

            const objects = data?.objects || [];
            if (objects.length === 0) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return m.reply(`╭───(    TOXIC-MD    )───\n├ No packages found for "${query}".\n├ Your search skills are as bad as your life choices.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            let resultText = "╭───(    TOXIC-MD    )───\n├───≫ NPM SEARCH ≪───\n├ \n";

            objects.forEach((obj, index) => {
                const pkg = obj.package;
                resultText += `├ ${index + 1}. ${pkg.name} v${pkg.version}\n`;
                if (pkg.description) resultText += `├   ${pkg.description.slice(0, 60)}\n`;
                resultText += `├   npmjs.com/package/${pkg.name}\n├ \n`;
            });

            if (data.total > 5) {
                resultText += `├ ...and ${data.total - 5} more results\n`;
            }

            resultText += "╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧";

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await m.reply(resultText);

        } catch (error) {
            console.error('NPM search error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ NPM ERROR ≪───\n├ \n├ NPM search failed. ${error.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
