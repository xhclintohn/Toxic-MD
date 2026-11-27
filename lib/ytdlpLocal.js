import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFile, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const isWin = process.platform === 'win32';
const exeName = isWin ? 'yt-dlp.exe' : 'yt-dlp';
const binDir = path.join(rootDir, 'database', 'bin');
const localBin = path.join(binDir, exeName);
const RELEASE = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/';

const AUDIO_MAX_SIZE = '50M';
const VIDEO_MAX_SIZE = '80M';
const VIDEO_FORMAT = 'bv*[height<=720][vcodec^=avc1]+ba[acodec^=mp4a]/bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720][ext=mp4]/b[height<=720]/b';

let resolved = null;
let resolving = null;

function tryRun(cmd, pre = []) {
  try {
    execFileSync(cmd, [...pre, '--version'], { stdio: 'ignore', timeout: 25000 });
    return true;
  } catch (_) {
    return false;
  }
}

function pythonCmd() {
  for (const c of ['python3', 'python']) {
    try {
      execFileSync(c, ['--version'], { stdio: 'ignore', timeout: 10000 });
      return c;
    } catch (_) {}
  }
  return null;
}

function assetCandidates() {
  const list = [];
  if (isWin) list.push({ asset: 'yt-dlp.exe', zipapp: false });
  else if (process.platform === 'darwin') list.push({ asset: 'yt-dlp_macos', zipapp: false });
  else if (process.platform === 'linux') {
    if (process.arch === 'x64') list.push({ asset: 'yt-dlp_linux', zipapp: false });
    else if (process.arch === 'arm64') list.push({ asset: 'yt-dlp_linux_aarch64', zipapp: false });
  }
  if (!isWin) list.push({ asset: 'yt-dlp', zipapp: true });
  return list;
}

async function downloadTo(url, dest) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(180000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100000) throw new Error('downloaded file too small');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  if (!isWin) fs.chmodSync(dest, 0o755);
}

async function resolveBinary() {
  if (resolved) return resolved;
  if (resolving) return resolving;
  resolving = (async () => {
    const py = pythonCmd();
    const tests = [];
    if (process.env.YTDLP_BIN) tests.push({ cmd: process.env.YTDLP_BIN, pre: [] });
    if (fs.existsSync(localBin)) {
      tests.push({ cmd: localBin, pre: [] });
      if (py) tests.push({ cmd: py, pre: [localBin] });
    }
    tests.push({ cmd: 'yt-dlp', pre: [] });
    for (const t of tests) {
      if (tryRun(t.cmd, t.pre)) return (resolved = t);
    }
    const errs = [];
    for (const c of assetCandidates()) {
      if (c.zipapp && !py) {
        errs.push('python3 missing (needed for yt-dlp zipapp)');
        continue;
      }
      try {
        console.log(`[YTDLP] downloading ${c.asset} from GitHub...`);
        await downloadTo(RELEASE + c.asset, localBin);
        const t = c.zipapp ? { cmd: py, pre: [localBin] } : { cmd: localBin, pre: [] };
        if (tryRun(t.cmd, t.pre)) {
          console.log('[YTDLP] ready:', localBin);
          return (resolved = t);
        }
        errs.push(`${c.asset} downloaded but will not run`);
      } catch (e) {
        errs.push(`${c.asset}: ${e.message}`);
      }
    }
    throw new Error(`yt-dlp unavailable and auto-download failed (${errs.join('; ') || 'no candidates'})`);
  })();
  try {
    return await resolving;
  } finally {
    resolving = null;
  }
}

function describeError(e) {
  const raw = String(e?.stderr || e?.message || '');
  const lines = raw.trim().split('\n').filter(Boolean);
  const parts = [];
  if (lines.length) parts.push(lines.slice(-2).join(' ').slice(0, 200));
  if (e?.code != null && typeof e.code === 'number') parts.push(`exit=${e.code}`);
  return parts.join(' ') || 'failed without an error message';
}

async function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ytdlp-'));
  try {
    return await fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function run(url, dir, extraArgs, { json = true } = {}) {
  const bin = await resolveBinary();
  const args = [
    ...bin.pre,
    '--no-warnings',
    '--no-check-certificates',
    '--socket-timeout', '30',
    '--retries', '3',
    '--js-runtimes', 'node',
    '--no-playlist',
    '--quiet',
    '--no-simulate'
  ];
  if (json) args.push('--dump-single-json');
  args.push(...extraArgs, '--', url);
  return new Promise((resolve, reject) => {
    execFile(bin.cmd, args, { maxBuffer: 64 * 1024 * 1024, timeout: 240000 }, (err, stdout, stderr) => {
      if (err) {
        err.stderr = stderr;
        console.error('[YTDLP]', { message: err.message, stderr: String(stderr).slice(-500), code: err.code });
        return reject(new Error(describeError(err)));
      }
      if (!json) return resolve({});
      try {
        resolve(JSON.parse(stdout));
      } catch (_) {
        resolve({});
      }
    });
  });
}

function listFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(f => !/\.(part|ytdl|json|temp)$/i.test(f))
    .sort()
    .map(f => path.join(dir, f));
}

const extOf = file => path.extname(file).slice(1).toLowerCase();

function ffmpegToMp3(input, output) {
  return new Promise((resolve, reject) => {
    execFile('ffmpeg', ['-y', '-i', input, '-vn', '-b:a', '128k', output], err => (err ? reject(new Error('ffmpeg unavailable or conversion failed')) : resolve()));
  });
}

export async function ytAudioLocal(url) {
  return withTempDir(async dir => {
    const info = await run(
      url,
      dir,
      ['-o', path.join(dir, 'media.%(ext)s'), '-f', 'bestaudio[ext=m4a]/bestaudio[acodec^=mp4a]/bestaudio', '--max-filesize', '40M']
    );
    const file = listFiles(dir)[0];
    if (!file) throw new Error('downloaded file not found');
    const ext = extOf(file);
    const base = { title: info.title || 'YouTube Audio', duration: info.duration || 0, thumbnail: info.thumbnail || '', channel: info.channel || info.uploader || '' };
    if (['m4a', 'mp4', 'aac'].includes(ext)) return { ...base, buffer: fs.readFileSync(file), mimetype: 'audio/mp4' };
    if (ext === 'mp3') return { ...base, buffer: fs.readFileSync(file), mimetype: 'audio/mpeg' };
    const out = path.join(dir, 'converted.mp3');
    await ffmpegToMp3(file, out);
    return { ...base, buffer: fs.readFileSync(out), mimetype: 'audio/mpeg' };
  });
}

export async function ytVideoLocal(url) {
  return withTempDir(async dir => {
    const info = await run(url, dir, [
      '-o', path.join(dir, 'media.%(ext)s'),
      '-f', VIDEO_FORMAT,
      '--merge-output-format', 'mp4',
      '--remux-video', 'mp4',
      '--max-filesize', VIDEO_MAX_SIZE
    ]);
    const file = listFiles(dir).find(f => extOf(f) === 'mp4');
    if (!file) throw new Error('downloaded file not found');
    return {
      title: info.title || 'YouTube Video',
      duration: info.duration || 0,
      thumbnail: info.thumbnail || '',
      buffer: fs.readFileSync(file),
      mimetype: 'video/mp4'
    };
  });
}

export async function ytSearchLocal(query, limit = 10) {
  const q = String(query || '').trim();
  if (!q) throw new Error('empty search query');
  const n = Math.max(1, Math.min(Number(limit) || 10, 20));
  return withTempDir(async dir => {
    const info = await run(`ytsearch${n}:${q}`, dir, ['--flat-playlist', '--skip-download']);
    const entries = Array.isArray(info?.entries) ? info.entries : [];
    return entries
      .map(e => ({
        title: e.title || '',
        author: e.uploader || e.channel || '',
        url: e.url || (e.id ? `https://www.youtube.com/watch?v=${e.id}` : ''),
        duration: Number(e.duration) || 0
      }))
      .filter(v => v.url);
  });
}
