import { getSettings, updateSetting } from '../../database/config.js';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 PRESENCE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const ALIAS_MAP = {
    'autorecording': 'recording', 'setrecording': 'recording', 'recording': 'recording',
    'presencerecording': 'recording', 'enablerecording': 'recording',
    'autotyping': 'typing', 'settyping': 'typing', 'typing': 'typing',
    'presencetyping': 'typing', 'enabletyping': 'typing',
    'autoonline': 'online', 'setonline': 'online', 'enableonline': 'online',
    'presenceonline': 'online', 'online': 'online',
    'autooffline': 'offline', 'setoffline': 'offline', 'presenceoffline': 'offline',
};

const _ON  = new Set(['on','enable','enabled','activate','activated','true','1','yes','start']);
const _OFF = new Set(['off','disable','disabled','deactivate','deactivated','false','0','no','stop']);
const VALID = ['online', 'offline', 'recording', 'typing'];

export default {
    name: 'presence',
    aliases: [...new Set([
        'autorecording','setrecording','recording','presencerecording','enablerecording',
        'autotyping','settyping','typing','presencetyping','enabletyping',
        'autoonline','setonline','enableonline','presenceonline',
        'autooffline','setoffline','presenceoffline',
    ])],
    description: 'Set or toggle bot presence status (online/offline/recording/typing)',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, args, prefix } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            try {
                const settings = await getSettings();

                const rawBody = (m?.body || m?.text || '').toLowerCase();
                const rawCmd = rawBody.replace(/^[^a-z0-9]+/, '').split(/\s+/)[0] || 'presence';
                const aliasType = ALIAS_MAP[rawCmd];

                if (aliasType) {
                    const arg = (args[0] || '').toLowerCase();
                    if (_OFF.has(arg)) {
                        await updateSetting('presence', 'offline');
                        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                        return sendInteractive(client, m, fmt(`${aliasType.toUpperCase()} disabled. Presence set to OFFLINE.`));
                    }
                    const target = _ON.has(arg) || arg === '' ? aliasType : aliasType;
                    if (settings.presence === target && _ON.has(arg)) {
                        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                        return sendInteractive(client, m, fmt(`Presence is already ${target.toUpperCase()}.`));
                    }
                    await updateSetting('presence', target);
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                    return sendInteractive(client, m, fmt(`Presence set to ${target.toUpperCase()}!`));
                }

                const value = args.join(' ').toLowerCase();

                if (VALID.includes(value)) {
                    if (settings.presence === value) {
                        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                        return sendInteractive(client, m, fmt(`Presence is already ${value.toUpperCase()}.`));
                    }
                    await updateSetting('presence', value);
                    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                    return sendInteractive(client, m, fmt(`Presence set to ${value.toUpperCase()}!`));
                }

                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } });
                return sendInteractive(client, m, fmt(
                    `Current: *${(settings.presence || 'NOT SET').toUpperCase()}*\n│ \n│ Usage:\n│ ${prefix}presence online\n│ ${prefix}presence offline\n│ ${prefix}presence recording\n│ ${prefix}presence typing\n│ \n│ Shortcuts:\n│ ${prefix}autorecording on/off\n│ ${prefix}autotyping on/off\n│ ${prefix}autoonline on/off`
                ));
            } catch {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt(`Failed to update presence. Check DB.`));
            }
        });
    }
};
