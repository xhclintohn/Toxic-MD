import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baileysBase = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Socket');
const baileysTypes = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Types');
const usyncPath = path.join(baileysBase, 'usync.js');

if (fs.existsSync(usyncPath)) {
    let usync = fs.readFileSync(usyncPath, 'utf8');
    if (!usync.includes('__USYNC_TIMEOUT_PATCH__')) {
        const oldQuery = 'const result = await query(iq);';
        const newQuery = 'const result = await query(iq, 120000); /* __USYNC_TIMEOUT_PATCH__ */';
        if (usync.includes(oldQuery)) {
            usync = usync.replace(oldQuery, newQuery);
            fs.writeFileSync(usyncPath, usync);
            console.log('[patch-baileys] usync.js timeout increased to 120s');
        } else {
            console.log('[patch-baileys] usync.js anchor not found, no patch applied');
        }
    } else {
        console.log('[patch-baileys] usync.js already patched');
    }
} else {
    console.log('[patch-baileys] usync.js not found, skipping');
}

const eventBufferPath = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Utils', 'event-buffer.js');

if (fs.existsSync(eventBufferPath)) {
    let eventBuffer = fs.readFileSync(eventBufferPath, 'utf8');
    if (!eventBuffer.includes('const stringifyMessageKey = (key) => key ?')) {
        const oldFn = "const stringifyMessageKey = (key) => `${key.remoteJid},${key.id},${key.fromMe ? '1' : '0'}`;";
        const newFn = "const stringifyMessageKey = (key) => key ? `${key.remoteJid},${key.id},${key.fromMe ? '1' : '0'}` : `null,${Date.now()}-${Math.random().toString(36).slice(2)},0`;";
        if (eventBuffer.includes(oldFn)) {
            eventBuffer = eventBuffer.replace(oldFn, newFn);
            fs.writeFileSync(eventBufferPath, eventBuffer);
            console.log('[patch-baileys] event-buffer.js null key guard applied');
        } else {
            console.log('[patch-baileys] event-buffer.js anchor not found, no patch applied');
        }
    } else {
        console.log('[patch-baileys] event-buffer.js already patched');
    }
} else {
    console.log('[patch-baileys] event-buffer.js not found, skipping');
}

const messagesRecvPath = path.join(baileysBase, 'messages-recv.js');

if (fs.existsSync(messagesRecvPath)) {
    let messagesRecv = fs.readFileSync(messagesRecvPath, 'utf8');
    if (!messagesRecv.includes('__PLACEHOLDER_RESEND_PATCH__')) {
        const constDecl = `\n    const placeholderResendCache = config.placeholderResendCache ||\n        new NodeCache({\n            stdTTL: DEFAULT_CACHE_TTLS.MSG_RETRY,\n            useClones: false\n        });`;
        const constDeclIndex = messagesRecv.indexOf(constDecl);
        const hasConstDecl = constDeclIndex !== -1;
        const allOccurrences = [...messagesRecv.matchAll(/placeholderResendCache/g)];
        const appearsBeforeConst = hasConstDecl && allOccurrences.some(m => m.index < constDeclIndex);
        if (hasConstDecl && appearsBeforeConst) {
            messagesRecv = messagesRecv.replace(constDecl, '\n    /* __PLACEHOLDER_RESEND_PATCH__ */');
            fs.writeFileSync(messagesRecvPath, messagesRecv);
            console.log('[patch-baileys] messages-recv.js duplicate placeholderResendCache removed');
        } else {
            console.log('[patch-baileys] messages-recv.js no conflict detected, skipping');
        }
    } else {
        console.log('[patch-baileys] messages-recv.js already patched');
    }
} else {
    console.log('[patch-baileys] messages-recv.js not found, skipping');
}

const newsletterPath = path.join(baileysTypes, 'Newsletter.js');

if (fs.existsSync(newsletterPath)) {
    let newsletter = fs.readFileSync(newsletterPath, 'utf8');
    if (newsletter.includes('export var XWAPaths') || newsletter.includes('export var QueryIds')) {
        newsletter = newsletter.replace(/export var XWAPaths;[\s\S]*?\}\)\(XWAPaths \|\| \(XWAPaths = \{\}\)\);\n/g, '');
        newsletter = newsletter.replace(/export var QueryIds;[\s\S]*?\}\)\(QueryIds \|\| \(QueryIds = \{\}\)\);\n/g, '');
        fs.writeFileSync(newsletterPath, newsletter);
        console.log('[patch-baileys] Newsletter.js duplicate enums removed');
    } else {
        console.log('[patch-baileys] Newsletter.js no duplicate enums, skipping');
    }
} else {
    console.log('[patch-baileys] Newsletter.js not found, skipping');
}

console.log('[patch-baileys] Done');
