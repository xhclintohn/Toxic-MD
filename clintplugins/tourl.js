import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import { zokou } from "../framework/zokou.js";

const MAX_FILE_SIZE_MB = 200;

async function uploadMedia(buffer) {
  try {
    const { ext } = await fileTypeFromBuffer(buffer);
    const bodyForm = new FormData();
    bodyForm.append("fileToUpload", buffer, `file.${ext}`);
    bodyForm.append("reqtype", "fileupload");

    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: bodyForm,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}: ${res.statusText}`);
    }

    const data = await res.text();
    return data;
  } catch (error) {
    console.error("Error during media upload:", error);
    throw new Error('Failed to upload media');
  }
}

zokou(
  {
    nomCom: "tourl",
    categorie: "General",
    reaction: "🔗",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    try {
      if (!msgRepondu || !['imageMessage', 'videoMessage', 'audioMessage'].includes(msgRepondu.mtype)) {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Reply to an image, video, or audio to upload! Use .tourl\n◈━━━━━━━━━━━━━━━━◈`);
      }

      await repondre(`𝐓�(O)𝐗𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Uploading your media, please wait... ⏳\n◈━━━━━━━━━━━━━━━━◈`);

      const media = await zk.downloadMediaMessage(msgRepondu, 'buffer');
      if (!media) {
        return repondre(`𝐓�{O}𝐗𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Failed to download media. Try again! 😓\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const fileSizeMB = media.length / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        return repondre(`𝐓�{O}�{X}𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB!\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const mediaUrl = await uploadMedia(media);

      const mediaType = getMediaType(msgRepondu.mtype);
      if (mediaType === 'audio') {
        await zk.sendMessage(
          dest,
          {
            text: `𝐓�{O}�{X}𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Here's your audio URL! 🔗\n│❒ URL: ${mediaUrl}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`
          },
          { quoted: ms }
        );
      } else {
        await zk.sendMessage(
          dest,
          {
            [mediaType]: { url: mediaUrl },
            caption: `𝐓�{O}�{X}𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Here's your ${mediaType}! 🔗\n│❒ URL: ${mediaUrl}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`
          },
          { quoted: ms }
        );
      }

    } catch (error) {
      console.error('Error processing media:', error);
      return repondre(`𝐓�{O}�{X}𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Error processing media: ${error.message}\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);

const getMediaType = (mtype) => {
  switch (mtype) {
    case 'imageMessage':
      return 'image';
    case 'videoMessage':
      return 'video';
    case 'audioMessage':
      return 'audio';
    default:
      return null;
  }
};