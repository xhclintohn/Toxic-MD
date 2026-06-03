import middleware from '../../utils/botUtil/middleware.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default async (context) => {
  await middleware(context, async () => {
    const { client, m, isBotAdmin, isAdmin } = context;
    const fq = getFakeQuoted(m);
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    if (!m.isGroup) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Yo, genius, this command's\n├ for groups. Quit embarrassing\n├ yourself.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    if (!isAdmin) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Pfft, you? Admin? Get real,\n├ loser. Only admins can do this.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    if (!isBotAdmin) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ I'm not admin, dipshit.\n├ Promote me or stop wasting\n├ my time.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    const responseList = await client.groupRequestParticipantsList(m.chat);

    if (responseList.length === 0) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ NO REQUESTS ≪───\n├ \n├ Wow, no one's dumb enough to\n├ wanna join this trash group.\n├ No requests to reject, moron.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    for (const participant of responseList) {
      try {
        const response = await client.groupRequestParticipantsUpdate(
          m.chat,
          [participant.jid],
          "reject"
        );
        console.log(response);
      } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        console.error('Error rejecting participant:', error);
        return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Screw-up alert! Couldn't reject\n├ @${participant.jid.split('@')[0]}.\n├ Fix your damn group, idiot.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`, { mentions: [participant.jid] });
      }
    }

    m.reply(`╭───(    TOXIC-MD    )───\n├───≫ REJECTED ≪───\n├ \n├ All those pathetic join requests?\n├ REJECTED. Go cry about it, losers.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
  });
};
