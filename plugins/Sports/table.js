import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveLeague, leagueHelp, getTable } from '../../lib/sportsApi.js';

const num = (v) => (v === null || v === undefined ? '-' : String(v));
const gdText = (v) => {
    if (v === null || v === undefined) return '-';
    const n = Number(v);
    return n > 0 ? `+${n}` : String(n);
};

function buildRows(rows) {
    const hasForm = rows.some(r => r.form);
    const heading = ['#', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'];
    if (hasForm) heading.push('Form');
    const out = [{ items: heading, isHeading: true }];
    for (const r of rows) {
        const items = [num(r.rank), r.team, num(r.played), num(r.wins), num(r.draws), num(r.losses), num(r.gf), num(r.ga), gdText(r.gd), num(r.points)];
        if (hasForm) items.push(r.form || '-');
        out.push({ items });
    }
    return out;
}

async function sendTableView(client, m, league, rows) {
    const content = {
        messageContextInfo: {
            threadId: [],
            deviceListMetadata: {
                senderKeyIndexes: [],
                recipientKeyIndexes: []
            },
            deviceListMetadataVersion: 2,
            botMetadata: {
                pluginMetadata: {},
                richResponseSourcesMetadata: {
                    sources: []
                }
            }
        },
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    submessages: [
                        {
                            messageType: 4,
                            tableMetadata: {
                                rows: buildRows(rows),
                                title: league.name
                            }
                        }
                    ],
                    messageType: 1,
                    unifiedResponse: {
                        data: "response/table//typenameGenAIMarkdownTextUXPrimitive//typenameGenAISingleLayoutViewMode"
                    },
                    contextInfo: {
                        mentionedJid: [],
                        groupMentions: [],
                        statusAttributions: [],
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: {
                            botJid: "867051314767696@bot"
                        },
                        forwardOrigin: 4
                    }
                }
            }
        }
    };
    await client.relayMessage(m.chat, content, {});
}

export default {
    name: 'table',
    aliases: ['standings', 'leaguetable'],
    description: 'League table / standings',
    run: async (context) => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        try {
            const league = resolveLeague((text || '').trim());
            if (!league || league.sport !== 'soccer') {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 TABLE」
│ Unknown league. Try one of these:\n│ ${leagueHelp()}\n│ Example: .table epl\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const rows = await getTable(league);
            if (!rows.length) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, `╭─❏ 「 TABLE」
│ No table available for ${league.name} right now.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            try {
                await sendTableView(client, m, league, rows.slice(0, 20));
            } catch (e) {
                console.error('Table view failed, using text:', e.message);
                let body = `│ ${league.name}\n│ # Team — P W D L GF GA GD Pts\n│ \n`;
                rows.slice(0, 20).forEach(r => {
                    body += `│ ${num(r.rank)} ${r.team} — ${num(r.played)} ${num(r.wins)} ${num(r.draws)} ${num(r.losses)} ${num(r.gf)} ${num(r.ga)} ${gdText(r.gd)} ${num(r.points)}\n`;
                });
                await sendInteractive(client, m, `╭─❏ 「 TABLE」
${body}╰───────────────\n> ©𝐏𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
        } catch (err) {
            console.error('Table error:', err.message);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, `╭─❏ 「 TABLE」
│ The table is unreachable right now.\n│ Try again in a bit.\n╰───────────────\n> ©𝐏𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
