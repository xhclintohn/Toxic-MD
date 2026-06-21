import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { herokuAppName, getHerokuApiKey } from '../../config/settings.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execAsync = promisify(exec);

const fmt = (msg) => `╭─❏ 「 VUPDATE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const GITHUB_REPO = (process.env.GITHUB_REPO || 'xhclintohn/Toxic-MD').replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m } = context;
        const root = process.cwd();
        const opts = { cwd: root, timeout: 300000, maxBuffer: 1024 * 1024 * 20 };

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let isGitCheckout = false;
        try {
            await execAsync('git rev-parse --is-inside-work-tree', opts);
            isGitCheckout = true;
        } catch {
            isGitCheckout = false;
        }

        if (isGitCheckout) {
            try {
                await sendInteractive(client, m, fmt('Pulling the latest code from GitHub...'));

                let branch = 'main';
                try {
                    const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', opts);
                    if (stdout && stdout.trim() && stdout.trim() !== 'HEAD') branch = stdout.trim();
                } catch {}

                await execAsync('git fetch origin', opts);
                await execAsync(`git reset --hard origin/${branch}`, opts);
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
                return;
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Update failed: ' + String(e?.message || e).split('\n')[0] + '\n│ Bot was NOT restarted.'));
            }
        }

        const apiKey = getHerokuApiKey();
        if (apiKey && herokuAppName) {
            try {
                await sendInteractive(client, m, fmt('Not a git checkout. Triggering a Heroku rebuild...'));
                await axios.post(
                    `https://api.heroku.com/apps/${herokuAppName}/builds`,
                    { source_blob: { url: `https://github.com/${GITHUB_REPO}/tarball/main` } },
                    { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/vnd.heroku+json; version=3', 'Content-Type': 'application/json' }, timeout: 60000 }
                );
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return sendInteractive(client, m, fmt('Heroku rebuild triggered for ' + herokuAppName + '.\n│ The bot will restart automatically once the build finishes.'));
            } catch (e) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                const detail = e?.response?.data?.message || e?.message || String(e);
                return sendInteractive(client, m, fmt('Heroku update failed: ' + String(detail).split('\n')[0]));
            }
        }

        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt("This bot isn't a git checkout and no Heroku API credentials are set.\n│ Set HEROKU_API_KEY and HEROKU_APP_NAME, or redeploy manually from GitHub."));
    });
};
