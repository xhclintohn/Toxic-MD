import { sendInteractive } from '../../lib/sendInteractive.js';

const box = (title, body) => `╭─❏ 「 ${title}」\n│ ${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

async function removalAi(buffer) {
  const homeRes = await fetch('https://removal.ai/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
    signal: AbortSignal.timeout(30000)
  });
  const homeHtml = await homeRes.text();
  const nonces = [...new Set([...homeHtml.matchAll(/security["']?\s*[:=]\s*["']([a-f0-9]{10})["']/g)].map(m => m[1]))];
  if (!nonces.length) nonces.push('d82109f663');

  let token = null;
  for (const nonce of nonces) {
    try {
      const tokenRes = await fetch(`https://removal.ai/wp-admin/admin-ajax.php?action=ajax_get_webtoken&security=${nonce}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        signal: AbortSignal.timeout(30000)
      });
      const tokenData = await tokenRes.json().catch(() => null);
      if (tokenData?.data?.webtoken) { token = tokenData.data.webtoken; break; }
    } catch {}
  }
  if (!token) throw new Error('Could not get removal token');

  const form = new FormData();
  form.append('image_file', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');

  const res = await fetch('https://api.removal.ai/3.0/remove', {
    method: 'POST',
    headers: { 'Web-Token': token },
    body: form,
    signal: AbortSignal.timeout(90000)
  });
  const json = await res.json();
  if (!json.url) throw new Error(json.message || json.error || 'Background removal failed');

  const img = await fetch(json.url, { signal: AbortSignal.timeout(30000) });
  if (!img.ok) throw new Error(`Result download HTTP ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

export default {
  name: 'removebg',
  aliases: ['nobg', 'rmbg', 'transparent', 'removebackground'],
  description: 'Remove the background from an image',
  run: async (context) => {
    const { client, m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

    const quoted = m.quoted ? m.quoted : m;
    const mime = quoted.mimetype || m.mimetype || '';
    if (!/image/.test(mime)) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('REMOVE BG', 'Reply to an image first.'));
    }

    try {
      const media = await quoted.download();
      const result = await removalAi(media);

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      await client.sendMessage(m.chat, {
        image: result,
        mimetype: 'image/png',
        caption: box('REMOVE BG', 'Background removed!')
      });
    } catch (e) {
      console.error('removebg error:', e);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return sendInteractive(client, m, box('REMOVE BG', `Failed: ${e.message || e}`));
    }
  }
};
