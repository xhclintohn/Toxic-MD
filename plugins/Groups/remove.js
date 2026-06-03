import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { resolveTargetJid } from '../../lib/lidResolver.js';

const DEV_NUMBER = '254114885159';

export default {
  name: 'remove',
  aliases: ['kick', 'yeet', 'boot', 'removemember'],
  description: 'Removes a user from a group',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m, prefix } = context;
      const fq = getFakeQuoted(m);
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      let rawJid = null;
      if (m.mentionedJid && m.mentionedJid.length > 0) rawJid = m.mentionedJid[0];
      if (!rawJid && m.quoted?.sender) rawJid = m.quoted.sender;

      if (!rawJid) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply(`╭───(    TOXIC-MD    )───\n├ Mention or quote a user. ${prefix}kick @user\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }

      const groupMetadata = await client.groupMetadata(m.chat);
      const participants = groupMetadata.participants;
      const targetJid = resolveTargetJid(rawJid, participants);
      const botJid = (client.user.id.split(':')[0].split('@')[0].replace(/\D/g, '')) + '@s.whatsapp.net';

      if (!targetJid) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply(`╭───(    TOXIC-MD    )───\n├ Couldn't find that person in this group.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }

      const _targetNum = targetJid.split('@')[0].replace(/\D/g, '');
      const _botNum = botJid.split('@')[0].replace(/\D/g, '');
      if (_targetNum === DEV_NUMBER || _targetNum === _botNum) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply(`╭───(    TOXIC-MD    )───\n├ That command cannot be used on the dev or the bot.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }

      try {
        await client.groupParticipantsUpdate(m.chat, [targetJid], 'remove');
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await client.sendMessage(m.chat, {
          text: `╭───(    TOXIC-MD    )───\n├───≫ KICKED ≪───\n├ \n├ @${targetJid.split('@')[0]} got yeeted out.\n├ Good riddance, trash.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
          mentions: [targetJid]
        }, { quoted: fq });
      } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        await m.reply(`╭───(    TOXIC-MD    )───\n├ Couldn't kick that user.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
    });
  }
};
