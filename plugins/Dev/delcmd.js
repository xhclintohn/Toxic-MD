import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { promises as fs } from 'fs';
import path from 'path';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { aliases } from '../../handlers/commandHandler.js';

const PLUGINS_DIR = path.join(__dirname, '..');
const PROTECTED = ['addcmd', 'delcmd'];

const resolveAlias = (input) => {
    try { if (aliases && aliases[input.toLowerCase()]) return aliases[input.toLowerCase()]; } catch {}
    return input;
};

const sanitizeName = (s) => (s || '').toLowerCase().replace(/\.js$/i, '').replace(/[^a-z0-9_-]/g, '').slice(0, 40);

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const fmt = (msg) => `╭─❏ 「 DELCMD」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        const rawInput = sanitizeName((text || '').trim());
        if (!rawInput) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('Usage: delcmd <name or alias>'));
        }

        const commandName = sanitizeName(resolveAlias(rawInput));
        const aliasNote = commandName !== rawInput ? `\n│ Alias: ${rawInput} → ${commandName}` : '';

        if (PROTECTED.includes(commandName)) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`"${commandName}" is protected so you can always recover.${aliasNote}`));
        }

        let categories = [];
        try {
            const entries = await fs.readdir(PLUGINS_DIR, { withFileTypes: true });
            categories = entries.filter(e => e.isDirectory()).map(e => e.name);
        } catch {}

        let deletedFrom = null;
        for (const category of categories) {
            const filePath = path.join(PLUGINS_DIR, category, `${commandName}.js`);
            try {
                await fs.access(filePath);
                await fs.unlink(filePath);
                deletedFrom = category;
                break;
            } catch {}
        }

        if (!deletedFrom) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`"${rawInput}" was not found in any folder.${aliasNote}`));
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await sendInteractive(client, m, fmt(`Deleted "${commandName}.js" from ${deletedFrom}.${aliasNote}\n│ Restarting to apply...`));
        setTimeout(() => { process.exit(0); }, 2000);
    });
};
