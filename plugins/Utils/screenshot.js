import { getFakeQuoted } from '../../lib/fakeQuoted.js';
export default async (context) => {

const { client, m, text, botname } = context;
const fq = getFakeQuoted(m);
await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });



try {
let cap = `╭───(    TOXIC-MD    )───\n├───≫ SCREENSHOT ≪───\n├ \n├ Screenshot by ${botname}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`

if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return m.reply("╭───(    TOXIC-MD    )───\n├ Provide a website link to screenshot, moron.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧")
}

const image = `https://image.thum.io/get/fullpage/${text}`

await client.sendMessage(m.chat, { image: { url: image }, caption: cap}, { quoted: fq });


} catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});

m.reply("╭───(    TOXIC-MD    )───\n├ Screenshot failed. Probably your garbage link.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧")

}

}
