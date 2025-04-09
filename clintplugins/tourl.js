const { zokou } = require("../framework/zokou");
const fs = require("fs");
const util = require("util");
const { TelegraPh } = require("../../lib/uploader");

// 𝐔𝐭𝐢𝐥𝐢𝐭𝐢𝐞𝐬 𝐌𝐨𝐝𝐮𝐥𝐞
// 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

zokou(
  {
    nomCom: "tourl",
    categorie: "Utilities",
    reaction: "🍁",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, prefixe, quoted } = commandeOptions;

    // Check if an image is quoted
    if (!quoted || !/image/.test(quoted.mtype)) {
      return repondre(
        `𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}𝐭𝐨𝐮𝐫𝐥 <𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐢𝐦𝐚𝐠𝐞>\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 𝐭𝐨 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐚 𝐔𝐑𝐋!`
      );
    }

    try {
      repondre(`𝐆𝐞𝐧𝐞𝐫�{a𝐭𝐢�{n𝐠 �{a 𝐔�{R�{L �{f�{o�{r �{y�{o�{u�{r �{i�{m�{a�{g�{e...`);

      // Download and save the quoted image
      const media = await zk.downloadAndSaveMediaMessage(quoted);

      // Upload to Telegra.ph and get URL
      const url = await TelegraPh(media);

      // Send the image with the generated URL
      await zk.sendMessage(
        dest,
        {
          image: { url: media },
          caption: `𝐆�{e�{n�{e�{r�{a�{t�{e�{d �{I�{m�{a�{g�{e �{L�{i�{n�{k: \n\n${util.format(url)}\n\n�{P�{o�{w�{e�{r�{e�{d �{b�{y �{x�{h_�{c�{l�{i�{n�{t�{o�{n`,
        },
        { quoted: ms }
      );

      // Clean up the temporary file
      await fs.unlinkSync(media);
    } catch (e) {
      repondre(`�{E�{r�{r�{o�{r �{g�{e�{n�{e�{r�{a�{t�{i�{n�{g �{U�{R�{L: ${e.message}`);
    }
  }
);

module.exports = { zokou };