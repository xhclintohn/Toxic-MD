import { DateTime } from 'luxon';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getSettings } from '../../lib/fastSettings.js';
import effectsMod from '../../plugins/Effects/effects.js';

export default {
    name: 'logomenu',
    aliases: ['effectsmenu', 'effectslist', 'logolist'],
    description: 'Displays all available logo & effects commands',
    run: async (context) => {
        const { client, m } = context;
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

        let effectCommands = [];
        try {
            const list = Array.isArray(effectsMod) ? effectsMod : [];
            for (const cmd of list) {
                if (cmd && cmd.name) effectCommands.push(cmd.name);
            }
        } catch (e) {}

        const dt = DateTime.now();
        let menuText = `╭───(    TOXIC-MD    )───\n├───≫ EFFECTS & LOGO MENU ≪───\n├ \n├ Prefix: ${effectivePrefix || 'None'}\n├ Total: ${effectCommands.length} effects\n├ Time: ${dt.toFormat('HH:mm')}\n├ \n`;

        for (const name of effectCommands) {
            menuText += `├ *${toFancyFont(name)}*\n`;
        }

        menuText += `╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        await client.sendMessage(m.chat, { text: menuText }, { quoted: fq });
    }
};
