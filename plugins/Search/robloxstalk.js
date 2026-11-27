import { sendInteractive } from '../../lib/sendInteractive.js';
import { nexrayGet } from '../../lib/downloaderChain.js';

export default async (context) => {
  const { client, m, text, prefix } = context;
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
  const fmt = (msg) => `╭─❏ 「 ROBLOX PROFILE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
  if (!text) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt(`Example: ${prefix}robloxstalk username`));
  }
  try {
    const username = text.trim();
    const d = await nexrayGet('/stalker/roblox', { username });
    if (!d) throw new Error('profile not found');
    const basic = d.basic || d;
    const presence = d.presence?.userPresences?.[0] || {};
    const statusMap = { 0: 'Offline', 1: 'Online', 2: 'In Game', 3: 'In Studio' };
    const lines = [
      `🎮 Name: ${basic.name || '-'}`,
      `│ Display: ${basic.displayName || '-'}`,
      `│ User ID: ${basic.id || d.userId || '-'}`,
      `│ Verified: ${basic.hasVerifiedBadge ? 'Yes' : 'No'}`,
      `│ Banned: ${basic.isBanned ? 'Yes' : 'No'}`,
      `│ Created: ${basic.created || '-'}`,
      `│ Status: ${statusMap[presence.userPresenceType] || 'Offline'}`,
      `│ Bio: ${(basic.description || '-').slice(0, 200)}`
    ].join('\n');
    await sendInteractive(client, m, fmt(lines));
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
  } catch (e) {
    console.error('robloxstalk error:', e);
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
    sendInteractive(client, m, fmt(`Failed: ${e.message}`));
  }
};
