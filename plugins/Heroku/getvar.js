import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import axios from 'axios';
import { herokuAppName, getHerokuApiKey } from '../../config/settings.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

const SENSITIVE = ['heroku_api_key', 'api_key', 'database_url', 'session', 'secret', 'password', 'token', 'private_key', 'auth', 'key'];

function isSensitive(key) {
    return SENSITIVE.some(s => key.toLowerCase().includes(s));
}

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const herokuApiKey = getHerokuApiKey();

        if (!herokuAppName || !herokuApiKey) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply("╭───(    TOXIC-MD    )───\n├ HEROKU_APP_NAME or HEROKU_API_KEY not set.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
        }

        if (!text) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply(`╭───(    TOXIC-MD    )───\n├ Usage: ${prefix}getvar VAR_NAME\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const varName = text.trim().split(" ")[0];

        if (isSensitive(varName)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply("╭───(    TOXIC-MD    )───\n├ That variable is protected and cannot be retrieved. 🔒\n├ For your own security.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
        }

        if (m.isGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await m.reply("╭───(    TOXIC-MD    )───\n├ Use this command in your DM only, not in groups. 🔒\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
        }

        try {
            const response = await axios.get(`https://api.heroku.com/apps/${herokuAppName}/config-vars`, {
                headers: { Authorization: `Bearer ${herokuApiKey}`, Accept: "application/vnd.heroku+json; version=3" }
            });
            const varValue = response.data[varName];
            if (varValue !== undefined) {
                await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ GETVAR ≪───\n├ \n├ ${varName} = ${varValue}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            } else {
                await m.reply(`╭───(    TOXIC-MD    )───\n├ Var "${varName}" doesn't exist.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
        } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await m.reply(`╭───(    TOXIC-MD    )───\n├ Failed to fetch var.\n├ ${error.response?.data || error.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    });
};
