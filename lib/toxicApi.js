import fetch from 'node-fetch';
import { TOXIC_API_KEY, TOXIC_API_FALLBACK } from '../keys.js';


  const BASE = 'https://api.giftedtech.co.ke/api';

  function getKeys() {
      return [TOXIC_API_KEY, TOXIC_API_FALLBACK].filter(Boolean);
  }

  function _cleanErr(e) {
      return new Error(e.type || e.code || e.name || 'request failed');
  }

  async function makeEffect(endpoint, text, extraParams = {}) {
      const keys = getKeys();
      let lastErr;
      for (const apikey of keys) {
          try {
              const params = new URLSearchParams({ text, apikey, ...extraParams });
              const res = await fetch(`${BASE}/ephoto360/${endpoint}?${params}`, { timeout: 30000 });
              if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
              const data = await res.json();
              if (!data.success || !data.result?.image_url) { lastErr = new Error(data.message || 'no image_url'); continue; }
              const imgRes = await fetch(data.result.image_url, { timeout: 20000 });
              if (!imgRes.ok) { lastErr = new Error(`Image fetch HTTP ${imgRes.status}`); continue; }
              return await imgRes.buffer();
          } catch (e) { lastErr = _cleanErr(e); }
      }
      throw lastErr || new Error('Effect generation failed');
  }

  const _WAIFU_PICS = new Set(['waifu','neko','shinobu','megumin','bully','cuddle','cry','hug','awoo','kiss','lick','pat','smug','bonk','blush','smile','wave','highfive','handhold','nom','bite','glomp','slap','kill','happy','wink','poke','dance','cringe']);
  const _NEKOS_BEST = new Set(['neko','waifu','husbando','kitsune','blush','smug','pat','hug','kiss','bite','happy','cry','dance','wave','poke','slap','cuddle','nom','punch','tickle','yeet','facepalm','bonk']);
  const _ANIME_REMAP = { maid: 'waifu', miko: 'waifu', uniform: 'waifu' };

  async function getAnime(endpoint) {
      const ep = _ANIME_REMAP[endpoint] || endpoint;
      const keys = getKeys();
      let lastErr;
      for (const apikey of keys) {
          try {
              const params = new URLSearchParams({ apikey });
              const res = await fetch(`${BASE}/anime/${ep}?${params}`, { timeout: 20000 });
              if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
              const ct = res.headers.get('content-type') || '';
              if (!ct.includes('json')) { lastErr = new Error('not json'); continue; }
              const data = await res.json();
              if (!data.success) { lastErr = new Error(data.message || data.error || 'no result'); continue; }
              if (data.result) return data.result;
          } catch (e) { lastErr = _cleanErr(e); }
      }
      if (_WAIFU_PICS.has(ep)) {
          try {
              const res = await fetch(`https://api.waifu.pics/sfw/${ep}`, { timeout: 15000 });
              if (res.ok) { const d = await res.json(); if (d.url) return d.url; }
          } catch {}
      }
      const nbEp = _NEKOS_BEST.has(ep) ? ep : 'waifu';
      try {
          const res = await fetch(`https://nekos.best/api/v2/${nbEp}`, { timeout: 15000 });
          if (res.ok) { const d = await res.json(); if (d.results?.[0]?.url) return d.results[0].url; }
      } catch {}
      throw lastErr || new Error('Anime fetch failed');
  }

  async function getAI(endpoint, query) {
      const keys = getKeys();
      let lastErr;
      for (const apikey of keys) {
          try {
              const params = new URLSearchParams({ q: query, apikey });
              const res = await fetch(`${BASE}/ai/${endpoint}?${params}`, { timeout: 30000 });
              if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
              const data = await res.json();
              if (!data.success) { lastErr = new Error(data.message || data.error || 'no result'); continue; }
              return data.result;
          } catch (e) { lastErr = _cleanErr(e); }
      }
      throw lastErr || new Error('AI request failed');
  }

  function _extractImgUrl(data) {
      if (!data || !data.success) return null;
      const r = data.result;
      if (typeof r === 'string' && r.startsWith('http')) return r;
      if (r?.output && typeof r.output === 'string') return r.output;
      if (r?.image_url && typeof r.image_url === 'string') return r.image_url;
      if (r?.imageUrl && typeof r.imageUrl === 'string') return r.imageUrl;
      if (r?.url && typeof r.url === 'string') return r.url;
      if (Array.isArray(r?.all_outputs) && r.all_outputs[0]) return r.all_outputs[0];
      return null;
  }

  async function makePhotoEdit(imageUrl, prompt) {
      const keys = getKeys();
      let lastErr;
      const editEndpoints = [
          { ep: 'photoeditor', extra: {} },
          { ep: 'photoeditorv2', extra: {} },
          { ep: 'photoeditorv3', extra: {} },
          { ep: 'imageeditor', extra: {} },
          { ep: 'nanobanana', extra: {} },
          { ep: 'nanobanana', extra: { model: 'v2' } },
      ];
      for (const { ep, extra } of editEndpoints) {
          for (const apikey of keys) {
              try {
                  const params = new URLSearchParams({ url: imageUrl, prompt, apikey, ...extra });
                  const res = await fetch(`${BASE}/tools/${ep}?${params}`, { timeout: 60000 });
                  if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
                  const data = await res.json();
                  const imgUrl = _extractImgUrl(data);
                  if (!imgUrl) { lastErr = new Error(data.error || data.message || 'no output url'); continue; }
                  return imgUrl;
              } catch (e) { lastErr = _cleanErr(e); }
          }
      }
      throw lastErr || new Error('Photo edit failed');
  }

  async function enhanceImage(imageUrl) {
      const keys = getKeys();
      let lastErr;
      const enhEndpoints = [
          { ep: 'remini', extra: '' },
          { ep: 'imageenhancer', extra: '' },
          { ep: 'imagehd', extra: '' },
          { ep: 'imageupscaler', extra: '&model=enhance' },
          { ep: 'imageupscaler', extra: '&model=upscale' },
          { ep: 'imageupscale', extra: '' },
      ];
      for (const { ep, extra } of enhEndpoints) {
          for (const apikey of keys) {
              try {
                  const res = await fetch(`${BASE}/tools/${ep}?url=${encodeURIComponent(imageUrl)}&apikey=${apikey}${extra}`, { timeout: 30000 });
                  if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
                  const data = await res.json();
                  const imgUrl = _extractImgUrl(data);
                  if (!imgUrl) { lastErr = new Error(data.error || data.message || 'no url'); continue; }
                  return imgUrl;
              } catch (e) { lastErr = _cleanErr(e); }
          }
      }
      const nbPrompts = [
          'enhance to HD quality, upscale and sharpen details',
          'make HD quality, improve resolution',
      ];
      for (const prompt of nbPrompts) {
          for (const apikey of keys) {
              try {
                  const params = new URLSearchParams({ url: imageUrl, prompt, apikey });
                  const res = await fetch(`${BASE}/tools/nanobanana?${params}`, { timeout: 45000 });
                  if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
                  const data = await res.json();
                  const imgUrl = _extractImgUrl(data);
                  if (!imgUrl) { lastErr = new Error(data.error || data.message || 'no url'); continue; }
                  return imgUrl;
              } catch (e) { lastErr = _cleanErr(e); }
          }
      }
      throw lastErr || new Error('Enhancement failed');
  }

  async function makeCanvas(imgUrl, title, type, text, watermark) {
      const keys = getKeys();
      let lastErr;
      for (const apikey of keys) {
          try {
              const params = new URLSearchParams({ url: imgUrl, title, type: type || 'spotify', text: text || '', watermark: watermark || 'TOXIC-MD', apikey });
              const res = await fetch(`${BASE}/tools/canvas?${params}`, { timeout: 30000 });
              if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
              const ct = res.headers.get('content-type') || '';
              if (ct.includes('image')) return await res.buffer();
              const data = await res.json();
              const imgRes = _extractImgUrl(data);
              if (imgRes) {
                  const ir = await fetch(imgRes, { timeout: 20000 });
                  if (ir.ok) return await ir.buffer();
              }
              lastErr = new Error('no image in response');
          } catch (e) { lastErr = _cleanErr(e); }
      }
      throw lastErr || new Error('Canvas generation failed');
  }

  async function makeRC(imageUrl, prompt) {
      const keys = getKeys();
      let lastErr;
      for (const apikey of keys) {
          try {
              const params = new URLSearchParams({ url: imageUrl, prompt, apikey });
              const res = await fetch(`${BASE}/tools/rc?${params}`, { timeout: 60000 });
              if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
              const data = await res.json();
              const imgUrl = _extractImgUrl(data);
              if (!imgUrl) { lastErr = new Error(data.error || data.message || 'no url'); continue; }
              return imgUrl;
          } catch (e) { lastErr = _cleanErr(e); }
      }
      throw lastErr || new Error('RC edit failed');
  }

  async function makePDF(query) {
      const keys = getKeys();
      let lastErr;
      for (const apikey of keys) {
          try {
              const params = new URLSearchParams({ query, apikey });
              const res = await fetch(`${BASE}/tools/topdf?${params}`, { timeout: 30000 });
              if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
              const ct = res.headers.get('content-type') || '';
              if (!ct.includes('pdf')) { lastErr = new Error('not a pdf'); continue; }
              return await res.buffer();
          } catch (e) { lastErr = _cleanErr(e); }
      }
      throw lastErr || new Error('PDF creation failed');
  }

  async function makeSong(query) {
      const keys = getKeys();
      let lastErr;
      for (const apikey of keys) {
          try {
              const params = new URLSearchParams({ q: query, apikey });
              const res = await fetch(`${BASE}/tools/aisong?${params}`, { timeout: 90000 });
              if (!res.ok) { lastErr = new Error(`HTTP ${res.status}`); continue; }
              const data = await res.json();
              if (!data.success) { lastErr = new Error(data.message || data.error || 'no result'); continue; }
              return data.result;
          } catch (e) { lastErr = _cleanErr(e); }
      }
      throw lastErr || new Error('Song generation failed');
  }

  export { makeEffect, getAnime, getAI, makePhotoEdit, enhanceImage, makeCanvas, makeRC, makePDF, makeSong };
  