import axios from 'axios';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';

import { herokuAppName as HEROKU_APP_NAME, getHerokuApiKey } from '../../config/settings.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
const HEROKU_API_KEY = getHerokuApiKey();

export default async (context) => {
    const { client, m } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const formatStylishReply = (message) => {
        return (
            `╭───(    TOXIC-MD    )───\n` +
            `├ ${message}\n` +
            `╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧\n` +
            `xD`
        );
    };

    await ownerMiddleware(context, async () => {
        await client.sendMessage(m.chat, { react: { text: '🚀', key: m.reactKey } });

        try {
            if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                return await client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(
                            "⚠️ Seriously? You forgot to set *HEROKU_API_KEY* or *HEROKU_APP_NAME*.\n" +
                            "Fix your setup before crying for updates. 🙄"
                        ),
                    },
                    { quoted: fq }
                );
            }

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        "🔄 Fine… triggering update.\n" +
                        "Don’t complain if the bot restarts in your face. 😒"
                    ),
                },
                { quoted: fq }
            );

            await axios.post(
                `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
                {
                    source_blob: {
                        url: "https://github.com/xhclintohn/Toxic-v2/tarball/main",
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${HEROKU_API_KEY}`,
                        Accept: "application/vnd.heroku+json; version=3",
                        "Content-Type": "application/json",
                    },
                }
            );

            return await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        "🚀 Update triggered.\n" +
                        "Sit tight while Toxic-MD resurrects with fresh upgrades. 🔥"
                    ),
                },
                { quoted: fq }
            );

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;

            let msg;

            if (errorMessage.includes("API key")) {
                msg =
                    "❌ Your Heroku API key is trash.\n" +
                    "Fix *HEROKU_API_KEY* before crying here.";
            } else if (errorMessage.includes("not found")) {
                msg =
                    "❌ Heroku app not found.\n" +
                    "Are you sure *HEROKU_APP_NAME* is correct, genius?";
            } else {
                msg = `❌ Update failed:\n${errorMessage}\nTry again without panicking.`;
            }

            await client.sendMessage(
                m.chat,
                { text: formatStylishReply(msg) },
                { quoted: fq }
            );
        }
    });
};