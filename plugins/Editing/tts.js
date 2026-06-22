import googleTTS from 'google-tts-api';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 TTS」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

export default {
    name: 'tts',
    aliases: ['texttospeech', 'speak', 'say', 'voice'],
    description: 'Convert text to speech audio. Use lang:en/hi/sw/fr etc to pick language.',
    run: async (context) => {
        const { client, m, text, args } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let input = (text || '').trim();
        if (!input) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`Gimme text to convert.\n│ Usage: .tts <text>\n│ With language: .tts lang:sw Habari`));
        }

        let lang = 'en';
        if (args[0]?.startsWith('lang:')) {
            lang = args[0].split(':')[1] || 'en';
            input = args.slice(1).join(' ').trim();
            if (!input) {
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return sendInteractive(client, m, fmt(`No text after lang specifier.`));
            }
        }

        try {
            const urls = googleTTS.getAllAudioUrls(input, {
                lang,
                slow: false,
                host: 'https://translate.google.com',
                splitPunct: ',.!?;',
            });

            const chunks = await Promise.all(urls.map(async ({ url }) => {
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://translate.google.com/',
                    }
                });
                if (!res.ok) throw new Error(`TTS fetch failed: ${res.status}`);
                return Buffer.from(await res.arrayBuffer());
            }));

            const audioBuffer = Buffer.concat(chunks);

            await client.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: true,
            }, { quoted: m });

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            await sendInteractive(client, m, fmt(`TTS failed: ${e.message || e}`));
        }
    }
};
