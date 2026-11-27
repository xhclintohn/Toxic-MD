import axios from 'axios';
import * as cheerio from 'cheerio';
import FormData from 'form-data';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export const EPHOTO_EFFECTS = {
  glossysilver: 'https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html',
  glitchtext: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
  writetext: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
  advancedglow: 'https://en.ephoto360.com/advanced-glow-effects-74.html',
  typographytext: 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
  pixelglitch: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
  neonglitch: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
  flagtext: 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
  flag3dtext: 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
  deletingtext: 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
  blackpinkstyle: 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html',
  glowingtext: 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html',
  underwater: 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
  underwatertext: 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
  logomaker: 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
  cartoonstyle: 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html',
  papercutstyle: 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html',
  watercolortext: 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html',
  effectclouds: 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
  blackpinklogo: 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html',
  gradienttext: 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html',
  summerbeach: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html',
  luxurygold: 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html',
  multicoloredneon: 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html',
  multicolored: 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html',
  sandsummer: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
  galaxywallpaper: 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html',
  galaxy: 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html',
  '1917style': 'https://en.ephoto360.com/1917-style-text-effect-523.html',
  makingneon: 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
  royaltext: 'https://en.ephoto360.com/royal-text-effect-online-free-471.html',
  freecreate: 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html',
  galaxystyle: 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html',
  amongustext: 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html',
  rainytext: 'https://en.ephoto360.com/foggy-rainy-text-effect-75.html',
  lighteffects: 'https://en.ephoto360.com/light-effects-74.html'
};

export async function ephoto360(effectId, textInput) {
  const url = EPHOTO_EFFECTS[String(effectId || '').toLowerCase()];
  if (!url) throw new Error(`Unknown effect: ${effectId}`);

  const initialResponse = await axios.get(url, {
    headers: { 'User-Agent': UA },
    timeout: 30000
  });

  const $ = cheerio.load(initialResponse.data);
  const token = $('input[name="token"]').val();
  const buildServer = $('input[name="build_server"]').val();
  const buildServerId = $('input[name="build_server_id"]').val();
  const cookies = initialResponse.headers['set-cookie'] || [];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

  if (!token || !buildServer || !buildServerId) {
    throw new Error('ephoto360 token not found');
  }

  const formData = new FormData();
  formData.append('text[]', textInput);
  formData.append('token', token);
  formData.append('build_server', buildServer);
  formData.append('build_server_id', buildServerId);

  const postResponse = await axios.post(url, formData, {
    headers: {
      ...formData.getHeaders(),
      'User-Agent': UA,
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie': cookieHeader,
      'Referer': url
    },
    timeout: 30000
  });

  const $$ = cheerio.load(postResponse.data);
  const rawFormValue = $$('input[name="form_value_input"]').val();
  if (!rawFormValue) throw new Error('ephoto360 form data not found');

  const formValueInput = JSON.parse(rawFormValue);
  formValueInput['text[]'] = formValueInput.text;
  delete formValueInput.text;

  const finalResponse = await axios.post(
    'https://en.ephoto360.com/effect/create-image',
    new URLSearchParams(formValueInput),
    {
      headers: {
        'User-Agent': UA,
        'Cookie': cookieHeader,
        'Referer': url,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000
    }
  );

  if (!finalResponse.data?.image) throw new Error('ephoto360 image url not found');
  return new URL(finalResponse.data.image, buildServer).href;
}

export async function ephoto360Buffer(effectId, textInput) {
  const imgUrl = await ephoto360(effectId, textInput);
  const res = await axios.get(imgUrl, {
    responseType: 'arraybuffer',
    headers: { 'User-Agent': UA },
    timeout: 30000
  });
  return Buffer.from(res.data);
}
