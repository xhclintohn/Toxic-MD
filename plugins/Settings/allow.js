import { getSettings, getAllowedUsers, addAllowedUser, removeAllowedUser } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';

function cleanNumber(raw) {
    return (raw || '').replace(/[\s+\-().]/g, '').trim();
}

export default {
    name: 'allow',
    aliases: ['allowuser', 'allowai'],
    description: 'Allow specific numbers to use autoai when autoai is off',
    category: 'Settings',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const fmt = (title, lines) => {
                const body = (Array.isArray(lines) ? lines : [lines]).map(l => `│ ${l}`).join('\n');
                return `╭─❏ 「 ${title}」
│
${body}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
            };

            try {
                const settings = await getSettings();
                const autoaiOn = settings?.autoai === true || settings?.autoai === 'true' || settings?.autoai === 'on';

                if (autoaiOn) {
                    return client.sendMessage(m.chat, {
                        text: fmt('ALLOW', [
                            'AutoAI is ON — replies to everyone.',
                            'Turn it off first to manage allowed list.',
                            `Use: ${prefix}autoai off`
                        ])
                    });
                }

                const sub = (args[0] || '').toLowerCase();

                if (sub === 'list') {
                    const list = await getAllowedUsers();
                    if (!list.length) {
                        return client.sendMessage(m.chat, {
                            text: fmt('ALLOW LIST', 'No one allowed. AutoAI is off for everyone 💀')
                        });
                    }
                    return client.sendMessage(m.chat, {
                        text: fmt('ALLOW LIST', [`Total: ${list.length}`, ...list.map((n, i) => `${i + 1}. ${n}`)])
                    });
                }

                if (sub === 'remove' || sub === 'del' || sub === 'delete') {
                    const raw = args.slice(1).join('');
                    const num = cleanNumber(raw);
                    if (!num || num.length < 6) {
                        return client.sendMessage(m.chat, {
                            text: fmt('ALLOW', [`Provide a valid number.`, `Example: ${prefix}allow remove 254712345678`])
                        });
                    }
                    await removeAllowedUser(num);
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                    return client.sendMessage(m.chat, {
                        text: fmt('ALLOW', [`Removed: ${num}`, 'AutoAI will no longer respond to them.'])
                    });
                }

                const rawNum = (sub === 'add' ? args.slice(1).join('') : args.join('')).trim();
                const num = cleanNumber(rawNum);

                if (!num || num.length < 6) {
                    const list = await getAllowedUsers();
                    return client.sendMessage(m.chat, {
                        text: fmt('ALLOW', [
                            `Status: AutoAI OFF`,
                            `Allowed users: ${list.length}`,
                            '',
                            `Add: ${prefix}allow 254712345678`,
                            `Remove: ${prefix}allow remove 254712345678`,
                            `List: ${prefix}allow list`
                        ])
                    });
                }

                await addAllowedUser(num);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return client.sendMessage(m.chat, {
                    text: fmt('ALLOW', [`Added: ${num}`, 'AutoAI will respond to them even while off.'])
                });

            } catch {
                client.sendMessage(m.chat, {
                    text: fmt('ALLOW', 'something broke. try again.')
                });
            }
        });
    }
};