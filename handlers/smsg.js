import { proto, getContentType } from '@whiskeysockets/baileys';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path from 'path';

const filePath = path.resolve(__dirname, "../toxic.jpg");
let kali = Buffer.alloc(0);
try { kali = readFileSync(filePath); } catch { kali = Buffer.alloc(0); }

const lidMappingCache = new Map();

function resolveLidToJid(jid) {
  if (!jid) return jid;
  if (jid.endsWith('@lid')) {
    const lid = jid.split('@')[0].split(':')[0];
    let mapped = lidMappingCache.get(lid)
      || (globalThis.lidPhoneCache && globalThis.lidPhoneCache.get(lid));
    if (!mapped && globalThis.resolvePhoneFromLid) {
      const r = globalThis.resolvePhoneFromLid(jid);
      if (r && typeof r === 'string' && !r.endsWith('@lid')) mapped = r;
    }
    if (mapped && typeof mapped === 'string') {
      const num = mapped.split('@')[0].replace(/\D/g, '');
      if (num) {
        if (!lidMappingCache.has(lid)) lidMappingCache.set(lid, num);
        return num + '@s.whatsapp.net';
      }
    }
    return jid;
  }
  return jid;
}

function smsg(conn, m, store, resolvedChatJid = null) {
  if (!m) return {};
  let M = proto.WebMessageInfo;

  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id?.startsWith("BAE5") && m.id.length === 16;
    
    if (resolvedChatJid) {
      m.chat = resolvedChatJid;
    } else if (m.key.remoteJidAlt) {
      m.chat = m.key.remoteJidAlt;
    } else if (m.key.remoteJid) {
      m.chat = resolveLidToJid(m.key.remoteJid);
    } else {
      m.chat = m.key.remoteJid;
    }
    
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat?.endsWith("@g.us");
    
    let rawSender;
    if (m.fromMe && conn.user?.id) {
      rawSender = conn.user.id;
    } else if (m.key.participantAlt) {
      rawSender = m.key.participantAlt;
    } else if (m.key.participant) {
      rawSender = m.key.participant;
    } else {
      rawSender = m.chat;
    }
    
    rawSender = resolveLidToJid(rawSender);
    m.sender = conn.decodeJid(rawSender);
    
    if (m.isGroup) {
      let rawParticipant;
      if (m.key.participantAlt) {
        rawParticipant = m.key.participantAlt;
      } else if (m.key.participant) {
        rawParticipant = m.key.participant;
      } else {
        rawParticipant = "";
      }
      rawParticipant = resolveLidToJid(rawParticipant);
      m.participant = conn.decodeJid(rawParticipant) || "";
    }
  }

  if (m.message) {
    try {
      m.mtype = getContentType(m.message);
    } catch {
      m.mtype = 'unknown';
    }

    if (m.mtype === "deviceSentMessage" && m.message.deviceSentMessage?.message) {
      m.mtype = getContentType(m.message.deviceSentMessage.message);
      m.msg = m.message.deviceSentMessage.message[m.mtype];
    } else if (m.mtype === "ephemeralMessage" && m.message.ephemeralMessage?.message) {
      m.mtype = getContentType(m.message.ephemeralMessage.message);
      m.msg = m.message.ephemeralMessage.message[m.mtype];
    } else if (m.mtype === "viewOnceMessage" && m.message[m.mtype]) {
      m.msg = m.message[m.mtype].message[getContentType(m.message[m.mtype].message)];
    } else {
      m.msg = m.message[m.mtype];
    }

    m.body =
      m.message?.conversation ||
      m.msg?.caption ||
      m.msg?.text ||
      (m.mtype === "listResponseMessage" && m.msg?.singleSelectReply?.selectedRowId) ||
      (m.mtype === "buttonsResponseMessage" && m.msg?.selectedButtonId) ||
      (m.mtype === "interactiveResponseMessage" && (() => { try { return JSON.parse(m.msg?.nativeFlowResponseMessage?.paramsJson)?.id || ''; } catch { return ''; } })()) ||
      (m.mtype === "viewOnceMessage" && m.msg?.caption) ||
      "";

    m.text =
      (m.mtype === "buttonsResponseMessage" && m.msg?.selectedButtonId) ||
      (m.mtype === "interactiveResponseMessage" && (() => { try { return JSON.parse(m.msg?.nativeFlowResponseMessage?.paramsJson)?.id || ''; } catch { return ''; } })()) ||
      m.msg?.text ||
      m.msg?.caption ||
      m.message?.conversation ||
      m.msg?.contentText ||
      m.msg?.selectedDisplayText ||
      m.msg?.title ||
      "";

    let quoted = m.msg?.contextInfo?.quotedMessage;
    m.quoted = quoted || null;

    let rawMentionedJid = m.msg?.contextInfo?.mentionedJid || [];
    m.mentionedJid = rawMentionedJid.map(jid => {
      if (jid && jid.endsWith('@lid')) {
        return resolveLidToJid(jid);
      }
      return jid;
    });

    if (m.quoted) {
      let type = getContentType(quoted);
      m.quoted = quoted[type];
      if (["productMessage"].includes(type)) {
        type = getContentType(m.quoted);
        m.quoted = m.quoted[type];
      }

      if (typeof m.quoted === "string") m.quoted = { text: m.quoted };

      if (!m.quoted || typeof m.quoted !== "object") {
        m.quoted = null;
      } else {
        m.quoted.mtype = type;
        m.quoted.id = m.msg?.contextInfo?.stanzaId;

        let quotedChat = m.msg?.contextInfo?.remoteJid || m.chat;
        if (quotedChat && quotedChat.endsWith('@lid')) {
          quotedChat = resolveLidToJid(quotedChat);
        }
        m.quoted.chat = quotedChat;

        m.quoted.isBaileys =
          m.quoted.id?.startsWith("BAE5") && m.quoted.id.length === 16;

        let quotedSender = m.msg?.contextInfo?.participant;
        if (quotedSender && quotedSender.endsWith('@lid')) {
          quotedSender = resolveLidToJid(quotedSender);
        }
        m.quoted.sender = conn.decodeJid(quotedSender);
        m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user?.id);

        m.quoted.text =
          m.quoted.text ||
          m.quoted.caption ||
          m.quoted.conversation ||
          m.quoted.contentText ||
          m.quoted.selectedDisplayText ||
          m.quoted.title ||
          "";

        let quotedMentioned = m.msg?.contextInfo?.mentionedJid || [];
        m.quoted.mentionedJid = quotedMentioned.map(jid => {
          if (jid && jid.endsWith('@lid')) {
            return resolveLidToJid(jid);
          }
          return jid;
        });

        m.getQuotedObj = m.getQuotedMessage = async () => {
          if (!m.quoted.id) return false;
          let q = await store.loadMessage(m.chat, m.quoted.id, conn);
          return smsg(conn, q, store);
        };

        let _vM;
        const _getVM = () => {
          if (!_vM) _vM = M.fromObject({
            key: { remoteJid: m.quoted.chat, fromMe: m.quoted.fromMe, id: m.quoted.id },
            message: quoted,
            ...(m.isGroup ? { participant: m.quoted.sender } : {}),
          });
          return _vM;
        };
        m.quoted.fakeObj = { get key() { return _getVM().key; } };
        m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: _getVM().key });
        m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, _getVM(), forceForward, options);
        m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
      }
    }
  }

  if (m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg);

  m.text = m.text || m.body || "";

  if (m.key) {
    const _rjid = m.chat || m.key.remoteJid || '';
    const _part = m.isGroup ? (m.participant || m.sender || m.key.participant || '') : '';
    m.reactKey = {
      id: m.key.id,
      remoteJid: _rjid,
      fromMe: m.key.fromMe || false,
      ...(m.isGroup && _part ? { participant: _part } : {}),
    };
  } else {
    m.reactKey = m.key;
  }

  m.reply = (text, chatId = m.chat, options = {}) => {
    try {
      return conn.sendMessage(chatId, { text: String(text) }, { ...options });
    } catch (e) {
      return conn.sendMessage(chatId, { text: String(text) });
    }
  };

  m.copy = () => smsg(conn, M.fromObject(M.toObject(m)), store);
  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
    conn.copyNForward(jid, m, forceForward, options);

  return m;
}

export { smsg, lidMappingCache };