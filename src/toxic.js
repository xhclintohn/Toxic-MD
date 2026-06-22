import { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path from 'path';
import util from 'util';
import speed from 'performance-now';
import { smsg, formatp, tanggal, formatDate, getTime, sleep, clockString, fetchJson, getBuffer, jsonformat, generateProfilePicture, parseMention, getRandom, fetchBuffer, sendJson } from '../lib/botFunctions.js';
import { exec, spawn, execSync } from 'child_process';
import { TelegraPh, UploadFileUgu } from '../lib/toUrl.js';
import { commands, aliases, totalCommands } from '../handlers/commandHandler.js';
import status_saver from '../features/status_saver.js';
import gcPresence from '../features/gcPresence.js';
import antitaggc from '../features/antitag.js';
import antilink from '../features/antilink.js';
import { getGroupSettings, updateSetting } from '../database/config.js';
import { getCachedSettings, getCachedSudo, getCachedBanned, getCachedBannedGroups, getCachedSettingsSync, getCachedSudoSync, getCachedBannedSync, getCachedBannedGroupsSync } from '../lib/settingsCache.js';
import { botname, mycode } from '../config/settings.js';
import { cleanupOldMessages } from '../lib/Store.js';
import * as msgStore from '../lib/MessageStore.js';
import antistatusmention from '../features/antistatusmention.js';
import autoai from '../features/autoai.js';
import antiviewonce from '../features/antiviewonce.js';
import toxicaiFeature from '../features/toxicai.js';
import afkFeature from '../features/afk.js';
import mentionResponder from '../features/mentionResponder.js';
import ownerMiddleware from '../utils/botUtil/Ownermiddleware.js';
import { lidMappingCache } from '../handlers/smsg.js';
import { resolveTargetJid, resolveSenderJid } from '../lib/lidResolver.js';
import { getFakeQuoted } from '../lib/fakeQuoted.js';

const fakeQuoted = getFakeQuoted;
const DEV_NUMBER = '254114885159';
const OWNER_NUMBER_ENV = (process.env.OWNER_NUMBER || '').replace(/\D/g, '').slice(-12) || null;

process.setMaxListeners(50);
cleanupOldMessages();

let _toxicPict = Buffer.alloc(0);
try {
    _toxicPict = fs.readFileSync(path.resolve(__dirname, '../toxic.jpg'));
} catch (e) {
    _toxicPict = Buffer.alloc(0);
}
setInterval(() => cleanupOldMessages(), 12 * 60 * 60 * 1000);

let _cachedBotNumber = '';
let _cachedBotJid = '';
if (!global._toxicGroupMetaCache) global._toxicGroupMetaCache = new Map();
const _groupMetaCache = global._toxicGroupMetaCache;
const _groupMetaInFlight = new Map();
const GROUP_META_TTL = 300000;

async function fastGroupMetadata(client, jid) {
      const now = Date.now();
      const cached = _groupMetaCache.get(jid);
      if (cached && (now - cached.time) < GROUP_META_TTL) return cached.data;
      if (_groupMetaInFlight.has(jid)) return _groupMetaInFlight.get(jid);
      const p = (async () => {
          try {
              const meta = await Promise.race([
                  client.groupMetadata(jid),
                  new Promise((_, rej) => setTimeout(() => rej(new Error('meta_timeout')), 5000))
              ]);
              _groupMetaCache.set(jid, { data: meta, time: Date.now() });
              if (_groupMetaCache.size > 200) {
                  const oldest = _groupMetaCache.keys().next().value;
                  _groupMetaCache.delete(oldest);
              }
              return meta;
          } catch (e) {
              return cached?.data || {};
          } finally {
              _groupMetaInFlight.delete(jid);
          }
      })();
      _groupMetaInFlight.set(jid, p);
      return p;
  }

async function downloadMedia(client, message, type) {
    try {
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        return await client.downloadMediaMessage(message);
    }
}

function shouldStoreMessage(m) {
    const remoteJid = m.chat || m.key?.remoteJid;
    if (!remoteJid) return false;
    return !remoteJid.includes('@broadcast') && !remoteJid.includes('@newsletter');
}

function resolveLidToPhoneNumber(lidJid) {
    if (!lidJid || !lidJid.endsWith('@lid')) return lidJid;
    try {
        const lidNumber = lidJid.split('@')[0].split(':')[0];
        const mapped = lidMappingCache.get(lidNumber) || (globalThis.lidPhoneCache && globalThis.lidPhoneCache.get(lidNumber));
        if (mapped) return mapped + '@s.whatsapp.net';
        try {
            const sessionDir = path.join(__dirname, '../Session');
            const revFile = path.join(sessionDir, `lid-mapping-${lidNumber}_reverse.json`);
            if (fs.existsSync(revFile)) {
                const raw = fs.readFileSync(revFile, 'utf-8');
                const jid = JSON.parse(raw);
                if (jid) {
                    const n = String(jid).split('@')[0].split(':')[0].replace(/\D/g, '');
                    if (n && n.length >= 7 && n !== lidNumber) {
                        if (globalThis.lidPhoneCache) globalThis.lidPhoneCache.set(lidNumber, n);
                        return n + '@s.whatsapp.net';
                    }
                }
            }
        } catch {}
        return lidJid;
    } catch (e) {
        return lidJid;
    }
}

function getCleanNumber(jid) {
    if (!jid) return 'Unknown';
    let clean = jid.split('@')[0].split(':')[0];
    clean = clean.replace(/[^\d]/g, '');
    if (clean.length > 12) clean = clean.slice(-12);
    return clean;
}

function normalizeNumber(jid) {
    if (!jid) return '';
    let clean = jid.split('@')[0].split(':')[0];
    clean = clean.replace(/[^\d]/g, '');
    if (clean.length > 12) clean = clean.slice(-12);
    return clean;
}

function isDevNumber(jid) {
    if (!jid) return false;
    const normalized = normalizeNumber(jid);
    return normalized === DEV_NUMBER;
}

function getMessageType(message) {
    if (!message) return '❓ Unknown';
    const viewOnce = message.viewOnceMessage || message.viewOnceMessageV2 || message.viewOnceMessageV2Extension;
    if (viewOnce) {
        const inner = viewOnce.message || viewOnce;
        if (inner.imageMessage) return '👁️ View Once Image';
        if (inner.videoMessage) return '👁️ View Once Video';
        if (inner.audioMessage) return '👁️ View Once Audio';
        return '👁️ View Once';
    }
    if (message.imageMessage?.viewOnce) return '👁️ View Once Image';
    if (message.videoMessage?.viewOnce) return '👁️ View Once Video';
    if (message.conversation) return '📝 Text';
    if (message.imageMessage) return '🖼️ Image';
    if (message.videoMessage) return '🎥 Video';
    if (message.audioMessage) return '🔊 Audio';
    if (message.stickerMessage) return '😀 Sticker';
    if (message.documentMessage) return '📄 Document';
    if (message.documentWithCaptionMessage) return '📄 Document';
    if (message.contactMessage) return '👤 Contact';
    if (message.contactsArrayMessage) return '👤 Contacts';
    if (message.locationMessage) return '📍 Location';
    if (message.liveLocationMessage) return '📍 Live Location';
    if (message.pollCreationMessage || message.pollCreationMessageV3) return '📊 Poll';
    if (message.extendedTextMessage?.text) return '📝 Extended Text';
    if (message.buttonsResponseMessage) return '🔘 Button Response';
    if (message.listResponseMessage) return '📋 List Response';
    if (message.templateButtonReplyMessage) return '🎨 Template Button';
    if (message.editedMessage) return '✏️ Edited';
    return '❓ Unknown';
}

function extractInnerMessage(message) {
    if (!message) return message;
    if (message.ephemeralMessage?.message) return extractInnerMessage(message.ephemeralMessage.message);
    if (message.viewOnceMessage?.message) return extractInnerMessage(message.viewOnceMessage.message);
    if (message.viewOnceMessageV2?.message) return extractInnerMessage(message.viewOnceMessageV2.message);
    if (message.viewOnceMessageV2Extension?.message) return extractInnerMessage(message.viewOnceMessageV2Extension.message);
    if (message.documentWithCaptionMessage?.message) return message.documentWithCaptionMessage.message;
    return message;
}

function isViewOnceMessage(rawMessage) {
    if (!rawMessage) return false;
    if (rawMessage.viewOnceMessage || rawMessage.viewOnceMessageV2 || rawMessage.viewOnceMessageV2Extension) return true;
    const inner = extractInnerMessage(rawMessage);
    if (inner?.imageMessage?.viewOnce === true) return true;
    if (inner?.videoMessage?.viewOnce === true) return true;
    return false;
}

function getViewOnceMedia(rawMessage) {
    const voWrapper = rawMessage.viewOnceMessage || rawMessage.viewOnceMessageV2 || rawMessage.viewOnceMessageV2Extension;
    if (voWrapper) {
        const inner = voWrapper.message || voWrapper;
        return { image: inner.imageMessage || null, video: inner.videoMessage || null };
    }
    const inner = extractInnerMessage(rawMessage);
    return {
        image: inner?.imageMessage?.viewOnce ? inner.imageMessage : null,
        video: inner?.videoMessage?.viewOnce ? inner.videoMessage : null
    };
}

export default async (client, m, chatUpdate, store) => {
    if (!_cachedBotJid && client.user?.id) {
        _cachedBotJid = client.decodeJid(client.user.id);
        if (_cachedBotJid && _cachedBotJid.includes(':')) {
            _cachedBotJid = _cachedBotJid.split(':')[0];
        }
    }

    if (m.key?.fromMe === true) {
        m.sender = client.user?.id || client.decodeJid(client.user?.id);
    } else {
        m.sender = m.key?.participantAlt || m.key?.participant || m.key?.remoteJidAlt || m.key?.remoteJid;
    }

    if (m.sender && m.sender.endsWith('@lid')) {
        m.sender = resolveLidToPhoneNumber(m.sender);
    }
    if (m.chat && m.chat.endsWith('@lid')) {
          m.chat = resolveLidToPhoneNumber(m.chat);
      }

      // ── Message count tracking (for autoreport) ──
      if (!m.key?.fromMe && m.sender) {
          const _cPhone = m.sender.split('@')[0].split(':')[0].replace(/\D/g, '');
          if (_cPhone && /^\d{7,15}$/.test(_cPhone)) {
              if (!global._toxicMsgCounts) global._toxicMsgCounts = {};
              if (!global._toxicMsgCountsToday) global._toxicMsgCountsToday = {};
              global._toxicMsgCounts[_cPhone] = (global._toxicMsgCounts[_cPhone] || 0) + 1;
              global._toxicMsgCountsToday[_cPhone] = (global._toxicMsgCountsToday[_cPhone] || 0) + 1;
          }
      }
  
    if (shouldStoreMessage(m)) {
        const _sRjid = m.chat || m.key?.remoteJid;
        const _sNjid = _sRjid;
        if (_sNjid && m.key?.id) {
            const msgKeys = Object.keys(m.message || {});
            const isUseless = msgKeys.length === 0 ||
                (msgKeys.length === 1 && (msgKeys[0] === 'protocolMessage' || msgKeys[0] === 'senderKeyDistributionMessage')) ||
                (msgKeys.length === 2 && msgKeys.includes('senderKeyDistributionMessage') && msgKeys.includes('messageContextInfo'));
            if (!isUseless) {
                const _sMid = m.key.id;
                const _sSender = m.sender || m.key.participant || m.key.remoteJid || '';
                const _sPayload = { key: m.key, message: m.message || {}, pushName: m.pushName || '' };
                await msgStore.saveMessage(_sMid, _sNjid, _sSender, _sPayload).catch(() => {});
            }
        }
    }

    if (store && shouldStoreMessage(m)) {
        const _s2Rjid = m.chat || m.key?.remoteJid;
        const _s2Njid = _s2Rjid;
        if (_s2Njid) {
            if (!store.chats) store.chats = Object.create(null);
            if (!store.messageMap) store.messageMap = Object.create(null);
            if (!store.chats[_s2Njid]) store.chats[_s2Njid] = [];
            const _s2Mid = m.key.id;
            store.chats[_s2Njid].push({ ...m, message: m.message || {}, timestamp: Date.now(), originalRemoteJid: _s2Rjid, normalizedRemoteJid: _s2Njid });
            store.messageMap[_s2Mid] = { normalizedJid: _s2Njid, originalJid: _s2Rjid, timestamp: Date.now() };
            if (store.chats[_s2Njid].length > 20) {
                const _rmMsg = store.chats[_s2Njid].shift();
                if (_rmMsg?.key?.id) delete store.messageMap[_rmMsg.key.id];
            }
        }
    }

    if (m.key?.fromMe) {
        const _allPfx = ['.','!','#','/','$','?','+','-','*','\~','@','%','&','^','=','|'];
        let _fmBody = (m.text || m.body || m.message?.conversation || m.message?.extendedTextMessage?.text || '').trim();
        if (!_fmBody && m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
            try { const _pfj = m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson; _fmBody = (typeof _pfj === 'string' ? JSON.parse(_pfj) : _pfj)?.id || ''; } catch {}
        }
        if (!_fmBody && m.message?.buttonsResponseMessage?.selectedButtonId) {
            _fmBody = m.message.buttonsResponseMessage.selectedButtonId;
        }
        if (!_fmBody && m.message?.templateButtonReplyMessage?.selectedId) {
            _fmBody = m.message.templateButtonReplyMessage.selectedId;
        }
        if (!_fmBody && m.message?.deviceSentMessage?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
            try { const _pfj = m.message.deviceSentMessage.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson; _fmBody = (typeof _pfj === 'string' ? JSON.parse(_pfj) : _pfj)?.id || ''; } catch {}
        }
        if (!_fmBody && m.message?.deviceSentMessage?.message?.buttonsResponseMessage?.selectedButtonId) {
            _fmBody = m.message.deviceSentMessage.message.buttonsResponseMessage.selectedButtonId;
        }
        if (!_fmBody && m.message?.ephemeralMessage?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
            try { const _pfj = m.message.ephemeralMessage.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson; _fmBody = (typeof _pfj === 'string' ? JSON.parse(_pfj) : _pfj)?.id || ''; } catch {}
        }
        if (!_fmBody || !_allPfx.some(p => _fmBody.startsWith(p))) return;
    }

    try {
        const rawSudoUsers = getCachedSudoSync();
        const rawBannedUsers = getCachedBannedSync();
        const rawBannedGroups = getCachedBannedGroupsSync();
        const fetchedSettings = getCachedSettingsSync();
        getCachedSettings().catch(() => {});
        getCachedBannedGroups().catch(() => {});
        const sudoUsers = Array.isArray(rawSudoUsers) ? rawSudoUsers : [];
        const bannedUsers = Array.isArray(rawBannedUsers) ? rawBannedUsers : [];
        const bannedGroups = Array.isArray(rawBannedGroups) ? rawBannedGroups : [];
        let settings = fetchedSettings;

        if (!settings) { try { settings = await getCachedSettings(); } catch {} if (!settings) return; }

        const { prefix, mode, gcpresence, antitag, antidelete: antideleteSetting, antilink: antilinkSetting, chatbotpm: chatbotpmSetting, packname, multiprefix, stealth } = settings;

        var body =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            m.message?.documentMessage?.caption ||
            m.message?.buttonsResponseMessage?.selectedButtonId ||
            m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            m.message?.templateButtonReplyMessage?.selectedId ||
            m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
            m.text ||
            "";

        body = typeof body === 'string' ? body : '';

        if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
            try {
                const _pfj = m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson;
                const params = typeof _pfj === 'string' ? JSON.parse(_pfj) : _pfj;
                body = params?.id || body;
            } catch (e) {}
        }

        if (m.message?.templateButtonReplyMessage?.selectedId) {
            body = m.message.templateButtonReplyMessage.selectedId;
        }

        const Tag = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        var msgToxic = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
        var budy = typeof m.text == "string" ? m.text : "";

        const timestamp = speed();
        const toxicspeed = speed() - timestamp;
        const pict = _toxicPict;

        const ALL_PREFIXES = ['.','!','#','/','$','?','+','-','*','\~','@','%','&','^','=','|'];
        let commandName = null;
        let usedPrefix = prefix;

        if (body) {
            if (multiprefix === 'true' || multiprefix === true) {
                const mp = ALL_PREFIXES.find(p => body.startsWith(p));
                if (mp) {
                    const _r1 = body.slice(mp.length).trim().split(/\s+/)[0].toLowerCase();
                    commandName = _r1.replace(/^[^\w+]+/, '') || _r1;
                    usedPrefix = mp;
                } else if (!prefix) {
                    commandName = body.trim().split(/\s+/)[0].toLowerCase();
                }
            } else {
                if (prefix && body.startsWith(prefix)) {
                    const _r2 = body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
                    commandName = _r2.replace(/^[^\w+]+/, '') || _r2;
                    usedPrefix = prefix;
                } else if (body.startsWith('/') && prefix !== '/') {
                    const _r3 = body.slice(1).trim().split(/\s+/)[0].toLowerCase();
                    commandName = _r3.replace(/^[^\w+]+/, '') || _r3;
                    usedPrefix = '/';
                } else if (!prefix) {
                    commandName = body.trim().split(/\s+/)[0].toLowerCase();
                }
            }
        }

        const resolvedCommandName = aliases[commandName] || commandName;
        const cmd = commands[resolvedCommandName];
        const args = body.slice(usedPrefix.length).trim().split(/ +/).slice(1);
        const pushname = m.pushName || "No Name";
        if (!_cachedBotNumber && client?.user?.id) {
            _cachedBotNumber = client.decodeJid(client.user.id);
            if (_cachedBotNumber && _cachedBotNumber.includes(':')) {
                _cachedBotNumber = _cachedBotNumber.split(':')[0];
            }
        }
        let botNumber = _cachedBotNumber || client.decodeJid(client.user.id);
        if (botNumber && botNumber.includes(':')) {
            botNumber = botNumber.split(':')[0];
        }

        const senderNormalized = normalizeNumber(m.sender);
        const botNormalized = normalizeNumber(botNumber);
        const itsMe = senderNormalized === botNormalized;
        let isDev = isDevNumber(m.sender);
        const isSudo = sudoUsers.some(s => normalizeNumber(String(s)) === senderNormalized);
        const isEnvOwner = !!(OWNER_NUMBER_ENV && senderNormalized === OWNER_NUMBER_ENV);
        const Owner = itsMe || isDev || isSudo || isEnvOwner;
        let text = args.join(" ");
        const arg = budy.trim().substring(budy.indexOf(" ") + 1);
        const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);

        m.isGroup = m.chat?.endsWith("g.us");
        m.metadata = {};

        let isAdmin = false;
        let isBotAdmin = false;

        if (m.isGroup) {
            try {
                const cached = _groupMetaCache.get(m.chat);
                if (cached && (Date.now() - cached.time) < GROUP_META_TTL) {
                    m.metadata = cached.data;
                } else {
                    m.metadata = await fastGroupMetadata(client, m.chat);
                    _groupMetaCache.set(m.chat, { data: m.metadata, time: Date.now() });
                }
            } catch (e) {
                m.metadata = {};
            }

            const participants = m.metadata?.participants || [];
            const _lidNumFn = (jid) => (!jid ? '' : jid.split('@')[0].split(':')[0].replace(/\D/g, ''));
            const _resolveNum = (jid) => {
                if (!jid) return '';
                if (jid.endsWith('@lid')) {
                    const lidNum = _lidNumFn(jid);
                    const fromCache = globalThis.lidPhoneCache && globalThis.lidPhoneCache.get(lidNum);
                    if (fromCache) return String(fromCache).replace(/\D/g, '');
                    if (m.metadata) {
                        const ownerLid = _lidNumFn(m.metadata.owner || '');
                        if (ownerLid && ownerLid === lidNum && m.metadata.ownerPn) return m.metadata.ownerPn.split('@')[0].replace(/\D/g, '');
                        const subjectLid = _lidNumFn(m.metadata.subjectOwner || '');
                        if (subjectLid && subjectLid === lidNum && m.metadata.subjectOwnerPn) return m.metadata.subjectOwnerPn.split('@')[0].replace(/\D/g, '');
                    }
                    return lidNum;
                }
                return jid.split('@')[0].split(':')[0].replace(/\D/g, '');
            };
            const _numMatch = (a, b) => {
                if (!a || !b) return false;
                if (a === b) return true;
                const s = a.length < b.length ? a : b;
                const l = a.length < b.length ? b : a;
                return l.endsWith(s) && s.length >= 7;
            };
            const senderNum = _resolveNum(m.sender);
            const botNumP = _resolveNum(botNumber);
            const _senderLidNum = m.sender?.endsWith('@lid') ? _lidNumFn(m.sender) : '';
            for (const p of participants) {
                const pJid = p.id || p.jid || '';
                const pLid = p.lid || '';
                const pPhone = p.phoneNumber || p.phone_number || p.pn || '';
                const pPn = pPhone ? String(pPhone).replace(/\D/g, '') : '';
                const pNum = pPn || _resolveNum(pJid) || _resolveNum(pLid);
                const pLidNum = pJid.endsWith('@lid') ? _lidNumFn(pJid) : (pLid ? _lidNumFn(pLid) : '');
                const isAdminRole = p.admin === 'admin' || p.admin === 'superadmin';
                const senderMatchPhone = _numMatch(pNum, senderNum);
                const senderMatchLid = _senderLidNum && pLidNum && _senderLidNum === pLidNum;
                if (isAdminRole && (senderMatchPhone || senderMatchLid)) isAdmin = true;
                if (isAdminRole && _numMatch(pNum, botNumP)) isBotAdmin = true;
            }
            if (!isBotAdmin && m.isGroup && participants.length > 0) {
                try {
                    const freshMeta = await client.groupMetadata(m.chat);
                    const freshParticipants = freshMeta?.participants || [];
                    for (const p of freshParticipants) {
                        const pJid = p.id || p.jid || '';
                        const pLid = p.lid || '';
                        const pPhone = p.phoneNumber || p.phone_number || p.pn || '';
                        const pPn = pPhone ? String(pPhone).replace(/\D/g, '') : '';
                        const pNum = pPn || _resolveNum(pJid) || _resolveNum(pLid);
                        const isAdminRole = p.admin === 'admin' || p.admin === 'superadmin';
                        if (isAdminRole && _numMatch(pNum, botNumP)) { isBotAdmin = true; break; }
                    }
                } catch {}
            }
            if (Owner) isAdmin = true;
        }

        m.isAdmin = isAdmin;
        m.isBotAdmin = isBotAdmin;

        if (!m.isGroup && m.quoted?.sender && m.quoted.sender.endsWith('@lid')) {
            const _dmLidNum = m.quoted.sender.split('@')[0].split(':')[0];
            if (globalThis.lidPhoneCache) {
                const _cached = globalThis.lidPhoneCache.get(_dmLidNum);
                if (_cached) m.quoted.sender = String(_cached).replace(/\D/g, '') + '@s.whatsapp.net';
            }
            if (m.quoted.sender.endsWith('@lid') && globalThis.resolvePhoneFromLid) {
                const _resolved = globalThis.resolvePhoneFromLid(m.quoted.sender);
                if (_resolved && typeof _resolved === 'string' && !_resolved.endsWith('@lid')) {
                    m.quoted.sender = _resolved.includes('@') ? _resolved : _resolved.replace(/\D/g, '') + '@s.whatsapp.net';
                }
            }
        }

        let clint = m.quoted || m;
        let quoted = m;
        if (clint && typeof clint === 'object') {
            if (clint.mtype === 'buttonsMessage') quoted = clint[Object.keys(clint)[1]];
            else if (clint.mtype === 'templateMessage') quoted = clint.hydratedTemplate?.[Object.keys(clint.hydratedTemplate || {})[1]] || clint;
            else if (clint.mtype === 'product') quoted = clint[Object.keys(clint)[0]];
            else if (m.quoted) quoted = m.quoted;
        }
        const mime = quoted?.msg ? quoted.msg.mimetype : quoted?.mimetype || '';
        const qmsg = quoted?.msg ? quoted.msg : quoted;
        m.reply = async (textMsg, chatId = m.chat, options = {}) => {
            try {
                return await client.sendMessage(chatId, {
                    text: String(textMsg ?? ''),
                    title: 'Toxic-MD',
                    subtitle: '',
                    footer: '©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧',
                    interactiveButtons: [{ name: 'inapp_signup', buttonParamsJson: '{}' }],
                    ...options
                });
            } catch (e) {
                return await client.sendMessage(chatId, { text: String(textMsg ?? '') }, options);
            }
        };

        const trimmedBody = body.trim();

        if ((trimmedBody.startsWith('>') || trimmedBody.startsWith('$')) && Owner && !cmd) {
            const evalText = trimmedBody.slice(1).trim();
            if (!evalText) return await m.reply('W eval?🟢!');
            const sock = client, conn = client, bot = client, xh = client, clint = client, wa = client;
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            try {
                let evaled = await eval(evalText);
                if (typeof evaled !== 'string') evaled = util.inspect(evaled);
                await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
                if (evaled && evaled !== 'undefined' && evaled !== 'null') await m.reply(evaled);
            } catch (err) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });
                await m.reply('Error:\n' + String(err));
            }
            return;
        }

        if (cmd && !isDev) {
            const senderNumber = (m.sender || '').replace(/@s\.whatsapp\.net$/, '').split(':')[0];
            if (bannedUsers.includes(senderNumber)) {
                await client.sendMessage(m.chat, {
                    text: `╭─❏ 「 BANNED 」\n│ You're banned from using commands.\n│ Get lost.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
                });
                return;
            }
        }

        if (m.isGroup && !itsMe && !isDev && !Owner && bannedGroups.includes(m.chat)) {
            return;
        }

        if (cmd && !itsMe && !isDev && !Owner) {
            if (mode === 'private') return;
            if (mode === 'group' && !m.isGroup) return;
            if (mode === 'inbox' && m.isGroup) return;
        }

        const isStealthOn = stealth === 'true' || stealth === true;
        if (isStealthOn) {
            if (commandName === 'stealth' && cmd) {
                const stCtx = {
                    client, m, args, text, Owner, chatUpdate, store, isBotAdmin, isAdmin, IsGroup: m.isGroup,
                    participants: m.metadata?.participants || [], pushname, body, budy, totalCommands, mime, qmsg,
                    msgToxic, botNumber, itsMe, packname: settings.packname, generateProfilePicture, groupMetadata: m.metadata || {},
                    toxicspeed, mycode, fetchJson, exec, getRandom, UploadFileUgu, TelegraPh, prefix: usedPrefix, cmd,
                    botname, mode, gcpresence, antitag, antidelete: antideleteSetting, fetchBuffer, sendJson, settings,
                    getGroupAdmins: () => [], pict, Tag, stealth, multiprefix, isDev, isSudo, isEnvOwner, fakeQuoted, fq: fakeQuoted,
                    isGroup: m.isGroup, command: commandName, sock: client, conn: client, wa: client, bot: client, xh: client, clint: client
                };
                if (typeof cmd.run === 'function') await cmd.run(stCtx);
                else if (typeof cmd === 'function') await cmd(stCtx);
            }
            return;
        }

        const _rT = new Set(['w', 'wow', 'xd', 'p', 'uhm']);
        if (_rT.has(body.trim().toLowerCase()) && m.quoted) {
            try {
                const _q = m.msg?.contextInfo?.quotedMessage || m.quoted || null;
                if (_q) {
                    const _vo = _q?.viewOnceMessageV2?.message || _q?.viewOnceMessageV2Extension?.message || _q?.viewOnceMessage || _q;
                    const _img = _vo?.imageMessage || _vo?.imageMessageV2 || _vo?.imageMessageV1;
                    const _vid = _vo?.videoMessage || _vo?.videoMessageV2 || _vo?.videoMessageV1;
                    if (_img || _vid) {
                        const _buf = await client.downloadMediaMessage(_img || _vid);
                        let _dm = client.user?.id || '';
                        if (_dm.includes(':')) _dm = _dm.split(':')[0] + '@s.whatsapp.net';
                        if (_buf && _dm) {
                            const _cap = `╭─❏ 「 VIEW ONCE」
│ Sender: @${(m.sender || '').split('@')[0]}\n│ Chat: ${m.isGroup ? 'Group' : 'DM'}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
                            if (_img) await client.sendMessage(_dm, { image: _buf, caption: _cap });
                            else await client.sendMessage(_dm, { video: _buf, caption: _cap });
                        }
                    }
                }
            } catch {}
            return;
        }

        const _featurePromises = [
            status_saver(client, m, Owner, usedPrefix).catch(e => console.log('❌ [STATUS_SAVER]:', e.message)),
            afkFeature(client, m).catch(e => console.log('❌ [AFK]:', e.message)),
            antiviewonce(client, m).catch(e => console.log('❌ [ANTIVIEWONCE]:', e.message)),
        ];
        if (m.isGroup) {
            _featurePromises.push(
                antilink(client, m, store).catch(e => console.log('❌ [ANTILINK]:', e.message)),
                gcPresence(client, m).catch(e => console.log('❌ [GCPRESENCE]:', e.message)),
                antitaggc(client, m, isBotAdmin, itsMe, isAdmin, Owner, body).catch(e => console.log('❌ [ANTITAGGC]:', e.message)),
                antistatusmention(client, m).catch(e => console.log('❌ [ANTISTATUSMENTION]:', e.message)),
                mentionResponder(client, m).catch(e => console.log('❌ [MENTIONRESPONDER]:', e.message)),
            );
        }
        Promise.all(_featurePromises).catch(() => {});

        (async () => {
            if (m.message?.protocolMessage?.type === 0) {
                const _adSettings = await getCachedSettings();
                if (_adSettings?.antidelete !== true) {
                    return;
                }
                const deletedKey = m.message.protocolMessage.key;
                const deletedMessageId = deletedKey.id;
                const deletedRemoteJid = deletedKey.remoteJid;
                if (!deletedRemoteJid || deletedRemoteJid === 'status@broadcast' || deletedRemoteJid.includes('@broadcast') || deletedRemoteJid.includes('@newsletter')) {
                    return;
                }
                const normalizedDeletedJid = deletedRemoteJid.endsWith('@lid') ? (resolveLidToPhoneNumber(deletedRemoteJid) || deletedRemoteJid) : deletedRemoteJid;
                let deletedMessage = null;
                let chatJidToSearch = normalizedDeletedJid;
                const sqlRow = await msgStore.getMessage(deletedMessageId);
                if (sqlRow) {
                    deletedMessage = { key: sqlRow.message?.key || { id: deletedMessageId, remoteJid: sqlRow.jid, participant: sqlRow.sender }, message: sqlRow.message?.message || {}, pushName: sqlRow.message?.pushName || '' };
                    chatJidToSearch = sqlRow.jid;
                } else {
                }
                if (!deletedMessage && store?.chats && store?.messageMap) {
                    if (store.messageMap?.[deletedMessageId]) chatJidToSearch = store.messageMap[deletedMessageId].normalizedJid;
                    if (store.chats?.[chatJidToSearch]) deletedMessage = store.chats[chatJidToSearch].find(msg => msg.key.id === deletedMessageId);
                    if (!deletedMessage && normalizedDeletedJid !== chatJidToSearch && store.chats?.[normalizedDeletedJid]) {
                        deletedMessage = store.chats[normalizedDeletedJid].find(msg => msg.key.id === deletedMessageId);
                        if (deletedMessage) chatJidToSearch = normalizedDeletedJid;
                    }
                    if (!deletedMessage) {
                        for (const [jid, messages] of Object.entries(store.chats || {})) {
                            if (['key', 'idGetter', 'dict', 'array'].includes(jid)) continue;
                            const foundMsg = messages?.find?.(msg => msg.key.id === deletedMessageId);
                            if (foundMsg) { deletedMessage = foundMsg; chatJidToSearch = jid; break; }
                        }
                    }
                    if (deletedMessage) {
                    } else {
                    }
                }
                if (deletedMessage) {
                        let botJid = client.decodeJid(client.user.id);
                        if (botJid && botJid.endsWith('@lid')) {
                            const resolved = resolveLidToPhoneNumber(botJid);
                            if (resolved && !resolved.endsWith('@lid')) botJid = resolved;
                        }
                        let senderRaw = deletedMessage.key.participant || deletedMessage.key.remoteJid || '';
                        if (senderRaw.endsWith('@lid')) {
                            const resolved = await resolveSenderJid(senderRaw, chatJidToSearch, client).catch(() => null);
                            if (resolved && !resolved.endsWith('@lid')) {
                                senderRaw = resolved;
                            } else {
                            }
                        }
                        const sender = client.decodeJid(senderRaw);
                        let deleterRaw = m.key.participant || '';
                        if (deleterRaw.endsWith('@lid')) {
                            const resolved = await resolveSenderJid(deleterRaw, chatJidToSearch, client).catch(() => null);
                            if (resolved && !resolved.endsWith('@lid')) {
                                deleterRaw = resolved;
                            } else {
                            }
                        }
                        const deleter = deleterRaw ? deleterRaw.split('@')[0].split(':')[0] : 'Unknown';
                        let groupName = 'Private Chat';
                        if (chatJidToSearch.endsWith('@g.us')) {
                            try { const gMeta = await fastGroupMetadata(client, chatJidToSearch); groupName = gMeta?.subject || 'Unknown Group'; } catch { groupName = 'Unknown Group'; }
                        }
                        const deleteTime = new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
                        const rawMessage = deletedMessage.message || {};
                        const messageType = getMessageType(rawMessage);
                        const voMedia = isViewOnceMessage(rawMessage) ? getViewOnceMedia(rawMessage) : null;
                        try {
                            if (voMedia) {
                                const hdr = `╭─❏ 「 DELETED MSG 」\n│ Time: ${deleteTime}\n│ Chat: ${groupName}\n│ Type: ${messageType}\n│ Deleted by: @${deleter}\n│ Sender: @${sender.split('@')[0]}\n╰───────────────`;
                                if (voMedia.image) { const buf = await downloadMedia(client, voMedia.image, 'image'); await client.sendMessage(botJid, { image: buf, caption: hdr + '\n\n👁️ *Deleted View Once Image*', mentions: [sender] }); }
                                else if (voMedia.video) { const buf = await downloadMedia(client, voMedia.video, 'video'); await client.sendMessage(botJid, { video: buf, caption: hdr + '\n\n👁️ *Deleted View Once Video*', mentions: [sender] }); }
                                else { await client.sendMessage(botJid, { text: hdr + '\n\n👁️ *Deleted View Once (media unavailable)*', mentions: [sender] }); }
                            } else {
                                const msg = extractInnerMessage(rawMessage);
                                const hdr = `╭─❏ 「 DELETED MSG 」\n│ Time: ${deleteTime}\n│ Chat: ${groupName}\n│ Type: ${messageType}\n│ Deleted by: @${deleter}\n│ Sender: @${sender.split('@')[0]}`;
                                if (msg.conversation) { await client.sendMessage(botJid, { text: hdr + `\n\n│\n│ 📝 *Deleted Content:*\n${msg.conversation}`, mentions: [sender] }); }
                                else if (msg.extendedTextMessage?.text) { await client.sendMessage(botJid, { text: hdr + `\n╰───────☉\n\n📝 *Deleted Content:*\n${msg.extendedTextMessage.text}`, mentions: [sender] }); }
                                else if (msg.imageMessage) { const buf = await downloadMedia(client, msg.imageMessage, 'image'); await client.sendMessage(botJid, { image: buf, caption: hdr + `\n╰───────────────\n\n📸 *Deleted Image:*\n${msg.imageMessage.caption || ''}`, mentions: [sender] }); }
                                else if (msg.videoMessage) { const buf = await downloadMedia(client, msg.videoMessage, 'video'); await client.sendMessage(botJid, { video: buf, caption: hdr + `\n╰───────────────\n\n🎥 *Deleted Video:*\n${msg.videoMessage.caption || ''}`, mentions: [sender] }); }
                                else if (msg.audioMessage) { const buf = await downloadMedia(client, msg.audioMessage, 'audio'); await client.sendMessage(botJid, { text: hdr + `\n╰───────────────\n\n🎵 *Deleted Audio*`, mentions: [sender] }); await client.sendMessage(botJid, { audio: buf, ptt: msg.audioMessage.ptt || false, mimetype: 'audio/mpeg' }); }
                                else if (msg.stickerMessage) { const buf = await downloadMedia(client, msg.stickerMessage, 'sticker'); await client.sendMessage(botJid, { text: hdr + `\n╰───────☉\n\n😀 *Deleted Sticker*`, mentions: [sender] }); await client.sendMessage(botJid, { sticker: buf }); }
                                else if (msg.documentMessage) { const buf = await downloadMedia(client, msg.documentMessage, 'document'); await client.sendMessage(botJid, { document: buf, mimetype: msg.documentMessage.mimetype || 'application/octet-stream', fileName: msg.documentMessage.fileName || 'document', caption: hdr + `\n╰───────────────\n\n📄 *Deleted Document:*\n${msg.documentMessage.fileName || ''}\n${msg.documentMessage.caption || ''}`, mentions: [sender] }); }
                                else if (msg.contactMessage) { await client.sendMessage(botJid, { text: hdr + `\n╰───────────────☉\n\n👤 *Deleted Contact:*\n${msg.contactMessage.displayName || 'Contact'}`, mentions: [sender] }); await client.sendMessage(botJid, { contacts: { displayName: msg.contactMessage.displayName, contacts: [{ vcard: msg.contactMessage.vcard }] } }); }
                                else if (msg.locationMessage) { await client.sendMessage(botJid, { text: hdr + `\n╰───────────────\n\n📍 *Deleted Location*`, mentions: [sender] }); await client.sendMessage(botJid, { location: { degreesLatitude: msg.locationMessage.degreesLatitude, degreesLongitude: msg.locationMessage.degreesLongitude, name: msg.locationMessage.name || '', address: msg.locationMessage.address || '' } }); }
                                else if (msg.pollCreationMessage || msg.pollCreationMessageV3) { const poll = msg.pollCreationMessage || msg.pollCreationMessageV3; const pOpts = (poll.options || []).map(o => o.optionName).join('\n々 '); await client.sendMessage(botJid, { text: hdr + `\n╰───────────────\n\n📊 *Deleted Poll:*\n${poll.name || 'Poll'}\n々 ${pOpts}`, mentions: [sender] }); }
                                else { await client.sendMessage(botJid, { text: hdr + `\n╰───────────────\n\n⚠️ *Deleted content could not be recovered*`, mentions: [sender] }); }
                            }
                        } catch (error) { console.log('❌ [ANTIDELETE ERROR]:', error.message); }
                }
            }

            if (m.message?.protocolMessage?.type === 14 || m.message?.editedMessage) {
                const _aeSettings = await getCachedSettings();
                if (_aeSettings?.antiedit === true && store?.chats && store?.messageMap) {
                    try {
                        const editedProto = m.message.protocolMessage || {};
                        const editKey = editedProto.key || m.message.editedMessage?.message?.protocolMessage?.key;
                        const newMessage = editedProto.editedMessage?.message || m.message.editedMessage?.message;
                        if (editKey && newMessage) {
                            const editedMessageId = editKey.id;
                            const editedRemoteJid = editKey.remoteJid || m.chat;
                            if (editedRemoteJid !== 'status@broadcast' && !editedRemoteJid.includes('@broadcast') && !editedRemoteJid.includes('@newsletter')) {
                                const normalizedEditJid = editedRemoteJid.includes('@lid') ? editedRemoteJid.split('@')[0] + '@s.whatsapp.net' : editedRemoteJid;
                                let originalMessage = null;
                                let chatJid = store.messageMap[editedMessageId]?.normalizedJid || normalizedEditJid;
                                if (store.chats[chatJid]) originalMessage = store.chats[chatJid].find(msg => msg.key.id === editedMessageId);
                                if (!originalMessage) { for (const [jid, messages] of Object.entries(store.chats)) { if (['key', 'idGetter', 'dict', 'array'].includes(jid)) continue; const found = messages.find(msg => msg.key.id === editedMessageId); if (found) { originalMessage = found; break; } } }
                                const botJid = client.decodeJid(client.user.id);
                                const editor = m.key.participant ? m.key.participant.split('@')[0] : (m.sender || '').split('@')[0] || 'Unknown';
                                let groupName = 'Private Chat';
                                if (editedRemoteJid.endsWith('@g.us')) { try { const gMeta = await fastGroupMetadata(client, editedRemoteJid); groupName = gMeta?.subject || 'Unknown Group'; } catch {} }
                                const editTime = new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' });
                                let originalText = '';
                                if (originalMessage?.message) { const origMsg = extractInnerMessage(originalMessage.message); originalText = origMsg.conversation || origMsg.extendedTextMessage?.text || origMsg.imageMessage?.caption || origMsg.videoMessage?.caption || ''; }
                                const newInner = extractInnerMessage(newMessage);
                                const newText = newInner.conversation || newInner.extendedTextMessage?.text || newInner.imageMessage?.caption || newInner.videoMessage?.caption || '';
                                if (newText) {
                                    let fullMsg = `╭─❏ 「 EDITED MSG 」\n│ Time: ${editTime}\n│ Chat: ${groupName}\n│ Edited by: @${editor}\n╰───────────────`;
                                    if (originalText) fullMsg += `\n\nOriginal:\n${originalText}`;
                                    else fullMsg += `\n\n📌 *Original message not in cache.*`;
                                    fullMsg += `\n\nEdited to:\n${newText}`;
                                    await client.sendMessage(botJid, { text: fullMsg, mentions: [m.key.participant || m.sender] });
                                }
                            }
                        }
                    } catch (error) { console.log('❌ [ANTIEDIT ERROR]:', error.message); }
                }
            }
        })().catch(() => {});

        if (cmd) {
            try {
                const participants = m.metadata?.participants || [];
                const groupMetadata = m.metadata || {};
                if (m.mentionedJid && m.mentionedJid.length > 0 && globalThis.resolvePhoneFromLidAsync) {
                    const resolved = [];
                    for (const jid of m.mentionedJid) {
                        if (jid && jid.endsWith('@lid')) {
                            let phone = null;
                            for (const p of participants) {
                                const pBase = p.id || p.jid || '';
                                const pLidField = p.lid || '';
                                const lidNum = jid.split('@')[0].split(':')[0].replace(/\D/g, '');
                                const pLidNum = pBase.endsWith('@lid') ? pBase.split('@')[0].split(':')[0].replace(/\D/g, '') : (pLidField.endsWith('@lid') ? pLidField.split('@')[0].split(':')[0].replace(/\D/g, '') : '');
                                if (pLidNum && pLidNum === lidNum) {
                                    const pPhone = p.phoneNumber || p.phone_number || p.pn || '';
                                    if (pPhone) { phone = String(pPhone).split('@')[0].replace(/\D/g, ''); break; }
                                    if (!pBase.endsWith('@lid')) { phone = pBase.split('@')[0].replace(/\D/g, ''); break; }
                                }
                            }
                            if (!phone) {
                                const asyncResult = await globalThis.resolvePhoneFromLidAsync(jid).catch(() => null);
                                if (asyncResult && typeof asyncResult === 'string') {
                                    phone = asyncResult.split('@')[0].replace(/\D/g, '');
                                }
                            }
                            resolved.push(phone ? phone + '@s.whatsapp.net' : jid);
                        } else {
                            resolved.push(jid);
                        }
                    }
                    m.mentionedJid = resolved;
                }
                const cmdCtx = {
                    client, m, args, text, prefix: usedPrefix, command: commandName, pushname, botNumber,
                    itsMe, isDev, isSudo, isEnvOwner, Owner, settings, Tag, msgToxic, budy, sock: client, conn: client, wa: client, bot: client, xh: client, clint: client, store,
                    isAdmin, isBotAdmin, mode, pict, botname, totalCommands, isGroup: m.isGroup,
                    participants, groupMetadata, body, fq: fakeQuoted, fakeQuoted, mime, qmsg,
                    packname: settings.packname, generateProfilePicture, toxicspeed, mycode, fetchJson,
                    exec, getRandom, UploadFileUgu, TelegraPh, gcpresence, antitag,
                    antidelete: antideleteSetting, fetchBuffer, sendJson, getGroupAdmins: () => [],
                    stealth, multiprefix, chatUpdate, IsGroup: m.isGroup
                };
                if (typeof cmd.run === 'function') {
                    await cmd.run(cmdCtx);
                } else if (typeof cmd === 'function') {
                    await cmd(cmdCtx);
                }
            } catch (cmdErr) {
                console.log('Command error:', cmdErr.message);
            }
        }

        autoai({ client, m, settings, botNumber, body, isDev, isSudo, Owner,
            prefix: usedPrefix, fq: fakeQuoted, pushname }).catch(e => console.log('❌ [AUTOAI]:', e.message));

        if (settings?.toxicagent === true || settings?.toxicagent === 'true') {
            toxicaiFeature({ client, m, body, isDev, settings, fq: fakeQuoted, prefix: usedPrefix }).catch(e => console.log('❌ [TOXICAI]:', e.message));
        }

    } catch (e) {
        console.log('toxic.js main error:', e.message);
    }
};