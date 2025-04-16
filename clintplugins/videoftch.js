// video.js
const util = require('util');
const { zokou } = require(__dirname + '/../framework/zokou');
const axios = require('axios');

zokou(
  {
    nomCom: 'video',
    categorie: 'Download',
    reaction: '🎥',
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, nomAuteurMessage } = commandeOptions;

    try {
      console.log('DEBUG - video triggered:', { arg, nomAuteurMessage });

      if (!arg[0]) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ OI, ${nomAuteurMessage}! Don't be lazy! Give me a YouTube URL, like .video https://youtu.be/qHDJSRlNhVs! 😡\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const videoUrl = arg.join(' ').trim();
      if (!videoUrl.match(/^(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/)/)) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ DUDE, ${nomAuteurMessage}! That’s not a YouTube URL! Use youtube.com or youtu.be, got it? 😣\n◈━━━━━━━━━━━━━━━━◈`);
      }

      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${nomAuteurMessage}, snagging your video link faster than lightning! 🔍\n◈━━━━━━━━━━━━━━━━◈`);

      const apiUrl = `https://api.giftedtech.web.id/api/download/ytv?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.success || !data.result || !data.result.media || data.result.media.length === 0) {
        return repondre(`�{T}𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ NO VIDEO, ${nomAuteurMessage}! Your URL’s a dud! Try a real one! 😤\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Get the 360p .mp4 download link
      const videoInfo = data.result.media.find(media => media.format.includes('360p') && media.format.includes('.mp4')) || data.result.media[0];
      const title = data.result.title;
      const downloadUrl = videoInfo.download_url;

      await zk.sendMessage(
        dest,
        {
          text: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ BOOM, ${nomAuteurMessage}! Your video’s ready to roll! 🔥\n│❒ Title: ${title}\n│❒ Download: ${downloadUrl}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`,
          footer: `Hey ${nomAuteurMessage}! I'm Toxic-MD, created by 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 😎`,
        },
        { quoted: ms }
      );

    } catch (e) {
      console.error('Video download error:', e);
      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ TOTAL WRECK, ${nomAuteurMessage}! Something crashed: ${e.message} 😡 Sort it out!\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);