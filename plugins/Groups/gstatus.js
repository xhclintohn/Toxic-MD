import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const _fmt = (msg) => `╭─❏ 「 GROUP STATUS 」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

async function _downloadMedia(sourceMsg, type) {
  const stream = await downloadContentFromMessage(sourceMsg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function _sendStatusToGroup(client, jid, mediaType, buffer, caption) {
  if (mediaType === 'image') {
    await client.sendMessage(jid, {
      image: buffer, caption: caption || '',
      contextInfo: { isGroupStatus: true, statusSourceType: 'IMAGE', statusAttributions: [{ type: 10 }], statusAudienceMetadata: { audienceType: 'CLOSE_FRIENDS' } }
    });
  } else if (mediaType === 'video') {
    await client.sendMessage(jid, {
      video: buffer, caption: caption || '',
      contextInfo: { isGroupStatus: true, statusSourceType: 'VIDEO', statusAttributions: [{ type: 10 }], statusAudienceMetadata: { audienceType: 'CLOSE_FRIENDS' } }
    });
  } else if (mediaType === 'audio') {
    await client.sendMessage(jid, {
      audio: buffer, mimetype: 'audio/mp4',
      contextInfo: { isGroupStatus: true, statusSourceType: 'AUDIO', statusAttributions: [{ type: 10 }], statusAudienceMetadata: { audienceType: 'CLOSE_FRIENDS' } }
    });
  } else {
    await client.sendMessage(jid, {
      text: caption || '',
      contextInfo: { isGroupStatus: true, statusSourceType: 'TEXT', statusAttributions: [{ type: 10 }], statusAudienceMetadata: { audienceType: 'CLOSE_FRIENDS' } }
    });
  }
}

export default {
  name: 'gstatus',
  aliases: ['groupstatus', 'gs'],
  description: 'Posts media or text as a silent group status.',
  run: async (context) => {
    const { client, m, prefix, IsGroup, botname } = context;

    try {
      if (!botname) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, { text: _fmt('Bot name is not set.') });
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

        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (m.message?.imageMessage) {
          sourceMsg = m.message.imageMessage; mediaType = 'image';
          caption = m.message.imageMessage?.caption || inlineText || null;
        } else if (m.message?.videoMessage) {
          sourceMsg = m.message.videoMessage; mediaType = 'video';
          caption = m.message.videoMessage?.caption || inlineText || null;
        } else if (m.message?.audioMessage) {
          sourceMsg = m.message.audioMessage; mediaType = 'audio';
        } else if (quoted?.imageMessage) {
          sourceMsg = quoted.imageMessage; mediaType = 'image';
          caption = quoted.imageMessage?.caption || inlineText || null;
        } else if (quoted?.videoMessage) {
          sourceMsg = quoted.videoMessage; mediaType = 'video';
          caption = quoted.videoMessage?.caption || inlineText || null;
        } else if (quoted?.audioMessage) {
          sourceMsg = quoted.audioMessage; mediaType = 'audio';
        }

        if (!sourceMsg && !inlineText) {
          await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
          return client.sendMessage(m.chat, {
            text: _fmt('Reply to media or provide text.\n│ Example:\n│ ' + prefix + 'gstatus all Hello groups!\n│ Reply to image + ' + prefix + 'gstatus all Caption')
          });
        }

        let buffer = null;
        if (sourceMsg && mediaType) {
          try { buffer = await _downloadMedia(sourceMsg, mediaType); }
          catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
            return client.sendMessage(m.chat, { text: _fmt('Failed to download media: ' + e.message) });
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
            await _sendStatusToGroup(client, jid, mediaType, buffer, caption);
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

      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (m.message?.imageMessage) {
        sourceMsg = m.message.imageMessage; mediaType = 'image';
        caption = m.message.imageMessage?.caption || inlineText || null;
      } else if (m.message?.videoMessage) {
        sourceMsg = m.message.videoMessage; mediaType = 'video';
        caption = m.message.videoMessage?.caption || inlineText || null;
      } else if (m.message?.audioMessage) {
        sourceMsg = m.message.audioMessage; mediaType = 'audio';
      } else if (quoted) {
        if (quoted.imageMessage) {
          sourceMsg = quoted.imageMessage; mediaType = 'image';
          caption = quoted.imageMessage?.caption || inlineText || null;
        } else if (quoted.videoMessage) {
          sourceMsg = quoted.videoMessage; mediaType = 'video';
          caption = quoted.videoMessage?.caption || inlineText || null;
        } else if (quoted.audioMessage) {
          sourceMsg = quoted.audioMessage; mediaType = 'audio';
        }
      }

      if (!sourceMsg && !inlineText) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
        return client.sendMessage(m.chat, { text: _fmt('Reply to media or add text after the command.') });
      }

      caption = caption || inlineText || null;

      let buffer = null;
      if (sourceMsg && mediaType) {
        const stream = await downloadContentFromMessage(sourceMsg, mediaType);
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        buffer = Buffer.concat(chunks);
      }

      await _sendStatusToGroup(client, targetGroupJid, mediaType, buffer, caption);

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
