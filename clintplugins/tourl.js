import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import { zokou } from "../framework/zokou.js";

const MAX_FILE_SIZE_MB = 200;

async function uploadMedia(buffer) {
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) {
      throw new Error('Could not determine file type');
    }

    const bodyForm = new FormData();
    bodyForm.append("fileToUpload", buffer, `file.${fileType.ext}`);
    bodyForm.append("reqtype", "fileupload");

    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: bodyForm,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const data = await res.text();
    if (!data.startsWith('http')) {
      throw new Error('Invalid response from upload server');
    }

    return data;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(`Upload failed: ${error.message}`);
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
      // Validate message type
      if (!msgRepondu) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Please reply to a media message (image/video/audio)\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const validTypes = ['imageMessage', 'videoMessage', 'audioMessage'];
      if (!validTypes.includes(msgRepondu.mtype)) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Unsupported media type! Only images, videos and audio\n◈━━━━━━━━━━━━━━━━◈`);
      }

      await repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Uploading your media, please wait... ⏳\n◈━━━━━━━━━━━━━━━━◈`);

      // Download and validate media
      const media = await zk.downloadMediaMessage(msgRepondu, 'buffer');
      if (!media || media.length === 0) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Failed to download media. Please try again\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Check file size
      const fileSizeMB = media.length / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        return repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ File too large! Max ${MAX_FILE_SIZE_MB}MB\n│❒ Your file: ${fileSizeMB.toFixed(2)}MB\n◈━━━━━━━━━━━━━━━━◈`);
      }

      // Upload and validate response
      const mediaUrl = await uploadMedia(media);
      if (!mediaUrl) {
        throw new Error('No URL returned from upload service');
      }

      // Determine media type for response
      const mediaType = getMediaType(msgRepondu.mtype);
      const successMessage = {
        text: `TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ ${mediaType.toUpperCase()} URL 🔗\n│❒ ${mediaUrl}\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`
      };

      // For non-audio media, send as media message with caption
      if (mediaType !== 'audio') {
        successMessage[mediaType] = { url: mediaUrl };
        successMessage.caption = successMessage.text;
        delete successMessage.text;
      }

      await zk.sendMessage(dest, successMessage, { quoted: ms });

    } catch (error) {
      console.error('Command error:', error);
      await repondre(`TOXIC-MD\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Error: ${error.message}\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);

function getMediaType(mtype) {
  const typeMap = {
    imageMessage: 'image',
    videoMessage: 'video',
    audioMessage: 'audio'
  };
  return typeMap[mtype] || 'file';
}