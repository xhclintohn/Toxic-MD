import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';
import { herokuAppName, getHerokuApiKey } from '../../config/settings.js';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const fmt = (msg) => `╭─❏ 「 UPDATE」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
const REPO = (process.env.GITHUB_REPO || 'xhclintohn/Toxic-MD').replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
const SKIP = new Set(['.git','node_modules','.env','config.env','session.json','creds.json','auth','Session','session']);
const doRestart = (root) => {
    setTimeout(() => {
        exec('pm2 restart toxic-v2 || pm2 restart all', { cwd: root }, (err) => {
            if (err) {
                try {
                    const out = fs.openSync(path.join(root, 'bot.log'), 'a');
                    const child = spawn('npm', ['start'], { cwd: root, detached: true, stdio: ['ignore', out, out], shell: process.platform === 'win32' });
                    child.unref();
                } catch {}
            }
            process.exit(0);
        });
    }, 1500);
};

function readVersion(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')).version || null; } catch { return null; }
}

function baileysInfo(root) {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        const spec = pkg.dependencies?.['@whiskeysockets/baileys'] || '';
        const m = String(spec).match(/github:([^#]+)(?:#(.+))?/);
        if (m) return { repo: m[1], branch: m[2] || 'main', installSpec: '@whiskeysockets/baileys@' + spec };
    } catch {}
    return { repo: 'xhclintohn/Baileys', branch: 'test', installSpec: '@whiskeysockets/baileys@github:xhclintohn/Baileys#test' };
}

async function fetchLatestVersion(repo, branch) {
    const res = await axios.get('https://raw.githubusercontent.com/' + repo + '/' + branch + '/package.json', {
        timeout: 20000,
        headers: { 'User-Agent': 'Toxic-MD' }
    });
    return res.data?.version || null;
}

function cmpVer(a, b) {
    const pa = String(a).split('-')[0].split('.').map(n => parseInt(n, 10) || 0);
    const pb = String(b).split('-')[0].split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
    }
    return 0;
}

async function reinstallBaileys(root, opts, installSpec) {
    await execAsync('npm install --no-audit --no-fund ' + installSpec, { ...opts, timeout: 10 * 60 * 1000 });
}

async function performGitUpdate(client, m, opts) {
    await sendInteractive(client, m, fmt('Git repo — pulling latest code...'));
    let branch = 'main';
    try {
        const r = await execAsync('git rev-parse --abbrev-ref HEAD', opts);
        if (r.stdout?.trim() && r.stdout.trim() !== 'HEAD') branch = r.stdout.trim();
    } catch {}
    await execAsync('git fetch origin', opts);
    await execAsync('git reset --hard origin/' + branch, opts);
    const { stdout: head } = await execAsync('git rev-parse --short HEAD', opts);
    let depNote = 'deps ok';
    try { await execAsync('npm install --no-audit --no-fund', opts); depNote = 'deps installed'; } catch (e) { depNote = String(e.message||e).split('\n')[0]; }
    return { head: head.trim(), depNote };
}

async function performHerokuUpdate(client, m, apiKey, appName) {
    await sendInteractive(client, m, fmt('Heroku — triggering rebuild on ' + appName + '...'));
    await axios.post('https://api.heroku.com/apps/' + appName + '/builds',
        { source_blob: { url: 'https://github.com/' + REPO + '/tarball/main' } },
        { headers: { Authorization: 'Bearer ' + apiKey, Accept: 'application/vnd.heroku+json; version=3', 'Content-Type': 'application/json' }, timeout: 60000 });
    client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
    return sendInteractive(client, m, fmt('Rebuild triggered for ' + appName + '.\n│ Bot restarts after build completes.'));
}

async function performZipUpdate(client, m, opts, root) {
    let AdmZip;
    try { AdmZip = (await import('adm-zip')).default; } catch { throw new Error('adm-zip missing. Run npm install.'); }
    await sendInteractive(client, m, fmt('No git — downloading latest from GitHub...'));
    const zipPath = path.join(root, '.toxic_update.zip');
    const exRoot  = path.join(root, '.toxic_update');
    const res = await axios.get('https://github.com/' + REPO + '/archive/refs/heads/main.zip', {
        responseType: 'arraybuffer', timeout: 120000, maxContentLength: Infinity, maxBodyLength: Infinity,
        headers: { 'User-Agent': 'Toxic-MD' }
    });
    fs.writeFileSync(zipPath, Buffer.from(res.data));
    fs.rmSync(exRoot, { recursive: true, force: true });
    new AdmZip(zipPath).extractAllTo(exRoot, true);
    const repoName = REPO.split('/').pop();
    let srcDir = path.join(exRoot, repoName + '-main');
    if (!fs.existsSync(srcDir)) {
        const dirs = fs.readdirSync(exRoot).map(d => path.join(exRoot, d)).filter(p => fs.statSync(p).isDirectory());
        if (dirs.length) srcDir = dirs[0];
    }
    fs.cpSync(srcDir, root, {
        recursive: true, force: true,
        filter: (src) => {
            const rel = path.relative(srcDir, src);
            if (!rel) return true;
            const top = rel.split(path.sep)[0];
            if (SKIP.has(top)) return false;
            if (rel.endsWith('.session')) return false;
            if (top === 'database' && rel.endsWith('.db')) return false;
            return true;
        }
    });
    fs.rmSync(zipPath, { force: true });
    fs.rmSync(exRoot, { recursive: true, force: true });
    let depNote = 'deps ok';
    try { await execAsync('npm install --no-audit --no-fund', opts); depNote = 'deps installed'; } catch (e) { depNote = String(e.message||e).split('\n')[0]; }
    return { depNote };
}

export default {
    name: 'update',
    aliases: ['botupdate', 'selfupdate', 'checkupdate', 'upd', 'vupdate'],
    description: 'Update Toxic-MD and Baileys — checks versions first and only updates what is outdated (.update check / .update force)',
    run: async (context) => {
        await ownerMiddleware(context, async () => {
            const { client, m, args } = context;
            const root = process.cwd();
            const opts = { cwd: root, timeout: 300000, maxBuffer: 1024 * 1024 * 20 };
            const sub = (args?.[0] || '').toLowerCase();
            const mode = sub === 'check' ? 'check' : sub === 'force' ? 'force' : 'update';
            client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});
            try {
                const bInfo = baileysInfo(root);
                const botLocal = readVersion(path.join(root, 'package.json'));
                const bailsLocal = readVersion(path.join(root, 'node_modules', '@whiskeysockets', 'baileys', 'package.json'));

                let botLatest = null;
                let bailsLatest = null;
                let checkFailed = false;
                try { botLatest = await fetchLatestVersion(REPO, 'main'); } catch { checkFailed = true; }
                try { bailsLatest = await fetchLatestVersion(bInfo.repo, bInfo.branch); } catch { checkFailed = true; }

                const botOutdated = !botLocal || (botLatest ? cmpVer(botLatest, botLocal) > 0 : false);
                const bailsOutdated = !bailsLocal || (bailsLatest ? cmpVer(bailsLatest, bailsLocal) > 0 : false);

                const statusLines = [
                    'Toxic-MD: ' + (botLocal || 'unknown') + ' → ' + (botLatest || 'unknown') + (botOutdated ? ' ⬆️' : ' ✅'),
                    'Baileys: ' + (bailsLocal || 'not installed') + ' → ' + (bailsLatest || 'unknown') + (bailsOutdated ? ' ⬆️' : ' ✅')
                ];

                if (mode === 'check') {
                    client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                    const verdict = (botOutdated || bailsOutdated)
                        ? 'Update available — run .update to apply it.'
                        : 'Everything is up to date.';
                    return sendInteractive(client, m, fmt(statusLines.join('\n│ ') + '\n│ ' + verdict));
                }

                if (checkFailed && mode !== 'force') {
                    client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt(statusLines.join('\n│ ') + '\n│ Could not reach GitHub to check versions.\n│ Nothing was changed. Try again, or use .update force.'));
                }

                if (mode !== 'force' && !botOutdated && !bailsOutdated) {
                    client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                    return sendInteractive(client, m, fmt(statusLines.join('\n│ ') + '\n│ Already up to date — nothing to update.'));
                }

                await sendInteractive(client, m, fmt(statusLines.join('\n│ ') + '\n│ Updating' + (mode === 'force' ? ' (forced)' : '') + '...'));

                const isHeroku = !!(process.env.DYNO || process.env.HEROKU);
                if (isHeroku) {
                    const apiKey = getHerokuApiKey();
                    const appName = herokuAppName;
                    if (!apiKey || !appName) {
                        client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                        return sendInteractive(client, m, fmt('Set HEROKU_API_KEY and HEROKU_APP_NAME first.'));
                    }
                    return await performHerokuUpdate(client, m, apiKey, appName);
                }

                const notes = [];
                if (botOutdated || mode === 'force') {
                    let isGit = false;
                    try { await execAsync('git rev-parse --is-inside-work-tree', opts); isGit = true; } catch {}
                    if (isGit) {
                        const r = await performGitUpdate(client, m, opts);
                        notes.push('Toxic-MD updated to ' + r.head + ' (' + r.depNote + ')');
                    } else {
                        const r = await performZipUpdate(client, m, opts, root);
                        notes.push('Toxic-MD updated from zip (' + r.depNote + ')');
                    }
                }

                if (bailsOutdated || mode === 'force') {
                    await sendInteractive(client, m, fmt('Updating Baileys (' + (bailsLocal || 'none') + ' → ' + (bailsLatest || 'latest') + ')...'));
                    await reinstallBaileys(root, opts, bInfo.installSpec);
                    const bailsAfter = readVersion(path.join(root, 'node_modules', '@whiskeysockets', 'baileys', 'package.json'));
                    notes.push('Baileys updated: ' + (bailsLocal || 'none') + ' → ' + (bailsAfter || 'unknown'));
                }

                client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                await sendInteractive(client, m, fmt(notes.join('\n│ ') + '\n│ Restarting...'));
                doRestart(root);
            } catch (e) {
                client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt('Update failed: ' + String(e?.response?.data?.message || e?.message || e).split('\n')[0]));
            }
        });
    }
};
