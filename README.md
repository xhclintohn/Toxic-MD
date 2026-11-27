<div align="center">

# Toxic MD — WhatsApp Bot

![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen?style=flat-square&logo=node.js)
![Platform](https://img.shields.io/badge/Platform-WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white)
![Multi-Device](https://img.shields.io/badge/Multi--Device-Supported-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.2.22-blue?style=flat-square)

**A fast WhatsApp multi-device bot for group control, automation, AI chat, media editing and fun commands.**

<img src="https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/images/toxicx.png" width="100%" />

[![Changelog](https://img.shields.io/badge/Changelog-View%20all%20versions-blue?style=for-the-badge)](CHANGELOG.md)

</div>

---

Toxic-MD is a WhatsApp bot you run yourself. It manages groups, automates the boring stuff, protects your chats, and comes with a big set of utility and fun commands. It is built on [Toxic Baileys](https://github.com/xhclintohn/Baileys) — a fork of the Baileys WhatsApp Web API — so it stays connected without constant QR scanning.

Every version and what changed in it lives in the [CHANGELOG](CHANGELOG.md).

<details>
<summary>Read this README in your language</summary>

This README is in English by default. Full translations live in the [`Langs/`](Langs) folder:

| Language | Link |
|---|---|
| Swahili | [Read the Swahili (Kiswahili) README](Langs/sw.md) |
| Spanish | [Read the Spanish (Español) README](Langs/es.md) |
| French | [Read the French (Français) README](Langs/fr.md) |
| German | [Read the German (Deutsch) README](Langs/de.md) |
| Portuguese | [Read the Portuguese (Português) README](Langs/pt.md) |
| Arabic | [Read the Arabic (العربية) README](Langs/ar.md) |
| Hindi | [Read the Hindi (हिन्दी) README](Langs/hi.md) |
| Chinese | [Read the Chinese (中文) README](Langs/zh.md) |
| Japanese | [Read the Japanese (日本語) README](Langs/ja.md) |
| Korean | [Read the Korean (한국어) README](Langs/ko.md) |
| Russian | [Read the Russian (Русский) README](Langs/ru.md) |
| Turkish | [Read the Turkish (Türkçe) README](Langs/tr.md) |
| Indonesian | [Read the Indonesian (Bahasa Indonesia) README](Langs/id.md) |
| Hausa | [Read the Hausa README](Langs/ha.md) |
| Yoruba | [Read the Yoruba (Yorùbá) README](Langs/yo.md) |
| Amharic | [Read the Amharic (አማርኛ) README](Langs/am.md) |

Change the bot's reply language anytime with: `.language <code>` (owner only)

</details>

---

## Why Toxic-MD?

| Feature | Details |
|---|---|
| Multi-device support | No constant QR scanning required |
| Fast and stable | Optimized for continuous uptime |
| Easy deployment | Works on any hosting platform |
| Beginner friendly | Simple setup, clear documentation |
| Highly customizable | Flexible prefix, modes, settings and languages |
| AI-powered | Auto AI chat with Groq/Llama |
| Group protection | Anti-link, anti-badword, anti-group-status, anti-delete, view-once recovery and more |
| Multi-language | 17 languages supported |
| Auto reports | Daily group stats posted to group status |

---

## Deploy the bot

**Step 1 — Fork the repository**

[![Fork Repo](https://img.shields.io/badge/FORK%20REPOSITORY-brightgreen?style=for-the-badge&logo=github)](https://github.com/xhclintohn/Toxic-MD/fork)

**Step 2 — Pair your WhatsApp**

[![Pair WhatsApp](https://img.shields.io/badge/PAIR%20WHATSAPP-blue?style=for-the-badge&logo=whatsapp&logoColor=white)](https://fork.nyxtechs.net)

**Step 3 — Deploy the bot**

[![Deploy Bot](https://img.shields.io/badge/DEPLOY%20BOT-orange?style=for-the-badge&logo=rocket)](https://fork.nyxtechs.net)

### Quick start

1. Visit **https://nyxtechs.net/pairing**
2. Open WhatsApp on your phone
3. Go to **Settings → Linked Devices**
4. Tap **Pair Device** and scan or enter the pairing code

Then set your session ID:

```env
SESSION=YOUR_SESSION_ID
```

---

## Features

**Automation**

- Auto read messages, auto view status, auto like status
- Custom auto replies, auto AI chat (Groq/Llama), auto bio
- Auto report (daily group stats)

**Group protection and moderation**

- Anti-link — blocks WhatsApp and external links
- Anti-bad word — deletes/warns/kicks for a bad-word list, extensible per group
- Anti-group status — deletes/warns/kicks non-admins who post a group status
- Anti-bot — detects and removes known bot accounts
- Anti-delete — retrieves deleted messages
- View-once media recovery
- Anti-status mention, anti-foreign, anti-demote and anti-promote
- Welcome and goodbye messages (customizable images/text)
- Auto warn and auto kick system

**Useful tools**

- Sticker maker (image / video / GIF), QR code generator
- Media downloader (YouTube, TikTok, IG, FB, etc.)
- Profile and group info commands, CDN upload
- Language switcher (17 languages)

**Fun commands**

- Random memes, quotes and facts, mini games
- AI-style chat commands, media editing (brat, trigger, wanted, wasted, etc.)

**System controls**

- Public / private mode toggle, bot ping and status check
- Restart bot command, menu and help commands
- Time-based greetings, multi-platform update support
- Compact SQLite sessions — one small database file instead of thousands of JSON files

---

## For developers

Toxic-MD runs on [Toxic Baileys](https://github.com/xhclintohn/Baileys). If you want to build your own bot on the same library, here is the connection setup it uses — the same style as the [Toxic Pairing](https://github.com/xdxhclinton3/Toxic-Pairing-XD) site.

<details>
<summary>Connection example (pairing code)</summary>

```js
import makeWASocket, {
  useMultiFileAuthState,
  Browsers,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} from '@whiskeysockets/baileys';
import pino from 'pino';

const { state, saveCreds } = await useMultiFileAuthState('session');

const sock = makeWASocket({
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
  },
  logger: pino({ level: 'silent' }),
  browser: Browsers.android('Chrome'),
  syncFullHistory: false,
  markOnlineOnConnect: false,
});

sock.ev.on('creds.update', saveCreds);

sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
  if (qr && !state.creds.registered) {
    const code = await sock.requestPairingCode('2547XXXXXXXX');
    console.log('Pairing code:', code);
  }
  if (connection === 'open') console.log('Connected');
  if (connection === 'close') {
    const loggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
    if (!loggedOut) console.log('Disconnected — reconnecting...');
  }
});
```

</details>

---

## Safety notice

> Using unofficial WhatsApp APIs may violate WhatsApp's Terms of Service. Toxic-MD is a self-hosted project. Use it responsibly.

Best practices:

- Use a secondary WhatsApp number, not your primary one
- Enable two-step verification on your account
- Avoid spamming commands or over-automating activity
- Use private mode to reduce visibility and risk

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Session expired | Re-pair your WhatsApp via the pairing link |
| Bot not responding | Check your server/hosting logs for errors |
| Ban warning received | Reduce automation frequency and switch to private mode |

---

## Disclaimer

> All features provided by Toxic-MD are strictly for **educational purposes only**.
> The developer is not responsible for any misuse, account bans, or violations of WhatsApp's policies that may result from using this bot.

---

<div align="center">

**Toxic-MD**

Simple • Powerful • Multi-Device WhatsApp Bot

*Built by xh_clinton*

</div>
