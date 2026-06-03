import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { getSettings, getGroupSettings, updateGroupSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getDeviceMode } from '../../lib/deviceMode.js';

export default async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    const formatStylishReply = (title, message) => {
      return `╭───(    TOXIC-MD    )───\n├───≫ ${title} ≪───\n├ \n├ ${message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    };

    if (!jid.endsWith('@g.us')) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "Yo, dumbass, this command's for groups only. Get lost.") }, { quoted: fq });
    }

    try {
      const settings = await getSettings();
      if (!settings) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "Database is fucked, no settings found. Fix it, loser.") }, { quoted: fq });
      }

      let groupSettings = await getGroupSettings(jid);
      if (!groupSettings) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "No group settings found. Database's acting up, try again.") }, { quoted: fq });
      }

      let isEnabled = groupSettings?.antiforeign === true;

      const Myself = await client.decodeJid(client.user.id);
      const groupMetadata = await client.groupMetadata(m.chat);
      const userAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
      const isBotAdmin = userAdmins.includes(Myself);

      if (value === 'on' || value === 'off') {
        if (!isBotAdmin) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "Make me an admin first, you clown. Can't touch antiforeign without juice.") }, { quoted: fq });
        }

        const action = value === 'on';

        if (isEnabled === action) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", `Antiforeign's already ${value.toUpperCase()}, genius. Stop wasting my time.\n├ \n├ 📌 Usage: ${prefix}antiforeign on | ${prefix}antiforeign off`) }, { quoted: fq });
        }

        await updateGroupSetting(jid, 'antiforeign', action);
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", `Antiforeign's now ${value.toUpperCase()}. Foreigners better watch out or get yeeted!\n├ \n├ 📌 Usage: ${prefix}antiforeign on | ${prefix}antiforeign off`) }, { quoted: fq });
      }

            const _devMode = await getDeviceMode();
      if (_devMode === 'ios') {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", `Antiforeign's ${isEnabled ? 'ON' : 'OFF'} in this group, dipshit. Pick a vibe!\n├ \n├ 📌 Usage: ${prefix}antiforeign on | ${prefix}antiforeign off`) }, { quoted: fq });
      } else {
    const _msg = generateWAMessageFromContent(
            m.chat,
            {
                interactiveMessage: {
                    body: { text: formatStylishReply("ANTIFOREIGN", `Antiforeign's ${isEnabled ? 'ON' : 'OFF'} in this group, dipshit. Pick a vibe!\n├ \n├ 📌 Usage: ${prefix}antiforeign on | ${prefix}antiforeign off`) },
                    footer: { text: '' },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Choose an option',
                                    sections: [{
                                        rows: [
                                                                                                    { title: 'ON ✅', id: `${prefix}antiforeign on` },
                                                            { title: 'OFF ❌', id: `${prefix}antiforeign off` }
                                        ]
                                    }]
                                })
                            }
                        ]
                    }
                }
            },
            { quoted: fq }
          );
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

          await client.relayMessage(m.chat, _msg.message, { messageId: _msg.key.id });
      }
    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      console.error('[Antiforeign] Error in command:', error);
      await client.sendMessage(m.chat, { text: formatStylishReply("ANTIFOREIGN", "Shit broke, couldn't mess with antiforeign. Database or something's fucked. Try later.") }, { quoted: fq });
    }
  });
};
