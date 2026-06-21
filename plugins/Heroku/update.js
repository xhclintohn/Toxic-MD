import axios from 'axios';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

import { herokuAppName as HEROKU_APP_NAME, getHerokuApiKey } from '../../config/settings.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
const HEROKU_API_KEY = getHerokuApiKey();

const GITHUB_REPO = (process.env.GITHUB_REPO || 'xhclintohn/Toxic-MD').replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
const EXCLUDE_TOP = new Set(['.git', 'node_modules', '.env', 'config.env', 'session.json', 'creds.json', 'whatsasena.json', 'auth', 'Session', 'session']);

const restart = (root) => {
    setTimeout(() => {
        import('child_process').then(({ exec }) => {
            exec('pm2 restart toxic-v2 || pm2 restart all', { cwd: root }, () => { process.exit(0); });
        });
    }, 1500);
};

async function gitUpdate(client, m, opts, root) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    await sendInteractive(client, m, `╭─❏ 「 UPDATE」\n│ Git detected. Pulling the latest code...\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    let branch = 'main';
    try {
        const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', opts);
        if (stdout && stdout.trim() && stdout.trim() !== 'HEAD') branch = stdout.trim();
    } catch {}
    await execAsync('git fetch origin', opts);
    await execAsync(`git reset --hard origin/${branch}`, opts);
    const { stdout: head } = await execAsync('git rev-parse --short HEAD', opts);
    let depNote = 'dependencies up to date';
    try { await execAsync('npm install --no-audit --no-fund', opts); depNote = 'dependencies installed'; }
    catch (e) { depNote = 'npm warning: ' + String(e.message || e).split('\n')[0]; }
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    await sendInteractive(client, m, `╭─❏ 「 UPDATE」\n│ Updated to ${head.trim()}\n│ ${depNote}\n│ Restarting now...\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    restart(root);
}

async function herokuUpdateCheck(client, m, prefix) {
    await client.sendMessage(m.chat, { react: { text: '🔂', key: m.reactKey } });
    try {
        if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            return await sendInteractive(client, m, `╭─❏ 「 UPDATE」\n│ Seriously? You forgot to set *HEROKU_API_KEY* or *HEROKU_APP_NAME*.\n│ Fix your setup before crying for updates. 🙄\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
        }

        const githubRes = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits/main`);
        const latestCommit = githubRes.data;
        const latestSha = latestCommit.sha;

        const herokuRes = await axios.get(`https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`, {
            headers: { Authorization: `Bearer ${HEROKU_API_KEY}`, Accept: 'application/vnd.heroku+json; version=3' }
        });

        const lastBuild = herokuRes.data[0];
        const deployedSha = lastBuild?.source_blob?.url || '';
        const alreadyDeployed = deployedSha.includes(latestSha);

        if (alreadyDeployed) {
            const _devMode = await getDeviceMode();
            if (_devMode === 'ios') {
                await client.sendMessage(m.chat, { react: { text: '📋', key: m.reactKey } }).catch(()=>{});
                await sendInteractive(client, m, `╭─❏ 「 UPDATE」\n│ Options:\n│ ${prefix}menu\n│ ${prefix}settings\n│ ${prefix}triggerupdate\n│ ${prefix}menu\n╰───────────────`);
                return;
            } else {
                const msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: {
                                body: { text: 'Your bot is already on the latest version, genius.' },
                                footer: { text: 'Powered by Toxic-MD' },
                                nativeFlowMessage: {
                                    buttons: [{
                                        name: 'single_select',
                                        buttonParamsJson: JSON.stringify({
                                            title: 'Want something else?',
                                            sections: [{ rows: [
                                                { title: 'Menu', description: 'Get command list', id: `${prefix}menu` },
                                                { title: 'Settings', description: 'Bot settings', id: `${prefix}settings` },
                                            ] }]
                                        })
                                    }]
                                }
                            }
                        }
                    }
                });
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                return await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            }
        }

        const _devMode = await getDeviceMode();
        if (_devMode === 'ios') {
            await sendInteractive(client, m, `🆕 Update Available, Dumbass\n\nNew version found. You're still using outdated garbage.\n\n📌 *Commit:* ${latestCommit.commit.message}\n👤 *Author:* ${latestCommit.commit.author.name}\n🕒 *Date:* ${new Date(latestCommit.commit.author.date).toLocaleString()}\n\nTo update your worthless bot, tap the button below. If you're unable to tap the buttons type ${prefix}triggerupdate Don't ask me how to tap, you monkey. 🐒😂`);
        } else {
            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: `🆕 Update Available, Dumbass\n\nNew version found. You're still using outdated garbage.\n\n📌 *Commit:* ${latestCommit.commit.message}\n👤 *Author:* ${latestCommit.commit.author.name}\n🕒 *Date:* ${new Date(latestCommit.commit.author.date).toLocaleString()}\n\nTo update your worthless bot, tap the button below. If you're unable to tap the buttons type ${prefix}triggerupdate Don't ask me how to tap, you monkey. 🐒😂` },
                            footer: { text: 'Powered by Toxic-MD' },
                            nativeFlowMessage: {
                                buttons: [{
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: 'UPDATE OPTIONS',
                                        sections: [{
                                            title: 'What do you want?',
                                            rows: [
                                                { title: '🚀 Trigger Update', description: 'Update now', id: `${prefix}triggerupdate` },
                                                { title: 'Menu', description: 'Back to command list', id: `${prefix}menu` },
                                            ]
                                        }]
                                    })
                                }]
                            }
                        }
                    }
                }
            });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
            await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        }

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
        await client.sendMessage(m.chat, { text: `╭─❏ 「 UPDATE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
    }
}

export default async (context) => {
    const { client, m, prefix } = context;
    await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    await ownerMiddleware(context, async () => {
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
            return await gitUpdate(client, m, opts, root);
        }

        if (HEROKU_API_KEY && HEROKU_APP_NAME) {
            return await herokuUpdateCheck(client, m, prefix);
        }

        await sendInteractive(client, m, `╭─❏ 「 UPDATE」\n│ No git or Heroku detected.\n│ You're on a panel/VPS.\n│ Use your platform's redeploy button or git pull manually.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    });
};
