import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
  import { sendInteractive } from '../../lib/sendInteractive.js';
  import { downloadContentFromMessage } from '@whiskeysockets/baileys';
  import { createCanvas, loadImage } from '@napi-rs/canvas';

  const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  async function padToSquare(buf) {
      try {
          const src = await loadImage(buf);
          const max = Math.max(src.width, src.height);
          const canvas = createCanvas(max, max);
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, max, max);
          ctx.drawImage(src, Math.floor((max - src.width) / 2), Math.floor((max - src.height) / 2), src.width, src.height);
          return canvas.toBuffer('image/jpeg');
      } catch {
          return buf;
      }
  }

  async function downloadImg(quoted, m) {
      if (quoted) {
          if (typeof quoted.download === 'function') {
              try { const b = await quoted.download(); if (b?.length) return b; } catch {}
          }
          const imgMsg = quoted.msg || quoted;
          try {
              const stream = await downloadContentFromMessage(imgMsg, 'image');
              const chunks = [];
              for await (const c of stream) chunks.push(c);
              const b = Buffer.concat(chunks);
              if (b?.length) return b;
          } catch {}
          try { const b = await this?.downloadMediaMessage?.(imgMsg); if (b?.length) return b; } catch {}
      }
      return null;
  }

  export default {
      name: 'fullpp',
      aliases: ['pp', 'setpp', 'setprofile', 'setbotpp', 'profilepic', 'botpfp'],
      description: "Update the bot's profile picture (letterboxed to square, no cropping)",
      run: async (context) => {
          await ownerMiddleware(context, async () => {
              const { client, m } = context;
              client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

              try {
                  let imageBuffer = null;

                  const quoted = m.quoted;
                  if (quoted && (quoted.mtype === 'imageMessage' || quoted.msg?.mimetype?.startsWith('image/'))) {
                      if (typeof quoted.download === 'function') {
                          try { imageBuffer = await quoted.download(); } catch {}
                      }
                      if (!imageBuffer?.length) {
                          const imgMsg = quoted.msg || quoted;
                          try {
                              const stream = await downloadContentFromMessage(imgMsg, 'image');
                              const chunks = [];
                              for await (const c of stream) chunks.push(c);
                              imageBuffer = Buffer.concat(chunks);
                          } catch {
                              try { imageBuffer = await client.downloadMediaMessage(imgMsg); } catch {}
                          }
                      }
                  } else if (m.message?.imageMessage) {
                      try {
                          const stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
                          const chunks = [];
                          for await (const c of stream) chunks.push(c);
                          imageBuffer = Buffer.concat(chunks);
                      } catch {
                          try { imageBuffer = await client.downloadMediaMessage(m.message.imageMessage); } catch {}
                      }
                  }

                  if (!imageBuffer?.length) {
                      client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                      return sendInteractive(client, m, fmt("FULLPP", "Reply to an image or send one with the command."));
                  }

                  imageBuffer = await padToSquare(imageBuffer);

                  await client.updateProfilePicture(client.user.id, imageBuffer);
                  client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
                  await sendInteractive(client, m, fmt("FULLPP", "Profile picture updated — full image, no cropping. ✅"));
              } catch (error) {
                  client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                  await sendInteractive(client, m, fmt("FULLPP", `Failed: ${error.message}`));
              }
          });
      }
  };
  