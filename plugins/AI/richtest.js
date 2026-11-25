import { randomUUID } from 'node:crypto';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

const IMG = 'https://upload.lntrl.dev/f/beypeyg.jpg';

const buildSteps = () => [
    {
        __typename: 'GenAIStepThoughtEntry',
        header: 'Getting started'
    },
    {
        __typename: 'GenAIStepThoughtEntry',
        header: 'What coffee is',
        body: 'Coffee is a brewed drink made from roasted coffee beans, the seeds of berries from certain Coffea species.',
        sources: [
            {
                __typename: 'GenAIStepWebLinkSource',
                url: 'https://en.wikipedia.org/wiki/Coffee',
                title: 'Coffee — Wikipedia',
                favicon_url: 'https://en.wikipedia.org/static/images/icons/wikipedia.png'
            }
        ]
    },
    {
        __typename: 'GenAIStepThoughtEntry',
        header: 'Health benefits',
        body: 'Coffee is rich in antioxidants and may support alertness, mood and metabolism when enjoyed in moderation.',
        sources: [
            {
                __typename: 'GenAIStepWebLinkSource',
                url: 'https://www.healthline.com/nutrition/coffee-benefits',
                title: 'Coffee: Health Benefits, Nutrition, and Risks — Healthline',
                favicon_url: 'https://www.healthline.com/favicon.ico'
            },
            {
                __typename: 'GenAIStepWebLinkSource',
                url: 'https://github.com',
                title: 'GitHub',
                favicon_url: 'https://github.githubassets.com/favicons/favicon.png'
            }
        ]
    },
    {
        __typename: 'GenAIStepThoughtEntry',
        header: 'A closer look',
        body: 'Here is a visual overview to go with the summary.',
        artifacts: [
            {
                __typename: 'GenAIImagePrimitive',
                asset_query_status: 'FETCHED',
                preview_image: {
                    url: IMG,
                    mime_type: 'image/jpeg',
                    width: 800,
                    height: 450
                },
                full_image: {
                    url: IMG,
                    mime_type: 'image/jpeg',
                    width: 1600,
                    height: 900
                },
                source: {
                    source_type: 'IMAGE_GEN',
                    source_display_name: 'coffee.jpg'
                }
            }
        ]
    }
];

const buildScreens = (stepEntries) => [
    {
        __typename: 'FOAUnifiedResponseEmbeddedScreen',
        title: 'Thoughts',
        content: [
            {
                __typename: 'FOAEmbeddedScreenContentTabbed',
                tabs: [
                    {
                        __typename: 'FOAUnifiedResponseTab',
                        id: 'steps',
                        tab_header: 'Steps',
                        sections: [],
                        step_entries: stepEntries
                    }
                ]
            }
        ]
    }
];

const buildPayload = (variant) => {
    const stepEntries = buildSteps();
    const embeddedScreens = buildScreens(stepEntries);
    const sections = variant === 'details'
        ? [
            {
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                    __typename: 'GenAISingleLayoutViewModel',
                    primitive: {
                        __typename: 'GenAIMetadataTextPrimitive',
                        text: 'Full steps'
                    }
                }
            }
        ]
        : [
            {
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                    __typename: 'GenAISingleLayoutViewModel',
                    primitive: {
                        __typename: 'GenAIMarkdownTextUXPrimitive',
                        text: 'Here is what I found about coffee, step by step.'
                    }
                }
            },
            {
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                    __typename: 'GenAISingleLayoutViewModel',
                    primitive: {
                        __typename: 'GenAIBotProgressStatusPrimitive',
                        title: 'Full steps',
                        is_in_progress: true,
                        icon: 'THINKING'
                    }
                }
            }
        ];
    return {
        __typename: 'GenAIUnifiedResponse',
        response_id: randomUUID(),
        sections,
        embedded_screens: embeddedScreens
    };
};

export default {
    name: 'richtest',
    aliases: ['airich', 'richsteps', 'richt'],
    description: 'Send a test AI rich response with steps',
    run: async (context) => {
        const { client, m, args } = context;
        const variant = String(args?.[0] || '').toLowerCase() === 'details' ? 'details' : 'progress';
        try {
            const payload = buildPayload(variant);
            const waMsg = generateWAMessageFromContent(
                m.chat,
                {
                    botForwardedMessage: {
                        message: {
                            richResponseMessage: {
                                messageType: 1,
                                unifiedResponse: {
                                    data: Buffer.from(JSON.stringify(payload)).toString('base64')
                                },
                                contextInfo: {
                                    forwardingScore: 3,
                                    isForwarded: true,
                                    forwardedAiBotMessageInfo: {
                                        botJid: '259786046210223@bot'
                                    },
                                    forwardOrigin: 4,
                                    botMessageSharingInfo: {
                                        botEntryPointOrigin: 1,
                                        forwardScore: 4
                                    }
                                }
                            }
                        }
                    }
                },
                { userJid: client.user?.id }
            );
            await client.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id });
        } catch (e) {
            console.log('[RICHTEST] rich response failed:', e?.message || e);
            await sendInteractive(client, m,
                `╭─❏ 「 RICHTEST 」
│ The rich response could not be sent on this WhatsApp version.
│ Try again after updating WhatsApp.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            ).catch(() => {});
        }
    }
};
