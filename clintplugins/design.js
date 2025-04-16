const {
  zokou
} = require("../framework/zokou");
const {
  default: axios
} = require("axios");
zokou({
  nomCom: "gen",
  reaction: "💥",
  categorie: "Toxic"
}, async (_0x19b10f, _0x10ca95, _0x5f3b1d) => {
  const {
    repondre: _0x36a262,
    arg: _0x32bdf7,
    ms: _0x347586
  } = _0x5f3b1d;
  try {
    if (!_0x32bdf7 || _0x32bdf7.length === 0) {
      return _0x36a262("Please describe your image and Toxic-MD will generate it.");
    }
    const _0x5207e1 = _0x32bdf7.join(" ");
    const _0x31ac22 = "https://www.samirxpikachu.run.place/ArcticFL?prompt=" + _0x5207e1;
    const _0x202b50 = {
      url: _0x31ac22
    };
    const _0x52094d = {
      image: _0x202b50,
      caption: "*powered by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*"
    };
    const _0x1b777a = {
      quoted: _0x347586
    };
    _0x10ca95.sendMessage(_0x19b10f, _0x52094d, _0x1b777a);
  } catch (_0x5d6292) {
    console.error("Erreur:", _0x5d6292.message || "Une erreur s'est produite");
    _0x36a262("Oops, an error occurred while processing your request");
  }
}); // Steal at your own risk ☠👾