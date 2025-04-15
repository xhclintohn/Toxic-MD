const { zokou } = require("../framework/zokou");
const { default: axios } = require('axios');

const TOXIC_MD = "\u{1D413}\u{1D40E}\u{1D417}\u{1D408}\u{1D402}-\u{1D40C}\u{1D403}";

// Twitter Download Command
zokou({ nomCom: "twitter", categorie: 'Download', reaction: "🐦" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  let twitterUrl = arg.join(' ').trim();
  if (!twitterUrl && ms.quoted && ms.quoted.text) {
    twitterUrl = ms.quoted.text.trim();
  }

  if (!twitterUrl) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Please provide a Twitter link 🚫
│❒ Example: .twitter https://twitter.com/elonmusk/status/1822355008559489216
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
    return;
  }

  const twitterRegex = /^https:\/\/(twitter|x)\.com\/[\w-]+\/status\/\d+/;
  if (!twitterRegex.test(twitterUrl)) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Invalid Twitter link format 🚫
│❒ Please provide a valid Twitter status link, e.g., https://twitter.com/elonmusk/status/1822355008559489216
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
    return;
  }

  try {
    const apiUrl = `https://api.giftedtech.web.id/api/download/aiodl2?apikey=gifted&url=${encodeURIComponent(twitterUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success || response.data.status !== 200) {
      const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Failed to download Twitter media 😓
│❒ Error: ${response.data.message || 'Unknown error'}
◈━━━━━━━━━━━━━━━━◈
      `;
      repondre(errorMessage);
      return;
    }

    const media = response.data.result;
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Twitter Download Success 🐦
│❒ Title: ${media.title || 'No title available'}
│❒ Type: ${media.type || 'unknown'}
│❒ URL: ${media.download_url}
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
  } catch (error) {
    const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Error downloading Twitter media 😓
│❒ Error: ${error.message || 'Unknown error'}
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(errorMessage);
  }
});

// Instagram Download Command
zokou({ nomCom: "ig", categorie: 'Download', reaction: "📸" }, async (dest, zk, commandeOptions) => {
  const { repondre, arg, ms } = commandeOptions;

  let igUrl = arg.join(' ').trim();
  if (!igUrl && ms.quoted && ms.quoted.text) {
    igUrl = ms.quoted.text.trim();
  }

  if (!igUrl) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Please provide an Instagram link 🚫
│❒ Example: .ig https://www.instagram.com/reel/C9bjQfRprHK/
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
    return;
  }

  const igRegex = /^https:\/\/(www\.)?instagram\.com\/(reel|p|tv)\/[\w-]+/;
  if (!igRegex.test(igUrl)) {
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Invalid Instagram link format 🚫
│❒ Please provide a valid Instagram post/reel link
│❒ Example: .ig https://www.instagram.com/reel/C9bjQfRprHK/
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
    return;
  }

  try {
    const apiUrl = `https://api.giftedtech.web.id/api/download/instadl?apikey=gifted&type=video&url=${encodeURIComponent(igUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success || response.data.status !== 200) {
      const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Failed to download Instagram media 😓
│❒ Error: ${response.data.message || 'Unknown error'}
◈━━━━━━━━━━━━━━━━◈
      `;
      repondre(errorMessage);
      return;
    }

    const media = response.data.result;
    const message = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Instagram Download Success 📸
│❒ Type: ${media.type || 'unknown'}
│❒ URL: ${media.download_url}
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(message);
  } catch (error) {
    const errorMessage = `
${TOXIC_MD}

◈━━━━━━━━━━━━━━━━◈
│❒ Error downloading Instagram media 😓
│❒ Error: ${error.message || 'Unknown error'}
◈━━━━━━━━━━━━━━━━◈
    `;
    repondre(errorMessage);
  }
});