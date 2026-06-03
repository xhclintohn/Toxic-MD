import { getAnime } from '../../lib/toxicApi.js';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

const ROASTS = [
    "Your WiFi password is probably 'password123'. Clown behaviour.",
    "You're the reason shampoo bottles say 'lather, rinse, repeat' — because some people need extra instructions.",
    "I've seen better decisions made by a coin flip.",
    "You type with one finger. That explains everything.",
    "Your personality has the energy of a dead phone battery.",
    "Even Google can't find a reason to be impressed by you.",
    "You're the human equivalent of a loading screen that never ends.",
    "People slow clap for you sarcastically and you think it's real.",
    "You peaked at birth, and even that's debatable.",
    "Your common sense must be on airplane mode — permanently.",
    "You could get lost in a one-room apartment.",
    "Your brain cells have a restraining order against each other.",
    "You're about as useful as a screen door on a submarine.",
    "You think 'lol' is a proper response to everything. Tragic.",
    "You're the type to reply 'k' and think you're deep.",
    "If stupidity had a mascot, it'd call in sick and send you instead.",
    "You're giving main character energy in a deleted scene.",
    "Your confidence is impressive considering your track record.",
    "You're a walking 'could've been' story.",
    "Even autocorrect gave up on fixing your messages.",
];

export default {
    name: 'roast',
    aliases: ['insult', 'savage', 'toxicroast', 'flame'],
    description: 'Roast someone (or yourself) with a savage line',
    run: async (context) => {
        const { client, m, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        const mentioned = m.mentionedJid?.length ? m.mentionedJid[0]
            : m.quoted?.sender ? m.quoted.sender
            : m.sender;
        const target = `@${mentioned.split('@')[0].split(':')[0]}`;
        const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        await client.sendMessage(m.chat, { react: { text: '🔥', key: m.reactKey } });
        await client.sendMessage(m.chat, {
            text: `╭───(    TOXIC-MD    )───\n├───≫ Rᴏᴀsᴛ ≪───\n├ \n├ 🎯 Target: ${target}\n├ \n├ ${roast}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`,
            mentions: [mentioned]
        }, { quoted: fq });
    }
};
