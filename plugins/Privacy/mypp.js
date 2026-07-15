import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { ButtonV2 } from '@whiskeysockets/baileys';

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 PROFILE PIC」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        const options = ['all', 'contacts', 'contact_blacklist', 'none'];
        const value = (args[0] || '').toLowerCase();

        if (options.includes(value)) {
            try {
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                await client.updateProfilePicturePrivacy(value);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return m.reply(fmt(`Profile pic privacy updated to: *${value}*`));
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return m.reply(fmt(`Failed: ${e.message?.slice(0, 60)}`));
            }
        }

        const bodyText = fmt(`Who can see your profile picture?\n\n│ ${prefix}mypp all\n│ ${prefix}mypp contacts\n│ ${prefix}mypp contact_blacklist\n│ ${prefix}mypp none`);
        const _devMode = await getDeviceMode();
        if (_devMode === 'ios') {
            await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
            return await sendInteractive(client, m, bodyText);
        }

        try {
            const btnV2 = new ButtonV2(client);
            btnV2.setBody(bodyText)

                .addButton('All ✅', `${prefix}mypp all`)
                .addButton('Contacts 👥', `${prefix}mypp contacts`)
                .addButton('None ❌', `${prefix}mypp none`);
            await btnV2.send(m.chat, { userJid: client.user?.id || '' });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch {
            await sendInteractive(client, m, bodyText);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        }
    });
};
