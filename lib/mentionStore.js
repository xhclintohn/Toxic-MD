import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE = path.join(__dirname, 'data', 'mentions.json');

let _data = {};
try { if (fs.existsSync(FILE)) _data = JSON.parse(fs.readFileSync(FILE, 'utf8')) || {}; } catch { _data = {}; }

function _save() {
    try {
        fs.mkdirSync(path.dirname(FILE), { recursive: true });
        fs.writeFileSync(FILE, JSON.stringify(_data));
    } catch {}
}

export function setMention(num, entry) {
    if (!num) return;
    _data[num] = entry;
    _save();
}

export function getMention(num) {
    if (!num) return null;
    return _data[num] || null;
}

export function removeMention(num) {
    if (_data[num]) { delete _data[num]; _save(); return true; }
    return false;
}
