import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import ownerMiddleware from '../../utils/botUtil/Ownermiddleware.js';
import { sendInteractive } from '../../lib/sendInteractive.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MENU_IMG = path.resolve(__dirname, '../../toxic.jpg');

async function makeThumb(buf) {
  if (!buf?.length) return null;
  try {
    return await sharp(buf)
      .resize(300, 300, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
  } catch {
    return buf.length < 100000 ? buf : null;
  }
}

function buildAlbumPayload(text, jpgthumb) {
  const thumb = jpgthumb || undefined;
  return {
    albumMessage: {
      contextInfo: {
        externalAdReply: {
          containsAutoReply: true,
          automatedGreetingMessageShown: true,
          greetingMessageBody: String(text),
          automatedGreetingMessageCtaType: 'OPEN_URL',
          ctaPayload: 'web',
          sourceUrl: 'web',
          thumbnail: thumb,
          jpegThumbnail: thumb,
          showAdAttribution: true,
          showPlayButton: false,
          disableNudge: false,
          renderLargerThumbnail: true,
          sourceApp: 'instagram',
          mediaUrl: 'web',
          originalImageUrl: 'web',
          thumbnailUrl: 'web',
          adType: 0,
          wtwaAdFormat: 0,
          wtwaWebsiteUrl: 'web',
          adPreviewUrl: 'web'
        }
      },
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2
      }
    }
  };
}

export default {
  name: 'jpm',
  aliases: ['jpmbisnis', 'jpmbiz', 'broadcastbisnis', 'bcbisnis'],
  description: 'Send JPM Bisnis album greeting in the current group',
  run: async (context) => {
    await ownerMiddleware(context, async () => {
      const { client, m, text } = context;
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      const body = String(text || '').trim();
      if (!body) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 JPM」\n│ Provide text.\n│ Example: .jpm Hello everyone\n╰───────────────`);
      }

      if (!m.isGroup && !String(m.chat).endsWith('@g.us')) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 JPM」\n│ Group only.\n╰───────────────`);
      }

      let imgBuf = null;
      try {
        if (fs.existsSync(MENU_IMG)) imgBuf = fs.readFileSync(MENU_IMG);
      } catch {}
      if (!imgBuf?.length) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 JPM」\n│ Menu image missing (toxic.jpg).\n╰───────────────`);
      }

      const jpgthumb = await makeThumb(imgBuf);
      if (!jpgthumb?.length) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, `╭─❏ 「 JPM」\n│ Thumbnail process failed.\n╰───────────────`);
      }

      const payload = buildAlbumPayload(body, jpgthumb);

      try {
        const msg = generateWAMessageFromContent(m.chat, payload, {
          userJid: client.user?.id || client.user?.jid
        });
        await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        await sendInteractive(client, m, `╭─❏ 「 JPM」\n│ Sent in this group.\n╰───────────────`);
      } catch (e) {
        try {
          await client.relayMessage(m.chat, payload, {});
          await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
          await sendInteractive(client, m, `╭─❏ 「 JPM」\n│ Sent in this group.\n╰───────────────`);
        } catch (e2) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          await sendInteractive(client, m, `╭─❏ 「 JPM」\n│ Failed.\n│ ${String(e2?.message || e2).slice(0, 180)}\n╰───────────────`);
        }
      }
    });
  }
};
