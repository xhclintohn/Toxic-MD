import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';

const VALID_VALUES = ['android', 'ios', 'default'];

export default {
    name: 'device',
    aliases: ['setdevice', 'devicemode', 'platform', 'deviceset', 'setplatform'],
    description: 'Set device mode: android/ios/default. Android uses select buttons; iOS uses text-only.',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, args, prefix } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const fmt = (msg) =>
                `╭─❏ 「 DEVICE MODE」
│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

            const value = (args[0] || '').toLowerCase().trim();

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
