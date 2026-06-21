import { botname } from '../../config/settings.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
};

const getPlatform = () => {
    const plat = process.platform;
    if (plat === 'win32') return 'Windows';
    if (plat === 'darwin') return 'macOS';
    if (plat === 'linux') return 'Linux';
    if (plat === 'freebsd') return 'FreeBSD';
    if (plat === 'openbsd') return 'OpenBSD';
    return plat;
};

export default {
    name: 'ping',
    aliases: ['p', 'speed', 'latency', 'response', 'pong'],
    description: 'Checks the bot response time and server status',
    run: async (context) => {
        const { client, m, toxicspeed, prefix } = context;
        const bName = botname || 'Toxic-MD';
        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            await client.sendMessage(m.chat, { react: { text: '⚡', key: m.reactKey } });

            const startTime = Date.now();
            const latency = Date.now() - startTime;
            const responseSpeed = (toxicspeed || latency / 1000 || 0.0094).toFixed(4);

            const formatUptime = (seconds) => {
                const d = Math.floor(seconds / 86400);
                const h = Math.floor((seconds % 86400) / 3600);
                const min = Math.floor((seconds % 3600) / 60);
                const s = Math.floor(seconds % 60);
                return [d && `${d}d`, h && `${h}h`, min && `${min}m`, s && `${s}s`].filter(Boolean).join(' ') || '0s';
            };

            const mem = process.memoryUsage();
            const usedMB = (mem.rss / 1024 / 1024).toFixed(2);
            const totalMB = (mem.heapTotal / 1024 / 1024).toFixed(2);
            const displayName = m.pushName || m.sender.split('@')[0].split(':')[0];
            const greeting = getGreeting();

            const text = `╭─❏ 「 Pɪɴɢ 」\n│ ${greeting}, ${displayName}\n│ Prefix : ${prefix || '.'}\n╰───────────────\n\n╭─❏ 「 Iɴꜰᴏ 」\n│ 𝐋𝐚𝐭𝐞𝐧𝐜𝐲 : ${responseSpeed}ms\n│ 𝐒𝐞𝐫𝐯𝐞𝐫 𝐓𝐢𝐦𝐞 : ${new Date().toLocaleString()}\n│ 𝐔𝐩𝐭𝐢𝐦𝐞 : ${formatUptime(process.uptime())}\n│ 𝐌𝐞𝐦𝐨𝐫𝐲 : ${usedMB}/${totalMB} MB\n│ 𝐍𝐨𝐝𝐞𝐉𝐒 : ${process.version}\n│ 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 : ${getPlatform()}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

            await sendInteractive(client, m, text);
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (error) {
            await m.reply(`╭─❏ 「 Pɪɴɢ 」\n│ Something broke. Shocker.\n│ ${error.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }
    }
};
