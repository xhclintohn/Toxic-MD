import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function isSafeAuthFileName(name) {
    return typeof name === 'string' && name.length > 0 && name.length <= 128 && !name.includes('/') && !name.includes('\\') && !name.includes('..');
}

function looksLikeCreds(obj) {
    return obj && typeof obj === 'object' && (obj.me || obj.signedIdentityKey || obj.noiseKey || obj.signedPreKey);
}

async function authenticationn() {
    try {
        const sessionDir = path.join(__dirname, '..', 'Session');
        const credsPath = path.join(sessionDir, 'creds.json');
        const sessionFilePath = path.join(__dirname, '..', 'session.json');

        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        let sessionData = process.env.SESSION || '';

        if (!sessionData || sessionData === 'zokk') {
            if (fs.existsSync(sessionFilePath)) {
                const fileContent = fs.readFileSync(sessionFilePath, 'utf8').trim();
                if (fileContent && fileContent !== 'zokk') {
                    try {
                        const parsed = JSON.parse(fileContent);
                        const sid = parsed.SESSION_ID || parsed.session || parsed.SESSION || '';
                        if (sid && sid !== 'PASTE_YOUR_SESSION_ID_HERE') {
                            sessionData = sid;
                        } else if (looksLikeCreds(parsed) || (parsed && parsed.files)) {
                            sessionData = fileContent;
                        }
                    } catch {
                        sessionData = fileContent;
                    }
                }
            }
        }

        if (!sessionData || sessionData === 'zokk') {
            console.log('⚠️ No session detected! — set SESSION env or paste your session ID in session.json (this message only shows up in the server/host logs, not in WhatsApp — check your hosting dashboard console, not your chats)');
            return;
        }

        if (sessionData === 'PASTE_YOUR_SESSION_ID_HERE') {
            console.log('❌ Wrong session! — placeholder value detected, paste a real session ID');
            return;
        }

        const retrievalMatch = String(sessionData).trim().match(/^https?:\/\/[^\/\s]+\/session\/([0-9a-f]{24})$/i);
        if (retrievalMatch) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 15000);
                const resp = await fetch(String(sessionData).trim(), { signal: controller.signal, headers: { 'Cache-Control': 'no-store' } });
                clearTimeout(timer);
                if (!resp.ok) {
                    console.log('❌ Wrong session! — session link expired or not found, pair again for a fresh link');
                    return;
                }
                sessionData = (await resp.text()).trim();
            } catch {
                console.log('❌ Wrong session! — could not fetch session bundle from the link');
                return;
            }
        }

        let decodedText;
        let parsed;
        try {
            const trimmed = String(sessionData).trim();
            if (trimmed.startsWith('{')) {
                decodedText = trimmed;
            } else {
                const raw = Buffer.from(trimmed, 'base64');
                try {
                    decodedText = zlib.gunzipSync(raw).toString('utf8');
                } catch {
                    decodedText = raw.toString('utf8');
                }
            }
            parsed = JSON.parse(decodedText);
        } catch {
            console.log('❌ Wrong session! — session data is corrupted or not valid base64 JSON');
            return;
        }

        if (parsed && parsed.files && typeof parsed.files === 'object') {
            let credsText = null;
            if (typeof parsed.files['creds.json'] === 'string') {
                try { credsText = Buffer.from(parsed.files['creds.json'], 'base64').toString('utf8'); } catch {}
            } else if (parsed.creds) {
                try { credsText = JSON.stringify(parsed.creds); } catch {}
            }
            let credsObj = null;
            try { credsObj = credsText ? JSON.parse(credsText) : null; } catch {}
            if (!looksLikeCreds(credsObj)) {
                console.log('❌ Wrong session! — session bundle is missing valid credentials, existing session was not overwritten');
                return;
            }
            let written = 0;
            for (const [name, b64] of Object.entries(parsed.files)) {
                if (!isSafeAuthFileName(name) || typeof b64 !== 'string') continue;
                try {
                    fs.writeFileSync(path.join(sessionDir, name), Buffer.from(b64, 'base64'));
                    written++;
                } catch {}
            }
            if (written === 0 || !fs.existsSync(credsPath)) {
                fs.writeFileSync(credsPath, credsText, 'utf8');
            }
            console.log('✅ Session Successfully loaded');
            return;
        }

        if (!looksLikeCreds(parsed)) {
            console.log('❌ Wrong session! — session data is missing valid credentials, existing session was not overwritten');
            return;
        }

        fs.writeFileSync(credsPath, decodedText, 'utf8');
        console.log('✅ Session Successfully loaded');
    } catch (e) {
        console.log('❌ Wrong session — ' + e.message);
        return;
    }
}

export default authenticationn;
