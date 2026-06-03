import { randomUUID } from 'crypto';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'tesq',
    alias: ['fakeai', 'metaai', 'aicode'],
    description: 'Send a fake Meta AI styled message with code block',
    run: async (context) => {
        const { client, m, text, sendJson } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const msgText = text || 'HACKED BY TOXIC-MD 💀';
        const intro = `*TOXIC-MD AI*\nHere's what I found:\n\n`;
        const unifiedData = Buffer.from(JSON.stringify({
            response_id: randomUUID(),
            sections: [
                {
                    view_model: {
                        primitive: {
                            text: intro,
                            __typename: 'GenAIMarkdownTextUXPrimitive'
                        },
                        __typename: 'GenAISingleLayoutViewModel'
                    }
                },
                {
                    view_model: {
                        primitive: {
                            language: 'javascript',
                            code_blocks: [
                                { content: 'console.log(', type: 'DEFAULT' },
                                { content: `"${msgText}"`, type: 'STR' },
                                { content: ');', type: 'DEFAULT' }
                            ],
                            __typename: 'GenAICodeUXPrimitive'
                        },
                        __typename: 'GenAISingleLayoutViewModel'
                    }
                }
            ]
        })).toString('base64');

        const msgContent = {
            messageContextInfo: {
                botMetadata: {
                    modelMetadata: {},
                    progressIndicatorMetadata: {},
                    imagineMetadata: {},
                    memoryMetadata: {},
                    richResponseSourcesMetadata: {},
                    botAgeCollectionMetadata: {},
                    unifiedResponseMutation: {}
                }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 'AI_RICH_RESPONSE_TYPE_STANDARD',
                        submessages: [
                            {
                                messageType: 'AI_RICH_RESPONSE_TEXT',
                                messageText: intro
                            },
                            {
                                messageType: 'AI_RICH_RESPONSE_CODE',
                                codeMetadata: {
                                    codeLanguage: 'javascript',
                                    codeBlocks: [
                                        { highlightType: 'AI_RICH_RESPONSE_CODE_HIGHLIGHT_DEFAULT', codeContent: 'console.log(' },
                                        { highlightType: 'AI_RICH_RESPONSE_CODE_HIGHLIGHT_STRING', codeContent: `"${msgText}"` },
                                        { highlightType: 'AI_RICH_RESPONSE_CODE_HIGHLIGHT_DEFAULT', codeContent: ');' }
                                    ]
                                }
                            }
                        ],
                        unifiedResponse: { data: unifiedData },
                        contextInfo: {
                            forwardingScore: 743,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
                            pairedMediaType: 'NOT_PAIRED_MEDIA',
                            forwardOrigin: 'META_AI',
                            botMessageSharingInfo: {
                                botEntryPointOrigin: 'FAVICON',
                                forwardScore: 743
                            }
                        }
                    }
                }
            }
        };

        try {
            await sendJson(client, m.chat, msgContent, { quoted: fq });
        } catch (err) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            console.error('tesq error:', err?.message);
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ TOXIC AI ≪───\n├ \n├ ${msgText}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
