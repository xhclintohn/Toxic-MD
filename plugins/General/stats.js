import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { getSudoUsers, getBannedUsers } from '../../database/config.js';
import { commands } from '../../handlers/commandHandler.js';
import { botname } from '../../config/settings.js';

function detectPlatform() {
    if (process.env.DYNO)                                              return 'Heroku 🟣';
    if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) return 'Railway 🚂';
    if (process.env.RENDER)                                            return 'Render 🔵';
    if (process.env.REPLIT_DEPLOYMENT || process.env.REPL_ID)         return 'Replit 🌀';
    if (process.env.FLY_APP_NAME)                                      return 'Fly.io 🪰';
    if (process.env.KOYEB_SERVICE_ID)                                  return 'Koyeb ⚡';
    if (process.env.K_SERVICE || process.env.FUNCTION_TARGET)          return 'Google Cloud ☁️';
    if (process.env.AWS_LAMBDA_FUNCTION_NAME)                          return 'AWS Lambda λ';
    const os = process.platform;
    if (os === 'linux')  return 'VPS/Linux 🖥️';
    if (os === 'darwin') return 'macOS 🍎';
    if (os === 'win32')  return 'Windows 🪟';
    return `Local (${os}) 🖥️`;
}

function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(' ') || '0s';
}

export default {
    name: 'stats',
    aliases: ['stat', 'botstats', 'botstat', 'statistics', 'botinfo'],
    description: 'Displays full bot statistics and system info',
    run: async (context) => {
        const { client, m } = context;
        const fq = getFakeQuoted(m);
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const mem = process.memoryUsage();
            const usedMB = (mem.rss / 1024 / 1024).toFixed(1);
            const heapMB = (mem.heapUsed / 1024 / 1024).toFixed(1);
            const totalHeapMB = (mem.heapTotal / 1024 / 1024).toFixed(1);

            const uptime = formatUptime(process.uptime());
            const platform = detectPlatform();
            const bName = botname || 'Toxic-MD';

            const cmdCount = Object.keys(commands).length;
            const groupCount = global._toxicGroupMetaCache?.size ?? '?';

            const sudoUsers = await getSudoUsers().catch(() => []);
            const bannedUsers = await getBannedUsers().catch(() => []);

            const botNum = (client.user?.id || '').split('@')[0].split(':')[0];

            const text =
                `╭───(    TOXIC-MD    )───\n` +
                `├───≫ BOT STATS ≪───\n` +
                `├\n` +
                `├ 🤖 *Bot Name:* ${bName}\n` +
                `├ 📱 *Bot Number:* +${botNum}\n` +
                `├ ⏱ *Uptime:* ${uptime}\n` +
                `├\n` +
                `├───≫ System ≪───\n` +
                `├\n` +
                `├ 🧠 *RAM:* ${usedMB} MB used\n` +
                `├ 💾 *Heap:* ${heapMB}/${totalHeapMB} MB\n` +
                `├ 🖥️ *Platform:* ${platform}\n` +
                `├ 🟢 *Node.js:* ${process.version}\n` +
                `├\n` +
                `├───≫ Bot Data ≪───\n` +
                `├\n` +
                `├ 📋 *Commands:* ${cmdCount}\n` +
                `├ 👥 *Groups:* ${groupCount}\n` +
                `├ 🛡️ *Sudo Users:* ${sudoUsers.length}\n` +
                `├ 🚫 *Banned Users:* ${bannedUsers.length}\n` +
                `├\n` +
                `╰──────────────────☉\n` +
                `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

            await client.sendMessage(m.chat, { react: { text: '📊', key: m.reactKey } });
            await client.sendMessage(m.chat, { text }, { quoted: fq });
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await m.reply(`╭───(    TOXIC-MD    )───\n├───≫ STATS ERROR ≪───\n├ \n├ Something broke fetching stats.\n├ Error: ${e.message}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
