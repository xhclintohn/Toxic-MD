import { uploadToUrl } from '../../lib/toUrl.js';
  import { makeRC } from '../../lib/toxicApi.js';
    import { getSettings } from '../../database/config.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

  export default {
      name: 'rc',
      aliases: ['airc', 'rcedit'],
      description: 'AI image edit using RC model',
      category: 'Editing',
      run: async (context) => {
          const { client, m } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
          const settings = await getSettings();
          const prefix = settings.prefix || '.';

          const quoted = m.quoted ? m.quoted : null;
          const mime = quoted?.mimetype || '';
          const prompt = (m.text || '').replace(/^\S+\s*/, '').trim();

          if (!quoted || !/image/.test(mime)) {
              return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Reply to an image with a prompt.\n│ Example: ${prefix}rc make it look like night\n╰───────────────\n> ©𝐏𝐨𝐰𝐞᠊ʀᴇᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
          }

          if (!prompt) {
              return sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Tell me what to do with the image.\n│ Example: ${prefix}rc make it look like night\n╰───────────────\n> ©𝐏𝐨𝐰𝐞᠊ʀᴇᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
          }

          await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

          try {
              const media = await quoted.download();
              const imgUrl = await uploadToUrl(media);
              const resultUrl = await makeRC(imgUrl, prompt);

              await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
              await client.sendMessage(m.chat, {
                  image: { url: resultUrl },
                  caption: `╭─❏ 「 RC Eᴅɪᴛ」
│ Prompt: ${prompt}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞᠊ʀᴇᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
              });
          } catch {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
              await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ RC edit failed. Try again.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞᠊ʀᴇᴅ 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
          }
      }
  };
  