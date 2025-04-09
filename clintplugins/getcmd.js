const { zokou } = require("../framework/zokou");
const axios = require("axios");

// 𝐔𝐭𝐢𝐥𝐢𝐭𝐢𝐞𝐬 𝐌𝐨𝐝𝐮𝐥𝐞
// 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧

zokou(
  {
    nomCom: "getcmd",
    categorie: "Utilities",
    reaction: "🛠",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg, prefixe, nomAuteurMessage } = commandeOptions;

    // Define owner
    const ownerNumber = "254735342808@s.whatsapp.net";
    const sender = ms.key.participant || ms.key.remoteJid;

    // Restrict to owner only
    if (sender !== ownerNumber) {
      return repondre(
        `𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!\n\n𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐫𝐞𝐬𝐭𝐫𝐢𝐜𝐭𝐞𝐝 𝐭𝐨 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 (@${ownerNumber.split("@")[0]}).`
      );
    }

    // Check for filename argument
    if (!arg || arg.length === 0) {
      return repondre(
        `𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}𝐠𝐞𝐭𝐜𝐦𝐝 𝐥𝐨𝐠𝐨.𝐣𝐳\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐟𝐢𝐥𝐞𝐧𝐚𝐦𝐞 𝐭𝐨 𝐫𝐞𝐭𝐫𝐢𝐞𝐯𝐞 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐩𝐥𝐮𝐠𝐢𝐧𝐬 𝐫𝐞𝐩𝐨!`
      );
    }

    const fileName = arg.join(" ").trim();
    if (!fileName.endsWith(".js")) {
      return repondre(
        `𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐅𝐢𝐥𝐞𝐧𝐚𝐦𝐞!\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐮𝐬𝐞 𝐚 .𝐣𝐬 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞 (𝐞.𝐠., 𝐥𝐨𝐠𝐨.𝐣𝐬).`
      );
    }

    // GitHub repo details (replace with your actual repo)
    const repoOwner = "xhclinton"; // Replace with your GitHub username
    const repoName = "toxic-md";   // Replace with your repo name
    const folder = "clintplugins";
    const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${folder}/${fileName}`;

    try {
      repondre(`𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐜𝐨𝐧𝐭𝐞𝐧𝐭𝐬 𝐨𝐟 "${fileName}"...`);

      // Fetch file content from GitHub
      const response = await axios.get(rawUrl);
      const fileContent = response.data;

      // Format response with fancy font
      const message = `
━━━━━━━━━━━━━━━━━━━
  🛠 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐅𝐢𝐥𝐞 𝐑𝐞𝐭𝐫𝐢𝐞𝐯𝐚𝐥 ⚡️

> 𝐅𝐢𝐥𝐞𝐧𝐚𝐦𝐞: *${fileName}*
> 𝐒𝐨𝐮𝐫𝐜𝐞: 𝐆𝐢𝐭𝐇𝐮𝐛 𝐑𝐞𝐩𝐨

\`\`\`javascript
${fileContent}
\`\`\`

━━━━━━━━━━━━━━━━━━━
�{P𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭�{o𝐧
�{O𝐰𝐧𝐞�{r: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭�{o𝐧
`;

      // Send the file content
      await zk.sendMessage(
        dest,
        {
          text: message,
        },
        { quoted: ms }
      );
    } catch (error) {
      console.error("Error retrieving file:", error);
      let errorMsg = "�{E𝐫𝐫�{o𝐫 �{r𝐞𝐭�{r𝐢𝐞�{v𝐢�{n�{g �{f𝐢𝐥�{e!";
      if (error.response && error.response.status === 404) {
        errorMsg = `�{F𝐢𝐥�{e "${fileName}" �{n�{o𝐭 �{f�{o𝐮�{n�{d �{i�{n �{t�{h�{e �{r�{e𝐩�{o!`;
      } else {
        errorMsg += `\n�{D�{e𝐭�{a𝐢�{l�{s: ${error.message}`;
      }
      repondre(errorMsg);
    }
  }
);

module.exports = { zokou };