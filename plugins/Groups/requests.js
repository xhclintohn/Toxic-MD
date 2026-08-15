import middleware from '../../utils/botUtil/middleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

export default async (context) => {
    await middleware(context, async () => {
        const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });


const response = await client.groupRequestParticipantsList(m.chat);

if (response.length === 0) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return m.reply(`╭─❏ 「 REQUESTS」\n│ There are no pending join requests.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
}

let jids = ''; 

response.forEach((participant, index) => {
    jids +='+' + participant.jid.split('@')[0];
    if (index < response.length - 1) {
        jids += '\n│ '; 
    }
});

 sendInteractive(client, m, `╭─❏ 「 PENDING REQUESTS」
│ ${jids}\n│ \n│ Use .approve-all or .reject-all\n│ to handle these join requests.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`); 


})

}
