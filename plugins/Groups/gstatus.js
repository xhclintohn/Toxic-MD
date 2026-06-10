import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: 'gstatus',
  aliases: ['groupstatus', 'gs'],
  description: 'Posts media or text as a silent group status.',
  run: async (context) => {
    const { client, m, prefix, IsGroup, botname } = context;

    const fmt = (text) => `│ \n│ ${text}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨ｎ`;

    try {
      if (!botname) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, { text: fmt(`Bot name is not set.`) });
      }

      const bodyStr = (m.body || '').trim();
      const spaceIdx = bodyStr.indexOf(' ');
      const afterCmd = spaceIdx !== -1 ? bodyStr.slice(spaceIdx + 1).trim() : '';

      let targetGroupJid = null;
      let inlineText = null;

      if (IsGroup) {
        targetGroupJid = m.chat;
        inlineText = afterCmd || null;
      } else {
        if (!afterCmd) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, {
            text: fmt(`Reply to media and provide a group link or JID.\nExample:\n${prefix}gstatus https://chat.whatsapp.com/xxxxx\n${prefix}gstatus 120363@g.us`)
          });
        }
        const parts = afterCmd.split(/\s+/);
        const input = parts[0];
        const rest = parts.slice(1).join(' ').trim();

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
            return client.sendMessage(m.chat, { text: fmt(`Invalid or expired group link.`) });
          }
        } else if (input.includes('@g.us')) {
          targetGroupJid = input.trim();
        } else {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, { text: fmt(`Invalid group link or JID.`) });
        }

        inlineText = rest || null;
      }

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      let caption = null;
      let sourceMsg = null;
      let mediaType = null;

      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (m.message?.imageMessage) {
        sourceMsg = m.message.imageMessage;
        mediaType = 'image';
        caption = inlineText || m.message.imageMessage?.caption || null;
      } else if (m.message?.videoMessage) {
        sourceMsg = m.message.videoMessage;
        mediaType = 'video';
        caption = inlineText || m.message.videoMessage?.caption || null;
      } else if (m.message?.audioMessage) {
        sourceMsg = m.message.audioMessage;
        mediaType = 'audio';
      } else if (quoted) {
        if (quoted.imageMessage) {
          sourceMsg = quoted.imageMessage;
          mediaType = 'image';
          caption = inlineText || quoted.imageMessage?.caption || null;
        } else if (quoted.videoMessage) {
          sourceMsg = quoted.videoMessage;
          mediaType = 'video';
          caption = inlineText || quoted.videoMessage?.caption || null;
        } else if (quoted.audioMessage) {
          sourceMsg = quoted.audioMessage;
          mediaType = 'audio';
        } else if (quoted.conversation) {
          caption = inlineText || quoted.conversation;
        } else if (quoted.extendedTextMessage?.text) {
          caption = inlineText || quoted.extendedTextMessage.text;
        }
      } else {
        caption = inlineText;
      }

      if (!mediaType && !caption) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, {
          text: fmt(`Reply to an image, video, audio, or include text.\nExample: ${prefix}gstatus Check out this update!`)
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
        await client.sendStatusMention(
          { image: buffer, ...(caption ? { caption } : {}) },
          [targetGroupJid]
        );
      } else if (mediaType === 'video') {
        const buffer = await getBuffer(sourceMsg, 'video');
        await client.sendStatusMention(
          { video: buffer, ...(caption ? { caption } : {}) },
          [targetGroupJid]
        );
      } else if (mediaType === 'audio') {
        const buffer = await getBuffer(sourceMsg, 'audio');
        await client.sendStatusMention(
          { audio: buffer, mimetype: 'audio/mp4', ptt: false },
          [targetGroupJid]
        );
      } else {
        await client.sendStatusMention(
          { text: caption },
          [targetGroupJid]
        );
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      if (!IsGroup) {
        await client.sendMessage(m.chat, { text: fmt(`✅ Status posted to group!`) });
      }

    } catch (error) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      await client.sendMessage(m.chat, { text: fmt(`Error: ${error.message}`) });
    }
  }
};
