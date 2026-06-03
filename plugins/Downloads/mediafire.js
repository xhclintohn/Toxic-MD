import axios from 'axios';
import * as cheerio from 'cheerio';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
export default async (context) => {

const { client, m, text, botname  } = context;
const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });


async function MediaFire(url, options) {
  try {
    let mime;
    options = options ? options : {};
    const res = await axios.get(url, options);
    const $ = cheerio.load(res.data);
    const hasil = [];
    const link = $('a#downloadButton').attr('href');
    const size = $('a#downloadButton').text().replace('Download', '').replace('(', '').replace(')', '').replace('\n', '').replace('\n', '').replace('                         ', '');
    const seplit = link.split('/');
    const nama = seplit[5];
    mime = nama.split('.');
    mime = mime[1];
    hasil.push({ nama, mime, size, link });
    return hasil;
  } catch (err) {
    return err;
  }
}

if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return m.reply("╭───(    TOXIC-MD    )───\n├ Provide a MediaFire link, you lazy bum!\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
}

if (!text.includes('mediafire.com')) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return m.reply("╭───(    TOXIC-MD    )───\n├ That doesn't look like a MediaFire link, genius.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
    }


await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

try {

        const fileInfo = await MediaFire(text);



if (!fileInfo || !fileInfo.length) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return m.reply("╭───(    TOXIC-MD    )───\n├ File no longer exists on MediaFire. Too slow!\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧");
}






        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

        await client.sendMessage(
            m.chat,
            {
                document: {
                    url: fileInfo[0].link,
                },
                fileName: fileInfo[0].nama,
                mimetype: fileInfo[0].mime,
                caption: `╭───(    TOXIC-MD    )───\n├───≫ MEDIAFIRE DL ≪───\n├ \n├ File: ${fileInfo[0].nama}\n├ Downloaded by ${botname}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`, 
            },
            { quoted: fq }


   );

} catch (error) {

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        m.reply(`╭───(    TOXIC-MD    )───\n├───≫ MEDIAFIRE ERROR ≪───\n├ \n├ Download failed, not my fault.\n├ ${error}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

}
