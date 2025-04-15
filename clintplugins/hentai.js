const {
  zokou: a34_0x11bad5
} = require("../framework/zokou");
const a34_0x53f42f = require("axios");
const a34_0x5b3bf8 = require("cheerio");
let a34_0x2af0bc = require("../framework/mesfonctions");
let a34_0x4493f6 = require("../bdd/hentai");
a34_0x11bad5({
  nomCom: "hwaifu",
  categorie: "Hentai",
  reaction: "🙄",
  desc: "send 5 hentai waifu images"
}, async (_0x28a68a, _0x51ecc0, _0x405381) => {
  const {
    repondre: _0x46156a,
    ms: _0x2d8852,
    verifGroupe: _0x35cd4d,
    superUser: _0x256242
  } = _0x405381;
  if (!_0x35cd4d && !_0x256242) {
    _0x46156a("This command is reserved for groups only.");
    return;
  }
  let _0x4bea62 = await a34_0x4493f6.checkFromHentaiList(_0x28a68a);
  if (!_0x4bea62 && !_0x256242) {
    _0x46156a("This group is not a group of perverts, calm down my friend.");
    return;
  }
  const _0x4c0ced = "https://api.waifu.pics/nsfw/waifu";
  try {
    for (let _0x4cff28 = 0; _0x4cff28 < 5; _0x4cff28++) {
      const _0x113140 = await a34_0x53f42f.get(_0x4c0ced);
      const _0x32512b = _0x113140.data.url;
      const _0x3f3fe6 = {
        url: _0x32512b
      };
      const _0xbbaa6d = {
        image: _0x3f3fe6
      };
      const _0x3ae3c9 = {
        quoted: _0x2d8852
      };
      _0x51ecc0.sendMessage(_0x28a68a, _0xbbaa6d, _0x3ae3c9);
    }
  } catch (_0x20caf5) {
    _0x46156a("Error occurred while retrieving the data. : " + _0x20caf5);
  }
});
a34_0x11bad5({
  nomCom: "trap",
  categorie: "Hentai",
  reaction: "🙄",
  desc: "send 5 hentai trap images"
}, async (_0x3a7167, _0x3b6f22, _0xad2957) => {
  const {
    repondre: _0x18e4d6,
    ms: _0x23663d,
    verifGroupe: _0x2a74b4,
    superUser: _0x2abbe0
  } = _0xad2957;
  if (!_0x2a74b4 && !_0x2abbe0) {
    _0x18e4d6("This command is reserved for groups only.");
    return;
  }
  let _0x134c9f = await a34_0x4493f6.checkFromHentaiList(_0x3a7167);
  if (!_0x134c9f && !_0x2abbe0) {
    _0x18e4d6("This group is not a group of perverts, calm down my friend.");
    return;
  }
  const _0xbfbcbf = "https://api.waifu.pics/nsfw/trap";
  try {
    for (let _0x86e756 = 0; _0x86e756 < 5; _0x86e756++) {
      const _0x36af96 = await a34_0x53f42f.get(_0xbfbcbf);
      const _0xc4c033 = _0x36af96.data.url;
      const _0x3c5a5e = {
        url: _0xc4c033
      };
      const _0x4056d9 = {
        image: _0x3c5a5e
      };
      const _0x2503dd = {
        quoted: _0x23663d
      };
      _0x3b6f22.sendMessage(_0x3a7167, _0x4056d9, _0x2503dd);
    }
  } catch (_0x5b10f4) {
    _0x18e4d6("Error occurred while retrieving the data. :", _0x5b10f4);
  }
});
a34_0x11bad5({
  nomCom: "hneko",
  categorie: "Hentai",
  reaction: "🙄",
  desc: "send 5 hentai neko images"
}, async (_0x5e7ead, _0x184206, _0x413a22) => {
  const {
    repondre: _0x274408,
    ms: _0x1de0f2,
    verifGroupe: _0x25d7ea,
    superUser: _0x751a59
  } = _0x413a22;
  if (!_0x25d7ea && !_0x751a59) {
    _0x274408("This command is reserved for groups only.");
    return;
  }
  let _0x50ef8f = await a34_0x4493f6.checkFromHentaiList(_0x5e7ead);
  if (!_0x50ef8f && !_0x751a59) {
    _0x274408("This group is not a group of perverts, calm down my friend.");
    return;
  }
  const _0x10ccdc = "https://api.waifu.pics/nsfw/neko";
  try {
    for (let _0x5a2cb5 = 0; _0x5a2cb5 < 5; _0x5a2cb5++) {
      const _0x3d44ea = await a34_0x53f42f.get(_0x10ccdc);
      const _0x3c1f6a = _0x3d44ea.data.url;
      const _0x59dd14 = {
        url: _0x3c1f6a
      };
      const _0x5e30cd = {
        image: _0x59dd14
      };
      const _0x30d489 = {
        quoted: _0x1de0f2
      };
      _0x184206.sendMessage(_0x5e7ead, _0x5e30cd, _0x30d489);
    }
  } catch (_0x3a3629) {
    _0x274408("Error occurred while retrieving the data. :", _0x3a3629);
  }
});
a34_0x11bad5({
  nomCom: "blowjob",
  categorie: "Hentai",
  reaction: "🙄",
  desc: "send 5 hentai blowjob images"
}, async (_0x42313e, _0x3c1620, _0x55934c) => {
  const {
    repondre: _0x315693,
    ms: _0x3f01a7,
    verifGroupe: _0xabaa6e,
    superUser: _0x1a956c
  } = _0x55934c;
  if (!_0xabaa6e && !_0x1a956c) {
    _0x315693("This command is reserved for groups only.");
    return;
  }
  let _0x389083 = await a34_0x4493f6.checkFromHentaiList(_0x42313e);
  if (!_0x389083 && !_0x1a956c) {
    _0x315693("This group is not a group of perverts, calm down my friend.");
    return;
  }
  const _0x5f4c02 = "https://api.waifu.pics/nsfw/blowjob";
  try {
    for (let _0x39f40c = 0; _0x39f40c < 5; _0x39f40c++) {
      const _0x4d31b6 = await a34_0x53f42f.get(_0x5f4c02);
      const _0x5f09fd = _0x4d31b6.data.url;
      const _0x31ea0d = {
        url: _0x5f09fd
      };
      const _0x2334d5 = {
        image: _0x31ea0d
      };
      const _0x2f9004 = {
        quoted: _0x3f01a7
      };
      _0x3c1620.sendMessage(_0x42313e, _0x2334d5, _0x2f9004);
    }
  } catch (_0x5181e4) {
    _0x315693("Error occurred while retrieving the data. :", _0x5181e4);
  }
});
a34_0x11bad5({
  nomCom: "hentaivid",
  categorie: "Hentai",
  reaction: "🙄",
  desc: "send random hentai videos"
}, async (_0x5e4f97, _0x247b8e, _0x437f2f) => {
  const {
    repondre: _0x17b411,
    ms: _0xf5e05c,
    verifGroupe: _0x9c3b8,
    superUser: _0x163f13
  } = _0x437f2f;
  if (!_0x9c3b8 && !_0x163f13) {
    _0x17b411("This command is reserved for groups only.");
    return;
  }
  let _0x1b69dc = await a34_0x4493f6.checkFromHentaiList(_0x5e4f97);
  if (!_0x1b69dc && !_0x163f13) {
    _0x17b411("This group is not a group of perverts, calm down my friend.");
    return;
  }
  try {
    let _0x3557b3 = await a34_0x4a29cb();
    let _0x24230c;
    if (_0x3557b3.length > 10) {
      _0x24230c = 10;
    } else {
      _0x24230c = _0x3557b3.length;
    }
    let _0x5ce4bf = Math.floor(Math.random() * _0x24230c);
    const _0x31e0c2 = {
      url: _0x3557b3[_0x5ce4bf].video_1
    };
    const _0x1f1f87 = {
      video: _0x31e0c2,
      caption: "*Title :* " + _0x3557b3[_0x5ce4bf].title + " \n *Category :* " + _0x3557b3[_0x5ce4bf].category
    };
    const _0xb592dd = {
      quoted: _0xf5e05c
    };
    _0x247b8e.sendMessage(_0x5e4f97, _0x1f1f87, _0xb592dd);
  } catch (_0x3e2e38) {
    console.log(_0x3e2e38);
  }
});
async function a34_0x4a29cb() {
  return new Promise((_0xd80be2, _0x90854b) => {
    const _0x802802 = Math.floor(Math.random() * 1153);
    a34_0x53f42f.get("https://sfmcompile.club/page/" + _0x802802).then(_0x346f1d => {
      const _0x4d9d84 = a34_0x5b3bf8.load(_0x346f1d.data);
      const _0x216044 = [];
      _0x4d9d84("#primary > div > div > ul > li > article").each(function (_0x3fb927, _0x200f71) {
        _0x216044.push({
          title: _0x4d9d84(_0x200f71).find("header > h2").text(),
          link: _0x4d9d84(_0x200f71).find("header > h2 > a").attr("href"),
          category: _0x4d9d84(_0x200f71).find("header > div.entry-before-title > span > span").text().replace("in ", ""),
          share_count: _0x4d9d84(_0x200f71).find("header > div.entry-after-title > p > span.entry-shares").text(),
          views_count: _0x4d9d84(_0x200f71).find("header > div.entry-after-title > p > span.entry-views").text(),
          type: _0x4d9d84(_0x200f71).find("source").attr("type") || "image/jpeg",
          video_1: _0x4d9d84(_0x200f71).find("source").attr("src") || _0x4d9d84(_0x200f71).find("img").attr("data-src"),
          video_2: _0x4d9d84(_0x200f71).find("video > a").attr("href") || ""
        });
      });
      _0xd80be2(_0x216044);
    });
  });
}