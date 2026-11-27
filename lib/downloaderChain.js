import { ytAudioLocal, ytVideoLocal, ytSearchLocal } from './ytdlpLocal.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const NEXRAY = 'https://api.nexray.eu.cc';
const ELLYTUBE_KEY = process.env.ELLYTUBE_API_KEY || 'Agustus2026';

export async function dlFetchJson(url, { headers = {}, timeout = 45000 } = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json', ...headers },
    signal: AbortSignal.timeout(timeout)
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`invalid JSON (HTTP ${res.status})`);
  }
  if (!res.ok || data?.status === false) {
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  }
  return data;
}

export async function dlDownload(url, { timeout = 120000, headers = {}, minBytes = 10000 } = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: '*/*', ...headers },
    signal: AbortSignal.timeout(timeout)
  });
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error('download empty');
  const head = buf.slice(0, 64).toString('utf8').toLowerCase();
  if (head.includes('<!doctype') || head.includes('<html')) throw new Error('download returned HTML not media');
  if (buf.length < minBytes) throw new Error(`media too small (${buf.length} bytes)`);
  return buf;
}

export async function verifyLink(link, { headers = {} } = {}) {
  if (!link || !/^https?:\/\//i.test(link)) throw new Error('no link');
  const res = await fetch(link, {
    headers: { 'User-Agent': UA, Accept: '*/*', Range: 'bytes=0-65535', ...headers },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok && res.status !== 206) throw new Error(`link HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const head = buf.slice(0, 64).toString('utf8').toLowerCase();
  if (head.includes('<!doctype') || head.includes('<html')) throw new Error('link returned HTML not media');
  if (buf.length < 1000) throw new Error('link media too small');
  return true;
}

export async function mediaBuffer(media) {
  if (media?.buffer) return media.buffer;
  if (!media?.link) throw new Error('no media link');
  return dlDownload(media.link, { headers: media.referer ? { Referer: media.referer } : {} });
}

export async function tryChain(label, attempts) {
  const errors = [];
  for (const attempt of attempts) {
    try {
      const out = await attempt();
      if (out) return out;
      errors.push('empty result');
    } catch (e) {
      errors.push(e?.message || String(e));
    }
  }
  throw new Error(`${label}: ${errors.join(' | ')}`);
}

export function pickLink(obj, keys) {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v;
  }
  return null;
}

export function extractYtId(url) {
  const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/|live\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function isYoutubeUrl(text) {
  return /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/)/i.test(String(text || ''));
}

async function nexrayYtmp3(url) {
  const d = await dlFetchJson(`${NEXRAY}/downloader/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 60000 });
  const r = d.result || {};
  const link = pickLink(r, ['url', 'download_url', 'download', 'link']);
  if (!link) throw new Error('nexray ytmp3: no link');
  await verifyLink(link);
  return { link, title: r.title || 'YouTube Audio', duration: r.duration || '', thumbnail: r.thumbnail || '', channel: r.channel || r.author || '', provider: 'nexray' };
}

async function nexrayYtplay(query) {
  const d = await dlFetchJson(`${NEXRAY}/downloader/ytplay?q=${encodeURIComponent(query)}`, { timeout: 60000 });
  const r = d.result || {};
  const link = pickLink(r, ['download_url', 'url', 'download', 'link']);
  if (!link) throw new Error('nexray ytplay: no link');
  await verifyLink(link);
  return { link, title: r.title || query, duration: r.duration || '', thumbnail: r.thumbnail || '', channel: r.channel || '', videoUrl: r.url || '', provider: 'nexray-play' };
}

async function ellytube(url, type = 'audio', quality = '320kbps') {
  const params = new URLSearchParams({ url, type, quality, apikey: ELLYTUBE_KEY });
  const d = await dlFetchJson(`https://ellytube.web.id/api/v1/youtube/download?${params}`, { timeout: 60000 });
  const r = d.result || d.data || {};
  const link = pickLink(r, ['download', 'downloadUrl', 'url', 'link', 'cdn', 'media']);
  if (!link) throw new Error('ellytube: no link');
  await verifyLink(link, { headers: { Referer: 'https://ellytube.web.id/' } });
  return { link, title: r.title || 'YouTube', duration: r.duration || '', thumbnail: r.thumbnail || '', channel: r.author || r.channel || '', provider: 'ellytube', referer: 'https://ellytube.web.id/' };
}

async function faaYtmp3(url) {
  const d = await dlFetchJson(`https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 60000 });
  const r = d.result || {};
  const link = pickLink(r, ['mp3', 'url', 'download_url', 'download']);
  if (!link) throw new Error('faa ytmp3: no link');
  await verifyLink(link);
  return { link, title: r.title || 'YouTube Audio', duration: r.duration || '', thumbnail: r.thumbnail || '', channel: r.author || '', provider: 'faa' };
}

async function faaYtplay(query) {
  const d = await dlFetchJson(`https://api-faa.my.id/faa/ytplay?query=${encodeURIComponent(query)}`, { timeout: 60000 });
  const r = d.result || {};
  const link = pickLink(r, ['mp3', 'url', 'download_url', 'download']);
  if (!link) throw new Error('faa ytplay: no link');
  await verifyLink(link);
  return { link, title: r.title || query, duration: r.duration_timestamp || r.duration || '', thumbnail: r.thumbnail || '', channel: r.author || '', videoUrl: r.url || '', provider: 'faa-play' };
}

async function faaYtmp4(url) {
  const d = await dlFetchJson(`https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(url)}`, { timeout: 60000 });
  const r = d.result || {};
  const link = pickLink(r, ['download_url', 'mp4', 'url', 'download']);
  if (!link) throw new Error('faa ytmp4: no link');
  await verifyLink(link);
  return { link, title: r.title || 'YouTube Video', duration: r.duration || '', thumbnail: r.thumbnail || '', provider: 'faa' };
}

async function ytSearchThenAudio(query) {
  const yts = (await import('yt-search')).default;
  const search = await yts(query);
  const video = search?.videos?.[0];
  if (!video?.url) throw new Error('no YouTube search results');
  const media = await nexrayYtmp3(video.url);
  media.title = media.title || video.title;
  media.thumbnail = media.thumbnail || video.thumbnail;
  media.videoUrl = video.url;
  return media;
}

export async function resolveYoutubeAudio(input) {
  const text = String(input || '').trim();
  if (isYoutubeUrl(text)) {
    const id = extractYtId(text);
    const url = id ? `https://youtube.com/watch?v=${id}` : text;
    return tryChain('YouTube audio', [
      () => nexrayYtmp3(url),
      () => faaYtmp3(url),
      () => ellytube(url, 'audio'),
      () => nexrayYtplay(url),
      async () => ({ ...(await ytAudioLocal(url)), provider: 'yt-dlp' })
    ]);
  }
  return tryChain('YouTube audio', [
    () => nexrayYtplay(text),
    () => faaYtplay(text),
    () => ytSearchThenAudio(text),
    async () => {
      const hits = await ytSearchLocal(text, 1);
      if (!hits.length) throw new Error('yt-dlp search: no results');
      return { ...(await ytAudioLocal(hits[0].url)), provider: 'yt-dlp' };
    }
  ]);
}

export async function resolveYoutubeVideo(url, quality = '720') {
  const id = extractYtId(url);
  const full = id ? `https://youtube.com/watch?v=${id}` : url;
  return tryChain('YouTube video', [
    async () => {
      const d = await dlFetchJson(`${NEXRAY}/downloader/ytmp4?url=${encodeURIComponent(full)}`, { timeout: 90000 });
      const r = d.result || {};
      const link = pickLink(r, ['url', 'download_url', 'download', 'link']);
      if (!link) throw new Error('nexray ytmp4: no link');
      await verifyLink(link);
      return { link, title: r.title || 'YouTube Video', duration: r.duration || '', thumbnail: r.thumbnail || '', provider: 'nexray' };
    },
    () => faaYtmp4(full),
    () => ellytube(full, 'video', quality),
    async () => ({ ...(await ytVideoLocal(full)), provider: 'yt-dlp' })
  ]);
}

async function tikwm(url) {
  const d = await dlFetchJson(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, { timeout: 45000 });
  if (d.code !== 0 || !d.data) throw new Error(d.msg || 'tikwm failed');
  const v = d.data;
  const link = v.hdplay || v.play;
  if (!link) throw new Error('tikwm: no video link');
  await verifyLink(link);
  return {
    link,
    music: v.music || v.music_info?.play || '',
    musicTitle: v.music_info?.title || '',
    title: v.title || 'TikTok Video',
    cover: v.cover || v.origin_cover || '',
    duration: v.duration || '',
    author: v.author?.nickname || v.author?.unique_id || 'Unknown',
    views: v.play_count ?? 'N/A',
    likes: v.digg_count ?? 'N/A',
    provider: 'tikwm'
  };
}

async function tiktokScrape(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': MOBILE_UA, Accept: 'text/html' },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`tiktok page HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/"playAddr":"([^"]+)"/) || html.match(/"downloadAddr":"([^"]+)"/);
  if (!m) throw new Error('tiktok scrape: no playAddr');
  const link = m[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
  await verifyLink(link, { headers: { Referer: 'https://www.tiktok.com/' } });
  const titleM = html.match(/"desc":"([^"]{1,200})"/);
  const authorM = html.match(/"nickname":"([^"]{1,80})"/);
  const musicM = html.match(/"playUrl":"([^"]+)"/);
  return {
    link,
    music: musicM ? musicM[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/') : '',
    musicTitle: '',
    title: titleM ? titleM[1] : 'TikTok Video',
    cover: '',
    duration: '',
    author: authorM ? authorM[1] : 'Unknown',
    views: 'N/A',
    likes: 'N/A',
    provider: 'scrape',
    referer: 'https://www.tiktok.com/'
  };
}

async function nexrayTiktok(url) {
  const d = await dlFetchJson(`${NEXRAY}/downloader/tiktok?url=${encodeURIComponent(url)}`, { timeout: 60000 });
  const r = d.result || {};
  const link = pickLink(r, ['data', 'url', 'video', 'play', 'hdplay', 'download_url']);
  if (!link) throw new Error('nexray tiktok: no link');
  await verifyLink(link);
  return {
    link,
    music: r.music_info?.url || r.music || '',
    musicTitle: r.music_info?.title || '',
    title: r.title || 'TikTok Video',
    cover: r.cover || '',
    duration: r.duration || '',
    author: r.author?.nickname || r.author?.unique_id || 'Unknown',
    views: r.stats?.views ?? 'N/A',
    likes: r.stats?.likes ?? 'N/A',
    provider: 'nexray'
  };
}

export async function resolveTiktok(url) {
  return tryChain('TikTok', [
    () => tikwm(url),
    () => tiktokScrape(url),
    () => nexrayTiktok(url)
  ]);
}

export async function resolvePinterestSearch(query) {
  const d = await dlFetchJson(`${NEXRAY}/search/pinterest?q=${encodeURIComponent(query)}`, { timeout: 45000 });
  const list = Array.isArray(d.result) ? d.result : [];
  const out = list.map(item => {
    if (typeof item === 'string') return { image: item, pin: '' };
    return {
      image: item.images_url || item.image || item.thumbnail || item.url || item.media || '',
      pin: item.pin || item.link || '',
      title: item.grid_title || item.title || item.description || ''
    };
  }).filter(x => x.image && /^https?:\/\//i.test(x.image));
  if (!out.length) throw new Error('pinterest search: no results');
  return out;
}

async function pinterestScrape(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`pinterest page HTTP ${res.status}`);
  const html = await res.text();
  let video = html.match(/<meta property="og:video" content="([^"]+)"/)?.[1] || html.match(/"videoUrl":"([^"]+)"/)?.[1] || '';
  let image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || '';
  if (!video) {
    const vm = html.match(/https:\\?\/\\?\/v\.pinimg\.com\\?\/videos\\?\/[^"\\]+\.mp4/);
    if (vm) video = vm[0].replace(/\\\//g, '/');
  }
  if (!image) {
    const im = html.match(/https:\/\/i\.pinimg\.com\/originals\/[^\s"')\\]+/);
    if (im) image = im[0];
  }
  const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || 'Pinterest';
  if (!video && !image) throw new Error('pinterest scrape: no media');
  return { video, image, title, provider: 'scrape' };
}

export async function resolvePinterestPin(url) {
  return tryChain('Pinterest pin', [
    async () => {
      const d = await dlFetchJson(`${NEXRAY}/downloader/pinterest?url=${encodeURIComponent(url)}`, { timeout: 45000 });
      const r = d.result || {};
      const video = pickLink(r, ['video', 'video_url', 'download_url']);
      const image = pickLink(r, ['image', 'thumbnail', 'url']);
      if (!video && !image) throw new Error('nexray pinterest: no media');
      return { video: video || '', image: image || '', title: r.title || r.description || 'Pinterest', provider: 'nexray' };
    },
    () => pinterestScrape(url)
  ]);
}

export async function resolveInstagram(url) {
  return tryChain('Instagram', [
    async () => {
      const d = await dlFetchJson(`${NEXRAY}/downloader/instagram?url=${encodeURIComponent(url)}`, { timeout: 60000 });
      return normalizeIg(d);
    },
    async () => {
      const d = await dlFetchJson(`${NEXRAY}/downloader/v2/instagram?url=${encodeURIComponent(url)}`, { timeout: 60000 });
      return normalizeIg(d);
    }
  ]);
}

function normalizeIg(d) {
  const r = d.result || {};
  const raw = r.media || r.urls || r.data || [];
  const media = (Array.isArray(raw) ? raw : [raw]).map(item => {
    if (typeof item === 'string') return { url: item, type: /\.mp4/i.test(item) ? 'mp4' : 'jpg' };
    const u = item?.url || item?.download_url || item?.link || '';
    return { url: u, type: item?.type === 'mp4' || /\.mp4/i.test(u) ? 'mp4' : 'jpg' };
  }).filter(x => x.url);
  if (!media.length) throw new Error('instagram: no media');
  return { media, title: r.title || r.caption || 'Instagram Post', username: r.username || r.author || 'unknown', likes: r.likes, comment: r.comment || r.comments };
}

export async function resolveFacebook(url) {
  const d = await dlFetchJson(`${NEXRAY}/downloader/facebook?url=${encodeURIComponent(url)}`, { timeout: 60000 });
  const r = d.result || {};
  const list = Array.isArray(r.download_url) ? r.download_url : Array.isArray(r.media) ? r.media : [];
  let link = pickLink(r, ['url', 'video', 'download_url', 'hd', 'sd']);
  if (!link && list.length) {
    const best = [...list].sort((a, b) => String(b.quality || b.resolusi || '').localeCompare(String(a.quality || a.resolusi || '')))[0];
    link = best?.url || best?.download_url;
  }
  if (!link) throw new Error('facebook: no video link');
  await verifyLink(link);
  return { link, title: r.title || 'Facebook Video', duration: r.duration || '', provider: 'nexray' };
}

export async function resolveTwitter(url) {
  const d = await dlFetchJson(`${NEXRAY}/downloader/twitter?url=${encodeURIComponent(url)}`, { timeout: 60000 });
  const r = d.result || {};
  const list = Array.isArray(r.download_url) ? r.download_url : [];
  const best = list.find(u => /mp4/i.test(String(u.type || u.name || ''))) || list[0];
  const link = best?.url || best?.download_url || pickLink(r, ['url', 'video']);
  if (!link) throw new Error('twitter: no video link');
  await verifyLink(link);
  return { link, title: r.title || 'Twitter/X Video', duration: r.duration || '', quality: best?.resolusi || best?.name || 'HD', provider: 'nexray' };
}

export async function resolveSpotify(input) {
  const text = String(input || '').trim();
  const isUrl = /open\.spotify\.com/i.test(text);
  return tryChain('Spotify', [
    async () => {
      let trackUrl = text;
      let title = '';
      let artist = '';
      if (!isUrl) {
        const s = await dlFetchJson(`${NEXRAY}/search/spotify?q=${encodeURIComponent(text)}`, { timeout: 45000 });
        const first = Array.isArray(s.result) ? s.result[0] : null;
        if (!first) throw new Error('spotify search: no results');
        trackUrl = first.url || first.link || '';
        title = first.title || '';
        artist = first.artist || '';
        if (!trackUrl) throw new Error('spotify search: no track url');
      }
      const d = await dlFetchJson(`${NEXRAY}/downloader/spotify?url=${encodeURIComponent(trackUrl)}`, { timeout: 60000 });
      const r = d.result || {};
      const link = pickLink(r, ['download', 'download_url', 'url', 'audio', 'link']);
      if (!link) throw new Error('spotify dl: no link');
      await verifyLink(link);
      return { link, title: r.title || title || 'Spotify Track', artist: r.artist || artist || '', thumbnail: r.thumbnail || r.cover || '', provider: 'nexray' };
    },
    async () => {
      let q = text;
      if (isUrl) {
        const s = await dlFetchJson(`${NEXRAY}/search/spotify?q=${encodeURIComponent(text)}`, { timeout: 45000 }).catch(() => null);
        const first = Array.isArray(s?.result) ? s.result[0] : null;
        if (first?.title) q = `${first.artist || ''} ${first.title}`.trim();
      }
      const media = await resolveYoutubeAudio(q);
      return { ...media, artist: '', provider: 'youtube-fallback' };
    }
  ]);
}

export async function resolveMediafire(url) {
  const d = await dlFetchJson(`${NEXRAY}/downloader/mediafire?url=${encodeURIComponent(url)}`, { timeout: 60000 });
  const r = d.result || {};
  const link = pickLink(r, ['url', 'download_url', 'download', 'link']);
  if (!link) throw new Error('mediafire: no link');
  return { link, name: r.name || r.filename || r.title || 'file', size: r.size || r.filesize || '', provider: 'nexray' };
}

export async function nexrayGet(path, params = {}, timeout = 45000) {
  const qs = new URLSearchParams(params).toString();
  const d = await dlFetchJson(`${NEXRAY}${path}${qs ? `?${qs}` : ''}`, { timeout });
  return d.result;
}

const RES_RE = /(1080|720|480|360|270|240|144)p/i;

function mediaScore(item, prefer) {
  const type = String(item?.type || item?.mime_type || item?.mimetype || '').toLowerCase();
  const name = String(item?.name || item?.quality || item?.resolusi || item?.label || '').toLowerCase();
  let score = 0;
  if (prefer === 'audio') {
    if (type.includes('audio') || type.includes('mp3') || name.includes('mp3')) score += 1000;
  } else if (type.includes('video') || type.includes('mp4')) {
    score += 1000;
  }
  if (name.includes('mp4') || name.includes('video')) score += 200;
  const match = name.match(RES_RE);
  if (match) score += Number(match[1]);
  if (item?.url || item?.download_url) score += 1;
  return score;
}

export function pickDownload(data, prefer = 'video') {
  if (!data) return null;
  const list = Array.isArray(data.download_url) ? data.download_url : Array.isArray(data.downloads) ? data.downloads : Array.isArray(data.media) ? data.media : Array.isArray(data.urls) ? data.urls : [];
  if (list.length) {
    const best = [...list].sort((a, b) => mediaScore(b, prefer) - mediaScore(a, prefer))[0];
    const picked = best?.url || best?.download_url || best?.downloadUrl;
    if (picked) return picked;
  }
  if (prefer === 'audio') {
    const audio = Array.isArray(data.audio) ? data.audio[0] : data.audio;
    if (audio?.url) return audio.url;
    if (typeof audio === 'string') return audio;
  }
  return data.url || data.download_url || data.downloadUrl || data.video_url || data.videoUrl || data.direct_url || data.directUrl || data.play || data.hdplay || data.download || null;
}

export async function resolveNexrayDownload(path, url, { prefer = 'video', timeout = 60000 } = {}) {
  const r = await nexrayGet(path, { url }, timeout);
  if (!r) throw new Error('no result');
  const link = pickDownload(r, prefer);
  if (!link) throw new Error('no download link in result');
  await verifyLink(link);
  return { link, raw: r, title: r.title || r.name || '', provider: 'nexray' };
}
