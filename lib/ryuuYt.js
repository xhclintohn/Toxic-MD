import { proxyFetch } from './proxyFetch.js';

const RYUU_KEY = process.env.RYUU_API_KEY || 'ryuu-apis-9c049100c28fc39e1791732697814';
const RYUU_BASE = 'https://api.ryuu-dev.my.id/downloader/youtube';

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
        duration: layer.duration || '',
        thumbnail: layer.thumbnail || layer.thumb || '',
        channel: layer.channel || '',
        filename: layer.filename || '',
        link,
        format: layer.format || '',
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
    () => tryRyuu(url, format),
    () => tryApiziaulByUrl(url),
    () => trySidy(url)
  ];
  for (const fn of attempts) {
    try {
      return await fn();
    } catch (e) {
      errors.push(e?.message || String(e));
    }
  }
  throw new Error(`All download sources failed: ${errors.join(' | ')}`);
}

export async function playSearchDownload(query) {
  const errors = [];
  try {
    return await tryApiziaulQuery(query);
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
        Accept: '*/*'
      },
      timeout: timeoutMs
    },
    { maxProxyAttempts: 4, preferProxy: false }
  );
  if (!res.ok) throw new Error(`Media download failed: ${res.status}`);
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  if (!buf.length) throw new Error('Media download empty');
  return buf;
}

export default ryuuYoutube;
