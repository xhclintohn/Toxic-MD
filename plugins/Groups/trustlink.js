import { getTrustedLinks, addTrustedLink, removeTrustedLink } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

function normalizeDomain(raw) {
    try {
        const u = raw.startsWith('http') ? new URL(raw) : new URL('https://' + raw);
        return u.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
        return raw.toLowerCase().replace(/^www\./, '');
    }
}

export default [
    {
        name: 'trustlink',
        aliases: ['addtrustedlink', 'allowlink', 'whitelistlink'],
        description: 'Add a domain/link to the antilink trusted (whitelist) list for this group',
        run: async (context) => {
            await ownerMiddleware(context, async () => {
                const { client, m, text, isGroup, prefix } = context;
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

                if (!isGroup) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("TRUSTLINK", "Group only command."));
                }

                if (!text || text.trim() === '') {
                    const trusted = await getTrustedLinks(m.chat);
                    await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(() => {});
                    if (!trusted || trusted.length === 0) {
                        return sendInteractive(client, m, fmt("TRUSTLINK", `No trusted links set.\n│ Usage: ${prefix}trustlink <domain>\n│ Example: ${prefix}trustlink youtube.com`));
                    }
                    const list = trusted.map((d, i) => `${i + 1}. ${d}`).join('\n│ ');
                    return sendInteractive(client, m, fmt("TRUSTED LINKS", `${trusted.length} trusted domain(s):\n│ ${list}\n│ \n│ Add: ${prefix}trustlink <domain>\n│ Remove: ${prefix}untrustlink <domain>`));
                }

                const domain = normalizeDomain(text.trim());
                if (!domain || domain.length < 3) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("TRUSTLINK", "That doesn't look like a valid domain."));
                }

                const trusted = await getTrustedLinks(m.chat);
                if (trusted.includes(domain)) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("TRUSTLINK", `\`${domain}\` is already trusted.`));
                }

                await addTrustedLink(m.chat, domain);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("TRUSTLINK", `\`${domain}\` added to trusted links.\n│ Antilink will now allow this domain.`));
            });
        }
    },
    {
        name: 'untrustlink',
        aliases: ['removetrustedlink', 'disallowlink', 'unwhitelistlink'],
        description: 'Remove a domain from the antilink trusted list for this group',
        run: async (context) => {
            await ownerMiddleware(context, async () => {
                const { client, m, text, isGroup, prefix } = context;
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

                if (!isGroup) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("UNTRUSTLINK", "Group only command."));
                }

                if (!text || text.trim() === '') {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("UNTRUSTLINK", `Usage: ${prefix}untrustlink <domain>`));
                }

                const domain = normalizeDomain(text.trim());
                const trusted = await getTrustedLinks(m.chat);
                if (!trusted.includes(domain)) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("UNTRUSTLINK", `\`${domain}\` is not in the trusted list.`));
                }

                await removeTrustedLink(m.chat, domain);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt("UNTRUSTLINK", `\`${domain}\` removed from trusted links.`));
            });
        }
    },
    {
        name: 'trustlist',
        aliases: ['listtrusted', 'trustedlinks', 'allowedlinks'],
        description: 'Show all trusted domains for this group\'s antilink',
        run: async (context) => {
            await ownerMiddleware(context, async () => {
                const { client, m, isGroup, prefix } = context;
                await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

                if (!isGroup) {
                    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt("TRUSTLIST", "Group only command."));
                }

                const trusted = await getTrustedLinks(m.chat);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                if (!trusted || trusted.length === 0) {
                    return sendInteractive(client, m, fmt("TRUSTED LINKS", `No trusted links set.\n│ Add one: ${prefix}trustlink <domain>`));
                }
                const list = trusted.map((d, i) => `${i + 1}. ${d}`).join('\n│ ');
                return sendInteractive(client, m, fmt("TRUSTED LINKS", `${trusted.length} trusted domain(s):\n│ ${list}`));
            });
        }
    }
];
