const { zokou } = require("../framework/zokou");
const { default: axios } = require('axios');

const TOXIC_MD = "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃"; // Fancy font

zokou({ nomCom: "apk", categorie: 'Download', reaction: "📱" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚𝐧 𝐚𝐩𝐩 𝐧𝐚𝐦𝐞 🚫
│❒ 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .apk 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
    return;
  }

  const appName = arg.join(' ').trim();

  try {
    const apiUrl = `https://api.giftedtech.web.id/api/download/apkdl?apikey=gifted&appName=${encodeURIComponent(appName)}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success || response.data.status !== 200) {
      const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐚𝐩𝐩 😓
│❒ 𝐄𝐫𝐫𝐨𝐫: ${response.data.message || '𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐞𝐫𝐫𝐨𝐫'}
◈━━━━━━━━━━━━━━━━◈
      `;
      repondre(errorMessage);
      return;
    }

    const app = response.data.result;
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐀𝐩𝐩 𝐈𝐧𝐟𝐨 📱
│❒ 𝐀𝐩𝐩 𝐍𝐚𝐦𝐞: ${app.appname}
│❒ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: ${app.developer}
│❒ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐋𝐢𝐧𝐤: ${app.download_url}
◈━━━━━━━━━━━━━━━━◈
    `;
    await zk.sendMessage(dest, { text: message }, { quoted: ms });
  } catch (error) {
    const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐄𝐫𝐫𝐨𝐫 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐚𝐩𝐩: ${error.message} 😓
│❒ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫 𝐨𝐫 𝐜𝐡𝐞𝐜𝐤 𝐭𝐡𝐚𝐭 𝐚𝐩𝐩 𝐧𝐚𝐦𝐞.
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(errorMessage);
  }
});