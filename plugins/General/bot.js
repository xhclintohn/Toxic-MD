import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { getSettings } from '../../database/config.js';
import { getDeviceMode } from '../../lib/deviceMode.js';
import { ButtonV2 } from '@whiskeysockets/baileys';

export default {
    name: 'start',
    aliases: ['alive', 'online', 'toxic', 'bot', 'status', 'active', 'check'],
    description: 'Check if bot is alive',
    run: async (context) => {
        const { client, m, mode, pict, botname, text, prefix } = context;

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
        await client.sendMessage(m.chat, { react: { text: '🤖', key: m.reactKey } });

        const xhClintonPaths = [
            path.join(__dirname, 'xh_clinton'),
            path.join(process.cwd(), 'xh_clinton'),
            path.join(__dirname, '..', 'xh_clinton')
        ];

        let audioFolder = null;
        for (const folderPath of xhClintonPaths) {
            if (fs.existsSync(folderPath)) { audioFolder = folderPath; break; }
        }

        if (audioFolder) {
            const possibleFiles = [];
            for (let i = 1; i <= 10; i++) {
                for (const ext of ['.mp3', '.m4a', '.ogg', '.opus', '.wav']) {
                    const fullPath = path.join(audioFolder, `menu${i}${ext}`);
                    if (fs.existsSync(fullPath)) possibleFiles.push(fullPath);
                }
            }
            if (possibleFiles.length > 0) {
                const randomFile = possibleFiles[Math.floor(Math.random() * possibleFiles.length)];
                await client.sendMessage(m.chat, {
                    audio: { url: randomFile }, ptt: true, mimetype: 'audio/mpeg', fileName: 'toxic-start.mp3'
                });
            }
        }

        const settings = await getSettings();
        const effectivePrefix = settings.prefix || '.';
        const device = await getDeviceMode();

                let displayJid = m.sender;
        if (displayJid && String(displayJid).endsWith('@lid')) {
            try {
                if (globalThis.resolvePhoneFromLid) {
                    const p = globalThis.resolvePhoneFromLid(displayJid);
                    if (p && !String(p).endsWith('@lid')) {
                        const n = String(p).replace(/\D/g, '');
                        if (n && n.length >= 7 && n.length <= 15) displayJid = n + '@s.whatsapp.net';
                    }
                }
                if (String(displayJid).endsWith('@lid') && client?.signalRepository?.lidMapping?.getPNForLID) {
                    const pn = await client.signalRepository.lidMapping.getPNForLID(displayJid).catch(() => null);
                    if (pn && typeof pn === 'string' && String(pn).includes('@s.whatsapp.net')) {
                        const n = pn.split('@')[0].replace(/\D/g, '');
                        if (n && n.length >= 7 && n.length <= 15) displayJid = n + '@s.whatsapp.net';
                    }
                }
                if (String(displayJid).endsWith('@lid') && m.key) {
                    const alt = m.key.participantAlt || m.key.remoteJidAlt;
                    if (alt && String(alt).endsWith('@s.whatsapp.net')) displayJid = alt;
                }
            } catch {}
        }
        const stillLid = String(displayJid).endsWith('@lid');
        const who = stillLid ? (m.pushName || m.name || 'there') : ('@' + String(displayJid).split('@')[0].split(':')[0].replace(/\D/g, ''));
        const mentionList = stillLid ? [] : [displayJid];

        const bodyText = `╭─❏ 「 Sᴛᴀʀᴛ」\n│ Yo ${who}! You actually bothered\n│ to check if I'm alive?\n│ ${botname} is active 24/7, unlike\n│ your brain cells.\n│ Stop wasting my time and pick\n│ something useful below.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (device === 'ios') {
            await client.sendMessage(m.chat, { text: bodyText, mentions: mentionList });
            return;
        }

        try {
            const btnV2 = new ButtonV2(client);
            btnV2.setBody(bodyText)

                .addButton('𝐌𝐞𝐧𝐮', `${effectivePrefix}menu`)
                .addButton('𝐏𝐢𝐧𝐠', `${effectivePrefix}ping`)
                .addButton('𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬', `${effectivePrefix}settings`);
            await btnV2.send(m.chat, { userJid: client.user?.id || '', mentions: mentionList });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch {
            await client.sendMessage(m.chat, { text: bodyText, mentions: mentionList });
            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        }
    } };
