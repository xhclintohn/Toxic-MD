import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, text, Owner } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

  try {

      let getGroupzs = await client.groupFetchAllParticipating();
      let groupzs = Object.entries(getGroupzs)
          .slice(0)
          .map((entry) => entry[1]);
      let anaa = groupzs.map((v) => v.id);
      let jackhuh = `╭─❏ 「 BOT GROUPS」
`
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      const promises = anaa.map((i) => {
        return new Promise((resolve) => {
          client.groupMetadata(i).then((metadat) => {
            setTimeout(() => {
              jackhuh += `│ Subject: ${metadat.subject}\n`
              jackhuh += `│ Members: ${metadat.participants.length}\n`
              jackhuh += `│ Jid: ${i}\n│ \n`
              resolve()
            }, 500);
          })
        })
      })
      await Promise.all(promises)
      jackhuh += `╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      sendInteractive(client, m, jackhuh);

  } catch (e) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
    sendInteractive(client, m, `╭─❏ 「 ERROR」
│ Error occured while accessing\n│ bot groups.\n│ ${e}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`)
  }

  });
}
