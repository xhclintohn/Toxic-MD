import { proxyFetchJson } from './proxyFetch.js';

const RYUU_KEY = process.env.RYUU_API_KEY || 'ryuu-apis-9c049100c28fc39e1791732697814';
const BASE = 'https://api.ryuu-dev.my.id/downloader/youtube';

export async function ryuuYoutube(url, format = 'mp3') {
  const endpoint = `${BASE}?url=${encodeURIComponent(url)}&format=${encodeURIComponent(format)}`;
  const { ok, status, data } = await proxyFetchJson(
    endpoint,
    {
      method: 'GET',
      headers: {
        'X-RYUU-APIKEY': RYUU_KEY,
        Accept: 'application/json',
        'User-Agent': 'Toxic-MD/1.0',
      },
      timeout: 90000,
    },
    { maxProxyAttempts: 5, preferProxy: false }
  );

  if (!ok || !data) throw new Error(`Download failed: ${status || 'no response'}`);

  const inner = data?.result?.result || data?.result || data;
  const link = inner?.link || inner?.url || inner?.download || null;
  if (!link) throw new Error('Download failed: no media link in response');

  return {
    title: inner.title || 'Untitled',
    views: inner.views || '',
    duration: inner.duration || '',
    thumbnail: inner.thumbnail || '',
    channel: inner.channel || '',
    filename: inner.filename || '',
    link,
    format: inner.format || format,
  };
}

export default ryuuYoutube;
