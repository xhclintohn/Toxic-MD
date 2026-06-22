import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ButtonV2 } from '../../lib/WABuilder.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 CALL PRIVACY」\n│ ${msg}\n╰───────────────\n> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        const options = ['all', 'known', 'none'];
        const value = (args[0] || '').toLowerCase();

        if (options.includes(value)) {
            try {
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                await client.updateCallPrivacy(value);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return m.reply(fmt(`Call privacy set to: *${value}*`));
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return m.reply(fmt(`Failed: ${e.message?.slice(0, 60)}`));
            }
        }

        const bodyText = fmt(`Who can call you?\n\n│ ${prefix}callprivacy all\n│ ${prefix}callprivacy known\n│ ${prefix}callprivacy none`);
        const _devMode = await getDeviceMode();
        if (_devMode === 'ios') {
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
            return await sendInteractive(client, m, bodyText);
        }

        try {
            const btnV2 = new ButtonV2(client);
            btnV2.setBody(bodyText)
                .setFooter('> ©𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧')
                .addButton('All ✅', `${prefix}callprivacy all`)
                .addButton('Known 👥', `${prefix}callprivacy known`)
                .addButton('None 🚫', `${prefix}callprivacy none`);
            await btnV2.send(m.chat, { userJid: client.user?.id || '' });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch {
            await sendInteractive(client, m, bodyText);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        }
    });
};
