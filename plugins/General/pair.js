import { generateWAMessageFromContent, proto, startPairing, isPairingActive } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';

function cleanNumber(input) {
    let num = input.replace(/[\s\-\(\)\+\.]/g, '');
    num = num.replace(/[^0-9]/g, '');
    if (num.startsWith('00')) {
        num = num.slice(2);
    }
    return num;
}

export default {
    name: 'pair',
    aliases: ['getcode', 'paircode', 'pairingcode', 'connect'],
    description: 'Generates a pairing code for WhatsApp multi-device linking',
    run: async (context) => {
        const { client, m, text, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            if (!text) {
                return await sendInteractive(client, m, `╭─❏ 「 Pᴀɪʀɪɴɢ」
│ Oi genius, give me a number\n│ to pair with. You think I can\n│ read your mind?\n│ \n│ Usage: *${prefix}pair <number>*\n│ Example: *${prefix}pair 254712345678*\n│ Example: *${prefix}pair +1 234 567 8901*\n│ \n│ Spaces, dashes, plus signs...\n│ I'll clean that mess up for you.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const number = cleanNumber(text);

            if (number.length < 6 || number.length > 15) {
                return await sendInteractive(client, m, `╭─❏ 「 Iɴᴠᴀʟɪᴅ Nᴜᴍʙᴇʀ」
│ That number is garbage.\n│ Cleaned: ${number}\n│ Need 6-15 digits with country code.\n│ Try again with a real number.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            if (isPairingActive(number)) {
                return await sendInteractive(client, m, `╭─❏ 「 Pᴀɪʀɪɴɢ」
│ A pairing for ${number}\n│ is already running.\n│ Wait for it to finish first.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            await sendInteractive(client, m, `╭─❏ 「 Pᴀɪʀɪɴɢ」
│ Generating code for: ${number}\n│ Hold on, this takes a sec...\n│ Don't spam the command, idiot.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

            await startPairing(number, {
                newsletterJid: '120363425667150709@newsletter',
                onCode: async (code) => {
                    const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
                    try {
                        const ctaMsg = generateWAMessageFromContent(m.chat, {
                            interactiveMessage: {
                                body: {
                                    text: `╭─❏ 「 Pᴀɪʀɪɴɢ Cᴏᴅᴇ」
│ Number: ${number}\n│ Code: *${formattedCode}*\n│ \n│ Copy the code and paste it\n│ in your WhatsApp linked\n│ devices section.\n│ \n│ The code expires quickly so\n│ move your slow ass.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                                },
                                footer: {
                                    text: 'Toxic-MD Pairing System'
                                },
                                nativeFlowMessage: {
                                    messageVersion: 1,
                                    buttons: [
                                        {
                                            name: 'cta_copy',
                                            buttonParamsJson: JSON.stringify({
                                                display_text: 'Copy Pairing Code',
                                                copy_code: formattedCode
                                            })
                                        }
                                    ]
                                }
                            }
                        }, { userJid: client.user?.id });

                        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                        await client.relayMessage(m.chat, ctaMsg.message, { messageId: ctaMsg.key.id });
                    } catch (btnErr) {
                        console.error('[pair] code button failed:', btnErr?.message || btnErr);
                        await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
                        await sendInteractive(client, m, `╭─❏ 「 Pᴀɪʀɪɴɢ Cᴏᴅᴇ」
│ Number: ${number}\n│ Code: *${formattedCode}*\n│ \n│ Copy the code above and paste\n│ it in your WhatsApp linked\n│ devices section. Hurry up,\n│ it expires quick.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                    }
                },
                onConnected: async ({ sessionId, userJid }) => {
                    let quotedMsg = null;
                    try {
                        const sessionMsg = generateWAMessageFromContent(userJid, proto.Message.fromObject({
                            interactiveMessage: {
                                body: { text: sessionId },
                                footer: { text: '' },
                                nativeFlowMessage: {
                                    messageVersion: 1,
                                    buttons: [{
                                        name: 'cta_copy',
                                        buttonParamsJson: JSON.stringify({ display_text: 'Copy Session id', copy_code: sessionId })
                                    }],
                                    messageParamsJson: ''
                                }
                            }
                        }), { userJid: client.user.id });

                        await client.relayMessage(userJid, sessionMsg.message, { messageId: sessionMsg.key.id });
                        quotedMsg = sessionMsg;
                    } catch (sendError) {
                        try { quotedMsg = await client.sendMessage(userJid, { text: sessionId }); } catch {}
                    }

                    try {
                        await client.sendMessage(userJid, {
                            text: `╭─❏ 「 Sᴇssɪᴏɴ Cᴏɴɴᴇᴄᴛᴇᴅ」
│ The long code above is your\n│ Session ID. Copy and store it\n│ safely, you'll need it to\n│ deploy your Toxic-MD bot!\n│ This ID does not expire.\n│ \n│ Repo: github.com/xhclintohn/Toxic-MD\n│ Deploy: https://hosting.nyxtechs.net\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                        }, quotedMsg ? { quoted: quotedMsg } : {});
                    } catch {}

                    await sendInteractive(client, m, `╭─❏ 「 Pᴀɪʀɪɴɢ」
│ ${number} paired successfully ✅️\n│ Session ID sent to that\n│ number's DM.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                },
                onError: async (error) => {
                    console.error("Error in pair command:", error);
                    await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
                    await sendInteractive(client, m, `╭─❏ 「 Pᴀɪʀɪɴɢ Fᴀɪʟᴇᴅ」
│ Couldn't generate the code.\n│ ${error.message || 'Unknown error'}\n│ \n│ Make sure the number is valid\n│ and actually on WhatsApp.\n│ Then try again, if you can\n│ manage that.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }
            });

        } catch (error) {
            console.error("Error in pair command:", error);
            await client.sendMessage(m.chat, { react: { text: '', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, `╭─❏ 「 Pᴀɪʀɪɴɢ Fᴀɪʟᴇᴅ」
│ Couldn't generate the code.\n│ ${error.message || 'Unknown error'}\n│ \n│ Make sure the number is valid\n│ and actually on WhatsApp.\n│ Then try again, if you can\n│ manage that.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
