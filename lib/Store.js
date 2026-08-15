import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseDir = path.resolve(__dirname, '../message_data');

if (!fs.existsSync(baseDir)) {
    try {
        fs.mkdirSync(baseDir, { recursive: true });
    } catch (e) {}
}

function loadChatData(remoteJid, messageId) {
    try {
        return JSON.parse(fs.readFileSync(path.join(baseDir, remoteJid, `${messageId}.json`), 'utf8')) || [];
    } catch (error) {
        return [];
    }
}

function saveChatData(remoteJid, messageId, chatData) {
    const chatDir = path.join(baseDir, remoteJid);
    if (!fs.existsSync(chatDir)) {
        try { fs.mkdirSync(chatDir, { recursive: true }); } catch (e) { return; }
    }
    try {
        fs.writeFileSync(path.join(chatDir, `${messageId}.json`), JSON.stringify(chatData));
    } catch (error) {}
}

function cleanupOldMessages(maxAgeMs = 12 * 60 * 60 * 1000) {
    try {
        if (!fs.existsSync(baseDir)) return;
        const now = Date.now();
        for (const remoteJid of fs.readdirSync(baseDir)) {
            const chatDir = path.join(baseDir, remoteJid);
            if (!fs.lstatSync(chatDir).isDirectory()) continue;
            for (const file of fs.readdirSync(chatDir)) {
                try {
                    const filePath = path.join(chatDir, file);
                    if (now - fs.statSync(filePath).mtimeMs > maxAgeMs) fs.unlinkSync(filePath);
                } catch (err) {}
            }
            try { if (fs.readdirSync(chatDir).length === 0) fs.rmdirSync(chatDir); } catch (e) {}
        }
    } catch (err) {}
}

export { loadChatData, saveChatData, cleanupOldMessages };