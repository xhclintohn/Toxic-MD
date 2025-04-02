const axios = require("axios");
const {
  zokou
} = require("../framework/zokou");
const fs = require("fs-extra");
const {
  exec
} = require("child_process");
const child_process = require("child_process");
const {
  unlink
} = require("fs").promises;
const sleep = _0x16fef4 => {
  return new Promise(_0x57bc99 => {
    setTimeout(_0x57bc99, _0x16fef4);
  });
};
const GIFBufferToVideoBuffer = async _0x1ae2c5 => {
  const _0x3ff4a6 = "" + Math.random().toString(36);
  await fs.writeFileSync("./" + _0x3ff4a6 + ".gif", _0x1ae2c5);
  child_process.exec("ffmpeg -i ./" + _0x3ff4a6 + ".gif -movflags faststart -pix_fmt yuv420p -vf \"scale=trunc(iw/2)*2:trunc(ih/2)*2\" ./" + _0x3ff4a6 + ".mp4");
  await sleep(4000);
  var _0x24462b = await fs.readFileSync("./" + _0x3ff4a6 + ".mp4");
  Promise.all([unlink("./" + _0x3ff4a6 + ".mp4"), unlink("./" + _0x3ff4a6 + ".gif")]);
  return _0x24462b;
};
const generateReactionCommand = (_0x590e3d, _0x3759e6) => {
  zokou({
    nomCom: _0x590e3d,
    categorie: "Reaction",
    reaction: _0x3759e6
  }, async (_0x1a2c0e, _0x5cdcd6, _0x1ff662) => {
    const {
      auteurMessage: _0x5790cf,
      auteurMsgRepondu: _0x2a481e,
      repondre: _0x3d1783,
      ms: _0x5ba907,
      msgRepondu: _0x11b8d2
    } = _0x1ff662;
    const _0x389b2e = "https://api.waifu.pics/sfw/" + _0x590e3d;
    try {
      const _0x7b112b = await axios.get(_0x389b2e);
      const _0x5d3864 = _0x7b112b.data.url;
      const _0x6cb22d = await axios.get(_0x5d3864, {
        responseType: "arraybuffer"
      });
      const _0x1d2ba1 = await _0x6cb22d.data;
      const _0x347cc1 = await GIFBufferToVideoBuffer(_0x1d2ba1);
      if (_0x11b8d2) {
        var _0x1ea2d4 = " @" + _0x5790cf.split("@")[0] + "  " + _0x590e3d + " @" + _0x2a481e.split("@")[0];
        const _0xe2cfb9 = {
          video: _0x347cc1,
          gifPlayback: true,
          caption: _0x1ea2d4,
          mentions: [_0x5790cf, _0x2a481e]
        };
        const _0x38cb57 = {
          quoted: _0x5ba907
        };
        _0x5cdcd6.sendMessage(_0x1a2c0e, _0xe2cfb9, _0x38cb57);
      } else {
        const _0x10466e = {
          video: _0x347cc1,
          gifPlayback: true,
          caption: "@" + _0x5790cf.split("@")[0] + " " + _0x590e3d + " everyone",
          mentions: [_0x5790cf]
        };
        const _0x20309d = {
          quoted: _0x5ba907
        };
        _0x5cdcd6.sendMessage(_0x1a2c0e, _0x10466e, _0x20309d);
      }
    } catch (_0x338322) {
      _0x3d1783("Erreur lors de la récupération des données :" + _0x338322);
      console.log(_0x338322);
    }
  });
};
generateReactionCommand("bully", "👊");
generateReactionCommand("cuddle", "🤗");
generateReactionCommand("cry", "😢");
generateReactionCommand("hug", "😊");
generateReactionCommand("awoo", "🐺");
generateReactionCommand("kiss", "😘");
generateReactionCommand("lick", "👅");
generateReactionCommand("pat", "👋");
generateReactionCommand("smug", "😏");
generateReactionCommand("bonk", "🔨");
generateReactionCommand("yeet", "🚀");
generateReactionCommand("blush", "😊");
generateReactionCommand("smile", "😄");
generateReactionCommand("wave", "👋");
generateReactionCommand("highfive");
generateReactionCommand("handhold");
generateReactionCommand("nom", "👅");
generateReactionCommand("bite", "🦷");
generateReactionCommand("glomp", "🤗");
generateReactionCommand("slap", "👋");
generateReactionCommand("kill", "💀");
generateReactionCommand("kick", "🦵");
generateReactionCommand("happy", "😄");
generateReactionCommand("wink", "😉");
generateReactionCommand("poke", "👉");
generateReactionCommand("dance", "💃");
generateReactionCommand("cringe", "😬");