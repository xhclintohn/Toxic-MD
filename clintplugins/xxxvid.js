const { zokou } = require("../framework/zokou");
const { default: axios } = require('axios');

const TOXIC_MD = "𝐓𝐎𝐗𝐈𝐂-𝐌𝐃"; // Fancy font

zokou({ nomCom: "xxxvideo", categorie: 'Adult', reaction: "🔞" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚𝐧 𝐗𝐕𝐢𝐝𝐞𝐨𝐬 𝐔𝐑𝐋 🚫
│❒ 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .xxxvideo https://www.xvideos.com/video.uphdukv604c/...
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
    return;
  }

  const videoUrl = arg.join(' ').trim();
  const xvideosRegex = /^https:\/\/www\.xvideos\.com\/video\.[a-zA-Z0-9]+\//;
  if (!xvideosRegex.test(videoUrl)) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐗𝐕𝐢𝐝𝐞𝐨𝐬 𝐔𝐑𝐋 🚫
│❒ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐗𝐕𝐢𝐝𝐞𝐨𝐬 𝐔𝐑𝐋, 𝐞.𝐠., https://www.xvideos.com/video.uphdukv604c/...
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
    return;
  }

  try {
    const apiUrl = `https://api.giftedtech.web.id/api/download/xvideosdl?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success || response.data.status !== 200) {
      const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐯𝐢𝐝𝐞𝐨 😓
│❒ 𝐄𝐫𝐫𝐨𝐫: ${response.data.message || '𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐞𝐫𝐫𝐨𝐫'}
◈━━━━━━━━━━━━━━━━◈
      `;
      repondre(errorMessage);
      return;
    }

    const video = response.data.result;
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐗𝐕𝐢𝐝𝐞𝐨 𝐈𝐧𝐟𝐨 🔞
│❒ 𝐓𝐢𝐭𝐥𝐞: ${video.title}
│❒ 𝐕𝐢𝐞𝐰𝐬: ${video.views}
│❒ 𝐕𝐨𝐭𝐞𝐬: ${video.votes}
│❒ 𝐋𝐢𝐤𝐞𝐬: ${video.likes}
│❒ 𝐃𝐢𝐬𝐥𝐢𝐤𝐞𝐬: ${video.dislikes}
│❒ 𝐒𝐢𝐳𝐞: ${video.size}
│❒ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐋𝐢𝐧𝐤: ${video.download_url}
◈━━━━━━━━━━━━━━━━◈
    `;
    await zk.sendMessage(dest, { text: message }, { quoted: ms });
  } catch (error) {
    const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐄𝐫𝐫𝐨𝐫 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐯𝐢𝐝𝐞𝐨: ${error.message} 😓
│❒ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠 𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫 𝐨𝐫 𝐜𝐡𝐞𝐜𝐤 𝐭𝐡𝐞 𝐔𝐑𝐋.
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(errorMessage);
  }
});