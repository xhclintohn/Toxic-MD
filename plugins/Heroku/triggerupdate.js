import axios from 'axios';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

import { herokuAppName as HEROKU_APP_NAME, getHerokuApiKey } from '../../config/settings.js';
const HEROKU_API_KEY = getHerokuApiKey();

const GITHUB_REPO = (process.env.GITHUB_REPO || 'xhclintohn/Toxic-MD').replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');

export default async (context) => {
    const { client, m } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    await ownerMiddleware(context, async () => {
        await client.sendMessage(m.chat, { react: { text: '🚀', key: m.reactKey } });

        try {
            if (HEROKU_API_KEY && HEROKU_APP_NAME) {
                await client.sendMessage(m.chat, {
                    text: `╭─❏ 「 TRIGGERUPDATE」\n│ Fine… triggering update.\n│ Don't complain if the bot restarts in your face. 😒\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                });

                await axios.post(
                    `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
                    { source_blob: { url: `https://github.com/${GITHUB_REPO}/tarball/main` } },
                    {
                        headers: {
                            Authorization: `Bearer ${HEROKU_API_KEY}`,
                            Accept: 'application/vnd.heroku+json; version=3',
                            'Content-Type': 'application/json'
                        }
                    }
                );

                return await sendInteractive(client, m, `╭─❏ 「 TRIGGERUPDATE」\n│ Update triggered.\n│ Sit tight while Toxic-MD resurrects with fresh upgrades. 🔥\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            const root = process.cwd();
            const opts = { cwd: root, timeout: 300000, maxBuffer: 1024 * 1024 * 20 };
            let isGit = false;
            try {
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);
                await execAsync('git rev-parse --is-inside-work-tree', opts);
                isGit = true;
            } catch { isGit = false; }

            if (isGit) {
                const { exec } = await import('child_process');
                const { promisify } = await import('util');
                const execAsync = promisify(exec);
                await sendInteractive(client, m, `╭─❏ 「 TRIGGERUPDATE」\n│ Git detected. Pulling latest code...\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
                await execAsync('git fetch origin', opts);
                await execAsync('git reset --hard origin/main', opts);
                try { await execAsync('npm install --no-audit --no-fund', opts); } catch {}
                return sendInteractive(client, m, `╭─❏ 「 TRIGGERUPDATE」\n│ Updated via git.\n│ Restarting now...\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
            }

            await sendInteractive(client, m, `╭─❏ 「 TRIGGERUPDATE」\n│ You're on a panel/VPS without git.\n│ Use your platform's redeploy button or connect via SSH and run git pull.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            let msg;
            if (errorMessage.includes('API key')) {
                msg = 'Your Heroku API key is trash.\nFix *HEROKU_API_KEY* before crying here.';
            } else if (errorMessage.includes('not found')) {
                msg = 'Heroku app not found.\nAre you sure *HEROKU_APP_NAME* is correct, genius?';
            } else {
                msg = `Update failed:\n${errorMessage}\nTry again without panicking.`;
            }
            await client.sendMessage(m.chat, { text: `╭─❏ 「 TRIGGERUPDATE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
        }
    });
};
