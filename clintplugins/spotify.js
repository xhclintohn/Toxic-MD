const { zokou } = require("../framework/zokou");
const { default: axios } = require('axios');

const TOXIC_MD = "\u{1D413}\u{1D40E}\u{1D417}\u{1D408}\u{1D402}-\u{1D40C}\u{1D403}"; // 𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

zokou({ nomCom: "spotify", categorie: 'General', reaction: "🎵" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞 🚫
│❒ 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: .spotify 𝐓𝐡𝐞 𝐒𝐩𝐞𝐜𝐭𝐫𝐞
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
    return;
  }

  const songName = arg.join(' ').trim();

  try {
    const mockTrackUrl = "https://open.spotify.com/track/0VjIjW4M7f9DrlbszDHL0";
    const apiUrl = `https://api.giftedtech.web.id/api/download/spotifydl?apikey=gifted&url=${encodeURIComponent(mockTrackUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success || response.data.status !== 200) {
      const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐬𝐨𝐧𝐠 😓
│❒ 𝐄𝐫𝐫𝐨𝐫: ${response.data.message || '𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐞𝐫𝐫𝐨𝐫'}
◈━━━━━━━━━━━━━━━━◈
      `;
      repondre(errorMessage);
      return;
    }

    const track = response.data.result;
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐒𝐩𝐨𝐭𝐢𝐟𝐲 𝐒𝐨𝐧𝐠 𝐈𝐧𝐟𝐨 🎵
│❒ 𝐓𝐢𝐭𝐥𝐞: ${track.title}
│❒ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${track.duration}
│❒ 𝐐𝐮𝐚𝐥𝐢𝐭𝐲: ${track.quality}
│❒ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐋𝐢𝐧𝐤: ${track.download_url}
◈━━━━━━━━━━━━━━━━◈
    `;
    await zk.sendMessage(dest, { text: message }, { quoted: ms });
  } catch (error) {
    const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ 𝐄𝐫𝐫𝐨𝐫 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐬𝐨𝐧𝐠: ${error.message} 😓
│❒ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫 𝐨𝐫 𝐜𝐡𝐞𝐜𝐤 𝐭𝐡𝐞 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞.
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(errorMessage);
  }
});