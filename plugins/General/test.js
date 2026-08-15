import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sendInteractive } from '../../lib/sendInteractive.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  name: 'test',
  aliases: ['tst', 'testcmd'],
  description: 'Sends a test voice note to check if you\'re worthy',
  run: async (context) => {
    const { client, m, botname, text } = context;

    if (text) {
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      return client.sendMessage(m.chat, { text: `╭─❏ 「 Eʀʀᴏʀ」
│ Yo, @${m.sender.split('@')[0].split(':')[0]}, what's this extra\n│ garbage? Just say .test, you clown.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { mentions: [m.sender] });
    }

    try {
      const possibleAudioPaths = [
        path.join(__dirname, 'xh_clinton', 'test.mp3'),
        path.join(process.cwd(), 'xh_clinton', 'test.mp3'),
        path.join(__dirname, '..', 'xh_clinton', 'test.mp3'),
      ];

      let audioPath = null;
      for (const possiblePath of possibleAudioPaths) {
        if (fs.existsSync(possiblePath)) {
          audioPath = possiblePath;
          break;
        }
      }

      if (audioPath) {
        console.log(`✅ Found audio file at: ${audioPath}`);
        await client.sendMessage(m.chat, {
          audio: { url: audioPath },
          ptt: true,
          mimetype: 'audio/mpeg',
          fileName: 'test.mp3'
        });
      } else {
        console.error('❌ Audio file not found at any of the following paths:', possibleAudioPaths);
        await sendInteractive(client, m, `╭─❏ 「 Fᴀɪʟᴇᴅ」
│ Shit, couldn't find test.mp3 in\n│ xh_clinton/. Fix your files, you slacker.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
      }
    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      console.error('Error in test command:', error);
      await sendInteractive(client, m, `╭─❏ 「 Eʀʀᴏʀ」
│ Yo, something fucked up the test\n│ audio. Try again later, dumbass.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }
  }
};
