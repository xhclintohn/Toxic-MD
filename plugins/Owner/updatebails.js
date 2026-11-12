import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const BAILEYS_SPEC = '@whiskeysockets/baileys@github:xhclintohn/Baileys#test';

function readBaileysVersion(root) {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(root, 'node_modules', '@whiskeysockets', 'baileys', 'package.json'), 'utf8'));
        return pkg.version || 'unknown';
    } catch {
        return 'not installed';
    }
}

export default {
    name: 'updatebails',
    aliases: ['ub', 'updatebaileys', 'reinstall', 'npmi'],
    description: 'Update only Baileys from the test branch, without wiping node_modules or reinstalling everything (owner/dev only)',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

            const root = process.cwd();
            const before = readBaileysVersion(root);

            try {
                await sendInteractive(client, m,
`╭─❏ 「 UPDATEBAILS 」
│ Updating Baileys only...
│ Installed now: ${before}
│ node_modules is left in place — nothing is wiped.
│ This is much lighter than a full reinstall.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                );

                const { stdout, stderr } = await execAsync(`npm install --no-save --no-audit --no-fund ${BAILEYS_SPEC}`, {
                    cwd: root,
                    timeout: 10 * 60 * 1000,
                    maxBuffer: 20 * 1024 * 1024,
                    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' }
                });

                const after = readBaileysVersion(root);
                const out = String(stdout || '').trim().split('\n').slice(-8).join('\n') || 'done';
                const errTail = String(stderr || '').trim().split('\n').slice(-4).join('\n');

                await sendInteractive(client, m,
`╭─❏ 「 UPDATEBAILS 」
│ Baileys updated ✅
│ ${before} → ${after}
│ 
│ ${out.split('\n').map(l => '│ ' + l).join('\n')}
${errTail ? '│ \n│ notes:\n' + errTail.split('\n').map(l => '│ ' + l).join('\n') + '\n' : ''}│ 
│ Restart the bot from the panel so the new Baileys loads.
│ The version number may stay the same if the test branch
│ did not bump it — the install still pulls the latest test code.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                );
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            } catch (e) {
                const msg = e?.stderr || e?.message || String(e);
                const short = String(msg).trim().split('\n').slice(-12).join('\n');
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                await sendInteractive(client, m,
`╭─❏ 「 UPDATEBAILS 」
│ Update failed ❌
│ 
${short.split('\n').map(l => '│ ' + l).join('\n')}
│ 
│ Nothing was deleted — the bot is still running on Baileys ${before}.
│ Safe to try again, or restart from the panel instead.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                );
            }
        });
    }
};
