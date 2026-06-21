import { getGroupSettings, updateGroupSetting } from '../../database/config.js';
  import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
  import { sendInteractive } from '../../lib/sendInteractive.js';

  const fmt = (message) => `╭─❏ 「 GCPRESENCE 」\n│ ${message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  const ON_VALUES  = new Set(['on', 'enable', 'enabled', 'true', '1', 'start']);
  const OFF_VALUES = new Set(['off', 'disable', 'disabled', 'false', '0', 'stop']);

  export default async (context) => {
      await ownerMiddleware(context, async () => {
          const { client, m, args, prefix } = context;

          client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

          const value = (args[0] || '').toLowerCase();
          const jid = m.chat;
          const isGroup = jid.endsWith('@g.us');

          let isEnabled = false;
          if (isGroup) {
              const groupSettings = await getGroupSettings(jid);
              isEnabled = groupSettings?.gcpresence === true;
          }

          // Toggle on/off
          if (ON_VALUES.has(value) || OFF_VALUES.has(value)) {
              const action = ON_VALUES.has(value);

              if (isEnabled === action) {
                  client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                  return sendInteractive(client, m, fmt(`GCPresence is already ${action ? 'ON' : 'OFF'} 🙄`));
              }

              if (!isGroup) {
                  client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                  return sendInteractive(client, m, fmt('GCPresence is a group-only feature. Use it inside a group.'));
              }

              await updateGroupSetting(jid, 'gcpresence', action);
              client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
              return sendInteractive(client, m,
                  fmt(`GCPresence turned ${action ? '*ON* ✅' : '*OFF* ❌'}\n│ The bot will ${action ? 'now fake' : 'stop faking'} typing/recording in this group.`)
              );
          }

          // No argument — show current status
          const statusLine = isGroup
              ? (isEnabled ? '✅ ON' : '❌ OFF')
              : '✅ ON (always active in DMs)';

          client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt(
              `Status: ${statusLine}\n│ \n│ *Toggle:*\n│  ${prefix}gcpresence on  — Enable\n│  ${prefix}gcpresence off — Disable\n│ \n│ Also works: enable/disable, true/false`
          ));
      });
  };
  