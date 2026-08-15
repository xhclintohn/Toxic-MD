import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { resolveSenderJid } from '../../lib/lidResolver.js';
import { getDevice } from '@whiskeysockets/baileys';

const VALID_VALUES = ['android', 'ios', 'default'];

const DEVICE_LABELS = {
    android: 'Android',
    ios: 'iOS',
    web: 'Web',
    desktop: 'Desktop',
    unknown: 'Unknown'
};

export default {
    name: 'device',
    aliases: ['setdevice', 'devicemode', 'platform', 'deviceset', 'setplatform'],
    description: 'Reply to a message with no args to detect that user\'s device. Use android/ios/default with no reply to set the bot\'s button/text mode.',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, args, prefix } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const fmt = (msg) =>
                `╭─❏ 「 DEVICE MODE」
│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

            const value = (args[0] || '').toLowerCase().trim();

            // Detection mode: ".device" with no args, replying to someone's message.
            // Explicit args (e.g. ".device android") always win and fall through to
            // the settings logic below, even if sent as a reply.
            if (!value && m.quoted) {
                try {
                    const quotedId = m.quoted.id || '';
                    let detected = 'unknown';
                    try {
                        detected = getDevice(quotedId) || 'unknown';
                    } catch {
                        detected = 'unknown';
                    }

                    const rawParticipant = m.msg?.contextInfo?.participant || '';
                    let targetJid = m.quoted.sender || rawParticipant || '';
                    if (targetJid && targetJid.endsWith('@lid')) {
                        const resolved = await resolveSenderJid(
                            targetJid,
                            m.chat,
                            client,
                            { participant: rawParticipant, participantAlt: m.msg?.contextInfo?.participantAlt }
                        ).catch(() => null);
                        if (resolved) targetJid = resolved;
                    }
                    const num = targetJid ? targetJid.split('@')[0].split(':')[0].replace(/\D/g, '') : null;
                    const label = DEVICE_LABELS[detected] || 'Unknown';
                    const isLidTag = targetJid && targetJid.endsWith('@lid') ? ' (LID unresolved)' : '';

                    await client.sendMessage(m.chat, { react: { text: detected === 'unknown' ? '⚠️' : '✅', key: m.reactKey } });
                    return await client.sendMessage(m.chat, {
                        text: fmt(
                            num
                                ? `@${num}${isLidTag} is using: *${label}*${detected === 'unknown' ? '\n│ Could not be determined from this message.' : ''}`
                                : `Device: *${label}*\n│ Sender could not be identified.${detected === 'unknown' ? '\n│ Could not be determined from this message.' : ''}`
                        ),
                        mentions: num && targetJid && !targetJid.endsWith('@lid') ? [targetJid] : []
                    });
                } catch (e) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    return await client.sendMessage(m.chat, {
                        text: fmt(`Failed to detect device: ${e?.message || e}`)
                    });
                }
            }

            if (!value) {
                const settings = await getSettings();
                const current = settings.device || process.env.DEVICE || 'default';
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.sendMessage(m.chat, {
                    text: fmt(
                        `Current device mode: *${current.toUpperCase()}*\n│ \n│ android / default — Uses select list buttons\n│ ios — Text-only responses (no buttons)\n│ \n│ Usage: *${prefix}device android*\n│         *${prefix}device ios*\n│         *${prefix}device default*`
                    )
                });
            }

            if (!VALID_VALUES.includes(value)) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return await client.sendMessage(m.chat, {
                    text: fmt(`Invalid value: *${value}*\n│ Accepted: *android*, *ios*, *default*`)
                });
            }

            const settings = await getSettings();
            const current = settings.device || 'default';

            if (current === value) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return await client.sendMessage(m.chat, {
                    text: fmt(`Device is already set to *${value.toUpperCase()}*. Nothing changed.`)
                });
            }

            await updateSetting('device', value);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return await client.sendMessage(m.chat, {
                text: fmt(
                    `Device mode set to *${value.toUpperCase()}*\n│ \n│ ${
                        value === 'ios'
                            ? 'iOS mode: buttons replaced with text-only responses.'
                            : 'Android mode: select list buttons enabled everywhere.'
                    }`
                )
            });
        });
    }
};
