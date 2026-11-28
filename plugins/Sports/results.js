import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveLeague, leagueHelp, getResults, formatMatch } from '../../lib/sportsApi.js';

export default {
    name: 'results',
    aliases: ['result', 'lastresults'],
    description: 'Recent results for a league',
    run: async (context) => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            const league = resolveLeague((text || '').trim());
            if (!league) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 RESULTS」
│ Unknown league. Try one of these:\n│ ${leagueHelp()}\n│ Example: .results laliga\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const matches = await getResults(league);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            if (!matches.length) {
                return sendInteractive(client, m, `╭─❏ 「 RESULTS」
│ No recent ${league.name} results found.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            let body = `│ ${league.name}\n│ \n`;
            matches.slice(0, 12).forEach(mt => { body += `│ ${formatMatch(mt)}\n`; });
            return sendInteractive(client, m, `╭─❏ 「 RESULTS」
${body}╰───────────────\n> ©𝐏𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch (err) {
            console.error('Results error:', err.message);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 RESULTS」
│ Results are unreachable right now.\n│ Try again in a bit.\n╰───────────────\n> ©𝐏𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
