import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveLeague, leagueHelp, getFixtures, formatMatch } from '../../lib/sportsApi.js';

export default {
    name: 'fixtures',
    aliases: ['fixture', 'upcoming', 'nextmatches'],
    description: 'Upcoming fixtures for a league',
    run: async (context) => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            const league = resolveLeague((text || '').trim());
            if (!league) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 FIXTURES」
│ Unknown league. Try one of these:\n│ ${leagueHelp()}\n│ Example: .fixtures kpl\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const matches = await getFixtures(league);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            if (!matches.length) {
                return sendInteractive(client, m, `╭─❏ 「 FIXTURES」
│ No upcoming ${league.name} fixtures found.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            let body = `│ ${league.name}\n│ \n`;
            matches.slice(0, 12).forEach(mt => { body += `│ ${formatMatch(mt)}\n`; });
            return sendInteractive(client, m, `╭─❏ 「 FIXTURES」
${body}╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch (err) {
            console.error('Fixtures error:', err.message);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 FIXTURES」
│ Fixtures are unreachable right now.\n│ Try again in a bit.\n╰───────────────\n> ©𝐏𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
