import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
    name: 'setwelcome',
    aliases: ['welcomemsg', 'customwelcome', 'setwelcomemsg'],
    description: 'Set a custom welcome message for this group. Use {user} for the new member\'s mention.',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, text, prefix, isGroup, isBotAdmin } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            if (!isGroup) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETWELCOME", "Group only command."));
            }

            if (!isBotAdmin) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETWELCOME", "Make me admin first."));
            }

            const gs = await getGroupSettings(m.chat);
            if (!gs.welcome) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETWELCOME", `Welcome is OFF for this group.\n│ Enable it first: ${prefix}welcome on`));
            }

            const args = (text || '').trim().split(/\s+/);
            const subCmd = args[0]?.toLowerCase() || '';

            if (subCmd === 'image' || subCmd === 'img') {
                const imgUrl = args.slice(1).join(' ').trim();
                if (!imgUrl) {
                    const currentImg = gs.welcome_image || '';
                    await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("SETWELCOME", `${currentImg ? 'Current image: ' + currentImg : 'No custom image set.'}\n│ \n│ Usage: ${prefix}setwelcome image <url>\n│ Use ${prefix}setwelcome image off to disable.\n│ To upload an image to URL, use ${prefix}tourl`));
                }
                if (imgUrl === 'off' || imgUrl === 'none' || imgUrl === 'remove' || imgUrl === 'reset') {
                    await updateGroupSetting(m.chat, 'welcome_image', '');
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                    return sendInteractive(client, m, fmt("SETWELCOME", "Custom welcome image removed. Will use profile pic fallback (if enabled) or text only."));
                }
                await updateGroupSetting(m.chat, 'welcome_image', imgUrl);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("SETWELCOME", `Custom welcome image set!\n│ Image URL: ${imgUrl}`));
            }

            if (subCmd === 'usepp' || subCmd === 'profilepic' || subCmd === 'pp') {
                const current = gs.welcome_use_pp;
                const newVal = !(current === true || current === 1);
                await updateGroupSetting(m.chat, 'welcome_use_pp', newVal);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("SETWELCOME", `Profile pic fallback ${newVal ? 'ENABLED' : 'DISABLED'}.\n│ ${newVal ? 'When no custom image is set, member profile pic will be used.' : 'Welcome will be text-only when no custom image is set.'}`));
            }

            if (subCmd === 'show' || subCmd === 'view' || subCmd === 'preview') {
                const currentMsg = gs.custom_welcome || '';
                const currentImg = gs.welcome_image || '';
                const usePp = gs.welcome_use_pp === true || gs.welcome_use_pp === 1;
                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt("SETWELCOME", `Current settings:\n│ Message: ${currentMsg || '(default)'}\n│ Image: ${currentImg || '(none)'}\n│ Use PP: ${usePp ? 'Yes' : 'No'}`));
            }

            if (!text || text.trim() === '') {
                const current = gs.custom_welcome || '';
                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
                const preview = current ? `Current custom:\n│ ${current.slice(0, 120)}${current.length > 120 ? '...' : ''}` : 'No custom message set (using default).';
                return sendInteractive(client, m, fmt("SETWELCOME", `${preview}\n│ \n│ Usage: ${prefix}setwelcome <message>\n│ Use {user} = member mention\n│ Use {group} = group name\n│ Use {desc} = group description\n│ \n│ ${prefix}setwelcome image <url> — set custom image\n│ ${prefix}setwelcome usepp — toggle profile pic fallback\n│ ${prefix}setwelcome show — view current settings\n│ To reset: ${prefix}setwelcome reset`));
            }

            if (text.trim().toLowerCase() === 'reset') {
                await updateGroupSetting(m.chat, 'custom_welcome', '');
                await updateGroupSetting(m.chat, 'welcome_image', '');
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("SETWELCOME", "Welcome message reset to default."));
            }

            await updateGroupSetting(m.chat, 'custom_welcome', text.trim());
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return sendInteractive(client, m, fmt("SETWELCOME", `Custom welcome message set!\n│ \n│ Preview:\n│ ${text.trim().slice(0, 120)}${text.trim().length > 120 ? '...' : ''}`));
        });
    }
};
