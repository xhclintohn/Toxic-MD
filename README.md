<div align="center">

# Toxic MD — WhatsApp Bot

![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen?style=flat-square&logo=node.js)
![Platform](https://img.shields.io/badge/Platform-WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white)
![Multi-Device](https://img.shields.io/badge/Multi--Device-Supported-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.2.6-blue?style=flat-square)

**A powerful, lightning-fast WhatsApp Multi-Device bot built for group control, automation, AI chat, media editing, and fun commands^^**

<img src="https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/images/toxicx.png" width="100%" />

</div>

---

## 🌍 Read This README In Your Language

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

Change the bot's reply language anytime with: `.language <code>` (Owner only)

---

## 🆕 What's New in v1.2.6

- 📢 **Channel Status Command** — New `.chstatus` command (owner only, 12 aliases) posts text or media as a status on the bot channel: plain text, reply to a text, reply to an image with its caption, or reply to an image and add your own caption, with an optional channel JID as the first argument
- 👥 **Group Status on the Real Function** — `.gstatus` now posts through Baileys `sendGroupStatus`, with the same text, reply and media handling as `.chstatus`, plus three new aliases
- 🧹 **Clear That Actually Clears** — `.clear` now clears the chat instead of deleting it, with an optional `keepstarred` argument, and the broken clear helper that always errored is fixed
- 📥 **Archive, Unarchive and Delete** — `.archive` now uses the Baileys wrapper, and new `.unarchive` and `.deletechat` owner commands round out chat management

---

## 🆕 What's New in v1.2.5

- 🔐 **Reply-to-Ban in DMs Fixed** — When you reply to a user's message in a DM with `.ban`, the bot now resolves the quoted LID from the original stored message and from the DM chat itself, so it bans the real phone number instead of returning a LID
- 🛡️ **No More LID Stored as a Banned Number** — `.ban` now refuses an unresolvable LID with a clear message instead of banning its 15-digit LID as if it were a phone number

---

## 🆕 What's New in v1.2.4

- 🔐 **LID Resolved Before Owner Checks** — Sender and quoted sender LIDs are now resolved to phone numbers before dev, owner and sudo checks run, so the dev number no longer loses access just because it arrives as a LID
- 🛡️ **No More LID Stored as a Phone Number** — An unresolved LID is no longer saved by `.addsudo` as if it were a phone number; the bot now tries Baileys, the stored map and group metadata first, and if it still cannot resolve it, it says so and asks for the number to be typed manually

---

## 🆕 What's New in v1.2.3

- ⚡ **Per-Chat Message Store** — Capped at 500 messages per chat, with trimming at most once per 1000 inserts instead of scanning the whole map on every message
- 💾 **CRM Store** — Trimming no longer sorts all stored messages on every save, in-memory cap is 20000, and disk writes are coalesced to at most once every 3 minutes
- 🔧 **Faster Startup** — Plugin loading no longer rewrites every plugin file on every startup
- ⚡ **LID Lookups** — Misses are remembered for 60 seconds instead of scanning the whole Session folder on every message, and the push-name and LID mapping caches are capped
- ⚡ **Faster Connect** — The group list fetched on connect is reused for the sudo scan instead of fetching all groups a second time, and the Baileys version fetch now times out after 8 seconds instead of stalling startup
- 🔐 **Full Session Bundle** — Session loading now accepts the full compressed session bundle from the pairing site, including signal and app-state keys, while still accepting the old credentials-only session ID; invalid session data no longer overwrites a working session
- 📦 **Dependencies** — Floating `latest` and `*` versions are pinned to their current stable releases, with no major-version changes and the Baileys fork unchanged

---

## 🆕 What's New in v1.1.1

- 💾 **CRM Store** — JSON locally; auto-uses Heroku PostgreSQL when DATABASE_URL is set for better recovery & inspection
- 🔧 **Improved LID Mapping** — More robust Linked Device ID handling
- ⚡ **Higher Message Cache** — `MESSAGE_CACHE_LIMIT = 50000`
- 📁 **Command Reorganization** — CRM & run tools moved to Utils category
- ✨ **Prefix Command UI** — Cleaner single-header styling

---

## 📖 About

**Toxic-MD** is a modern WhatsApp bot built on the **Baileys Multi-Device** library. It helps you manage groups, automate repetitive tasks, protect your chats, and enjoy a wide range of fun and utility commands — all in a single, easy-to-deploy package.

### Why Toxic-MD?

| Feature | Details |
|---|---|
| ✅ Multi-Device Support | No constant QR scanning required |
| ⚡ Fast & Stable | Optimized for continuous uptime |
| 🚀 Easy Deployment | Works on any hosting platform |
| 🧑‍💻 Beginner Friendly | Simple setup, clear documentation |
| 🔧 Highly Customizable | Flexible prefix, modes, settings, and languages |
| 🤖 AI-Powered | Auto AI chat with Groq/Llama |
| 🛡️ Group Protection | Anti-link, anti-badword, anti-group-status, anti-delete, view-once recovery, and more |
| 🌐 Multi-Language | 17 languages supported |
| 📊 Auto Reports | Daily group stats posted to group status |

## Deploy the Bot

#### Step 1 — Fork the Repository

[![Fork Repo](https://img.shields.io/badge/FORK%20REPOSITORY-brightgreen?style=for-the-badge&logo=github)](https://github.com/xhclintohn/Toxic-MD/fork)

#### Step 2 — Pair Your WhatsApp

[![Pair WhatsApp](https://img.shields.io/badge/PAIR%20WHATSAPP-blue?style=for-the-badge&logo=whatsapp&logoColor=white)](https://fork.toxicx.tech)

#### Step 3 — Deploy the Bot

[![Deploy Bot](https://img.shields.io/badge/DEPLOY%20BOT-orange?style=for-the-badge&logo=rocket)](https://fork.toxicx.tech)

### Quick Start

1. Visit: **https://toxicx.tech/pairing**
2. Open WhatsApp on your phone
3. Go to **Settings → Linked Devices**
4. Tap **Pair Device** and scan or enter the pairing code

```env
SESSION=YOUR_SESSION_ID
```

---

## Features

#### 🤖 Automation

- Auto Read Messages, Auto View Status, Auto Like Status
- Custom Auto Replies, Auto AI Chat (Groq/Llama), Auto Bio
- Auto Report (Daily group stats)

#### 🛡️ Group Protection & Moderation

- Anti-Link — blocks WhatsApp and external links
- Anti-Bad Word — deletes/warns/kicks for a bad-word list, extensible per group
- Anti-Group Status — deletes/warns/kicks non-admins who post a group status
- Anti-Bot — detects and removes known bot accounts
- Anti-Delete — retrieves deleted messages
- View-Once Media Recovery
- Anti-Status Mention, Anti-Foreign, Anti-Demote & Anti-Promote
- Welcome & Goodbye Messages (customizable images/text)
- Auto Warn & Auto Kick System

#### ⚙️ Useful Tools

- Sticker Maker (Image / Video / GIF), QR Code Generator
- Media Downloader (YouTube, TikTok, IG, FB, etc.)
- Profile & Group Info Commands, CDN Upload
- Language Switcher (17 languages)

#### 🎮 Fun Commands

- Random Memes, Quotes & Facts, Mini Games
- AI-Style Chat Commands, Media Editing (brat, trigger, wanted, wasted, etc.)

#### 🔧 System Controls

- Public / Private Mode Toggle, Bot Ping & Status Check
- Restart Bot Command, Menu & Help Commands
- Time-Based Greetings, Multi-Platform Update Support

---

## 🛡️ Safety Notice

> ⚠️ Using unofficial WhatsApp APIs may violate WhatsApp's Terms of Service. Toxic-MD is a self-hosted project. Use it responsibly.

**Best Practices:**

- Use a secondary WhatsApp number, not your primary one
- Enable Two-Step Verification on your account
- Avoid spamming commands or over-automating activity
- Use Private Mode to reduce visibility and risk

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| Session expired | Re-pair your WhatsApp via the pairing link |
| Bot not responding | Check your server/hosting logs for errors |
| Ban warning received | Reduce automation frequency and switch to Private Mode |

---

## 📚 Disclaimer

> ⚠️ All features provided by Toxic-MD are strictly for **educational purposes only**.
> The developer is not responsible for any misuse, account bans, or violations of WhatsApp's policies that may result from using this bot.

---

<div align="center">

**Toxic-MD**

Simple • Powerful • Multi-Device WhatsApp Bot

*Built with ❤️ by xh_clinton*

</div>
