const {
  zokou
} = require("../framework/zokou");
const axios = require("axios").default;
zokou({
  nomCom: "gpt",
  reaction: "📡",
  categorie: "AI"
}, async (_0x143e25, _0x1a5cd7, _0x1f2583) => {
  const {
    repondre: _0x451a9e,
    arg: _0x26cac8,
    ms: _0x9e5d7c
  } = _0x1f2583;
  try {
    if (!_0x26cac8 || _0x26cac8.length === 0) {
      return _0x451a9e("Please ask a question, and Toxic will answer it.");
    }
    const _0x31f01f = _0x26cac8.join(" ");
    const _0x4e3d23 = await axios.get("https://widipe.com/v2/gpt4?text=" + encodeURIComponent(_0x31f01f));
    const _0x3e61bc = _0x4e3d23.data;
    if (_0x3e61bc && _0x3e61bc.result) {
      _0x451a9e(_0x3e61bc.result);
    } else {
      _0x451a9e("Error during response generation.");
    }
  } catch (_0x2f9cd1) {
    console.error("Error:", _0x2f9cd1.message || "An unknown error occurred.");
    _0x451a9e("Oops, an error occurred while processing your request.");
  }
});