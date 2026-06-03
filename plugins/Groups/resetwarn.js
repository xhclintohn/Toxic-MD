import { resetWarn, getWarnCount } from '../../database/config.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { resolveTargetJid } from '../../lib/lidResolver.js';

export default {
    name: 'resetwarn',
    alias: ['delwarn', 'clearwarn'],
    description: 'Reset warns for a user',
    run: async (context) => {
        const { client, m, isAdmin, isBotAdmin } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        if (!m.isGroup) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ Group only.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
        if (!isAdmin) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ Admin only.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        let rawJid = m.quoted?.sender || m.mentionedJid?.[0];
        if (!rawJid) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ Reply or mention the user.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const groupMetadata = await client.groupMetadata(m.chat);
        const participants = groupMetadata.participants;
        const target = resolveTargetJid(rawJid, participants);
        if (!target) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return m.reply(`╭───(    TOXIC-MD    )───\n├ Couldn't find that person in this group.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const userNum = target.split('@')[0].split(':')[0];
        await resetWarn(m.chat, userNum);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

        return client.sendMessage(m.chat, {
            text: `╭───(    TOXIC-MD    )───\n├ Warns cleared for @${userNum} 🧹\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
            mentions: [target]
        }, { quoted: fq });
    }
};
