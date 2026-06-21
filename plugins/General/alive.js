import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { botname } from '../../config/settings.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { getGreeting } from '../../lib/language.js';

const getTimeGreeting = () => {
    try { return getGreeting(); } catch {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 21) return 'Good evening';
        return 'Good night';
    }
};

export default {
  name: 'alive',
  aliases: ['bot', 'test', 'isalive', 'status'],
  description: 'Checks if the bot is alive and running',
  run: async (context) => {
    const { client, m, prefix, pict } = context;
    client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    const bName = botname || 'Toxic-MD';
    const greeting = getTimeGreeting();

    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const mins = Math.floor((uptime % 3600) / 60);
      const secs = Math.floor(uptime % 60);
      const uptimeStr = `${days}d ${hours}h ${mins}m ${secs}s`;

      const caption = `╭─❏ 「 I'ᴍ Aʟɪᴠᴇ」\n│ ${greeting}, @${m.sender.split('@')[0]}!\n│ I'm up and running.\n│ Been alive for ${uptimeStr}.\n│ Type *${prefix}menu* if you need\n│ help, which you probably do.\n╰───────────────`;

      try {
        if (pict && Buffer.isBuffer(pict)) {
          await client.sendMessage(m.chat, { image: pict, caption: caption, mentions: [m.sender] });
        } else {
          await client.sendMessage(m.chat, { text: caption, mentions: [m.sender] });
        }
      } catch {
        await client.sendMessage(m.chat, { text: caption, mentions: [m.sender] }).catch(() => {});
      }
      client.sendMessage(m.chat, { react: { text: '🤖', key: m.reactKey } }).catch(() => {});

      const possibleAudioPaths = [
        path.join(__dirname, '..', 'xh_clinton', 'test.mp3'),
        path.join(process.cwd(), 'xh_clinton', 'test.mp3'),
        path.join(__dirname, 'xh_clinton', 'test.mp3'),
      ];

      for (const audioPath of possibleAudioPaths) {
        try {
          if (fs.existsSync(audioPath)) {
            await client.sendMessage(m.chat, {
              audio: { url: audioPath },
              ptt: true,
              mimetype: 'audio/mpeg',
              fileName: 'toxic-alive.mp3'
            });
            break;
          }
        } catch (err) {}
      }

    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      await sendInteractive(client, m, `╭─❏ 「 Cʀᴀsʜᴇᴅ」\n│ Something broke, @${m.sender.split('@')[0].split(':')[0]}.\n│ Error: ${error.message}\n│ Try again when I feel like it.\n╰───────────────`);
    }
  }
};
