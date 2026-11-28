import { sendInteractive } from '../../lib/sendInteractive.js';

  function fmt(n, unit) {
      return (n / 1024 / 1024).toFixed(1) + ' MB' + (unit ? ' ' + unit : '');
  }

  function bar(used, total, len = 20) {
      const fill = Math.round((used / total) * len);
      return '█'.repeat(fill) + '░'.repeat(len - fill) + ' ' + Math.round((used / total) * 100) + '%';
  }

  export default {
      name: 'memory',
      aliases: ['mem', 'botmemory', 'memorystats', 'ram', 'memstats', 'botstats'],
      description: 'Show bot memory usage',
      run: async (context) => {
          const { client, m } = context;
          const mu = process.memoryUsage();
          const upMs = process.uptime() * 1000;
          const days = Math.floor(upMs / 86400000);
          const hrs  = Math.floor((upMs % 86400000) / 3600000);
          const mins = Math.floor((upMs % 3600000) / 60000);
          const secs = Math.floor((upMs % 60000) / 1000);
          const uptimeStr = days ? days + 'd ' + hrs + 'h ' + mins + 'm' : hrs ? hrs + 'h ' + mins + 'm ' + secs + 's' : mins + 'm ' + secs + 's';

          const heapUsed  = (mu.heapUsed  / 1024 / 1024).toFixed(1);
          const heapTotal = (mu.heapTotal / 1024 / 1024).toFixed(1);
          const rss       = (mu.rss       / 1024 / 1024).toFixed(1);
          const external  = (mu.external  / 1024 / 1024).toFixed(1);

          const heapBar = bar(mu.heapUsed, mu.heapTotal);

          const msg =
              `╭─❏ 「 BOT MEMORY 」\n` +
              `│ 📦 Heap Used:  ${heapUsed} MB\n` +
              `│ 📊 Heap Total: ${heapTotal} MB\n` +
              `│ [${heapBar}]\n` +
              `│\n` +
              `│ 💾 RSS:        ${rss} MB\n` +
              `│ 🔌 External:   ${external} MB\n` +
              `│\n` +
              `│ ⏱ Uptime:     ${uptimeStr}\n` +
              `│ 🟢 Node:       ${process.version}\n` +
              `│ 💻 Platform:   ${process.platform}\n` +
              `╰───────────────\n` +
              `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

          await sendInteractive(client, m, msg);
      }
  };
  