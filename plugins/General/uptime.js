import { getFakeQuoted } from '../../lib/fakeQuoted.js';
export default async (context) => {
  const { client, m, text, botname } = context;
  const fq = getFakeQuoted(m);

  if (text) {
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
    return client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ What's with the extra crap, @${m.sender.split('@')[0].split(':')[0]}?\n├ Just say !uptime, dumbass.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq, mentions: [m.sender] });
  }

  try {
    const formatUptime = (seconds) => {
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      const daysDisplay = days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}, ` : '';
      const hoursDisplay = hours > 0 ? `${hours} ${hours === 1 ? 'hour' : 'hours'}, ` : '';
      const minutesDisplay = minutes > 0 ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}, ` : '';
      const secsDisplay = secs > 0 ? `${secs} ${secs === 1 ? 'second' : 'seconds'}` : '';

      return (daysDisplay + hoursDisplay + minutesDisplay + secsDisplay).replace(/,\s*$/, '');
    };

    const uptimeText = formatUptime(process.uptime());
    const replyText = `╭───(    TOXIC-MD    )───\n├───≫ Uᴘᴛɪᴍᴇ ≪───\n├ \n├ *${botname || 'Toxic-MD'} Uptime, Bitches*\n├ \n├ I've been awake for *${uptimeText}*,\n├ running shit like a boss.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

    await client.sendMessage(m.chat, { text: replyText }, { quoted: fq });
  } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    console.error('Error in uptime command:', error);
    await client.sendMessage(m.chat, { text: `╭───(    TOXIC-MD    )───\n├───≫ Eʀʀᴏʀ ≪───\n├ \n├ Something's fucked up with the\n├ uptime check. Try again later, loser.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` }, { quoted: fq });
  }
};
