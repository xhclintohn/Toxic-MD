import { downloadContentFromMessage } from '@whiskeysockets/baileys';
  import { getFakeQuoted } from '../../lib/fakeQuoted.js';

  async function _dlMedia(client, m) {
      const mtype = m.quoted.mtype || '';
      const typeMap = {
          imageMessage: 'image',
          videoMessage: 'video',
          stickerMessage: 'sticker',
          audioMessage: 'audio',
          pttMessage: 'audio',
          documentMessage: 'document',
      };
      const mediaType = typeMap[mtype];
      if (!mediaType) return null;
      try {
          const stream = await downloadContentFromMessage(m.quoted, mediaType);
          const chunks = [];
          for await (const chunk of stream) chunks.push(chunk);
          const buf = Buffer.concat(chunks);
          return buf.length > 0 ? buf : null;
      } catch {
          try { return await client.downloadMediaMessage(m.quoted); } catch { return null; }
      }
  }

  export default {
      name: 'save',
      aliases: ['sv'],
      run: async (context) => {
          const { client, m } = context;
          const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

          if (!m.quoted) {
              return client.sendMessage(m.chat, {
                  text:
                      `╭───(    TOXIC-MD    )───\n` +
                      `├───≫ SAVE ≪───\n` +
                      `├ \n` +
                      `├ Reply to something first, genius.\n` +
                      `╰──────────────────☉\n` +
                      `> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
              }, { quoted: fq });
          }

          const mtype = m.quoted.mtype || '';
          const senderNum = m.sender.split('@')[0].split(':')[0];
          const targetJid = senderNum + '@s.whatsapp.net';

          try {
              await client.sendMessage(m.chat, { react: { text: '💾', key: m.reactKey } });
              const caption = m.quoted.text || m.quoted.caption || '';
              const mime = m.quoted.mimetype || '';
              const mediaTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'pttMessage', 'documentMessage'];

              if (mediaTypes.includes(mtype)) {
                  const buf = await _dlMedia(client, m);
                  if (!buf) throw new Error('download failed');
                  if (mtype === 'imageMessage') {
                      await client.sendMessage(targetJid, { image: buf, caption }, { quoted: fq });
                  } else if (mtype === 'videoMessage') {
                      await client.sendMessage(targetJid, { video: buf, caption }, { quoted: fq });
                  } else if (mtype === 'stickerMessage') {
                      await client.sendMessage(targetJid, { sticker: buf }, { quoted: fq });
                  } else if (mtype === 'audioMessage' || mtype === 'pttMessage') {
                      await client.sendMessage(targetJid, { audio: buf, mimetype: mime || 'audio/ogg; codecs=opus', ptt: mtype === 'pttMessage' }, { quoted: fq });
                  } else if (mtype === 'documentMessage') {
                      await client.sendMessage(targetJid, { document: buf, mimetype: mime || 'application/octet-stream', fileName: m.quoted.fileName || 'file' }, { quoted: fq });
                  }
              } else {
                  const txt = m.quoted.text || m.quoted.caption || '';
                  if (txt) {
                      await client.sendMessage(targetJid, { text: txt }, { quoted: fq });
                  } else {
                      await m.quoted.copyNForward(targetJid, true);
                  }
              }

              await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

          } catch (err) {
              console.log('❌ [SAVE]:', err?.message || err);
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          }
      }
  };
  