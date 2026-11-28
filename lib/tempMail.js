import axios from 'axios';
import fs from 'fs';
import path from 'path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA };

const encodeSession = (data) => Buffer.from(JSON.stringify(data)).toString('base64url');
const decodeSession = (id) => JSON.parse(Buffer.from(id, 'base64url').toString('utf8'));

const randomName = () => `toxic${Math.random().toString(36).slice(2, 10)}`;
const randomPassword = () => Math.random().toString(36).slice(2) + 'Aa1!';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(config, retries = 3) {
    let lastError = null;
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await axios({ timeout: 20000, ...config });
        } catch (e) {
            lastError = e;
            const status = e.response?.status;
            if (status !== 429 && !(status >= 500)) throw e;
            await sleep(1500 * (attempt + 1));
        }
    }
    throw lastError;
}

async function createMailTm() {
    const { data: domains } = await request({ method: 'get', url: 'https://api.mail.tm/domains', headers: HEADERS });
    const list = domains['hydra:member'] || [];
    if (!list.length) throw new Error('No mail.tm domains available');
    const domain = list[Math.floor(Math.random() * list.length)].domain;
    const address = `${randomName()}@${domain}`;
    const password = randomPassword();
    await request({ method: 'post', url: 'https://api.mail.tm/accounts', data: { address, password }, headers: { ...HEADERS, 'Content-Type': 'application/json' } });
    const { data: auth } = await request({ method: 'post', url: 'https://api.mail.tm/token', data: { address, password }, headers: { ...HEADERS, 'Content-Type': 'application/json' } });
    if (!auth.token) throw new Error('mail.tm token missing');
    return { email: address, sessionId: encodeSession({ p: 'mt', e: address, t: auth.token }) };
}

async function createGuerrilla() {
    const res = await request({ method: 'get', url: 'https://www.guerrillamail.com/ajax.php?f=get_email_address&ip=127.0.0.1&agent=Mozilla_foo', headers: HEADERS });
    const { email_addr, sid_token } = res.data || {};
    if (!email_addr || !sid_token) throw new Error('Guerrilla session missing');
    const cookie = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
    return { email: email_addr, sessionId: encodeSession({ p: 'gm', e: email_addr, s: sid_token, c: cookie }) };
}

export async function createTempMail() {
    const providers = [createMailTm, createGuerrilla];
    let lastError = null;
    for (const create of providers) {
        try {
            return await create();
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError || new Error('All temp mail providers failed');
}

async function inboxMailTm(session) {
    const headers = { ...HEADERS, Authorization: `Bearer ${session.t}` };
    const { data } = await request({ method: 'get', url: 'https://api.mail.tm/messages', headers });
    const list = data['hydra:member'] || [];
    const emails = [];
    for (const item of list.slice(0, 5)) {
        let text = item.intro || '';
        try {
            const { data: full } = await request({ method: 'get', url: `https://api.mail.tm/messages/${item.id}`, headers });
            text = full.text || text;
        } catch {}
        emails.push({ from: item.from?.address || 'Unknown', subject: item.subject || 'No Subject', text });
    }
    return { total: data['hydra:totalItems'] ?? list.length, emails };
}

async function inboxGuerrilla(session) {
    const headers = { ...HEADERS, Cookie: session.c || '' };
    const { data } = await request({ method: 'get', url: `https://www.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${session.s}`, headers });
    const list = (data.list || []).filter(mail => mail.mail_from !== 'no-reply@guerrillamail.com');
    const emails = [];
    for (const item of list.slice(0, 5)) {
        let text = item.mail_excerpt || '';
        try {
            const { data: full } = await request({ method: 'get', url: `https://www.guerrillamail.com/ajax.php?f=fetch_email&email_id=${item.mail_id}&sid_token=${session.s}`, headers });
            text = (full.mail_body || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || text;
        } catch {}
        emails.push({ from: item.mail_from || 'Unknown', subject: item.mail_subject || 'No Subject', text });
    }
    return { total: list.length, emails };
}

export async function checkTempInbox(sessionId) {
    let session;
    try {
        session = decodeSession(sessionId);
    } catch {
        throw new Error('Invalid session ID');
    }
    if (session.p === 'mt') return inboxMailTm(session);
    if (session.p === 'gm') return inboxGuerrilla(session);
    throw new Error('Invalid session ID');
}

export function formatInboxText(total, emails) {
    if (total === 0) {
        return `╭─❏ 「 Tᴇᴍᴘ Iɴʙᴏx」
│ Inbox is empty, genius.
│ No emails yet.
│ Use your temp email somewhere
│ and check back.
│ Total Emails: 0
╰───────────────
> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    }
    let inboxText = `╭─❏ 「 Tᴇᴍᴘ Iɴʙᴏx」
│ Inbox: ${total} email${total > 1 ? 's' : ''} found\n`;
    emails.forEach((email, index) => {
        inboxText += `│ \n│ Email ${index + 1}:\n│ From: ${email.from || 'Unknown'}\n│ Subject: ${email.subject || 'No Subject'}\n`;
        if (email.text && email.text.trim()) {
            const cleanText = email.text.replace(/\r\n/g, '\n').trim();
            const truncated = cleanText.substring(0, 500) + (cleanText.length > 500 ? '...' : '');
            const lines = truncated.split('\n');
            inboxText += `│ Content: ${lines[0]}\n`;
            for (const line of lines.slice(1)) inboxText += `│ ${line}\n`;
        }
    });
    inboxText += `╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
    return inboxText;
}

const CODE_FILE = path.join(process.cwd(), 'data', 'tempMailSessions.json');
let codeMap = null;

function loadCodeMap() {
    if (codeMap) return codeMap;
    try { codeMap = JSON.parse(fs.readFileSync(CODE_FILE, 'utf8')); } catch { codeMap = {}; }
    return codeMap;
}

function saveCodeMap() {
    try {
        fs.mkdirSync(path.dirname(CODE_FILE), { recursive: true });
        fs.writeFileSync(CODE_FILE, JSON.stringify(codeMap));
    } catch {}
}

export function registerSessionCode(sessionId) {
    const map = loadCodeMap();
    let code;
    do { code = Math.random().toString(36).slice(2, 10); } while (map[code]);
    map[code] = sessionId;
    const keys = Object.keys(map);
    if (keys.length > 200) { for (const k of keys.slice(0, keys.length - 200)) delete map[k]; }
    saveCodeMap();
    return code;
}

export function resolveSessionCode(code) {
    return loadCodeMap()[code] || null;
}
