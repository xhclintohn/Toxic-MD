import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: 'gstatus',
  aliases: ['groupstatus', 'gs'],
  description: 'Posts media or text as a silent group status.',
  run: async (context) => {
    const { client, m, prefix, IsGroup, botname } = context;

    try {
      if (!botname) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, { 
          text: `╭─❏ 「 GROUP STATUS 」\n│ Bot name is not set.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        });
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
            text: `╭─❏ 「 GROUP STATUS 」\n│ Reply to media and provide a group link or JID.\n│ Example:\n│ ${prefix}gstatus https://chat.whatsapp.com/xxxxx\n│ ${prefix}gstatus 120363@g.us\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
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
            return client.sendMessage(m.chat, { 
              text: `╭─❏ 「 GROUP STATUS 」\n│ Invalid or expired group link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
            });
          }
        } else if (input.includes('@g.us')) {
          targetGroupJid = input.trim();
        } else {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, { 
            text: `╭─❏ 「 GROUP STATUS 」\n│ Invalid group link or JID.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
          });
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
        caption = m.message.imageMessage?.caption || inlineText || null;
      } else if (m.message?.videoMessage) {
        sourceMsg = m.message.videoMessage;
        mediaType = 'video';
        caption = m.message.videoMessage?.caption || inlineText || null;
      } else if (m.message?.audioMessage) {
        sourceMsg = m.message.audioMessage;
        mediaType = 'audio';
      } else if (quoted) {
        if (quoted.imageMessage) {
          sourceMsg = quoted.imageMessage;
          mediaType = 'image';
          caption = quoted.imageMessage?.caption || inlineText || null;
        } else if (quoted.videoMessage) {
          sourceMsg = quoted.videoMessage;
          mediaType = 'video';
          caption = quoted.videoMessage?.caption || inlineText || null;
        } else if (quoted.audioMessage) {
          sourceMsg = quoted.audioMessage;
          mediaType = 'audio';
        } else if (quoted.conversation) {
          caption = quoted.conversation || inlineText || null;
        } else if (quoted.extendedTextMessage?.text) {
          caption = quoted.extendedTextMessage.text || inlineText || null;
        }
      } else {
        caption = inlineText || null;
      }

      if (!mediaType && !caption) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, {
          text: `╭─❏ 「 GROUP STATUS 」\n│ Reply to an image, video, audio, or include text.\n│ Example: ${prefix}gstatus Check out this update!\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
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
        const messageObj = {
          image: buffer,
          contextInfo: {
            isGroupStatus: true,
            statusSourceType: "IMAGE",
            statusAttributions: [
              {
                type: 10
              }
            ],
            statusAudienceMetadata: {
              audienceType: "CLOSE_FRIENDS"
            }
          }
        };
        if (caption) messageObj.caption = caption;
        await client.sendMessage(targetGroupJid, messageObj);
      } else if (mediaType === 'video') {
        const buffer = await getBuffer(sourceMsg, 'video');
        const messageObj = {
          video: buffer,
          contextInfo: {
            isGroupStatus: true,
            statusSourceType: "VIDEO",
            statusAttributions: [
              {
                type: 10
              }
            ],
            statusAudienceMetadata: {
              audienceType: "CLOSE_FRIENDS"
            }
          }
        };
        if (caption) messageObj.caption = caption;
        await client.sendMessage(targetGroupJid, messageObj);
      } else if (mediaType === 'audio') {
        const buffer = await getBuffer(sourceMsg, 'audio');
        await client.sendMessage(targetGroupJid, {
          audio: buffer,
          mimetype: 'audio/mp4',
          contextInfo: {
            isGroupStatus: true,
            statusSourceType: "AUDIO",
            statusAttributions: [
              {
                type: 10
              }
            ],
            statusAudienceMetadata: {
              audienceType: "CLOSE_FRIENDS"
            }
          }
        });
      } else {
        await client.sendMessage(targetGroupJid, {
          text: caption,
          contextInfo: {
            isGroupStatus: true,
            statusSourceType: "TEXT",
            statusAttributions: [
              {
                type: 10
              }
            ],
            statusAudienceMetadata: {
              audienceType: "CLOSE_FRIENDS"
            }
          }
        });
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      if (!IsGroup) {
        await client.sendMessage(m.chat, { 
          text: `╭─❏ 「 GROUP STATUS 」\n│ ✅ Status posted to group!\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        });
      }

    } catch (error) {
      console.error('GStatus Error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      await client.sendMessage(m.chat, { 
        text: `╭─❏ 「 GROUP STATUS 」\n│ Error: ${error.message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      });
    }
  }
};