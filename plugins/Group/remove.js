import middleware from '../../utils/botUtil/middleware.js';
import { resolveTargetJid } from '../../lib/lidResolver.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveTarget as resolveUserTarget, pickActionableJid, primeGroupUsernames } from '../../lib/usernameResolver.js';

const DEV_NUMBER = '254114885159';

export default {
  name: 'remove',
  aliases: ['kick', 'yeet', 'boot', 'removemember'],
  description: 'Removes a user from a group',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m, prefix } = context;
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      const groupMeta = await client.groupMetadata(m.chat);
      const groupParticipants = groupMeta.participants;
      primeGroupUsernames(client, groupMeta, { chat: m.chat }).catch(() => {});

      const picked = await resolveUserTarget(client, { ...context, participants: groupParticipants }, { participants: groupParticipants, chat: m.chat });
      let rawJid = picked?.jid || null;
      if (!rawJid && m.mentionedJid && m.mentionedJid.length > 0) rawJid = m.mentionedJid[0];
      if (!rawJid && m.quoted?.sender) rawJid = m.quoted.sender;

      if (!rawJid) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 REMOVE 」
│ Mention or quote a user. ${prefix}kick @user\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }

      const participants = groupParticipants;
      const targetJid = picked?.jid || resolveTargetJid(rawJid, participants) || pickActionableJid(rawJid, participants);
      const botJid = (client.user.id.split(':')[0].split('@')[0].replace(/\D/g, '')) + '@s.whatsapp.net';

      if (!targetJid) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 REMOVE 」
│ Couldn't find that person in this group.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }

      const _targetNum = targetJid.split('@')[0].replace(/\D/g, '');
      const _botNum = botJid.split('@')[0].replace(/\D/g, '');
      const _botLid = (client.user?.lid || '').split(':')[0].split('@')[0].replace(/\D/g, '');
      if (_targetNum === DEV_NUMBER || _targetNum === _botNum || (_botLid && _targetNum === _botLid)) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 REMOVE 」
│ That command cannot be used on the dev or the bot.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }

      try {
        await client.groupParticipantsUpdate(m.chat, [targetJid], 'remove');
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await client.sendMessage(m.chat, {
          text: `╭─❏ 「 KICKED」
│ ${picked?.label || '@' + targetJid.split('@')[0]} got yeeted out.\n│ Good riddance, trash.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
          mentions: [targetJid]
        });
      } catch (error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        await sendInteractive(client, m, `╭─❏ 「 REMOVE 」
│ Couldn't kick that user.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
    });
  }
};
