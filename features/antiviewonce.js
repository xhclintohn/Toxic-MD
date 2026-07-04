import { downloadContentFromMessage } from '@whiskeysockets/baileys';
  import { getCachedSettings } from '../lib/settingsCache.js';

  // All wrapper types smsg.js recognises for view-once
  const VO_TYPES   = new Set(['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension']);
  const VO_WRAPPERS = ['viewOnceMessageV2Extension', 'viewOnceMessageV2', 'viewOnceMessage'];
  const TRANSPORT   = ['ephemeralMessage', 'documentWithCaptionMessage', 'deviceSentMessage',
                       'editedMessage', 'futureProofMessage'];

  function isEnabled(val) {
      if (val === true || val === 1) return true;
      if (typeof val === 'string') { const v = val.toLowerCase(); return v === 'true' || v === '1' || v === 'on'; }
      return false;
  }

 
  function deepUnwrap(msg) {
      if (!msg) return null;
      const ALL = [...VO_WRAPPERS, ...TRANSPORT];
      let cur = msg;
      for (let i = 0; i < 15; i++) {
          const k = ALL.find(w => cur[w]?.message);
          if (!k) break;
          cur = cur[k].message;
      }
      return cur;
  }

  function pickMedia(inner) {
      if (!inner) return null;
      if (inner.imageMessage) return { type: 'image', msg: inner.imageMessage };
      if (inner.videoMessage) return { type: 'video', msg: inner.videoMessage };
      if (inner.audioMessage || inner.pttMessage) return { type: 'audio', msg: inner.audioMessage || inner.pttMessage };
      return null;
  }

 
  async function grab(client, m, mediaMsg, type) {
      if (typeof m.msg?.download === 'function') {
          try { const b = await m.msg.download(); if (b?.length) return b; } catch {}
      }
      if (typeof m.download === 'function') {
          try { const b = await m.download(); if (b?.length) return b; } catch {}
      }

      // Strategy 2 — for viewOnceMessageV2/Extension: smsg sets m.msg = { message: { imageMessage } }
      // Access inner via m.msg.message and call downloadMediaMessage directly
      const innerViaSmsg = m.msg?.message;
      if (innerViaSmsg) {
          const im = innerViaSmsg.imageMessage || innerViaSmsg.videoMessage ||
                     innerViaSmsg.audioMessage || innerViaSmsg.pttMessage;
          if (im) {
              try { const b = await client.downloadMediaMessage(im); if (b?.length) return b; } catch {}
              const t2 = innerViaSmsg.videoMessage ? 'video'
                        : (innerViaSmsg.audioMessage || innerViaSmsg.pttMessage) ? 'audio' : 'image';
              try {
                  const s = await downloadContentFromMessage(im, t2);
                  const chunks = []; for await (const c of s) chunks.push(c);
                  const buf = Buffer.concat(chunks);
                  if (buf?.length) return buf;
              } catch {}
          }
      }

      // Strategy 3 — downloadContentFromMessage on the deepUnwrapped media object
      try {
          const dlType = type === 'audio' ? 'audio' : type === 'video' ? 'video' : 'image';
          const stream = await downloadContentFromMessage(mediaMsg, dlType);
          const chunks = []; for await (const c of stream) chunks.push(c);
          const buf = Buffer.concat(chunks);
          if (buf?.length) return buf;
      } catch {}

      // Strategy 4 — downloadMediaMessage with the media message directly (retrieve.js approach)
      try { const b = await client.downloadMediaMessage(mediaMsg); if (b?.length) return b; } catch {}

      // Strategy 5 — wrap media in synthetic message
      try {
          const b = await client.downloadMediaMessage({ message: { [`${type}Message`]: mediaMsg } });
          if (b?.length) return b;
      } catch (e) {}

      return null;
  }

  export default async (client, m) => {
      try {
          if (!m?.message) return;
          if (m.key?.fromMe) return;

          const settings = await getCachedSettings();
          if (!isEnabled(settings?.antiviewonce)) return;

          const mtype = m.mtype || '';
          const inner = deepUnwrap(m.message);
          const media = pickMedia(inner);

          const wrapperMatched = VO_TYPES.has(mtype)
              || VO_WRAPPERS.some(k => m.message[k])
              || TRANSPORT.some(k => m.message[k]?.message && VO_WRAPPERS.some(v => m.message[k].message[v]));
          const inlineFlagged = !!(media?.msg?.viewOnce === true);
          if (!wrapperMatched && !inlineFlagged) return;
          if (!media) return;

      
          const rawBot = client.user?.id || '';
          const botJid = rawBot.includes(':')
              ? rawBot.split(':')[0] + '@s.whatsapp.net'
              : rawBot;
          if (!botJid) return;

          const buf = await grab(client, m, media.msg, media.type);
          if (!buf?.length) return;

          const _rawSender = m.sender || m.key?.participant || m.key?.remoteJid || '';
          const _senderRaw = _rawSender.split('@')[0].split(':')[0];
          const senderNum = (_rawSender.endsWith('@lid') && globalThis.lidPhoneCache?.get(_senderRaw))
              ? String(globalThis.lidPhoneCache.get(_senderRaw)).replace(/\D/g, '')
              : _senderRaw || 'Unknown';
          const chatType = (m.chat || '').endsWith('@g.us') ? 'Group 👥' : 'DM 💬';
          const ts    = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
          const extra = (media.msg.caption || '').trim();
          const mentions = m.sender ? [m.sender] : [];
          const caption  = `╭─❏ 「 VIEW ONCE RETRIEVED」\n│ Sender: @${senderNum}\n│ Chat: ${chatType}\n│ Time: ${ts}\n${extra ? '│ Caption: ' + extra + '\n' : ''}│ \n│ Nothing slips past me. 😈\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

          if (media.type === 'image') {
              await client.sendMessage(botJid, { image: buf, caption, mentions });
          } else if (media.type === 'video') {
              await client.sendMessage(botJid, { video: buf, caption, mentions });
          } else if (media.type === 'document') {
              await client.sendMessage(botJid, {
                  document: buf,
                  mimetype: media.msg.mimetype || 'application/octet-stream',
                  fileName: media.msg.fileName || 'viewonce',
                  caption, mentions
              });
          } else {
              const mime = media.msg.mimetype || 'audio/ogg; codecs=opus';
              await client.sendMessage(botJid, { audio: buf, mimetype: mime, ptt: media.msg.ptt !== false });
              await client.sendMessage(botJid, { text: caption, mentions });
          }
      } catch (e) {}
  };
  