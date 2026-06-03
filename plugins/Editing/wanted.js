import { getFakeQuoted } from '../../lib/fakeQuoted.js';
let canvacord = null; try { canvacord = (await import("canvacord")).default ?? (await import("canvacord")); } catch {}

export default async (context) => {
        const { client, m, Tag, botname } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

let cap = `╭───(    TOXIC-MD    )───\n├───≫ WANTED ≪───\n├ \n├ Converted By ${botname}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

try {

        if (m.quoted) {
            try {
                img = await client.profilePictureUrl(m.quoted.sender, 'image')
            } catch {
                img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg"
            }
                        result = await canvacord.Canvacord.wanted(img);
        } else if (Tag) {
            try {
                ppuser = await client.profilePictureUrl(Tag[0] || m.sender, 'image')
            } catch {
                ppuser = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg'
            }
                        result = await canvacord.Canvacord.wanted(ppuser);
        } 


        await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: fq });
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

} catch (e) {

await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
m.reply('╭───(    TOXIC-MD    )───\n├───≫ ERROR ≪───\n├ \n├ Something wrong occured.\n├ Try again, loser.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧')

}
    }