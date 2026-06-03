import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { promises as fs } from 'fs';
import path from 'path';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { aliases } from '../../handlers/commandHandler.js';

const normalizeNumber = (jid) => {
    if (!jid) return '';
    return jid.split('@')[0].split(':')[0].replace(/\D/g, '') + '@s.whatsapp.net';
};

const DEVELOPER = normalizeNumber('254114885159');
const CATEGORIES = ['+18', 'Ai-Tools', 'Coding', 'Downloads', 'Editing', 'General', 'Groups', 'Heroku', 'Logo', 'Owner', 'Privacy', 'Search', 'Settings', 'Utils'];
const PLUGINS_DIR = path.join(__dirname, '..', '..', 'plugins');

function resolveAlias(input) {
    try {
        if (aliases && aliases[input.toLowerCase()]) return aliases[input.toLowerCase()];
    } catch {}
    return input;
}

export default async (context) => {
    const { client, m, text, prefix } = context;
    const fq = getFakeQuoted(m);
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
    await client.sendMessage(m.chat, { react: { text: '🔍', key: m.reactKey } });

    if (normalizeNumber(m.sender) !== DEVELOPER) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return await client.sendMessage(m.chat, {
            text: `╭───(    TOXIC-MD    )───\n├───≫ ACCESS DENIED ≪───\n├ \n├ This command is restricted to the bot owner.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        }, { quoted: fq });
    }

    if (!text) {
        const categoryList = CATEGORIES.map(c => `├ • ${c}`).join('\n');
        return await client.sendMessage(m.chat, {
            text: `╭───(    TOXIC-MD    )───\n├───≫ GETCMD ≪───\n├ \n├ Usage: ${prefix}getcmd <name>\n├ \n├ Categories:\n${categoryList}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        }, { quoted: fq });
    }

    const rawInput = text.trim().endsWith('.js') ? text.trim().slice(0, -3) : text.trim();
    const commandName = resolveAlias(rawInput);
    let fileFound = false;

    for (const category of CATEGORIES) {
        const filePath = path.join(PLUGINS_DIR, category, `${commandName}.js`);
        try {
            const data = await fs.readFile(filePath, 'utf8');
            const fileBuffer = Buffer.from(data, 'utf8');
            const aliasNote = commandName !== rawInput ? `├ Alias: ${rawInput} → ${commandName}\n` : '';

            const responseId = Math.random().toString(36).substring(2);
            const introText = `╭───(    TOXIC-MD    )───\n├───≫ COMMAND FILE ≪───\n├ \n├ File: ${commandName}.js\n├ Category: ${category}\n├ Size: ${data.length} chars\n${aliasNote}├ \n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            
            const encodedData = Buffer.from(JSON.stringify({
                "response_id": responseId,
                "sections": [
                    {
                        "view_model": {
                            "primitive": {
                                "text": introText,
                                "__typename": "GenAIMarkdownTextUXPrimitive"
                            },
                            "__typename": "GenAISingleLayoutViewModel"
                        }
                    },
                    {
                        "view_model": {
                            "primitive": {
                                "language": "javascript",
                                "code_blocks": [
                                    { "content": data, "type": "DEFAULT" }
                                ],
                                "__typename": "GenAICodeUXPrimitive"
                            },
                            "__typename": "GenAISingleLayoutViewModel"
                        }
                    }
                ]
            })).toString('base64');

            const content = {
                messageContextInfo: {
                    threadId: [],
                    deviceListMetadata: {
                        senderKeyIndexes: [],
                        recipientKeyIndexes: []
                    },
                    deviceListMetadataVersion: 2,
                    botMetadata: {
                        pluginMetadata: {},
                        richResponseSourcesMetadata: {
                            sources: []
                        }
                    }
                },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            submessages: [
                                {
                                    messageType: 2,
                                    messageText: introText
                                },
                                {
                                    messageType: 3,
                                    codeMetadata: {
                                        codeLanguage: "javascript",
                                        codeBlocks: [
                                            {
                                                highlightType: 0,
                                                codeContent: data
                                            }
                                        ]
                                    }
                                }
                            ],
                            messageType: 1,
                            unifiedResponse: {
                                data: encodedData
                            },
                            contextInfo: {
                                mentionedJid: [],
                                groupMentions: [],
                                statusAttributions: [],
                                forwardingScore: 743,
                                isForwarded: true,
                                forwardedAiBotMessageInfo: {
                                    botJid: "867051314767696@bot"
                                },
                                forwardOrigin: 4
                            }
                        }
                    }
                }
            };
            const relayOption = {};
            
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.relayMessage(m.chat, content, relayOption);
            await client.sendMessage(m.chat, {
                document: fileBuffer,
                fileName: `${commandName}.js`,
                mimetype: 'application/javascript',
                caption: `╭───(    TOXIC-MD    )───\n├ 📄 ${commandName}.js\n├ Category: ${category}\n├ Size: ${data.length} chars\n${aliasNote}╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            }, { quoted: fq });
            
            fileFound = true;
            break;
        } catch (err) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            if (err.code !== 'ENOENT') {
                return await client.sendMessage(m.chat, {
                    text: `╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Error reading file: ${err.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                }, { quoted: fq });
            }
        }
    }

    if (!fileFound) {
        await client.sendMessage(m.chat, {
            text: `╭───(    TOXIC-MD    )───\n├───≫ NOT FOUND ≪───\n├ \n├ "${rawInput}" not found in any category.\n├ \n├ Tip: use ${prefix}getcmd with no args\n├ to see all categories.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        }, { quoted: fq });
    }
};