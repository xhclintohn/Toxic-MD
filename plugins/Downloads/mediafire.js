import axios from 'axios';
import * as cheerio from 'cheerio';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { resolveMediafire, tryChain } from '../../lib/downloaderChain.js';

async function scrapeMediaFire(url) {
  const res = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(res.data);
  const link = $('a#downloadButton').attr('href');
  if (!link) throw new Error('download button not found');
  const size = $('a#downloadButton').text().replace('Download', '').replace(/[()\n]/g, '').trim();
  const nama = link.split('/')[5] || 'mediafire-file';
  return { link, name: nama, size };
}

export default async (context) => {
  const { client, m, text, botname } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 MEDIAFIRE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt('Provide a MediaFire link!'));
  }
  if (!text.includes('mediafire.com')) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt("That doesn't look like a MediaFire link."));
  }

  try {
    const file = await tryChain('MediaFire', [
      () => resolveMediafire(text.trim()),
      () => scrapeMediaFire(text.trim())
    ]);
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    await client.sendMessage(m.chat, {
      document: { url: file.link },
      fileName: file.name,
      mimetype: 'application/octet-stream',
      caption: `╭─❏ 「 MEDIAFIRE DL」\n│ File: ${file.name}${file.size ? `\n│ Size: ${file.size}` : ''}\n│ Downloaded by ${botname || 'Toxic-MD'}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
    });
  } catch (error) {
    console.error('mediafire error:', error);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Download failed.\n│ ${error.message || error}`));
  }
};
