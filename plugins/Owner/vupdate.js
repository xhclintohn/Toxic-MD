import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m } = context;
        const root = process.cwd();
        const opts = { cwd: root, timeout: 300000, maxBuffer: 1024 * 1024 * 20 };
        const fmt = (msg) => `╭─❏ 「 VUPDATE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        await sendInteractive(client, m, fmt('Pulling the latest code from GitHub...'));

        try {
            await execAsync('git rev-parse --is-inside-work-tree', opts);
        } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt("This bot isn't a git checkout, so I can't self-update. Redeploy it from the GitHub repo."));
        }

        try {
            await execAsync('git fetch origin', opts);
            await execAsync('git reset --hard origin/main', opts);
            const { stdout: head } = await execAsync('git rev-parse --short HEAD', opts);

            let depNote = 'dependencies up to date';
            try {
                await execAsync('npm install --no-audit --no-fund', opts);
                depNote = 'dependencies installed';
            } catch (npmErr) {
                depNote = 'npm warning: ' + String(npmErr.message || npmErr).split('\n')[0];
            }

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await sendInteractive(client, m, fmt('Updated to ' + head.trim() + '\n│ ' + depNote + '\n│ \n│ Restarting now...'));

            setTimeout(() => {
                exec('pm2 restart toxic-v2 || pm2 restart all', { cwd: root }, () => {
                    process.exit(0);
                });
            }, 1500);
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt('Update failed: ' + String(e?.message || e).split('\n')[0] + '\n│ Bot was NOT restarted.'));
        }
    });
};
