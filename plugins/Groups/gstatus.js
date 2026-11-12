import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const _fmt = (msg) => `╭─❏ 「 GROUP STATUS 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

function _unwrap(msg) {
  let cur = msg;
  for (let i = 0; i < 5 && cur && typeof cur === 'object'; i++) {
    const inner = cur.ephemeralMessage?.message || cur.viewOnceMessage?.message || cur.viewOnceMessageV2?.message || cur.viewOnceMessageV2Extension?.message;
    if (!inner) break;
    cur = inner;
  }
  return cur;
}

async function _collect(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function _downloadMedia(sourceMsg, type, m, fromQuoted) {
  let firstError = null;
  try {
    const buf = await _collect(await downloadContentFromMessage(sourceMsg, type));
    if (buf && buf.length) return buf;
    firstError = new Error('downloaded media was empty');
  } catch (e) {
    firstError = e;
  }
  const fallback = fromQuoted ? m?.quoted?.download : m?.download;
  if (typeof fallback === 'function') {
    try {
      const out = await fallback.call(fromQuoted ? m.quoted : m);
      const buf = Buffer.isBuffer(out) ? out : await _collect(out);
      if (buf && buf.length) return buf;
    } catch {}
  }
  throw firstError || new Error('downloaded media was empty');
}

async function _sendStatusToGroup(client, jid, mediaType, buffer, caption, attrs) {
  const a = attrs || {};
  if (mediaType === 'image') {
    return client.sendGroupStatus(jid, { image: buffer, caption: caption || '' });
  } else if (mediaType === 'video') {
    return client.sendGroupStatus(jid, { video: buffer, caption: caption || '', gifPlayback: !!a.gifPlayback, mimetype: a.mimetype || 'video/mp4' });
  } else if (mediaType === 'audio') {
    return client.sendGroupStatus(jid, { audio: buffer, mimetype: a.mimetype || 'audio/mp4', ptt: !!a.ptt });
  } else if (mediaType === 'sticker') {
    return client.sendGroupStatus(jid, { sticker: buffer, mimetype: a.mimetype || 'image/webp' });
  } else {
    return client.sendGroupStatus(jid, { text: caption || '' });
  }
}

export default {
  name: 'gstatus',
  aliases: ['groupstatus', 'gs', 'gstat', 'groupst', 'gstatuspost'],
  description: 'Posts media or text as a group status.',
  run: async (context) => {
    const { client, m, prefix, IsGroup, botname } = context;

    try {
      if (!botname) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, { text: _fmt('Bot name is not set.') });
      }

      if (typeof client.sendGroupStatus !== 'function') {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, { text: _fmt('Baileys is too old for group status.\n│ Update Baileys to 1.8.0 or newer, then try again.') });
      }

      const bodyStr = (m.body || '').trim();
      const spaceIdx = bodyStr.indexOf(' ');
      const afterCmd = spaceIdx !== -1 ? bodyStr.slice(spaceIdx + 1).trim() : '';
      const parts = afterCmd.split(/\s+/);
      const firstArg = (parts[0] || '').toLowerCase();

      if (firstArg === 'all') {
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const inlineText = parts.slice(1).join(' ').trim() || null;
        let mediaType = null;
        let sourceMsg = null;
        let caption = inlineText;

        const rootMsg = _unwrap(m.message || {});
        const quoted = _unwrap(rootMsg?.extendedTextMessage?.contextInfo?.quotedMessage
          || rootMsg?.imageMessage?.contextInfo?.quotedMessage
          || rootMsg?.videoMessage?.contextInfo?.quotedMessage
          || m.quoted?.message
          || null);
        let mediaAttrs = {};
        let fromQuoted = false;
        if (rootMsg?.imageMessage) {
          sourceMsg = rootMsg.imageMessage; mediaType = 'image';
          caption = inlineText || rootMsg.imageMessage?.caption || null;
          mediaAttrs = { mimetype: rootMsg.imageMessage?.mimetype || null };
        } else if (rootMsg?.videoMessage) {
          sourceMsg = rootMsg.videoMessage; mediaType = 'video';
          caption = inlineText || rootMsg.videoMessage?.caption || null;
          mediaAttrs = { mimetype: rootMsg.videoMessage?.mimetype || null, gifPlayback: !!rootMsg.videoMessage?.gifPlayback };
        } else if (rootMsg?.audioMessage) {
          sourceMsg = rootMsg.audioMessage; mediaType = 'audio';
          mediaAttrs = { mimetype: rootMsg.audioMessage?.mimetype || null, ptt: !!rootMsg.audioMessage?.ptt };
        } else if (rootMsg?.stickerMessage) {
          sourceMsg = rootMsg.stickerMessage; mediaType = 'sticker';
          mediaAttrs = { mimetype: rootMsg.stickerMessage?.mimetype || null };
        } else if (quoted?.imageMessage) {
          sourceMsg = quoted.imageMessage; mediaType = 'image';
          caption = inlineText || quoted.imageMessage?.caption || null;
          mediaAttrs = { mimetype: quoted.imageMessage?.mimetype || null };
          fromQuoted = true;
        } else if (quoted?.videoMessage) {
          sourceMsg = quoted.videoMessage; mediaType = 'video';
          caption = inlineText || quoted.videoMessage?.caption || null;
          mediaAttrs = { mimetype: quoted.videoMessage?.mimetype || null, gifPlayback: !!quoted.videoMessage?.gifPlayback };
          fromQuoted = true;
        } else if (quoted?.audioMessage) {
          sourceMsg = quoted.audioMessage; mediaType = 'audio';
          mediaAttrs = { mimetype: quoted.audioMessage?.mimetype || null, ptt: !!quoted.audioMessage?.ptt };
          fromQuoted = true;
        } else if (quoted?.stickerMessage) {
          sourceMsg = quoted.stickerMessage; mediaType = 'sticker';
          mediaAttrs = { mimetype: quoted.stickerMessage?.mimetype || null };
          fromQuoted = true;
        }

        if (m.quoted && !sourceMsg) {
          try {
            if (typeof m.quoted.download === 'function') {
              const buf = await m.quoted.download();
              if (buf && buf.length) {
                const mt = (m.quoted.mimetype || m.quoted.mtype || '').toLowerCase();
                if (m.quoted.mtype === 'stickerMessage' || mt === 'image/webp') { mediaType = 'sticker'; sourceMsg = { _buf: buf }; mediaAttrs = { mimetype: m.quoted.mimetype || null }; }
                else if (mt.includes('image') || m.quoted.mtype === 'imageMessage') { mediaType = 'image'; sourceMsg = { _buf: buf }; mediaAttrs = { mimetype: m.quoted.mimetype || null }; }
                else if (mt.includes('video') || m.quoted.mtype === 'videoMessage') { mediaType = 'video'; sourceMsg = { _buf: buf }; mediaAttrs = { mimetype: m.quoted.mimetype || null, gifPlayback: !!m.quoted.gifPlayback }; }
                else if (mt.includes('audio') || m.quoted.mtype === 'audioMessage') { mediaType = 'audio'; sourceMsg = { _buf: buf }; mediaAttrs = { mimetype: m.quoted.mimetype || null, ptt: !!m.quoted.ptt }; }
              }
            }
          } catch {}
        }

        if (!sourceMsg && !inlineText) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, {
            text: _fmt('Reply to media or provide text.\n│ Example:\n│ ' + prefix + 'gstatus all Hello groups!\n│ Reply to image + ' + prefix + 'gstatus all Caption')
          });
        }

        let buffer = null;
        if (sourceMsg && mediaType) {
          if (sourceMsg._buf) {
            buffer = sourceMsg._buf;
          } else {
            try { buffer = await _downloadMedia(sourceMsg, mediaType, m, fromQuoted); }
            catch (e) {
              await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
              return client.sendMessage(m.chat, { text: _fmt('Failed to download media: ' + e.message) });
            }
          }
        }

        const allGroups = await client.groupFetchAllParticipating();
        const groupJids = Object.keys(allGroups);

        if (!groupJids.length) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, { text: _fmt('Bot is not in any groups.') });
        }

        const results = { success: [], failed: [] };
        for (const jid of groupJids) {
          try {
            await _sendStatusToGroup(client, jid, mediaType, buffer, caption, mediaAttrs);
            results.success.push(allGroups[jid]?.subject || jid);
          } catch (e) {
            results.failed.push({ name: allGroups[jid]?.subject || jid, error: (e.message || '').slice(0, 60) });
          }
          await new Promise(r => setTimeout(r, 500));
        }

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        let report = `╭─❏ 「 GSTATUS REPORT 」\n│\n│ ✅ Success: ${results.success.length}/${groupJids.length}\n│ ❌ Failed: ${results.failed.length}/${groupJids.length}`;
        if (results.failed.length) {
          report += '\n│\n│ 📋 Failed:';
          for (const f of results.failed) report += `\n│  • ${f.name}: ${f.error}`;
        }
        report += '\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧';
        return client.sendMessage(m.chat, { text: report });
      }

      let targetGroupJid = null;
      let inlineText = null;

      if (IsGroup) {
        targetGroupJid = m.chat;
        inlineText = afterCmd || null;
      } else {
        if (!afterCmd) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, {
            text: `╭─❏ 「 GROUP STATUS 」\n│ Reply to media and provide a group link or JID.\n│ Example:\n│ ${prefix}gstatus https://chat.whatsapp.com/xxxxx\n│ ${prefix}gstatus 120363@g.us\n│ ${prefix}gstatus all Caption — send to ALL groups\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
          });
        }
        const p = parts;
        const input = p[0];
        const rest = p.slice(1).join(' ').trim();

        if (input.includes('chat.whatsapp.com')) {
          let code;
          try { const url = new URL(input); code = url.pathname.replace(/^\/+/, ''); }
          catch { code = input.split('/').pop(); }
          try {
            const res = await client.groupGetInviteInfo(code);
            targetGroupJid = res?.id || res?.groupId || res?.gid;
            if (!targetGroupJid) throw new Error('no id');
          } catch {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return client.sendMessage(m.chat, { text: `╭─❏ 「 GROUP STATUS 」\n│ Invalid or expired group link.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
          }
        } else if (input.includes('@g.us')) {
          targetGroupJid = input.trim();
        } else {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, { text: `╭─❏ 「 GROUP STATUS 」\n│ Invalid group link or JID.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧` });
        }
        inlineText = rest || null;
      }

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

      let caption = null;
      let sourceMsg = null;
      let mediaType = null;

      const rootMsg = _unwrap(m.message || {});
      const quoted = _unwrap(rootMsg?.extendedTextMessage?.contextInfo?.quotedMessage
        || rootMsg?.imageMessage?.contextInfo?.quotedMessage
        || rootMsg?.videoMessage?.contextInfo?.quotedMessage
        || m.quoted?.message
        || null);
      let mediaAttrs = {};
      let fromQuoted = false;

      if (rootMsg?.imageMessage) {
        sourceMsg = rootMsg.imageMessage; mediaType = 'image';
        caption = inlineText || rootMsg.imageMessage?.caption || null;
        mediaAttrs = { mimetype: rootMsg.imageMessage?.mimetype || null };
      } else if (rootMsg?.videoMessage) {
        sourceMsg = rootMsg.videoMessage; mediaType = 'video';
        caption = inlineText || rootMsg.videoMessage?.caption || null;
        mediaAttrs = { mimetype: rootMsg.videoMessage?.mimetype || null, gifPlayback: !!rootMsg.videoMessage?.gifPlayback };
      } else if (rootMsg?.audioMessage) {
        sourceMsg = rootMsg.audioMessage; mediaType = 'audio';
        mediaAttrs = { mimetype: rootMsg.audioMessage?.mimetype || null, ptt: !!rootMsg.audioMessage?.ptt };
      } else if (rootMsg?.stickerMessage) {
        sourceMsg = rootMsg.stickerMessage; mediaType = 'sticker';
        mediaAttrs = { mimetype: rootMsg.stickerMessage?.mimetype || null };
      } else if (quoted) {
        if (quoted.imageMessage) {
          sourceMsg = quoted.imageMessage; mediaType = 'image';
          caption = inlineText || quoted.imageMessage?.caption || null;
          mediaAttrs = { mimetype: quoted.imageMessage?.mimetype || null };
          fromQuoted = true;
        } else if (quoted.videoMessage) {
          sourceMsg = quoted.videoMessage; mediaType = 'video';
          caption = inlineText || quoted.videoMessage?.caption || null;
          mediaAttrs = { mimetype: quoted.videoMessage?.mimetype || null, gifPlayback: !!quoted.videoMessage?.gifPlayback };
          fromQuoted = true;
        } else if (quoted.audioMessage) {
          sourceMsg = quoted.audioMessage; mediaType = 'audio';
          mediaAttrs = { mimetype: quoted.audioMessage?.mimetype || null, ptt: !!quoted.audioMessage?.ptt };
          fromQuoted = true;
        } else if (quoted.stickerMessage) {
          sourceMsg = quoted.stickerMessage; mediaType = 'sticker';
          mediaAttrs = { mimetype: quoted.stickerMessage?.mimetype || null };
          fromQuoted = true;
        } else if (quoted.conversation || quoted.extendedTextMessage?.text) {
          caption = (quoted.conversation || quoted.extendedTextMessage?.text || '') + (inlineText ? '\n' + inlineText : '');
        }
      }

      if (m.quoted && !sourceMsg) {
        try {
          if (typeof m.quoted.download === 'function') {
            const buf = await m.quoted.download();
            if (buf && buf.length) {
              const mt = (m.quoted.mimetype || m.quoted.mtype || '').toLowerCase();
              if (m.quoted.mtype === 'stickerMessage' || mt === 'image/webp') { mediaType = 'sticker'; sourceMsg = { _buf: buf }; mediaAttrs = { mimetype: m.quoted.mimetype || null }; }
              else if (mt.includes('image') || m.quoted.mtype === 'imageMessage') { mediaType = 'image'; sourceMsg = { _buf: buf }; mediaAttrs = { mimetype: m.quoted.mimetype || null }; }
              else if (mt.includes('video') || m.quoted.mtype === 'videoMessage') { mediaType = 'video'; sourceMsg = { _buf: buf }; mediaAttrs = { mimetype: m.quoted.mimetype || null, gifPlayback: !!m.quoted.gifPlayback }; }
              else if (mt.includes('audio') || m.quoted.mtype === 'audioMessage') { mediaType = 'audio'; sourceMsg = { _buf: buf }; mediaAttrs = { mimetype: m.quoted.mimetype || null, ptt: !!m.quoted.ptt }; }
            }
          }
        } catch {}
      }

      if (!sourceMsg && !inlineText && !caption) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, { text: _fmt('Reply to media or text, or add text after the command.') });
      }

      caption = caption || inlineText || null;

      let buffer = null;
      if (sourceMsg && mediaType) {
        if (sourceMsg._buf) {
          buffer = sourceMsg._buf;
        } else {
          try {
            buffer = await _downloadMedia(sourceMsg, mediaType, m, fromQuoted);
          } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return client.sendMessage(m.chat, { text: _fmt('Failed to download media: ' + e.message) });
          }
        }
        if (!buffer || !buffer.length) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, { text: _fmt('Failed to download media: downloaded media was empty') });
        }
      }

      await _sendStatusToGroup(client, targetGroupJid, mediaType, buffer, caption, mediaAttrs);

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
      if (!IsGroup) {
        await client.sendMessage(m.chat, { text: _fmt('✅ Status posted to group!') });
      }

    } catch (error) {
      console.error('GStatus Error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
      await client.sendMessage(m.chat, { text: _fmt('Error: ' + error.message) });
    }
  }
};
