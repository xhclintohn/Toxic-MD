import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│\n${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        try {
            const allGroups = await client.groupFetchAllParticipating();
            const groups = Object.entries(allGroups).map(([id, meta], idx) => ({
                num: idx + 1,
                id,
                subject: meta.subject || id,
                count: meta.participants?.length || 0
            }));

            const sub = (args[0] || '').toLowerCase();

            if (sub === 'leave') {
                const raw = args.slice(1).join(' ').trim();

                if (!raw) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                    return sendInteractive(client, m, fmt('BOTGC LEAVE', [
                        '│ Usage:',
                        '│  .botgc leave all — leave all groups',
                        '│  .botgc leave 1 — leave group #1',
                        '│  .botgc leave 1,2,3 — leave multiple',
                        '│  .botgc leave 1 2 3 — also works',
                        '│',
                        '│ Use .botgc to see numbered list.'
                    ].join('\n')));
                }

                let toLeave = [];
                if (raw === 'all') {
                    toLeave = groups;
                } else {
                    const nums = raw.split(/[\s,]+/).map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
                    toLeave = groups.filter(g => nums.includes(g.num));
                    if (!toLeave.length) {
                        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                        return sendInteractive(client, m, fmt('BOTGC LEAVE', '│ No valid group numbers found.\n│ Use .botgc to see the numbered list.'));
                    }
                }

                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
                const results = { success: [], failed: [] };
                for (const g of toLeave) {
                    try {
                        await client.groupLeave(g.id);
                        results.success.push(g.subject);
                    } catch (e) {
                        results.failed.push({ name: g.subject, error: (e.message || '').slice(0, 60) });
                    }
                    await new Promise(r => setTimeout(r, 600));
                }

                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                let report = `│ ✅ Left: ${results.success.length}\n│ ❌ Failed: ${results.failed.length}`;
                if (results.success.length) {
                    report += '\n│';
                    for (const s of results.success) report += `\n│  ✅ ${s}`;
                }
                if (results.failed.length) {
                    report += '\n│';
                    for (const f of results.failed) report += `\n│  ❌ ${f.name}: ${f.error}`;
                }
                return sendInteractive(client, m, fmt('BOTGC LEAVE REPORT', report));
            }

            if (!groups.length) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                return sendInteractive(client, m, fmt('BOT GROUPS', '│ Bot is not in any groups.'));
            }

            let lines = `│ Total: ${groups.length}\n│`;
            for (const g of groups) {
                lines += `\n│ ${g.num}. ${g.subject}\n│    👥 ${g.count} members\n│    🔗 ${g.id}\n│`;
            }
            lines += '\n│\n│ 💡 Use .botgc leave <num> or .botgc leave all';

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            return sendInteractive(client, m, fmt('BOT GROUPS', lines));
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return sendInteractive(client, m, fmt('ERROR', `│ Error accessing bot groups.\n│ ${e.message}`));
        }
    });
};
