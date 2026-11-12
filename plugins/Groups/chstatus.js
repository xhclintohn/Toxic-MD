import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';

const DEFAULT_CHANNEL_JID = process.env.CHANNEL_JID || '120363425667150709@newsletter';

const _fmt = (msg) => `╭─❏ 「 CHANNEL STATUS 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

async function _downloadMedia(sourceMsg, type) {
  const stream = await downloadContentFromMessage(sourceMsg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default {
  name: 'chstatus',
  aliases: ['chtstatus', 'channelstatus', 'chstat', 'cstatus', 'channelstat', 'chstatuspost', 'postchstatus', 'chpost', 'channelpost', 'statuschannel', 'chst', 'channelstatuspost'],
  description: 'Posts text or media as a status on the bot channel.',
  run: async (context) => {
    await ownerMiddleware(context, async () => {
      const { client, m, prefix } = context;

      try {
        if (typeof client.sendChannelStatus !== 'function') {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, { text: _fmt('Baileys is too old for channel status.\n│ Update Baileys to 1.7.0 or newer, then try again.') });
        }

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const bodyStr = (m.body || '').trim();
        const spaceIdx = bodyStr.indexOf(' ');
        const afterCmd = spaceIdx !== -1 ? bodyStr.slice(spaceIdx + 1).trim() : '';
        const parts = afterCmd ? afterCmd.split(/\s+/) : [];
        const firstArg = (parts[0] || '').replace(/[.,;]+$/, '');

        let channelJid = DEFAULT_CHANNEL_JID;
        let inlineText = afterCmd || null;

        if (firstArg) {
          if (firstArg.includes('whatsapp.com/channel')) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return client.sendMessage(m.chat, { text: _fmt('Channel links are not supported.\n│ Use the channel JID instead, e.g.\n│ ' + prefix + 'chstatus ' + DEFAULT_CHANNEL_JID + ' Hello') });
          } else if (/^\d+@newsletter$/.test(firstArg)) {
            channelJid = firstArg;
            inlineText = parts.slice(1).join(' ').trim() || null;
          } else if (/^\d{15,20}$/.test(firstArg)) {
            channelJid = firstArg + '@newsletter';
            inlineText = parts.slice(1).join(' ').trim() || null;
          }
        }

        let mediaType = null;
        let sourceMsg = null;
        let mediaCaption = null;
        let mediaMimetype = null;
        let quotedText = null;

        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
          || m.message?.imageMessage?.contextInfo?.quotedMessage
          || m.message?.videoMessage?.contextInfo?.quotedMessage
          || m.quoted?.message
          || null;

        if (m.message?.imageMessage) {
          sourceMsg = m.message.imageMessage; mediaType = 'image';
          mediaCaption = m.message.imageMessage?.caption || null;
          mediaMimetype = m.message.imageMessage?.mimetype || null;
        } else if (m.message?.videoMessage) {
          sourceMsg = m.message.videoMessage; mediaType = 'video';
          mediaCaption = m.message.videoMessage?.caption || null;
          mediaMimetype = m.message.videoMessage?.mimetype || null;
        } else if (m.message?.audioMessage) {
          sourceMsg = m.message.audioMessage; mediaType = 'audio';
          mediaMimetype = m.message.audioMessage?.mimetype || null;
        } else if (quoted) {
          if (quoted.imageMessage) {
            sourceMsg = quoted.imageMessage; mediaType = 'image';
            mediaCaption = quoted.imageMessage?.caption || null;
            mediaMimetype = quoted.imageMessage?.mimetype || null;
          } else if (quoted.videoMessage) {
            sourceMsg = quoted.videoMessage; mediaType = 'video';
            mediaCaption = quoted.videoMessage?.caption || null;
            mediaMimetype = quoted.videoMessage?.mimetype || null;
          } else if (quoted.audioMessage) {
            sourceMsg = quoted.audioMessage; mediaType = 'audio';
            mediaMimetype = quoted.audioMessage?.mimetype || null;
          } else if (quoted.conversation || quoted.extendedTextMessage?.text) {
            quotedText = quoted.conversation || quoted.extendedTextMessage?.text || '';
          }
        }

        let buffer = null;
        if (sourceMsg && mediaType) {
          try {
            buffer = await _downloadMedia(sourceMsg, mediaType);
          } catch (e) {
            if (m.quoted && typeof m.quoted.download === 'function') {
              try { buffer = await m.quoted.download(); } catch {}
            }
            if (!buffer || !buffer.length) {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
              return client.sendMessage(m.chat, { text: _fmt('Failed to download media: ' + e.message) });
            }
          }
        }

        if (!buffer && !quotedText && m.quoted && typeof m.quoted.download === 'function') {
          try {
            const buf = await m.quoted.download();
            if (buf && buf.length) {
              const mt = (m.quoted.mimetype || m.quoted.mtype || '').toLowerCase();
              if (mt.includes('image') || m.quoted.mtype === 'imageMessage') mediaType = 'image';
              else if (mt.includes('video') || m.quoted.mtype === 'videoMessage') mediaType = 'video';
              else if (mt.includes('audio') || m.quoted.mtype === 'audioMessage') mediaType = 'audio';
              if (mediaType) {
                buffer = buf;
                if (!mediaCaption && m.quoted.text) mediaCaption = m.quoted.text;
                if (!mediaMimetype && m.quoted.mimetype) mediaMimetype = m.quoted.mimetype;
              }
            }
          } catch {}
        }

        if (!buffer && !quotedText && m.quoted && (m.quoted.mtype === 'conversation' || m.quoted.mtype === 'extendedTextMessage') && m.quoted.text) {
          quotedText = m.quoted.text;
        }

        let content = null;
        const caption = inlineText || mediaCaption || '';
        if (buffer && mediaType === 'image') {
          content = { image: buffer, caption };
        } else if (buffer && mediaType === 'video') {
          content = { video: buffer, caption };
        } else if (buffer && mediaType === 'audio') {
          content = { audio: buffer, mimetype: mediaMimetype || 'audio/mp4' };
        } else if (quotedText) {
          content = { text: quotedText + (inlineText ? '\n' + inlineText : '') };
        } else if (inlineText) {
          content = { text: inlineText };
        }

        if (!content) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, {
            text: _fmt('Reply to text or media, or add text after the command.\n│ Examples:\n│ ' + prefix + 'chstatus Hello channel!\n│ Reply to text + ' + prefix + 'chstatus\n│ Reply to image + ' + prefix + 'chstatus\n│ Reply to image + ' + prefix + 'chstatus Hi\n│ ' + prefix + 'chstatus ' + DEFAULT_CHANNEL_JID + ' Hello')
          });
        }

        const sent = await client.sendChannelStatus(channelJid, content);

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        return client.sendMessage(m.chat, { text: _fmt('✅ Channel status posted!\n│ Channel: ' + channelJid + '\n│ ID: ' + (sent?.id || 'sent')) });
      } catch (error) {
        console.error('ChStatus Error:', error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        const errStr = String(error?.message || error || '');
        let msg = 'Error: ' + errStr;
        if (errStr.includes('401') || error?.output?.statusCode === 401) {
          msg += '\n│ The bot is not an admin of that channel.';
        }
        await client.sendMessage(m.chat, { text: _fmt(msg) });
      }
    });
  }
};
