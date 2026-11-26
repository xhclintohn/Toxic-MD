import { handleViewOnce } from '@whiskeysockets/baileys';
import { getCachedSettings } from '../lib/settingsCache.js';

const registered = new WeakSet();

function isEnabled(val) {
    if (val === true || val === 1) return true;
    if (typeof val === 'string') { const v = val.toLowerCase(); return v === 'true' || v === '1' || v === 'on'; }
    return false;
}

export default async (client, m) => {
    try {
        if (!client?.ev || registered.has(client)) return;
        registered.add(client);

        client.viewOnceHandler = handleViewOnce(client, {
            onViewOnce: async (result) => {
                try {
                    const settings = await getCachedSettings();
                    if (!isEnabled(settings?.antiviewonce)) return;

                    const rawBot = client.user?.id || '';
                    const decodedBot = client.decodeJid ? client.decodeJid(rawBot) : rawBot;
                    const botJid = decodedBot.includes(':')
                        ? decodedBot.split(':')[0] + '@s.whatsapp.net'
                        : decodedBot;
                    if (!botJid) return;

                    const senderRaw = (result.sender || '').split('@')[0].split(':')[0];
                    const senderNum = ((result.sender || '').endsWith('@lid') && globalThis.lidPhoneCache?.get(senderRaw))
                        ? String(globalThis.lidPhoneCache.get(senderRaw)).replace(/\D/g, '')
                        : senderRaw || 'Unknown';
                    const chatType = (result.chatJid || '').endsWith('@g.us') ? 'Group 👥' : 'DM 💬';
                    const ts = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
                    const extra = (result.caption || '').trim();
                    const mentions = result.sender ? [result.sender] : [];
                    const caption = `╭─❏ 「 VIEW ONCE RETRIEVED」\n│ Sender: @${senderNum}\n│ Chat: ${chatType}\n│ Time: ${ts}\n${extra ? '│ Caption: ' + extra + '\n' : ''}│ \n│ Nothing slips past me. 😈\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

                    if (result.type === 'image') {
                        await client.sendMessage(botJid, { image: result.buffer, caption, mentions });
                    } else if (result.type === 'video' || result.type === 'ptv') {
                        await client.sendMessage(botJid, { video: result.buffer, caption, mentions });
                    } else {
                        const mime = result.mimetype || 'audio/ogg; codecs=opus';
                        await client.sendMessage(botJid, { audio: result.buffer, mimetype: mime, ptt: true });
                        await client.sendMessage(botJid, { text: caption, mentions });
                    }
                } catch (e) {
                    console.log('❌ [ANTIVIEWONCE]:', e?.message || e);
                }
            },
            onError: (error) => {
                console.log('⚠️ [ANTIVIEWONCE]', error?.message || error);
            }
        });
    } catch (e) {
        console.log('❌ [ANTIVIEWONCE]:', e?.message || e);
    }
};
