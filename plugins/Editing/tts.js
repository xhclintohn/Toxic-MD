import googleTTS from 'google-tts-api';
import { sendInteractive } from '../../lib/sendInteractive.js';

const fmt = (msg) => `╭─❏ 「 TTS」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

const LANG_MAP = {
    en: 'en', english: 'en',
    sw: 'sw', swahili: 'sw',
    fr: 'fr', french: 'fr',
    de: 'de', german: 'de',
    es: 'es', spanish: 'es',
    pt: 'pt', portuguese: 'pt',
    ar: 'ar', arabic: 'ar',
    hi: 'hi', hindi: 'hi',
    zh: 'zh-CN', chinese: 'zh-CN',
    ja: 'ja', japanese: 'ja',
    ko: 'ko', korean: 'ko',
    ru: 'ru', russian: 'ru',
    it: 'it', italian: 'it',
};

export default {
    name: 'tts',
    aliases: ['texttospeech', 'speak', 'voice', 'say', 'read', 'tts2', 'voiceit'],
    description: 'Convert text to speech audio. Usage: .tts text | .tts lang:sw text',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        let rawText = args.join(' ').trim();
        if (!rawText && m.quoted?.text) rawText = m.quoted.text.trim();

        if (!rawText) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt(`No text provided!\nUsage: *${prefix}tts <text>*\nWith language: *${prefix}tts lang:sw Habari*`));
        }

        let lang = 'en';
        const langMatch = rawText.match(/^lang:(\w+)\s+/i);
        if (langMatch) {
            const key = langMatch[1].toLowerCase();
            lang = LANG_MAP[key] || key;
            rawText = rawText.slice(langMatch[0].length).trim();
        }

        if (!rawText) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('Text cannot be empty after removing the language flag.'));
        }

        if (rawText.length > 500) rawText = rawText.slice(0, 500);

        try {
            const urls = googleTTS.getAllAudioUrls(rawText, { lang, slow: false, host: 'https://translate.google.com' });
            const buffers = [];
            for (const { url } of urls) {
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                        'Referer': 'https://translate.google.com/',
                        'Accept': '*/*',
                    }
                });
                if (!res.ok) throw new Error('TTS fetch failed: ' + res.status);
                const buf = Buffer.from(await res.arrayBuffer());
                buffers.push(buf);
            }
            const audio = buffers.length > 1 ? Buffer.concat(buffers) : buffers[0];
            if (!audio || audio.length < 100) throw new Error('Empty audio returned from TTS');

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
            await client.sendMessage(m.chat, {
                audio: audio,
                mimetype: 'audio/mpeg',
                fileName: 'tts.mp3',
                ptt: false,
            }, { quoted: m });
        } catch (e) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return sendInteractive(client, m, fmt('TTS failed: ' + (e?.message || String(e)).split('\n')[0]));
        }
    }
};
