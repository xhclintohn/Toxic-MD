import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { herokuAppName, getHerokuApiKey } from '../../config/settings.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const fmt = (msg) => `╭─❏ 「 VUPDATE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
const GITHUB_REPO = (process.env.GITHUB_REPO || 'xhclintohn/Toxic-MD').replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
const EXCLUDE_TOP = new Set(['.git', 'node_modules', '.env', 'config.env', 'session.json', 'creds.json', 'whatsasena.json', 'auth', 'Session', 'session']);

const restart = (root) => {
    setTimeout(() => {
        exec('pm2 restart toxic-v2 || pm2 restart all', { cwd: root }, () => { process.exit(0); });
    }, 1500);
};

async function gitUpdate(client, m, opts, root) {
    await sendInteractive(client, m, fmt('Git checkout detected. Pulling the latest code...'));
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
    await sendInteractive(client, m, fmt('Updated to ' + head.trim() + '\n│ ' + depNote + '\n│ \n│ Restarting now...'));
    restart(root);
}

async function herokuUpdate(client, m, apiKey) {
    await sendInteractive(client, m, fmt('Heroku detected. Triggering a rebuild...'));
    await axios.post(
        `https://api.heroku.com/apps/${herokuAppName}/builds`,
        { source_blob: { url: `https://github.com/${GITHUB_REPO}/tarball/main` } },
        { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/vnd.heroku+json; version=3', 'Content-Type': 'application/json' }, timeout: 60000 }
    );
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    return sendInteractive(client, m, fmt('Heroku rebuild triggered for ' + herokuAppName + '.\n│ It will restart automatically once the build finishes.'));
}

async function zipUpdate(client, m, opts, root) {
    let AdmZip;
    try { AdmZip = (await import('adm-zip')).default; }
    catch {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('adm-zip is not installed yet.\n│ Run npm install once (or redeploy), then try .vupdate again.'));
    }

    await sendInteractive(client, m, fmt('No git checkout. Downloading the latest code from GitHub...'));
    const zipPath = path.join(root, '.toxic_update.zip');
    const extractRoot = path.join(root, '.toxic_update');

    const res = await axios.get(`https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip`, {
        responseType: 'arraybuffer', timeout: 120000, maxContentLength: Infinity, maxBodyLength: Infinity, headers: { 'User-Agent': 'Toxic-MD' }
    });
    fs.writeFileSync(zipPath, Buffer.from(res.data));
    fs.rmSync(extractRoot, { recursive: true, force: true });
    new AdmZip(zipPath).extractAllTo(extractRoot, true);

    const repoName = GITHUB_REPO.split('/').pop();
    let srcDir = path.join(extractRoot, `${repoName}-main`);
    if (!fs.existsSync(srcDir)) {
        const dirs = fs.readdirSync(extractRoot).map(d => path.join(extractRoot, d)).filter(p => fs.statSync(p).isDirectory());
        if (dirs.length) srcDir = dirs[0];
    }

    fs.cpSync(srcDir, root, {
        recursive: true, force: true, filter: (src) => {
            const rel = path.relative(srcDir, src);
            if (!rel) return true;
            const top = rel.split(path.sep)[0];
            if (EXCLUDE_TOP.has(top)) return false;
            if (rel.endsWith('.session')) return false;
            if (top === 'database' && rel.endsWith('.db')) return false;
            return true;
        }
    });

    fs.rmSync(zipPath, { force: true });
    fs.rmSync(extractRoot, { recursive: true, force: true });

    let depNote = 'dependencies up to date';
    try { await execAsync('npm install --no-audit --no-fund', opts); depNote = 'dependencies installed'; }
    catch (e) { depNote = 'npm warning: ' + String(e.message || e).split('\n')[0]; }

    await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
    await sendInteractive(client, m, fmt('Updated from the GitHub zip.\n│ ' + depNote + '\n│ \n│ Restarting now...'));
    restart(root);
}

export default async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m } = context;
        const root = process.cwd();
        const opts = { cwd: root, timeout: 300000, maxBuffer: 1024 * 1024 * 20 };
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let isGit = false;
        try { await execAsync('git rev-parse --is-inside-work-tree', opts); isGit = true; } catch { isGit = false; }

        try {
            if (isGit) return await gitUpdate(client, m, opts, root);
            const apiKey = getHerokuApiKey();
            if (apiKey && herokuAppName) return await herokuUpdate(client, m, apiKey);
            return await zipUpdate(client, m, opts, root);
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            const detail = e?.response?.data?.message || e?.message || String(e);
            return sendInteractive(client, m, fmt('Update failed: ' + String(detail).split('\n')[0] + '\n│ Bot was NOT restarted.'));
        }
    });
};
