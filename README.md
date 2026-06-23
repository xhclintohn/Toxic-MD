<div align="center">

# Toxic MD — WhatsApp Bot

![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen?style=flat-square&logo=node.js)
![Platform](https://img.shields.io/badge/Platform-WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white)
![Multi-Device](https://img.shields.io/badge/Multi--Device-Supported-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.2.0-blue?style=flat-square)

**A powerful, lightning-fast WhatsApp Multi-Device bot built for group control, automation, AI chat, media editing, and fun commands**

<img src="https://raw.githubusercontent.com/xhclintohn/Music-Clips-Collection/main/images/toxicx.png" width="100%" />

</div>

---

## 🌍 Choose Your Language / Chagua Lughako / Elije Tu Idioma

This README is available in multiple languages. Choose yours below:

| Code | Language | Status |
|------|----------|--------|
| [en](#english) | **English** (Default) | Full |
| [sw](#swahili) | Swahili | Full |
| [es](#spanish) | Spanish | Full |
| [fr](#french) | French | Full |
| [de](#german) | German | Full |
| [pt](#portuguese) | Portuguese | Full |
| [ar](#arabic) | Arabic | Full |
| [hi](#hindi) | Hindi | Full |
| [zh](#chinese) | Chinese | Full |
| [ja](#japanese) | Japanese | Full |
| [ko](#korean) | Korean | Full |
| [ru](#russian) | Russian | Full |
| [tr](#turkish) | Turkish | Full |
| [id](#indonesian) | Indonesian | Full |
| [ha](#hausa) | Hausa | Full |
| [yo](#yoruba) | Yoruba | Full |
| [am](#amharic) | Amharic | Full |

Change bot language anytime with: `.language <code>` (Owner only)

---

<h2 id="english">📖 English (Default)</h2>

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
| 🛡️ Group Protection | Anti-link, anti-delete, view-once recovery, and more |
| 🌐 Multi-Language | 17 languages supported |
| 📊 Auto Reports | Daily group stats posted to group status |

### Deploy the Bot

Follow these three simple steps to get your bot running.

#### Step 1 — Fork the Repository

Start by forking the project to your own GitHub account.

[![Fork Repo](https://img.shields.io/badge/FORK%20REPOSITORY-brightgreen?style=for-the-badge&logo=github)](https://github.com/xhclintohn/Toxic-MD/fork)

#### Step 2 — Pair Your WhatsApp

Link your WhatsApp account to generate a Session ID.

[![Pair WhatsApp](https://img.shields.io/badge/PAIR%20WHATSAPP-blue?style=for-the-badge&logo=whatsapp&logoColor=white)](https://fork.toxicx.tech)

#### Step 3 — Deploy the Bot

Deploy your forked bot to your preferred hosting platform.

[![Deploy Bot](https://img.shields.io/badge/DEPLOY%20BOT-orange?style=for-the-badge&logo=rocket)](https://fork.toxicx.tech)

### Quick Start

#### Get Your Session ID

1. Visit: **https://toxicx.tech/pairing**
2. Open WhatsApp on your phone
3. Go to **Settings → Linked Devices**
4. Tap **Pair Device** and scan or enter the pairing code

#### Environment Variables

```env
SESSION=YOUR_SESSION_ID
```

---

### What's New in v1.2.0

- 🌐 **Language System** — Change bot reply language with `.language`. 17 languages including Swahili, Hausa, Yoruba, Amharic.
- 📊 **Auto Report** — Daily group analytics posted to group status every 24 hours. Toggle with `.autoreport on/off`.
- 🖼️ **CDN Upload** — Upload media to WhatsApp CDN and get direct URLs with `.cdnwa`.
- 🛠️ **Fixed Antiviewonce** — View-once media recovery now works perfectly.
- 📝 **Improved Setwelcome** — Custom images, optional profile pic, full customization.
- 🎯 **Fixed Setmention** — Now owner-only and sets bot's auto-reply when mentioned.
- 🖼️ **Fixed FullPP** — Profile picture updates now preserve full quality.
- 📡 **Fixed Ping** — Now shows correct platform (Windows, Linux, macOS).
- 👥 **Fixed Listonline** — Properly shows online group members.
- 🔄 **Unified Update** — `.update` and `.triggerupdate` now auto-detect platform (git/Heroku/panel).
- 🌅 **Time Greetings** — Menu, ping, and alive commands show time-based greetings.

---

### Features

#### 🤖 Automation

- Auto Read Messages
- Auto View Status
- Auto Like Status
- Custom Auto Replies
- Auto AI Chat (Groq/Llama)
- Auto Bio
- Auto Report (Daily group stats)

#### 🛡️ Group Protection & Moderation

- Anti-Link — blocks WhatsApp and external links
- Anti-Delete — retrieves deleted messages
- View-Once Media Recovery
- Anti-Status Mention
- Welcome & Goodbye Messages (customizable images/text)
- Admin-Only Command Restrictions
- Auto Warn & Auto Kick System
- Anti-Foreign — auto-kick non-allowed country codes
- Anti-Demote & Anti-Promote

#### ⚙️ Useful Tools

- Sticker Maker (Image / Video / GIF)
- QR Code Generator
- Media Downloader (YouTube, TikTok, IG, FB, etc.)
- Profile & Group Info Commands
- CDN Upload — get WhatsApp CDN URLs
- Language Switcher (17 languages)

#### 🎮 Fun Commands

- Random Memes
- Quotes & Facts
- Mini Games
- AI-Style Chat Commands
- Media Editing (brat, trigger, wanted, wasted, etc.)

#### 🔧 System Controls

- Public / Private Mode Toggle
- Bot Ping & Status Check
- Restart Bot Command
- Menu & Help Commands
- Time-Based Greetings
- Multi-Platform Update Support

---

### 🛡️ Safety Notice

> ⚠️ Using unofficial WhatsApp APIs may violate WhatsApp's Terms of Service. Toxic-MD is a self-hosted project. Use it responsibly.

**Best Practices:**

- Use a secondary WhatsApp number, not your primary one
- Enable Two-Step Verification on your account
- Avoid spamming commands or over-automating activity
- Use Private Mode to reduce visibility and risk

---

### 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| Session expired | Re-pair your WhatsApp via the pairing link |
| Bot not responding | Check your server/hosting logs for errors |
| Ban warning received | Reduce automation frequency and switch to Private Mode |

---

### 📚 Disclaimer

> ⚠️ All features provided by Toxic-MD are strictly for **educational purposes only**.  
> The developer is not responsible for any misuse, account bans, or violations of WhatsApp's policies that may result from using this bot.

---

<h2 id="swahili">📖 Swahili</h2>

**Toxic-MD** ni bot ya WhatsApp iliyojengwa kwa kutumia **Baileys Multi-Device**. Inasaidia kudhibiti vikundi, kufanya kazi kiotomatiki, kulinda mazungumzo, na kufurahia amri mbalimbali za burudani na zana.

### Mpya katika v1.2.0
- 🌐 **Mfumo wa Lugha** — Badilisha lugha kwa `.language`. Lugha 17 zikiwa na Kiswahili.
- 📊 **Ripoti Kiotomatiki** — Takwimu za kikundi kila siku 24. Washa/zima kwa `.autoreport on/off`.
- 🖼️ **CDN Upload** — Pakia media kwenye WhatsApp CDN na pata URL moja kwa moja kwa `.cdnwa`.

---

<h2 id="spanish">📖 Spanish (Español)</h2>

**Toxic-MD** es un bot de WhatsApp moderno construido con **Baileys Multi-Device**. Te ayuda a gestionar grupos, automatizar tareas, proteger tus chats y disfrutar de una amplia gama de comandos.

### Novedades en v1.2.0
- 🌐 **Sistema de Idiomas** — Cambia el idioma con `.language`. 17 idiomas disponibles.
- 📊 **Informe Automático** — Estadísticas diarias del grupo cada 24 horas. Activa/desactiva con `.autoreport on/off`.

---

<h2 id="french">📖 French (Francais)</h2>

**Toxic-MD** est un bot WhatsApp moderne construit avec **Baileys Multi-Device**. Il vous aide a gerer les groupes, automatiser les taches et proteger vos chats.

### Nouveautes dans v1.2.0
- 🌐 **Systeme de Langue** — Changez la langue avec `.language`. 17 langues prises en charge.
- 📊 **Rapport Automatique** — Statistiques quotidiennes du groupe toutes les 24 heures.

---

<h2 id="german">📖 German (Deutsch)</h2>

**Toxic-MD** ist ein moderner WhatsApp-Bot, der auf **Baileys Multi-Device** basiert. Er hilft dir bei der Gruppenverwaltung, Automatisierung und Chat-Sicherheit.

### Neu in v1.2.0
- 🌐 **Sprachsystem** — Sprache mit `.language` andern. 17 Sprachen unterstutzt.
- 📊 **Auto-Bericht** — Tägliche Gruppenstatistiken alle 24 Stunden.

---

<h2 id="portuguese">📖 Portuguese (Portugues)</h2>

**Toxic-MD** e um bot do WhatsApp moderno construido com **Baileys Multi-Device**. Ajuda a gerenciar grupos, automatizar tarefas e proteger chats.

### Novidades na v1.2.0
- 🌐 **Sistema de Idiomas** — Mude o idioma com `.language`. 17 idiomas suportados.
- 📊 **Relatorio Automatico** — Estatisticas diarias do grupo a cada 24 horas.

---

<h2 id="arabic">📖 Arabic</h2>

**Toxic-MD** بوت واتساب حديث مبني على **Baileys Multi-Device**. يساعدك في إدارة المجموعات وأتمتة المهام وحماية الدردشات.

### الجديد في الإصدار ١.٢.٠
- 🌐 **نظام اللغات** — غيّر اللغة باستخدام `.language`. ١٧ لغة مدعومة.
- 📊 **التقرير التلقائي** — إحصائيات المجموعة اليومية كل ٢٤ ساعة.

---

<h2 id="hindi">📖 Hindi</h2>

**Toxic-MD** एक आधुनिक WhatsApp बॉट है जो **Baileys Multi-Device** पर बना है। यह समूह प्रबंधन, कार्य स्वचालन और चैट सुरक्षा में मदद करता है।

### v1.2.0 में नया
- 🌐 **भाषा प्रणाली** — `.language` से भाषा बदलें। 17 भाषाएं समर्थित।
- 📊 **स्वचालित रिपोर्ट** — हर 24 घंटे में समूह आंकड़े।

---

<h2 id="chinese">📖 Chinese</h2>

**Toxic-MD** 是一款基于 **Baileys Multi-Device** 构建的现代 WhatsApp 机器人。它可帮助您管理群组、自动执行任务和保护聊天。

### v1.2.0 新增功能
- 🌐 **语言系统** — 使用 `.language` 更改语言。支持 17 种语言。
- 📊 **自动报告** — 每 24 小时一次的群组统计。

---

<h2 id="japanese">📖 Japanese</h2>

**Toxic-MD** は **Baileys Multi-Device** で構築されたモダンな WhatsApp ボットです。グループ管理、タスク自動化、チャット保護を支援します。

### v1.2.0 の新機能
- 🌐 **言語システム** — `.language` で言語を変更。17言語対応。
- 📊 **自動レポート** — 24時間ごとのグループ統計。

---

<h2 id="korean">📖 Korean</h2>

**Toxic-MD**는 **Baileys Multi-Device**로 구축된 현대적인 WhatsApp 봇입니다. 그룹 관리, 작업 자동화 및 채팅 보호를 도와드립니다.

### v1.2.0의 새로운 기능
- 🌐 **언어 시스템** — `.language`로 언어 변경. 17개 언어 지원.
- 📊 **자동 보고서** — 24시간마다 그룹 통계.

---

<h2 id="russian">📖 Russian</h2>

**Toxic-MD** — это современный бот для WhatsApp, построенный на **Baileys Multi-Device**. Помогает управлять группами, автоматизировать задачи и защищать чаты.

### Новое в v1.2.0
- 🌐 **Языковая система** — Меняйте язык через `.language`. 17 языков.
- 📊 **Автоотчет** — Ежедневная статистика группы каждые 24 часа.

---

<h2 id="turkish">📖 Turkish</h2>

**Toxic-MD**, **Baileys Multi-Device** uzerine insa edilmis modern bir WhatsApp botudur. Grup yonetimi, gorev otomasyonu ve sohbet korumasina yardimci olur.

### v1.2.0'deki Yenilikler
- 🌐 **Dil Sistemi** — `.language` ile dil degistirin. 17 dil destekleniyor.
- 📊 **Otomatik Rapor** — Her 24 saatte bir grup istatistikleri.

---

<h2 id="indonesian">📖 Indonesian</h2>

**Toxic-MD** adalah bot WhatsApp modern yang dibangun di atas **Baileys Multi-Device**. Membantu mengelola grup, mengotomatisasi tugas, dan melindungi obrolan.

### Yang Baru di v1.2.0
- 🌐 **Sistem Bahasa** — Ubah bahasa dengan `.language`. 17 bahasa didukung.
- 📊 **Laporan Otomatis** — Statistik grup harian setiap 24 jam.

---

<h2 id="hausa">📖 Hausa</h2>

**Toxic-MD** bot na WhatsApp ne na zamani da aka gina akan **Baileys Multi-Device**. Yana taimakawa wajen gudanar da kungiyoyi, aiwatar da ayyuka, da kare tattaunawa.

### Sabon abu a v1.2.0
- 🌐 **Tsarin Harshe** — Canza harshe da `.language`. Harsuna 17.
- 📊 **Rahoton Kansa** — Kididdigar rukuni kullum 24awa.

---

<h2 id="yoruba">📖 Yoruba</h2>

**Toxic-MD** jẹ bot WhatsApp ti o ti ni ilọsiwaju ti a kọ lori **Baileys Multi-Device**. O ran awọn ẹgbẹ lọwọ, ṣe iṣẹ laifọwọyi, ati daabobo ibaraẹnisọrọ.

### Tuntun ni v1.2.0
- 🌐 **Eto Ede** — Yi ede pada pẹlu `.language`. Ede 17.
- 📊 **Iroyin Aifọwọyi** — Awọn iroyin ẹgbẹ ojoojumọ ni awọn wakati 24.

---

<h2 id="amharic">📖 Amharic</h2>

**Toxic-MD** በ **Baileys Multi-Device** ላይ የተሰራ ዘመናዊ WhatsApp ቦት ነው። ቡድኖችን በማስተዳደር፣ ተግባራትን በራስ-ሰር በማከናወን እና ውይይቶችን በመጠበቅ ይረዳል።

### በ v1.2.0 ውስጥ አዲስ
- 🌐 **የቋንቋ ስርዓት** — ቋንቋውን በ `.language` ይቀይሩ። 17 ቋንቋዎች.
- 📊 **ራስ-ሰር ሪፖርት** — ሁሉም 24 ሰዓታት የቡድን ስታቲስቲክስ.

---

<div align="center">

**Toxic-MD**

Simple • Powerful • Multi-Device WhatsApp Bot

*Built with ❤️ by xh_clinton*

</div>
