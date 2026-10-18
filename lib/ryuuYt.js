import { proxyFetch } from './proxyFetch.js';

const RYUU_KEY = process.env.RYUU_API_KEY || 'ryuu-apis-9c049100c28fc39e1791732697814';
const RYUU_BASE = 'https://api.ryuu-dev.my.id/downloader/youtube';
const ELLYTUBE_KEY = process.env.ELLYTUBE_API_KEY || 'Agustus2026';

function pickMedia(data) {
  if (!data || typeof data !== 'object') return null;
  const layers = [
    data?.result?.result,
    data?.result?.data,
    data?.data?.result,
    data?.result,
    data?.data,
    data
  ];
  for (const layer of layers) {
    if (!layer || typeof layer !== 'object') continue;
    const link =
      layer.link ||
      layer.url ||
      layer.download ||
      layer.downloadUrl ||
      layer.cdn ||
      layer.media ||
      layer.audio ||
      layer.mp3;
    if (link && typeof link === 'string' && /^https?:\/\//i.test(link)) {
      return {
        title: layer.title || data?.result?.title || 'Untitled',
        views: layer.views || '',
        duration: layer.duration || layer.durationSeconds || '',
        thumbnail: layer.thumbnail || layer.thumb || '',
        channel: layer.channel || layer.author || '',
        filename: layer.filename || '',
        link,
        format: layer.format || layer.selectedFormat || '',
        source: layer
      };
    }
  }
  return null;
}

async function fetchJson(url, headers = {}, timeout = 90000) {
  const res = await proxyFetch(
    url,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      },
      timeout
    },
    { maxProxyAttempts: 5, preferProxy: false }
  );
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`invalid JSON (${res.status})`);
  }
  if (res.status === 401) throw new Error('API key invalid');
  if (res.status === 429) throw new Error('API rate limited');
  return { ok: res.ok, status: res.status, data };
}

async function tryRyuu(url, format) {
  const endpoint = `${RYUU_BASE}?url=${encodeURIComponent(url)}&format=${encodeURIComponent(format)}`;
  const { ok, status, data } = await fetchJson(endpoint, { 'X-RYUU-APIKEY': RYUU_KEY }, 95000);
  if (!ok) throw new Error(`Ryuu HTTP ${status}`);
  const media = pickMedia(data);
  if (!media) throw new Error('Ryuu: no media link');
  media.provider = 'ryuu';
  return media;
}

async function tryEllyTube(url, format = 'mp3') {
  const isAudio = String(format).toLowerCase() === 'mp3' || String(format).toLowerCase() === 'audio';
  const params = new URLSearchParams({
    url,
    type: isAudio ? 'audio' : 'video',
    quality: isAudio ? '320kbps' : String(format || '720'),
    apikey: ELLYTUBE_KEY
  });
  const endpoint = `https://ellytube.web.id/api/v1/youtube/download?${params.toString()}`;
  const { ok, status, data } = await fetchJson(endpoint, {}, 95000);
  if (!ok || data?.status === false) throw new Error(`EllyTube HTTP ${status}`);
  const media = pickMedia(data);
  if (!media) throw new Error('EllyTube: no media link');
  media.provider = 'ellytube';
  media.channel = media.channel || data?.result?.author || '';
  media.duration = media.duration || data?.result?.duration || '';
  media.thumbnail = media.thumbnail || data?.result?.thumbnail || '';
  return media;
}

async function tryApiziaulByUrl(url) {
  const endpoint = `https://apiziaul.vercel.app/api/downloader/ytmp3?url=${encodeURIComponent(url)}`;
  try {
    const { ok, data } = await fetchJson(endpoint, {}, 90000);
    if (ok) {
      const media = pickMedia(data);
      if (media) {
        media.provider = 'apiziaul-url';
        return media;
      }
    }
  } catch {}
  const endpoint2 = `https://apiziaul.vercel.app/api/downloader/ytplaymp3?query=${encodeURIComponent(url)}`;
  const { ok, status, data } = await fetchJson(endpoint2, {}, 90000);
  if (!ok) throw new Error(`apiziaul HTTP ${status}`);
  const media = pickMedia(data);
  if (!media) throw new Error('apiziaul: no media link');
  media.provider = 'apiziaul';
  return media;
}

async function tryApiziaulQuery(query) {
  const endpoint = `https://apiziaul.vercel.app/api/downloader/ytplaymp3?query=${encodeURIComponent(query)}`;
  const { ok, status, data } = await fetchJson(endpoint, {}, 90000);
  if (!ok) throw new Error(`apiziaul query HTTP ${status}`);
  const media = pickMedia(data);
  if (!media) throw new Error('apiziaul query: no media link');
  if (data?.result?.videoUrl) media.videoUrl = data.result.videoUrl;
  media.provider = 'apiziaul-query';
  return media;
}

async function trySidy(url) {
  const endpoint = `https://api.sidycoders.xyz/api/ytdl?url=${encodeURIComponent(url)}&format=mp3&apikey=memberdycoders`;
  const { ok, status, data } = await fetchJson(endpoint, {}, 60000);
  if (!ok) throw new Error(`sidy HTTP ${status}`);
  const link = data?.cdn || data?.result?.cdn || data?.url;
  if (!link) throw new Error('sidy: no media link');
  return {
    title: data?.title || data?.result?.title || 'Untitled',
    views: '',
    duration: data?.duration || '',
    thumbnail: data?.thumbnail || '',
    channel: '',
    filename: '',
    link,
    format: 'mp3',
    provider: 'sidycoders'
  };
}

export async function ryuuYoutube(url, format = 'mp3') {
  const errors = [];
  const attempts = [
    () => tryEllyTube(url, format),
    () => tryApiziaulByUrl(url),
    () => tryRyuu(url, format),
    () => trySidy(url)
  ];
  for (const fn of attempts) {
    try {
      const media = await fn();
      await assertDownloadable(media);
      return media;
    } catch (e) {
      errors.push(e?.message || String(e));
    }
  }
  throw new Error(`All download sources failed: ${errors.join(' | ')}`);
}

async function assertDownloadable(media) {
  if (!media?.link) throw new Error('no link');
  const headish = await proxyFetch(
    media.link,
    {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: '*/*',
        Range: 'bytes=0-2047',
        Referer: 'https://ellytube.web.id/'
      },
      timeout: 25000
    },
    { maxProxyAttempts: 2, preferProxy: false }
  ).catch(() => null);

  if (!headish) return media;

  const ctype = (headish.headers.get('content-type') || '').toLowerCase();
  const buf = Buffer.from(await headish.arrayBuffer());
  const sample = buf.slice(0, 64).toString('utf8').toLowerCase();
  if (sample.includes('<!doctype') || sample.includes('<html') || ctype.includes('text/html')) {
    throw new Error(`${media.provider || 'source'}: link returned HTML not media`);
  }
  if (buf.length > 0 && buf.length < 500 && !ctype.includes('audio') && !ctype.includes('video') && !ctype.includes('octet')) {
    throw new Error(`${media.provider || 'source'}: media too small/invalid`);
  }
  return media;
}

export async function playSearchDownload(query) {
  const errors = [];
  try {
    const media = await tryApiziaulQuery(query);
    await assertDownloadable(media);
    return media;
  } catch (e) {
    errors.push(e?.message || String(e));
  }
  try {
    const yts = (await import('yt-search')).default;
    const search = await yts(query);
    const video = search?.videos?.[0];
    if (!video?.url) throw new Error('No YouTube search results');
    const media = await ryuuYoutube(video.url, 'mp3');
    media.title = media.title || video.title;
    media.thumbnail = media.thumbnail || video.thumbnail;
    media.videoUrl = video.url;
    return media;
  } catch (e) {
    errors.push(e?.message || String(e));
  }
  throw new Error(`Play failed: ${errors.join(' | ')}`);
}

export async function downloadBuffer(url, timeoutMs = 120000) {
  const res = await proxyFetch(
    url,
    {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: '*/*',
        Referer: 'https://ellytube.web.id/'
      },
      timeout: timeoutMs
    },
    { maxProxyAttempts: 4, preferProxy: false }
  );
  if (!res.ok) throw new Error(`Media download failed: ${res.status}`);
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  if (!buf.length) throw new Error('Media download empty');
  const sample = buf.slice(0, 64).toString('utf8').toLowerCase();
  if (sample.includes('<!doctype') || sample.includes('<html')) {
    throw new Error('Media download returned HTML instead of file');
  }
  if (buf.length < 10000) {
    throw new Error(`Media file too small (${buf.length} bytes)`);
  }
  return buf;
}

export default ryuuYoutube;
