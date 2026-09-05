import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
  import { sendInteractive } from '../../lib/sendInteractive.js';

  const fmt = (msg) => `╭─❏ 「 GCNAME 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  export default {
    name: 'gcname',
    aliases: ['changename','changegcname','groupname','editgcname','renamegc','setgcname','gcnm','renamegroup','setgroupname','gname','rengc'],
    description: 'Change the group name/subject',
    run: async (context) => {
      await ownerMiddleware(context, async () => {
        const { client, m, text, isBotAdmin, IsGroup } = context;
        client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

        if (!IsGroup) {
          client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt('Group only command.'));
        }

        if (!isBotAdmin) {
          client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt('Make me admin first so I can rename the group.'));
        }

        const isAdmin = m.isAdmin;
        if (!isAdmin) {
          client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt("You're not an admin, what are you doing 💀"));
        }

        const newName = (text || '').trim();
        if (!newName) {
          client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt('Provide a new group name.\n│ Usage: .gcname NewGroupName'));
        }

        if (newName.length > 100) {
          client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt('Group name too long (max 100 chars).'));
        }

        try {
          await client.groupUpdateSubject(m.chat, newName);
          client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, `Group renamed to *${newName}* ✅`);
        } catch (e) {
          client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt('Failed to rename group: ' + (e.message || 'unknown error')));
        }
      });
    }
  };
  