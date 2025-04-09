const { zokou } = require("../framework/zokou");
const axios = require("axios");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
//                   𝐔𝐓𝐈𝐋𝐈𝐓𝐈𝐄𝐒 𝐌𝐎𝐃𝐔𝐋𝐄             //
//               𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃                //
//             𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧                   //
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

zokou(
  {
    nomCom: "getcmd",
    categorie: "Utilities",
    reaction: "🛠",
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg, prefixe, nomAuteurMessage } = commandeOptions;

   
    const ownerNumber = "254735342808@s.whatsapp.net";
    const sender = ms.key.participant || ms.key.remoteJid;

    
    if (sender !== ownerNumber) {
      return repondre(
        `❌ 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲!\n\n𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐫𝐞𝐬𝐭𝐫𝐢𝐜𝐭𝐞𝐝 𝐭𝐨 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐨𝐰𝐧𝐞𝐫 (@${ownerNumber.split("@")[0]}).`
      );
    }

    // Check for filename argument
    if (!arg || arg.length === 0) {
      return repondre(
        `🛠 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: ${prefixe}getcmd logo.js\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐟𝐢𝐥𝐞𝐧𝐚𝐦�(e 𝐭𝐨 𝐫�(e𝐭𝐫𝐢�(e𝐯�(e 𝐟𝐫𝐨𝐦 𝐭𝐡�(e 𝐩𝐥𝐮𝐠𝐢𝐧𝐬 𝐫𝐞𝐩𝐨!`
      );
    }

    const fileName = arg.join(" ").trim();
    if (!fileName.endsWith(".js")) {
      return repondre(
        `❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐅𝐢�(l𝐞𝐧𝐚𝐦�(e!\n\n𝐏�(l𝐞𝐚𝐬�(e 𝐮𝐬�(e 𝐚 .𝐣𝐬 𝐟𝐢(l𝐞 𝐧𝐚𝐦�(e (𝐞.𝐠., 𝐥𝐨𝐠𝐨.𝐣𝐬).`
      );
    }

    // GitHub repo details (replace with your actual repo)
    const repoOwner = "xhclintohn"; 
    const repoName = "Toxic-MD";   // Replace with your repo name
    const folder = "clintplugins";
    const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${folder}/${fileName}`;

    try {
      repondre(`🔄 𝐅𝐞𝐭𝐜𝐡𝐢𝐧�(g 𝐜𝐨𝐧𝐭�(e𝐧𝐭𝐬 𝐨𝐟 "${fileName}"...`);

      // Fetch file content from GitHub
      const response = await axios.get(rawUrl);
      const fileContent = response.data;

      // Format response
      const message = `
◈━━━━━━━━━━━━━━━━◈
  🛠 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐅𝐈𝐋𝐄 𝐑𝐄𝐓𝐑𝐈�(E𝐕𝐀𝐋 ⚡️

> 𝐅𝐢�(l𝐞𝐧�(a𝐦�(e: *${fileName}*
> 𝐒𝐨𝐮𝐫�(c�(e: 𝐆𝐢𝐭𝐇𝐮𝐛 𝐑�(e𝐩𝐨

\`\`\`javascript
${fileContent}
\`\`\`

◈━━━━━━━━━━━━━━━━◈
�(P�(o𝐰�(e𝐫�(e𝐝 𝐛𝐲 𝐓𝐨𝐱�(i𝐜-𝐌�(D
�(O𝐰�(n�(e�(r: �(x𝐡_�(c𝐥𝐢𝐧�(t�(o𝐧
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
      console.error("Erreur lors de la récupération du fichier :", error);
      let errorMsg = "❌ �(E𝐫𝐫�(o�(r 𝐫�(e𝐭�(r𝐢�(e�(v𝐢�(n�(g 𝐟�(i�(l�(e!";
      if (error.response && error.response.status === 404) {
        errorMsg = `❌ �(F𝐢�(l�(e "${fileName}" 𝐧�(o𝐭 𝐟�(o�(u�(n�(d 𝐢�(n 𝐭�(h�(e 𝐫�(e𝐩�(o!`;
      } else {
        errorMsg += `\n�(D�(e�(t�(a�(i�(l�(s: ${error.message}`;
      }
      repondre(errorMsg);
    }
  }
);

module.exports = { zokou };