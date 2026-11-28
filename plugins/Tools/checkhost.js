import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

export default {
  name: 'checkhost',
  aliases: ['cekhost', 'check'],
  description: 'Check if a website/host is up (check-host.net)',
  run: async (context) => {
    const { client, m, text } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('CHECK HOST', 'Give me a host or URL.\n│ Example: .checkhost google.com'));
    }

    try {
      let host = text.trim();
      if (!/^https?:\/\//i.test(host)) host = `https://${host}`;

      const startRes = await fetch(`https://check-host.net/check-http?host=${encodeURIComponent(host)}&max_nodes=5`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(20000)
      });
      const start = await startRes.json();
      if (!start.request_id) throw new Error(start.error || 'check-host rejected the request');

      let results = null;
      for (let i = 0; i < 6; i++) {
        await sleep(3000);
        const res = await fetch(`https://check-host.net/check-result/${start.request_id}`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(20000)
        });
        results = await res.json();
        const pending = Object.values(results).some(v => v === null);
        if (!pending) break;
      }

      const lines = [];
      for (const [node, v] of Object.entries(results || {})) {
        if (!v) { lines.push(`${node}: pending`); continue; }
        const first = Array.isArray(v) ? v[0] : v;
        if (Array.isArray(first)) {
          const [ok, time, status] = first;
          lines.push(`${node}: ${ok ? 'UP' : 'DOWN'} ${status || ''} ${time ? `(${Number(time).toFixed(2)}s)` : ''}`.trim());
        } else {
          lines.push(`${node}: ${JSON.stringify(first).slice(0, 60)}`);
        }
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('CHECK HOST', `Host: ${host}\n│ ${lines.join('\n│ ')}`));
    } catch (e) {
      console.error('cekhost error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('CHECK HOST', `Failed: ${e.message || e}`));
    }
  }
};
