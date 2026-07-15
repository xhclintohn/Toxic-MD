import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baileysBase = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Socket');
const baileysTypes = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Types');

const eventBufferPath = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Utils', 'event-buffer.js');

if (fs.existsSync(eventBufferPath)) {
    let eventBuffer = fs.readFileSync(eventBufferPath, 'utf8');
    if (!eventBuffer.includes('const stringifyMessageKey = (key) => key ?')) {
        const oldFn = "const stringifyMessageKey = (key) => `${key.remoteJid},${key.id},${key.fromMe ? '1' : '0'}`;";
        const newFn = "const stringifyMessageKey = (key) => key ? `${key.remoteJid},${key.id},${key.fromMe ? '1' : '0'}` : `null,${Date.now()}-${Math.random().toString(36).slice(2)},0`;";
        if (eventBuffer.includes(oldFn)) {
            eventBuffer = eventBuffer.replace(oldFn, newFn);
            fs.writeFileSync(eventBufferPath, eventBuffer);
        }
    }
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
        }
    }
}
