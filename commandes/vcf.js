(function (_0x5b479e, _0x199dbc) {
  const _0x378536 = _0x5b479e();
  while (true) {
    try {
      const _0x5a8d19 = -parseInt(_0x5c95(401, 592)) / 1 * (-parseInt(_0x5c95(463, 541)) / 2) + -parseInt(_0x5c95(410, 1160)) / 3 * (-parseInt(_0x5c95(413, 1268)) / 4) + -parseInt(_0x5c95(434, 626)) / 5 + parseInt(_0x5c95(382, 518)) / 6 * (-parseInt(_0x5c95(449, 595)) / 7) + parseInt(_0x5c95(420, 571)) / 8 + parseInt(_0x5c95(409, 585)) / 9 * (parseInt(_0x5c95(476, 612)) / 10) + -parseInt(_0x5c95(443, 568)) / 11 * (parseInt(_0x5c95(391, 1138)) / 12);
      if (_0x5a8d19 === _0x199dbc) {
        break;
      } else {
        _0x378536.push(_0x378536.shift());
      }
    } catch (_0x43828f) {
      _0x378536.push(_0x378536.shift());
    }
  }
})(_0x31a7, 454861);
function _0x5c95(_0x3f2bb7, _0x10a913) {
  const _0x14ee3e = _0x31a7();
  _0x5c95 = function (_0x294189, _0x5161f3) {
    _0x294189 = _0x294189 - 355;
    let _0x2d0fe0 = _0x14ee3e[_0x294189];
    return _0x2d0fe0;
  };
  return _0x5c95(_0x3f2bb7, _0x10a913);
}
function _0x28667a(_0x5e4cae, _0x52d8db, _0x42e1d1, _0xff51ce) {
  return _0x5c95(_0x42e1d1 + 628, _0x52d8db);
}
function _0x31a7() {
  const _0x47335e = ["bind", "eys", "console", "RFyfE", "e creating", "loMmr", "HDIKY", "MEEzj", "3377532cEZkAK", "trim", "QAJOv", "LeJcw", "cSrlI", "constructo", "MqqDs", "oMTPM", "...", "\nTotal Con", "2VxxMLf", "RXKhU", "\nTEL;type=", "xPVWf", "writeFileS", "GptjI", "nction() ", "iMtjG", "2133ZRebaP", "51rySsPw", "tacts: ", "warn", "160708yvDLZl", "YSkga", "KebhQ", "jyTDI", "info", "message", "categorie", "2908600gCGdgG", "MKwzr", "YcJXX", "return (fu", "XgnZF", "MiUth", " here!", "VOICE;waid", "name", "n groups o", "log", "t an admin", "ng or send", "zSzAi", "2285765EeDrOK", "../framewo", "default", "rk/zokou", "toString", "subject", "split", "DVNfF", "exception", "22ZdPNeo", "notify", "table", "XsTsK", "CELL;type=", "./contacts", "221277udsqOA", "ckets/bail", "VIQWV", "(((.+)+)+)", "xYkqZ", "juvFp", "CfTbg", ".Vcf", "text/vcard", "qkJxw", "You are no", "D\nVERSION:", "nomCom", "VCF for ", "128418pvuneL", "rCekF", "Bot is Com", "gZqZQ", "vcf", "Error whil", "F. Please ", "zkOGz", "trace", "PtZsM", "into a vcf", "Ldvfi", "glqIG", "35330SWzlUu", "nly", "try again.", " contacts ", "ctor(\"retu", "apply", "yKzWc", "VxIQm", "3.0\nFN:", "quoted", "ing the VC", "ile creati", "Group", "kBjTH", "PFvfb", "An error o", "Mropu", "g VCF:", "xpiration", "[BARAKA] +", "ccurred wh", "prototype", "BEGIN:VCAR", "length", "search", "error", " or sendin", "bBMVi", "tjQrT", "{}.constru", "A moment, ", "@whiskeyso", "102nwbdVv"];
  _0x31a7 = function () {
    return _0x47335e;
  };
  return _0x31a7();
}
function _0x5e826a(_0x413c09, _0x29ca23, _0x26c6b6, _0x31d730) {
  return _0x5c95(_0x29ca23 + 891, _0x31d730);
}
const {
  zokou
} = require("../framework/zokou");
const {
  getBinaryNodeChild,
  getBinaryNodeChildren
} = require("@whiskeysockets/baileys").default;
const _0x4ca7ae = {
  nomCom: "vcf",
  categorie: "Group",
  reaction: "📄"
};
zokou(_0x4ca7ae, async (_0x6323ff, _0xc9ea96, _0x14b2c2) => {
  const {
    repondre: _0x2ed647,
    verifGroupe: _0x3be068,
    verifAdmin: _0x51aa8a,
    ms: _0x191592
  } = _0x14b2c2;
  const _0x8b0388 = require("fs");
  if (!_0x51aa8a) {
    _0x2ed647("Lol..I need an admin position to do this!");
    return;
  }
  if (!_0x3be068) {
    _0x2ed647("Huhh dear this command is only for groups");
    return;
  }
  try {
    let _0x5739f4 = await _0xc9ea96.groupMetadata(_0x6323ff);
    const _0x43ace4 = await _0x5739f4.participants;
    let _0x74f3a2 = "";
    for (let _0x29496d of _0x43ace4) {
      let _0x4d82e3 = _0x29496d.id.split("@")[0];
      let _0x52fbd0 = _0x29496d.name || _0x29496d.notify || "[ENZO MD] +" + _0x4d82e3;
      _0x74f3a2 += "BEGIN:VCARD\nVERSION:3.0\nFN:" + _0x52fbd0 + "\nTEL;type=CELL;type=VOICE;waid=" + _0x4d82e3 + ":+" + _0x4d82e3 + "\nEND:VCARD\n";
    }
    await _0x2ed647("Hold, Compiling in progress " + _0x43ace4.length + " contacts into a vcf...");
    await _0x8b0388.writeFileSync("./contacts.vcf", _0x74f3a2.trim());
    const _0xbf2494 = {
      ephemeralExpiration: 86400,
      quoted: _0x191592
    };
    await _0xc9ea96.sendMessage(_0x6323ff, {
      document: _0x8b0388.readFileSync("./contacts.vcf"),
      mimetype: "text/vcard",
      fileName: _0x5739f4.subject + ".Vcf",
      caption: "VCF for " + _0x5739f4.subject + "\nTotal Contacts: " + _0x43ace4.length
    }, _0xbf2494);
    _0x8b0388.unlinkSync("./contacts.vcf");
  } catch (_0xca8e7e) {
    console.error("Error while creating or sending VCF:", _0xca8e7e.message || _0xca8e7e);
    _0x2ed647("An error occurred while creating or sending the VCF. Please try again.");
  }
});