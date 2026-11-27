import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function parseBingImages(html) {
  const $ = cheerio.load(html);
  const items = [];
  $('a.iusc').each((_, el) => {
    const raw = $(el).attr('m');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data.murl) return;
      items.push({
        title: data.t || data.desc || 'Image result',
        snippet: data.desc || '',
        link: data.purl || data.murl,
        image: data.murl,
        thumbnail: data.turl || data.murl
      });
    } catch {}
  });
  if (items.length) return items;
  $('img.mimg').each((_, el) => {
    const src = $(el).attr('src');
    if (!src || src.startsWith('data:')) return;
    items.push({
      title: $(el).attr('alt') || 'Image result',
      snippet: '',
      link: src,
      image: src,
      thumbnail: src
    });
  });
  return items;
}

export async function searchImages(query, limit = 5) {
  const q = String(query || '').trim();
  if (!q) throw new Error('Empty image query');

  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2&first=1&setlang=en&cc=us`;
    const res = await fetch(url, {
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(30000)
    });
    if (res.ok) {
      const items = parseBingImages(await res.text());
      if (items.length) return items.slice(0, limit);
    }
  } catch {}

  const res = await fetch(`https://api.nexray.eu.cc/search/googleimage?q=${encodeURIComponent(q)}`, {
    headers: { 'user-agent': UA },
    signal: AbortSignal.timeout(30000)
  });
  const data = await res.json().catch(() => null);
  const list = Array.isArray(data?.result) ? data.result : [];
  const items = list.map(item => {
    if (typeof item === 'string') return { title: q, snippet: '', link: item, image: item, thumbnail: item };
    const img = item.url || item.image || item.link || item.thumbnail || '';
    return { title: item.title || q, snippet: item.snippet || '', link: item.link || img, image: img, thumbnail: item.thumbnail || img };
  }).filter(x => x.image);
  if (!items.length) throw new Error('Image search unavailable');
  return items.slice(0, limit);
}

export async function searchWeb(query, limit = 5) {
  const q = String(query || '').trim();
  if (!q) throw new Error('Empty search query');

  try {
    const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(q)}&setlang=en&cc=us`, {
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(30000)
    });
    if (res.ok) {
      const $ = cheerio.load(await res.text());
      const items = [];
      $('li.b_algo').each((_, el) => {
        const a = $(el).find('h2 a').first();
        const title = a.text().trim();
        const link = a.attr('href');
        const snippet = $(el).find('.b_caption p, .b_snippet').first().text().trim();
        if (title && link) items.push({ title, snippet, link });
      });
      if (items.length) return items.slice(0, limit);
    }
  } catch {}

  const res = await fetch(`https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(q)}`, {
    headers: { 'user-agent': UA, accept: 'text/html' },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`Web search HTTP ${res.status}`);
  const $ = cheerio.load(await res.text());
  const items = [];
  $('a.result-link').each((_, el) => {
    const title = $(el).text().trim();
    let link = $(el).attr('href') || '';
    const uddg = link.match(/[?&]uddg=([^&]+)/);
    if (uddg) link = decodeURIComponent(uddg[1]);
    const snippet = $(el).closest('tr').next().find('.result-snippet').text().trim();
    if (title && link) items.push({ title, snippet, link });
  });
  if (!items.length) throw new Error('Web search unavailable');
  return items.slice(0, limit);
}
