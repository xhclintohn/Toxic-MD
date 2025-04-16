import { createRequire } from 'module';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs-extra';
import { zokou } from "../framework/zokou.js";

const require = createRequire(import.meta.url);
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

class ImgLarger {
    constructor() {
        this.baseURL = 'https://get1.imglarger.com/api/Upscaler';
        this.headers = {
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://imgupscaler.com',
            'Referer': 'https://imgupscaler.com/',
            'User-Agent': 'Postify/1.0.0',
            'X-Forwarded-For': Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.')
        };
        this.retryLimit = 3;
    }

    async uploadImage(input, scaleRadio = 2, isLogin = 0) {
        const formData = new FormData();
        if (Buffer.isBuffer(input)) {
            formData.append('myfile', input, { filename: 'uploaded_image.jpg' });
        } else {
            throw new Error('Invalid input. Provide a buffer.');
        }
        formData.append('scaleRadio', scaleRadio);
        formData.append('isLogin', isLogin);
        try {
            console.log('Uploading image, please wait...');
            const response = await axios.post(`${this.baseURL}/Upload`, formData, {
                headers: { ...this.headers, ...formData.getHeaders() },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                onUploadProgress: progressEvent => {
                    this.showProgress(progressEvent.loaded, progressEvent.total);
                }
            });
            if (response.data.code === 999) {
                throw new Error('API limit exceeded.');
            }
            return response.data;
        } catch (error) {
            throw new Error('Image upload failed.');
        }
    }

    showProgress(loaded, total) {
        const percentage = Math.round((loaded / total) * 100);
        process.stdout.write(`\rUploading: ${percentage}%\n`);
    }

    async checkStatus(code, scaleRadio, isLogin) {
        const payload = { code, scaleRadio, isLogin };
        try {
            const response = await axios.post(`${this.baseURL}/CheckStatus`, payload, { headers: this.headers });
            return response.data;
        } catch (error) {
            throw new Error('Failed to check task status.');
        }
    }

    async processImage(input, scaleRadio = 2, isLogin = 0, retries = 0) {
        try {
            const { data: { code } } = await this.uploadImage(input, scaleRadio, isLogin);
            let status;
            do {
                status = await this.checkStatus(code, scaleRadio, isLogin);
                if (status.data.status === 'waiting') {
                    await this.delay(5000);
                }
            } while (status.data.status === 'waiting');
            return status;
        } catch (error) {
            if (retries < this.retryLimit) {
                return await this.processImage(input, scaleRadio, isLogin, retries + 1);
            } else {
                throw new Error('Process failed after multiple attempts.');
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

zokou(
  {
    nomCom: "tohd",
    categorie: "General",
    reaction: "🖼️",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    try {
      if (!msgRepondu || msgRepondu.mtype !== 'imageMessage') {
        return repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Reply to an image to enhance its quality! Use .tohd\n◈━━━━━━━━━━━━━━━━◈`);
      }

      const media = await zk.downloadMediaMessage(msgRepondu, 'buffer');
      const imgLarger = new ImgLarger();

      await repondre(`𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Processing your image, please wait... 🖼️\n◈━━━━━━━━━━━━━━━━◈`);

      const result = await imgLarger.processImage(media, 4);
      const enhancedImageUrl = result.data.downloadUrls[0];

      await zk.sendMessage(
        dest,
        {
          image: { url: enhancedImageUrl },
          caption: `𝐓𝐎𝐗𝐈𝐂-𝐌𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Here's your enhanced image! ✨\n│❒ Powered by xh_clinton\n◈━━━━━━━━━━━━━━━━◈`
        },
        { quoted: ms }
      );

    } catch (error) {
      console.error('Error processing media:', error);
      return repondre(`𝐓�{O}𝐗𝐈𝐂-�{M}𝐃\n\n◈━━━━━━━━━━━━━━━━◈\n│❒ Error processing image: ${error.message}\n◈━━━━━━━━━━━━━━━━◈`);
    }
  }
);