import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

const EFFECT_CMDS = [
    'glossysilver','glitchtext','advancedglow','neonglitch','gradienttext','glowingtext',
    'luxurygold','multicolored','galaxytext','makingneon','writetext','underwater',
    'pixelglitch','summerbeach','papercut','cloudtext','gradientlogo','galaxylogo',
    'colorfulneon','greenneon','1917text','texteffect','lighteffect','bearlogo',
    'typography','hackerneon','blackpinklogo','blackpinkstyle','erasertext','cartoonstyle'
];

export default {
    name: 'effectsmenu',
    aliases: ['effectlist', 'fxmenu', 'texteffects'],
    description: 'Displays all text effect commands',
    run: async (context) => {
        const { client, m, pict, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const toFancyFont = (text) => {
            const fonts = {
                'a':'𝙖','b':'𝙗','c':'𝙘','d':'𝙙','e':'𝙚','f':'𝙛','g':'𝙜','h':'𝙝','i':'𝙞','j':'𝙟','k':'𝙠','l':'𝙡','m':'𝙢',
                'n':'𝙣','o':'𝙤','p':'𝙥','q':'𝙦','r':'𝙧','s':'𝙨','t':'𝙩','u':'𝙪','v':'𝙫','w':'𝙬','x':'𝙭','y':'𝙮','z':'𝙯',
                '1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','0':'0'
            };
            return text.toLowerCase().split('').map(c => fonts[c] || c).join('');
        };

        let menuText = `╭───(    TOXIC-MD    )───\n├───≫ EFFECTSMENU ≪───\n├ \n├ Use: ${prefix}<effect> YourText\n├ \n`;
        for (const cmd of EFFECT_CMDS) {
            menuText += `├ *${toFancyFont(cmd)}*\n`;
        }
        menuText += `╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        await client.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
                externalAdReply: {
                    title: 'TOXIC-MD — Text Effects',
                    body: '30 text effects. Go make something ugly.',
                    mediaType: 1,
                    thumbnail: pict,
                    sourceUrl: 'https://github.com/xhclintohn/Toxic-MD',
                    showAdAttribution: false,
                    renderLargerThumbnail: false,
                }
            }
        }, { quoted: fq });
    }
};
