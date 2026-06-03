import axios from 'axios';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

import { herokuAppName as HEROKU_APP_NAME, getHerokuApiKey } from '../../config/settings.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
const HEROKU_API_KEY = getHerokuApiKey();

export default async (context) => {
    const { client, m, prefix } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const formatStylishReply = (message) => {
        return (
            `╭───(    TOXIC-MD    )───\n` +
            `├ ${message}\n` +
            `╰──────────────────☉
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧\n` +
            `Pσɯҽɾҽԃ Ⴆყ Tσxιƈ-ɱԃȥ 😈`
        );
    };

    await ownerMiddleware(context, async () => {
        await client.sendMessage(m.chat, { react: { text: '🔂', key: m.reactKey } });

        try {
            if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                return await client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(
                            " Seriously? You forgot to set *HEROKU_API_KEY* or *HEROKU_APP_NAME*.\n" +
                            "Fix your setup before crying for updates. 🙄"
                        ),
                    },
                    { quoted: fq }
                );
            }

            const githubRes = await axios.get(
                "https://api.github.com/repos/xhclintohn/Toxic-v2/commits/main"
            );

            const latestCommit = githubRes.data;
            const latestSha = latestCommit.sha;

            const herokuRes = await axios.get(
                `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
                {
                    headers: {
                        Authorization: `Bearer ${HEROKU_API_KEY}`,
                        Accept: "application/vnd.heroku+json; version=3",
                    },
                }
            );

            const lastBuild = herokuRes.data[0];
            const deployedSha = lastBuild?.source_blob?.url || "";
            const alreadyDeployed = deployedSha.includes(latestSha);

            if (alreadyDeployed) {
                                const _devMode = await getDeviceMode();
                if (_devMode === 'ios') {
                    await client.sendMessage(m.chat, { text: "Your bot is already on the latest version, genius." }, { quoted: fq });
                } else {
    const msg = generateWAMessageFromContent(
                        m.chat,
                        {
                            viewOnceMessage: {
                                message: {
                                    interactiveMessage: {
                                        body: {
                                            text: "Your bot is already on the latest version, genius."
                                        },
                                        footer: {
                                            text: "Pσɯҽɾҽԃ Ⴆყ Tσxιƈ-ɱԃȥ"
                                        },
                                        nativeFlowMessage: {
                                            buttons: [
                                                {
                                                    name: "single_select",
                                                    buttonParamsJson: JSON.stringify({
                                                        title: "Want something else?",
                                                        sections: [
                                                            {
                                                                rows: [
                                                                    { title: "Menu", description: "Get command list", id: `${prefix}menu` },
                                                                    { title: "Settings", description: "Bot settings", id: `${prefix}settings` },
                                                                ],
                                                            },
                                                        ],
                                                    }),
                                                },
                                            ],
                                        },
                                    }
                                }
                            }
                        },
                        { quoted: fq }
                    );

                    return await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
 await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                }
            }

                        const _devMode = await getDeviceMode();
            if (_devMode === 'ios') {
                await client.sendMessage(m.chat, { text: `🆕 Update Available, Dumbass\n\nNew version found. You're still using outdated garbage.\n\n📌 *Commit:* ${latestCommit.commit.message}\n👤 *Author:* ${latestCommit.commit.author.name}\n🕒 *Date:* ${new Date(latestCommit.commit.author.date).toLocaleString()}\n\nTo update your worthless bot, tap the button below. if you're unable to tap the buttons type ${prefix}triggerupdate Don't ask me how to tap, you monkey. 🐒😂` }, { quoted: fq });
            } else {
    const msg = generateWAMessageFromContent(
                    m.chat,
                    {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: {
                                    body: {
                                        text: `🆕 Update Available, Dumbass\n\nNew version found. You're still using outdated garbage.\n\n📌 *Commit:* ${latestCommit.commit.message}\n👤 *Author:* ${latestCommit.commit.author.name}\n🕒 *Date:* ${new Date(latestCommit.commit.author.date).toLocaleString()}\n\nTo update your worthless bot, tap the button below. if you're unable to tap the buttons type ${prefix}triggerupdate Don't ask me how to tap, you monkey. 🐒😂`
                                    },
                                    footer: {
                                        text: "Pσɯҽɾҽԃ Ⴆყ Tσxιƈ-ɱԃȥ"
                                    },
                                    nativeFlowMessage: {
                                        buttons: [
                                            {
                                                name: "single_select",
                                                buttonParamsJson: JSON.stringify({
                                                    title: "UPDATE OPTIONS",
                                                    sections: [
                                                        {
                                                            title: "What do you want?",
                                                            rows: [
                                                                { title: "🚀 Trigger Update", description: "Update now", id: `${prefix}triggerupdate` },
                                                                { title: "Menu", description: "Back to command list", id: `${prefix}menu` },
                                                            ],
                                                        },
                                                    ],
                                                }),
                                            },
                                        ],
                                    },
                                }
                            }
                        }
                    },
                    { quoted: fq }
                );

                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });


                await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;

            let msg;

            if (errorMessage.includes("API key")) {
                msg =
                    " Your Heroku API key is trash.\n" +
                    "Fix *HEROKU_API_KEY* before crying here.";
            } else if (errorMessage.includes("not found")) {
                msg =
                    " Heroku app not found.\n" +
                    "Are you sure *HEROKU_APP_NAME* is correct, genius?";
            } else {
                msg = ` Update failed:\n${errorMessage}\nTry again without panicking.`;
            }

            await client.sendMessage(
                m.chat,
                { text: formatStylishReply(msg) },
                { quoted: fq }
            );
        }
    });
};