import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import os from 'os';

export default {
    name: 'devpanel',
    aliases: ['devinfo', 'sysinfo', 'ownerpanel', 'botstats-dev'],
    description: 'Developer/owner/sudo-only system health panel',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, isDev, isSudo, itsMe, Owner, botNumber, settings } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

            try {
                const mem = process.memoryUsage();
                const usedMB = (mem.rss / 1024 / 1024).toFixed(1);
                const heapMB = (mem.heapUsed / 1024 / 1024).toFixed(1);
                const uptime = process.uptime();
                const d = Math.floor(uptime / 86400);
                const h = Math.floor((uptime % 86400) / 3600);
                const min = Math.floor((uptime % 3600) / 60);
                const s = Math.floor(uptime % 60);
                const crm = global.crmstore?.getStats?.() || {};
                const role = itsMe ? 'BOT' : (isDev ? 'DEV' : (isSudo ? 'SUDO' : (Owner ? 'OWNER' : 'USER')));

                const body =
`╭─❏ 「 DEVPANEL 」
│ Role: *${role}*
│ Bot: ${botNumber || client.user?.id || 'n/a'}
│ Node: ${process.version}
│ Platform: ${os.platform()} ${os.arch()}
│ Uptime: ${d}d ${h}h ${min}m ${s}s
│ RAM: ${usedMB}MB (heap ${heapMB}MB)
│ Prefix: ${settings?.prefix || '(none)'}
│ CRM: ${crm.backend || 'json'} · msgs ${crm.messages ?? crm.totalMessages ?? 0}
│ Host: ${os.hostname()}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

                await sendInteractive(client, m, body);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                await sendInteractive(client, m, `╭─❏ 「 DEVPANEL 」\n│ Failed: ${e?.message || e}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }
        });
    }
};
