import { getFakeQuoted } from '../../lib/fakeQuoted.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: 'gstatus',
  aliases: ['groupstatus', 'gs'],
  description: 'Posts media or text as a silent group status.',
  run: async (context) => {
    const { client, m, prefix, IsGroup, botname } = context;
    const fq = getFakeQuoted(m);
    
    const fmt = (text) => `╭───(    TOXIC-MD    )───\n├ \n├ ${text}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨ｎ`;

    try {
      if (!botname) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, { text: fmt(`Bot name is not set.`), quoted: fq });
      }

      let targetGroupJid = null;

      if (IsGroup) {
        targetGroupJid = m.chat;
      } else {
        const rawArgs = m.body.trim().split(/\s+/);
        const input = rawArgs[1];
        if (!input) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, {
            text: fmt(`Reply to media and provide a group link or JID.\nExample:\n${prefix}gstatus https://chat.whatsapp.com/xxxxx\n${prefix}gstatus 120363@g.us`),
            quoted: fq
          });
        }
        if (input.includes('chat.whatsapp.com')) {
          let code;
          try {
            const url = new URL(input);
            code = url.pathname.replace(/^\/+/, '');
          } catch {
            code = input.split('/').pop();
          }
          try {
            const res = await client.groupGetInviteInfo(code);
            targetGroupJid = res?.id || res?.groupId || res?.gid;
            if (!targetGroupJid) throw new Error('no id');
          } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return client.sendMessage(m.chat, { text: fmt(`Invalid or expired group link.`), quoted: fq });
          }
        } else if (input.includes('@g.us')) {
          targetGroupJid = input.trim();
        } else {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, { text: fmt(`Invalid group link or JID.`), quoted: fq });
        }
      }

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      let caption = null;
      let sourceMsg = null;
      let mediaType = null;

      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (m.message?.imageMessage) {
        sourceMsg = m.message.imageMessage;
        mediaType = 'image';
        caption = m.message.imageMessage?.caption || null;
      } else if (m.message?.videoMessage) {
        sourceMsg = m.message.videoMessage;
        mediaType = 'video';
        caption = m.message.videoMessage?.caption || null;
      } else if (m.message?.audioMessage) {
        sourceMsg = m.message.audioMessage;
        mediaType = 'audio';
      } else if (quoted) {
        if (quoted.imageMessage) {
          sourceMsg = quoted.imageMessage;
          mediaType = 'image';
          caption = quoted.imageMessage?.caption || null;
        } else if (quoted.videoMessage) {
          sourceMsg = quoted.videoMessage;
          mediaType = 'video';
          caption = quoted.videoMessage?.caption || null;
        } else if (quoted.audioMessage) {
          sourceMsg = quoted.audioMessage;
          mediaType = 'audio';
        } else if (quoted.conversation) {
          caption = quoted.conversation;
        } else if (quoted.extendedTextMessage?.text) {
          caption = quoted.extendedTextMessage.text;
        }
      }

      if (!mediaType && !caption) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, {
          text: fmt(`Reply to an image, video, audio, or include text.\nExample: ${prefix}gstatus Check out this update!`),
          quoted: fq
        });
      }

      const getBuffer = async (msg, type) => {
        const stream = await downloadContentFromMessage(msg, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
      };

      if (mediaType === 'image') {
        const buffer = await getBuffer(sourceMsg, 'image');
        await client.sendMessage(targetGroupJid, {
          image: buffer,
          caption: caption,
          contextInfo: { isGroupStatus: true }
        });
      } else if (mediaType === 'video') {
        const buffer = await getBuffer(sourceMsg, 'video');
        await client.sendMessage(targetGroupJid, {
          video: buffer,
          caption: caption,
          contextInfo: { isGroupStatus: true }
        });
      } else if (mediaType === 'audio') {
        const buffer = await getBuffer(sourceMsg, 'audio');
        await client.sendMessage(targetGroupJid, {
          audio: buffer,
          mimetype: 'audio/mp4',
          contextInfo: { isGroupStatus: true }
        });
      } else if (caption) {
        await client.sendMessage(targetGroupJid, {
          text: caption,
          contextInfo: { isGroupStatus: true }
        });
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      if (!IsGroup) {
        await client.sendMessage(m.chat, { text: fmt(`✅ Status posted to group!`), quoted: fq });
      }

    } catch (error) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      await client.sendMessage(m.chat, { text: fmt(`Error: ${error.message}`), quoted: fq });
    }
  }
};