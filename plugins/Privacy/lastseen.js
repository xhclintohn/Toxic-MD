import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ButtonV2 } from '../../lib/WABuilder.js';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 LAST SEEN」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        const options = ['all', 'contacts', 'contact_blacklist', 'none'];
        const value = (args[0] || '').toLowerCase();

        if (options.includes(value)) {
            try {
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                await client.updateLastSeenPrivacy(value);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return m.reply(fmt(`Last seen privacy updated to: *${value}*`));
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return m.reply(fmt(`Failed: ${e.message?.slice(0, 60)}`));
            }
        }

        const bodyText = fmt(`Who can see your last seen?\n\n│ ${prefix}lastseen all\n│ ${prefix}lastseen contacts\n│ ${prefix}lastseen contact_blacklist\n│ ${prefix}lastseen none`);
        const _devMode = await getDeviceMode();
        if (_devMode === 'ios') {
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
            return await sendInteractive(client, m, bodyText);
        }

        try {
            const btnV2 = new ButtonV2(client);
            btnV2.setBody(bodyText)
                .setFooter('> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧')
                .addButton('All ✅', `${prefix}lastseen all`)
                .addButton('Contacts 👥', `${prefix}lastseen contacts`)
                .addButton('None ❌', `${prefix}lastseen none`);
            await btnV2.send(m.chat, { userJid: client.user?.id || '' });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch {
            await sendInteractive(client, m, bodyText);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        }
    });
};
