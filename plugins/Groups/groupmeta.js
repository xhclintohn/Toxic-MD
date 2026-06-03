import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m, text, prefix, pict } = context;
        const fq = getFakeQuoted(m);

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const args = text.trim().split(/ +/);
        const command = args[0]?.toLowerCase() || '';
        const newText = args.slice(1).join(' ').trim();

        switch (command) {
            case 'setgroupname':
                if (!newText) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ USAGE ≪───\n├ \n├ Yo, give me a new group name!\n├ Usage: ${prefix}setgroupname <new name>\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }
                if (newText.length > 100) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Group name can't be longer\n├ than 100 characters, genius!\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }

                try {
                    await client.groupUpdateSubject(m.chat, newText);
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ UPDATED ≪───\n├ \n├ Group name set to "${newText}".\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
                } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ FAILED ≪───\n├ \n├ Failed to update group name.\n├ Make sure I'm an admin.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
                }
                break;

            case 'setgroupdesc':
                if (!newText) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ USAGE ≪───\n├ \n├ Gimme a new description!\n├ Usage: ${prefix}setgroupdesc <new description>\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                }

                try {
                    await client.groupUpdateDescription(m.chat, newText);
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ UPDATED ≪───\n├ \n├ Group description updated.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
                } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ FAILED ≪───\n├ \n├ Couldn't update the description.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
                }
                break;

            case 'setgrouprestrict':
                const action = newText.toLowerCase();
                if (!['on', 'off'].includes(action)) return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ USAGE ≪───\n├ \n├ Usage: ${prefix}setgrouprestrict <on|off>\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

                try {
                    const restrict = action === 'on';
                    await client.groupSettingUpdate(m.chat, restrict ? 'locked' : 'unlocked');
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ UPDATED ≪───\n├ \n├ Group editing is now\n├ ${restrict ? 'locked to admins only' : 'open to all members'}.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
                } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ FAILED ≪───\n├ \n├ Failed to update group settings.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
                }
                break;

            default:
                await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ INVALID ≪───\n├ \n├ Invalid groupmeta command!\n├ Use ${prefix}setgroupname,\n├ ${prefix}setgroupdesc, or\n├ ${prefix}setgrouprestrict\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    });
};
