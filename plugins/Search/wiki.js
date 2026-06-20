import wiki from 'wikipedia';
import { sendInteractive } from '../../lib/sendInteractive.js';
export default async (context) => {

const { client, m, text } = context;
await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });




        try {
            if (!text) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 USAGE 」
│ Provide a term to search, you lazy fool.\n│ E.g: What is JavaScript!\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`)
            }
            const con = await wiki.summary(text);
            const texa = `╭─❏ 「 WIKIPEDIA」
│ Title: ${con.title}\n│ Desc: ${con.description}\n│ \n│ Summary: ${con.extract}\n│ \n│ URL: ${con.content_urls.mobile.page}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            sendInteractive(client, m, texa)
        } catch (err) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            console.log(err)
            return sendInteractive(client, m, `╭─❏ 「 WIKI 」
│ Got 404. Couldn't find anything, try harder.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`)
        }
    }
