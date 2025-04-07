const {zokou} = require('../framework/zokou');
const fs = require('fs');
const getFBInfo = require("@xaviabot/fb-downloader");
const { default: axios } = require('axios');

zokou({nomCom : "instagram" , categorie : "Download"},async (dest , zk , commandeOptions)=>{
  const {ms,repondre,arg} = commandeOptions ;

  let link = arg.join(' ')

  if (!arg[0]) { repondre('𝐏𝐥𝐞𝐚𝐬𝐞 𝐢𝐧𝐬𝐞𝐫𝐭 𝐚𝐧 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐯𝐢𝐝𝐞𝐨 𝐥𝐢𝐧𝐤');return}; 

  try {
    let igvid = await axios('https://api.dreaded.site/api/igdl?url='+link)

    if (igvid.data.data.data[0].type == 'video') {
      zk.sendMessage(dest,{video : {url : igvid.data.data.data[0].url},caption : "𝐈𝐆 𝐕𝐢𝐝𝐞𝐨 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 (𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃)",gifPlayback : false },{quoted : ms}) 
    }
    else {
      zk.sendMessage(dest,{image : {url : igvid.data.data.data[0].url},caption : "𝐈𝐆 𝐈𝐦𝐚𝐠𝐞 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 (𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃)"})
    }
  } catch (e) { repondre("𝐄𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐝𝐮𝐫𝐢𝐧𝐠 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝:\n" + e) }
});

zokou({ nomCom: "facebook", categorie: "Download", reaction: "📽️" }, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    repondre('𝐈𝐧𝐬𝐞𝐫𝐭 𝐚 𝐩𝐮𝐛𝐥𝐢𝐜 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐯𝐢𝐝𝐞𝐨 𝐥𝐢𝐧𝐤!');
    return;
  }

  const queryURL = arg.join(" ");

  try {
    getFBInfo(queryURL).then((result) => {
      let caption = `𝐓𝐢𝐭𝐥𝐞: ${result.title}\n𝐋𝐢𝐧𝐤: ${result.url}`;
      zk.sendMessage(dest, { image: { url: result.thumbnail }, caption: caption }, { quoted: ms });
      zk.sendMessage(dest, { video: { url: result.hd }, caption: '𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐯𝐢𝐝𝐞𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 (𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃)' }, { quoted: ms });
    }).catch((error) => {
      console.log("Error:", error);
      repondre('𝐓𝐫𝐲 𝐟𝐛𝐝𝐥𝟐 𝐨𝐧 𝐭𝐡𝐢𝐬 𝐥𝐢𝐧𝐤');
    });
  } catch (error) {
    console.error('Error:', error);
    repondre('𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐞𝐫𝐫𝐨𝐫: ' + error);
  }
});

zokou({ nomCom: "tiktok", categorie: "Download", reaction: "🎵" }, async (dest, zk, commandeOptions) => {
  const { arg, ms, prefixe, repondre } = commandeOptions;
  if (!arg[0]) {
    repondre(`𝐇𝐨𝐰 𝐭𝐨 𝐮𝐬𝐞:\n${prefixe}tiktok <video_link>`);
    return;
  }

  const videoUrl = arg.join(" ");
  let data = await axios.get('https://api.dreaded.site/api/tiktok?url=' + videoUrl);
  let tik = data.data.data;

  const caption = `𝐀𝐮𝐭𝐡𝐨𝐫: ${tik.author}\n𝐃𝐞𝐬𝐜: ${tik.desc}`;
  zk.sendMessage(dest, { video: { url: tik.links[0].a }, caption: caption }, { quoted: ms });
});

zokou({ nomCom: "facebook2", categorie: "Download", reaction: "📽️" }, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    repondre('𝐈𝐧𝐬𝐞𝐫𝐭 𝐚 𝐩𝐮𝐛𝐥𝐢𝐜 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐯𝐢𝐝𝐞𝐨 𝐥𝐢𝐧𝐤!');
    return;
  }

  const queryURL = arg.join(" ");

  try {
    getFBInfo(queryURL).then((result) => {
      let caption = `𝐓𝐢𝐭𝐥𝐞: ${result.title}\n𝐋𝐢𝐧𝐤: ${result.url}`;
      zk.sendMessage(dest, { image: { url: result.thumbnail }, caption: caption }, { quoted: ms });
      zk.sendMessage(dest, { video: { url: result.sd }, caption: '𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐯𝐢𝐝𝐞𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 (𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐓𝐨𝐱𝐢𝐜-𝐌𝐃)' }, { quoted: ms });
    }).catch((error) => {
      console.log("Error:", error);
      repondre(error);
    });
  } catch (error) {
    console.error('Error:', error);
    repondre('𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐞𝐫𝐫𝐨𝐫: ' + error);
  }
});