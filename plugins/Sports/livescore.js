import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveLeague, leagueHelp, getScoreboard, getFixtures, formatMatch } from '../../lib/sportsApi.js';

export default {
    name: 'livescore',
    aliases: ['scores', 'score', 'live'],
    description: 'Live scores and today\'s matches for a league',
    run: async (context) => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            const league = resolveLeague((text || '').trim());
            if (!league) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 LIVE SCORE」
│ Unknown league. Try one of these:\n│ ${leagueHelp()}\n│ Example: .livescore epl\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const matches = await getScoreboard(league);
            if (!matches.length) {
                const next = await getFixtures(league);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                let body = `│ No ${league.name} matches today.\n`;
                if (next.length) {
                    body += `│ Next up:\n`;
                    next.slice(0, 5).forEach(mt => { body += `│ ${formatMatch(mt)}\n`; });
                }
                return sendInteractive(client, m, `╭─❏ 「 LIVE SCORE」
${body}╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const order = { in: 0, pre: 1, post: 2 };
            matches.sort((a, b) => (order[a.state] ?? 1) - (order[b.state] ?? 1));
            let body = `│ ${league.name}\n│ \n`;
            matches.slice(0, 15).forEach(mt => { body += `│ ${formatMatch(mt)}\n`; });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 LIVE SCORE」
${body}╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        } catch (err) {
            console.error('LiveScore error:', err.message);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 LIVE SCORE」
│ Scores are unreachable right now.\n│ Try again in a bit.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
