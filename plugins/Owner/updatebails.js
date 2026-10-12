import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export default {
    name: 'updatebails',
    aliases: ['ub', 'updatebaileys', 'reinstall', 'npmi'],
    description: 'Force remove node_modules + package-lock and run npm install (owner/dev only)',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m } = context;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

            const root = process.cwd();
            const modulesPath = path.join(root, 'node_modules');
            const lockPath = path.join(root, 'package-lock.json');

            try {
                await sendInteractive(client, m,
`╭─❏ 「 UPDATEBAILS 」
│ Cleaning node_modules + lockfile...
│ Then running npm install.
│ This may take a minute — hold on.
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                );

                if (fs.existsSync(modulesPath)) {
                    await fs.promises.rm(modulesPath, { recursive: true, force: true });
                }
                if (fs.existsSync(lockPath)) {
                    await fs.promises.unlink(lockPath).catch(() => {});
                }

                const { stdout, stderr } = await execAsync('npm install', {
                    cwd: root,
                    timeout: 10 * 60 * 1000,
                    maxBuffer: 20 * 1024 * 1024,
                    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' }
                });

                const out = String(stdout || '').trim().split('\n').slice(-8).join('\n') || 'done';
                const errTail = String(stderr || '').trim().split('\n').slice(-4).join('\n');

                await sendInteractive(client, m,
`╭─❏ 「 UPDATEBAILS 」
│ Install finished ✅
│ 
│ ${out.split('\n').map(l => '│ ' + l).join('\n')}
${errTail ? '│ \n│ notes:\n' + errTail.split('\n').map(l => '│ ' + l).join('\n') + '\n' : ''}│ 
│ Restart the bot if Baileys changed.
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
│ Install failed ❌
│ 
${short.split('\n').map(l => '│ ' + l).join('\n')}
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                );
            }
        });
    }
};
