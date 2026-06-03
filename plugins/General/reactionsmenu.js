import fs from 'fs';
import { getSettings } from '../../database/config.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
  name: 'reactionsmenu',
  aliases: ['reactmenu', 'reactionlist'],
  description: 'Displays the reactions commands menu',
  run: async (context) => {
    const { client, m, pict } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const settings = await getSettings();
    const effectivePrefix = settings.prefix || '';

    const toFancyFont = (text) => {
      const fonts = {
        'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝙿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄', 'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈',
        'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍', 'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
        'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞', 'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢',
        'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧', 's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
      };
      return text.toLowerCase().split('').map(c => fonts[c] || c).join('');
    };

    let menuText = `╭───(    TOXIC-MD    )───\n├───≫ REACTIONS MENU ≪───\n├ \n├ Prefix: ${effectivePrefix || 'None'}\n├ \n`;

    const commandFiles = fs.readdirSync('./plugins/Reactions').filter(f => f.endsWith('.js') && f !== 'links.js');
    for (const file of commandFiles) {
      menuText += `├ *${toFancyFont(file.replace('.js', ''))}*\n`;
    }

    menuText += `╰──────────────────☉\n`;

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        await client.sendMessage(m.chat, { text: menuText }, { quoted: fq });
  }
};
