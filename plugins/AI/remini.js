import { uploadToUrl } from '../../lib/toUrl.js';
  import { enhanceImage } from '../../lib/toxicApi.js';
  import { getFakeQuoted } from '../../lib/fakeQuoted.js';

  export default async (context) => {
      const { client, m } = context;
      const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      const quoted = m.quoted ? m.quoted : m;
      const mime = quoted.mimetype || m.mimetype || '';

      if (!/image/.test(mime)) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Mɪssɪɴɢ Iᴍᴀɢᴇ ≪───\n├ \n├ Give me an image you dumbass\n├ Reply to an image first\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞᠊ʀᴇᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      try {
          const media = await quoted.download();
          const imgUrl = await uploadToUrl(media);
          const resultUrl = await enhanceImage(imgUrl);

          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          await client.sendMessage(m.chat, {
              image: { url: resultUrl },
              caption: `╭───(    TOXIC-MD    )───\n├───≫ Eɴʜᴀɴᴄᴇᴅ Iᴍᴀɢᴇ ≪───\n├ \n├ Your shitty image is now HD.\n├ Still looks like garbage though.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞᠊ʀᴇᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
          }, { quoted: fq });
      } catch {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Fᴀɪʟᴇᴅ ≪───\n├ \n├ Enhancement failed. Try again.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞᠊ʀᴇᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
  };
  