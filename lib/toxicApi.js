import fetch from 'node-fetch';
import { ephoto360Buffer } from './ephoto360.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const NB_UA = 'Toxic-MD/1.2 (WhatsApp Bot)';

function _cleanErr(e) {
  return new Error(e.type || e.code || e.name || 'request failed');
}

async function makeEffect(endpoint, text) {
  return ephoto360Buffer(endpoint, text);
}

const _NEKOS_BEST = new Set(['neko', 'waifu', 'husbando', 'kitsune', 'blush', 'smug', 'pat', 'hug', 'kiss', 'bite', 'happy', 'cry', 'dance', 'wave', 'poke', 'slap', 'cuddle', 'nom', 'punch', 'tickle', 'yeet', 'facepalm', 'bonk']);
const _ANIME_REMAP = { maid: 'waifu', miko: 'waifu', uniform: 'waifu', shinobu: 'neko', megumin: 'waifu', oppai: 'waifu' };

async function getAnime(endpoint) {
  const ep = _ANIME_REMAP[endpoint] || endpoint;
  const nbEp = _NEKOS_BEST.has(ep) ? ep : 'waifu';
  const res = await fetch(`https://nekos.best/api/v2/${nbEp}`, {
    headers: { 'User-Agent': NB_UA },
    timeout: 15000
  });
  if (!res.ok) throw new Error(`Anime fetch HTTP ${res.status}`);
  const d = await res.json();
  const url = d.results?.[0]?.url;
  if (!url) throw new Error('Anime fetch failed');
  return url;
}

async function getAI(endpoint, query) {
  const attempts = [
    async () => {
      const res = await fetch(`https://api.nexray.eu.cc/ai/claude?text=${encodeURIComponent(query)}`, { headers: { 'User-Agent': UA }, timeout: 60000 });
      const d = await res.json();
      if (!d.status || !d.result) throw new Error(d.error || 'claude failed');
      return d.result;
    },
    async () => {
      const res = await fetch(`https://apiii-xrina.my.id/ai/deepseek?text=${encodeURIComponent(query)}`, { headers: { 'User-Agent': UA }, timeout: 60000 });
      const d = await res.json();
      if (!d.status || !d.data?.response) throw new Error(d.message || 'deepseek failed');
      return d.data.response;
    },
    async () => {
      const res = await fetch(`https://apiii-xrina.my.id/ai/blackbox-ai?text=${encodeURIComponent(query)}`, { headers: { 'User-Agent': UA }, timeout: 60000 });
      const d = await res.json();
      if (!d.status || !d.data?.response) throw new Error(d.message || 'blackbox failed');
      return d.data.response;
    }
  ];
  let lastErr;
  for (const attempt of attempts) {
    try { return await attempt(); } catch (e) { lastErr = _cleanErr(e); }
  }
  throw lastErr || new Error('AI request failed');
}

async function _faaNanoBanana(imageUrl, prompt) {
  const res = await fetch(`https://api-faa.my.id/faa/nano-banana?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`, {
    headers: { 'User-Agent': UA },
    timeout: 120000
  });
  const d = await res.json().catch(() => null);
  const r = d?.result || d?.data || {};
  const imgUrl = typeof r === 'string' ? r : (r.url || r.image_url || r.imageUrl || r.output || (Array.isArray(r.all_outputs) ? r.all_outputs[0] : null));
  if (!d?.status || !imgUrl) throw new Error(d?.error || d?.message || 'nano-banana failed');
  return imgUrl;
}

async function makePhotoEdit(imageUrl, prompt) {
  return _faaNanoBanana(imageUrl, prompt);
}

async function makeRC(imageUrl, prompt) {
  return _faaNanoBanana(imageUrl, prompt);
}

async function enhanceImage(imageUrl) {
  return _faaNanoBanana(imageUrl, 'enhance to HD quality, upscale and sharpen details, keep the same image');
}

async function makeCanvas(imgUrl, title, type, text, watermark) {
  const res = await fetch(`https://apiii-xrina.my.id/canvas/fakedev?name=${encodeURIComponent(title || 'Toxic-MD')}&avatar=${encodeURIComponent(imgUrl)}`, {
    headers: { 'User-Agent': UA },
    timeout: 60000
  });
  if (!res.ok) throw new Error(`Canvas HTTP ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('image')) return await res.buffer();
  const d = await res.json().catch(() => null);
  const imgRes = d?.data?.url || d?.result?.url || d?.url;
  if (imgRes) {
    const ir = await fetch(imgRes, { headers: { 'User-Agent': UA }, timeout: 30000 });
    if (ir.ok) return await ir.buffer();
  }
  throw new Error(d?.message || 'Canvas generation failed');
}

async function makePDF(query) {
  throw new Error('PDF service unavailable');
}

async function makeSong(query) {
  throw new Error('AI song service unavailable');
}

export { makeEffect, getAnime, getAI, makePhotoEdit, enhanceImage, makeCanvas, makeRC, makePDF, makeSong };
