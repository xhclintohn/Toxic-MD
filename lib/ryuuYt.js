const fetch = globalThis.fetch;

const RYUU_KEY = process.env.RYUU_API_KEY || 'ryuu-apis-9c049100c28fc39e1791732697814';
const BASE = 'https://api.ryuu-dev.my.id/downloader/youtube';

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
    const link = layer.link || layer.url || layer.download || layer.downloadUrl || layer.cdn || layer.media;
    if (link && typeof link === 'string' && /^https?:\/\//i.test(link)) {
      return {
        title: layer.title || data?.result?.title || 'Untitled',
        views: layer.views || '',
        duration: layer.duration || '',
        thumbnail: layer.thumbnail || layer.thumb || '',
        channel: layer.channel || '',
        filename: layer.filename || '',
        link,
        format: layer.format || ''
      };
    }
  }
  return null;
}

export async function ryuuYoutube(url, format = 'mp3') {
  const endpoint = `${BASE}?url=${encodeURIComponent(url)}&format=${encodeURIComponent(format)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  let res;
  try {
    res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-RYUU-APIKEY': RYUU_KEY,
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Download failed: invalid JSON (${res.status})`);
  }
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const media = pickMedia(data);
  if (!media) throw new Error('Download failed: no media link in response');
  return media;
}

export async function downloadBuffer(url, timeoutMs = 90000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: '*/*' },
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`Media download failed: ${res.status}`);
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    if (!buf.length) throw new Error('Media download empty');
    return buf;
  } finally {
    clearTimeout(timer);
  }
}

export default ryuuYoutube;
