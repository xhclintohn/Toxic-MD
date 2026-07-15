import axios from 'axios';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ButtonV2 } from '../../lib/buttons.js';

const THUMB = 'https://img2.pixhost.to/images/9055/745533062_rafaofficial.jpg';
const API_BASE = 'https://api.synoxcloud.xyz';
const fmt = (msg) => `╭─❏ 「 VIRTUAL NUMBER 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const sendGachaResult = async (client, m, nomor, negara, bendera, prefix) => {
    const title =
        `*GACHA VIRTUAL NUMBER* \n\n` +
        `◦ Number :\n${nomor}\n\n` +
        `◦ Country :\n${negara} ${bendera}`;

    try {
        const msg = generateWAMessageFromContent(
            m.chat,
            {
                interactiveMessage: {
                    body: { text: title },
                    footer: { text: '> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧' },
                    nativeFlowMessage: {
                        messageVersion: 1,
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'Copy Number',
                                    copy_code: nomor
                                })
                            },
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '🔄 Generate New',
                                    id: `${prefix}virtualnumber`
                                })
                            },
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '💬 Check OTP',
                                    id: `${prefix}virtualnumber otp ${nomor}`
                                })
                            }
                        ]
                    }
                }
            },
            { userJid: client.user?.id }
        );
        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        return;
    } catch {}

    const btnV2 = new ButtonV2(client);
    btnV2.setBody(title)
        .setFooter('> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧')
        .setThumbnail(THUMB)
        .addButton('🔄 Generate New', `${prefix}virtualnumber`)
        .addButton('💬 Check OTP', `${prefix}virtualnumber otp ${nomor}`);

    await btnV2.send(m.chat, { userJid: client.user.id, quoted: m });
};

const sendOtpResult = async (client, m, nomor, resData, prefix) => {
    let title =
        `*OTP CHECKER RESULT* 📥\n\n` +
        `◦ Number :\n${nomor}\n\n` +
        `◦ Status :\n${resData.message}\n\n` +
        `◦ Total OTP :\n${resData.result?.total ?? 0}`;

    if (resData.result?.otps?.length > 0) {
        title += `\n\n*OTP List:*\n`;
        resData.result.otps.forEach((otp, i) => {
            title += `${i + 1}. ${otp}\n`;
        });
    } else {
        title += `\n\n_No new OTPs received yet._`;
    }

    const btnV2 = new ButtonV2(client);
    btnV2.setBody(title)
        .setFooter('> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧')
        .setThumbnail(THUMB)
        .addButton('🔄 Re-check OTP', `${prefix}virtualnumber otp ${nomor}`)
        .addButton('🆕 New Number', `${prefix}virtualnumber`);
    
    await btnV2.send(m.chat, { userJid: client.user.id, quoted: m });
};

export default {
    name: 'virtualnumber',
    aliases: ['vnum', 'gachano', 'vtnum', 'vnm', 'virtualnum', 'genvirtual', 'gennumber', 'virtnum'],
    description: 'Get a random virtual number or check its OTP',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'otp') {
                const nomor = args.slice(1).join(' ').trim();
                if (!nomor) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt(`Please provide a number.\nExample: .virtualnumber otp +6281234567890`));
                }

                const res = await axios.get(`${API_BASE}/tools/otp-checker?number=${encodeURIComponent(nomor)}`);
                const resData = res.data;

                if (!resData?.status) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt(`OTP check failed: ${resData?.message || 'Unknown error'}`));
                }

                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                return sendOtpResult(client, m, nomor, resData, prefix);
            }

            const res = await axios.get(`${API_BASE}/tools/virtual-numbers`);
            const allNumbers = res.data?.result?.numbers;

            if (!Array.isArray(allNumbers) || allNumbers.length === 0) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('No numbers available from API right now. Try again later.'));
            }

            const selected = allNumbers[Math.floor(Math.random() * allNumbers.length)];
            const nomor = selected?.number;

            if (!nomor) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Failed to pick a number. Try again.'));
            }

            const negara = selected.country || 'Unknown';
            const bendera = selected.flag || '';

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendGachaResult(client, m, nomor, negara, bendera, prefix);

        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Error: ${e?.message || e}`));
        }
    }
};