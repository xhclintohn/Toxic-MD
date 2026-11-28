# Changelog

## 1.2.24

- New fancy `.menu` for Android: product-image header, limited-time-offer card, bottom sheet with Browse Categories (auto-loads every plugin folder with command counts — new folders show up by themselves) and a Hosting Site button (hosting.nyxtechs.net). Styled in Toxic-MD's own box format. iOS keeps the plain text menu.
- New `.menu2`: full command list with a link-preview header, every category in its own box.
- New `.menu3`: numbered category menu — reply with a number (or just send the number) to see that category's commands.
- Plugin folders reorganised: Downloads → Downloader, Groups → Group, Utils → Tools, Effects → Filters, plus new Games (chess, coinflip, dice, games, runner, ttt) and Dev (eval, shell, getfunc, devpanel, getcmd, addcmd, delcmd, dev) folders. New `.gamesmenu` and `.devmenu` commands.
- Command audit cleanup: 15 aliases that were shadowing real commands removed (`.alive`, `.online`, `.sticker`, `.test`, `.github`, `.tinyurl`, `.transcribe`, `.vupdate`, `.tempinbox`, `.effectsmenu`, `.gcname`, `.setgroupname` now reach their actual commands), duplicate listonline files merged into aliases, dead files removed, files renamed to match their command names. 420 commands, no duplicates.
- New `.fakemsg <text>` (aliases `.editfake`, `.fakeedit`): reply to a message in a group to fake-edit it.
- New `.delete2` (aliases `.del2`, `.dmsg2`, `.delmsg2`, `.delother2`): owner-only force delete — reply to a message to delete it and wipe the command trace.
- `.sa` (sticker audio) now works when the command is the caption of a video or audio, not only on reply.
- `.fakechat` error now shows the command name you actually typed.
- `.settingsmenu` fixed (it was listing nothing).

## 1.2.23

- New `.report` command: report spam to WhatsApp. Reply to a spam message and type `.report`, or use `.report 2547xxxxxxxx` / `.report @user` to report a number. Add `block` to also block them. Works in groups too, and shows the Report ID with a copy button. Owner only. Needs toxic-baileys 1.9.0 or newer — run `.update` first.
- Bug reports moved from `.report` to `.bug` (aliases `.feedback`, `.bugreport`). The menu now points to `.bug`.
- `.xreport` now uses the new reporting system and shows the Report ID.

## 1.2.22

- Fixed the first command in a group sometimes being ignored: WhatsApp delivers some group messages twice with the same ID (first a sender-key copy with no text, then the real message), and the duplicate filter was throwing away the real one. The filter now lets the real copy through.
- Sessions now use toxic-baileys' compact SQLite auth state: the whole session lives in one `auth.db` file instead of thousands of JSON files (22 MB down to about 3 MB), old pre-keys are pruned automatically, and your existing session migrates by itself on first start — no re-pairing. Needs toxic-baileys 1.8.8 or newer — run `.update` first.
- Downloaders rebuilt: every downloader now tries several sources in order until one works (YouTube audio/video, TikTok, Pinterest, Instagram, Facebook, Twitter/X, Spotify and more), with a local yt-dlp fallback for YouTube. Dead APIs removed.
- New downloaders: `.douyin`, `.applemusic`, `.terabox`, `.mega`, `.gdrive`, `.sfile`, `.ttimg`, `.videy`, `.aio`.
- New search commands: `.ttstalk`, `.twstalk`, `.ytstalk`, `.robloxstalk`, `.pinstalk`, `.amfinder`.
- New AI commands: `.blackbox`, `.claude`, `.deepseek`, `.quillbot`, `.bard`. `.codegen` and `.remini` fixed.
- New tools: `.checkhost` (alias `.cekhost`), `.trackip`, `.subdomain`, `.phishcheck`, `.web2zip`, `.fontsearch`, `.readqr`, `.tthashtag`, `.amsend`, `.amverify`.
- `.lyrics`, `.image`, `.google`, `.bratvid`, `.telesticker`, `.tinyurl`, `.npmdl`, `.capcut` and `.video` fixed — they were calling dead APIs.
- `.removebg` fixed with a new background-removal service.
- `.sa` (sticker audio) now also works on videos and caps the audio at 25 seconds.


## 1.2.21

- New `.settheme` command: set a WhatsApp chat theme on the current chat or group. `.settheme list` shows the themes, `.settheme 2` picks one by number (or use the name, like `.settheme emerald`), `.settheme color FF0000` sets a solid color background (add `doodle` for the pattern), and `.settheme clear` removes it. Works on a group JID or invite link too, like `.setwallpaper`. The bot must be a group admin. Needs toxic-baileys 1.8.7 or newer — run `.update` first.
- `.sticker` now works when you caption an image or video with the command, not only when you reply to one.

## 1.2.20

- `.vv` / `.vvx` can now retrieve a view-once long after it was sent — up to 24 hours. They check the toxic-baileys sender-copy cache first, instead of only the bot message store which kept just the last 20 messages per chat (that is why retrieval used to fail after a few minutes in busy chats). Needs toxic-baileys 1.8.6 or newer.

## 1.2.19

- `.update` now checks versions first: it compares your Toxic-MD and Baileys versions against GitHub and only updates what is outdated. If everything is current it says so and changes nothing. `.update check` reports versions without updating, `.update force` updates everything regardless.
- Fixed `.update` / `.updatebails` Baileys reinstalls silently reverting on the next start: the reinstall now updates package-lock.json too, so npm cannot restore the old Baileys commit afterwards.
- `.update` restart no longer needs pm2: if pm2 is not available, the bot relaunches itself after updating.

## 1.2.18

- `.pair` rebuilt on toxic-baileys' new `startPairing` handler: the code comes back fast (no more 3-second sleep or slow number check before asking WhatsApp), the socket stays alive until you actually link instead of dying after 10 seconds, and once paired the session ID is sent to that number's DM with a copy button. Needs toxic-baileys 1.8.5 or newer.
- Fixed welcome messages silently doing nothing when the developer rejoined a group: the auto-promote check could exit the whole group-events handler before the welcome block ran.
- Welcome messages no longer wait on profile-picture lookups they do not need, so they land right after a member joins.
- Removed the welcome card; welcome messages are text again (or the group custom image / member profile picture when those options are set).
- Antiviewonce now runs on toxic-baileys new `handleViewOnce` handler: view-once media is detected and downloaded the moment it arrives, and when WhatsApp withholds the media keys it is recovered from the sender own keyed copy automatically. Needs toxic-baileys 1.8.5 or newer.
- `.setwallpaper` no longer zooms: the image is fitted onto a 1080x1920 portrait canvas with a blurred fill before upload, so square and landscape images fill the chat background without being cropped.

## 1.2.17

- New `.setwallpaper` command (alias `.setwall`): reply to an image or send one with the caption to set it as the group's chat wallpaper. In a group it sets that group; from DM add the group JID or invite link, like `.setwall 120363000000000000@g.us`. The bot has to be in the group and an admin, since WhatsApp only lets admins change a group's theme. Needs toxic-baileys 1.8.4 or newer for the wallpaper media type.

## 1.2.16

- Auto view status works again: WhatsApp now delivers some statuses a different way that the bot was acknowledging but never handing to the view code, so those statuses were never viewed or liked. The bot now catches statuses however they arrive and views them right away (and likes them too when autolike is on), using the poster's number when it can be resolved and the raw key otherwise.

## 1.2.15

- Commands from the bot's own number now work: when you command the bot from the number it's linked to, your messages arrive as "append" updates and the bot was dropping them before it even saw them. Now it lets its own number's messages through, so commands work from your own number, in your own DM and in groups.
- Auto view status is now instant: the bot used to wait for a slow LID lookup (signal repo, session files, a full group fetch) before viewing each status, so statuses piled up and some were missed when a lot of features were on. Now it views the status the moment it arrives, using the number it already knows or the raw key, and only looks the number up in the background afterwards. The status like still uses the right number. The bot also now handles every message in a batch instead of just the first one, so statuses that arrive together all get viewed instead of only the first.
- Removed the forced app-state resync on connect and its log — Baileys resolves the sync key on its own now, so the bot doesn't need to force it.
- The bot no longer kills itself when its main file changes. It used to watch its own file and exit on any change, and with nothing to restart it, it stayed down. Bots stay up now.
- Cleaned up command aliases: fixed duplicate entries that were silently dropping aliases, and fixed collisions where one command's alias shadowed another — `.pin` pins a message again instead of triggering Pinterest, and `.song` reaches the song command.
- New `.richtest` command that sends a test AI rich response with steps. Use `.richtest details` for the details variant.
- The prefix you set now works reliably: the bot trims the prefix, handles prefixless mode properly (a command typed with a leading symbol still resolves), and no longer falls back to the default prefix when the settings read is slow — which is what made a custom prefix look ignored while `/` still worked.
- Welcome messages now come with a generated card: when someone joins a group with welcome on, the bot builds an image with their profile picture, their name, the group name and the member count, and sends it as a big preview card with your welcome text. If you set a custom welcome image it still uses that, and if the card can't be built it falls back to the old behaviour.

## 1.2.14

- Poll voting: reply to a poll with `.vote` and tap a button to vote. Polls with up to 3 options get quick-reply buttons, bigger polls get a list. The bot saves each poll's voting key the moment the poll arrives, so tapping a button votes with the right key.
- View-once reveal fixed: `.vv` and `.vvx` now recover view-once photos, videos and voice notes from the sender's own live copy when WhatsApp strips the media keys, instead of failing with a blank error.
- Auto-react: new `.autoreact` command. The bot reacts to messages with a different emoji every time, never the same twice in a row. `.autoreact on` reacts everywhere, `.autoreact dm` only in DMs, `.autoreact gc` only in groups, and `.autoreact off` stops it. It also shows up in `.on`, `.off` and `.settings`.
- Antidelete recovers more: deleted view-once media (including voice notes) is recovered from the sender's copy, and deleted buttons and interactive messages, poll votes, reactions, live locations, contacts and group invites are now recovered too. When a deleted message can't be fully rebuilt, it shows any text it finds instead of saying it couldn't be recovered.
- Group status captions: `.gstatus` no longer keeps a caption that is just the command itself, and replying to a message uses that message's text as the caption.
- Clear from anywhere: `.clear` now works on a number or a group JID, not just the chat you're in, and asks what to clear when you use it bare.
- Sticker audio: new `.stickeraudio` (`.sa`) command turns audio into a sticker.
- Pin commands: `.pin` now uses the new Baileys pin API, and `.pinchat` is a new command for pinning a whole chat.

## 1.2.13

- Slowdown fixes: the bot no longer rescans the whole Session directory for every message from an unresolvable LID. Failed LID scans are now cached for 60 seconds in both the message handler and the LID resolver, and the session cleanup no longer deletes Baileys' LID mapping files, so the fast direct file lookup keeps working. LID pairs that are already cached with the same value are no longer rewritten to the database on every group message. The device cache is now managed by Baileys with TTL eviction instead of a plain Map that never expired. The bot admin check now refetches group metadata at most once a minute per group instead of on every message.

## 1.2.12

- Sticker command fixed: `.sticker` (and `.s`, `.stk`, `.stkr`, `.make`, `.stik`, `.stikpack`) no longer uses wa-sticker-formatter, which needs sharp. It now uses the new `lib/stickerlite.js` engine, which converts with FFmpeg and writes the pack and author EXIF into the WebP itself. Images fill the square by default, and `.s full` keeps the whole picture. Videos are rejected over 8 MB or 30 seconds, and animated stickers are re-packed with the new watermark instead of being re-encoded. The sticker watermark setting and the pack and author identity are unchanged.

## 1.2.11

- New domain links: the trial check now calls the Nyx Hosting API on hosting.nyxtech.web.id instead of hosting.toxicx.tech, and the expiry and renewal messages now point at hosting.nyxtech.web.id. Both addresses serve the same site, so the trial check and the renewal flow work exactly as before.
- MainBot site: the `.script` command now shows https://hosting.nyxtech.web.id as the bot site instead of https://toxicx.tech.

## 1.2.10

- Update Baileys: `.updatebails` (and its aliases `.ub`, `.updatebaileys`, `.reinstall`, `.npmi`) now installs only Baileys from the test branch instead of deleting `node_modules` and the lockfile and reinstalling everything. The old behaviour ran the bot out of memory and was killed, leaving a half-installed `node_modules` behind. The command now reports the Baileys version before and after, says nothing was deleted if it fails, and asks for a panel restart so the new Baileys loads. Running it now pulls Baileys 1.8.1 from the test branch, which carries the media group-status fix.

## 1.2.9

- Group status media: `.gstatus` now unwraps ephemeral and view-once wrappers before looking for media, so images and videos sent in disappearing chats or as view-once messages are found instead of being missed. Media downloads now fall back to the bot's own quoted-message download when the direct download fails or comes back empty, and a failed download now says so clearly instead of sending broken content.
- Group status media: video, audio and sticker details are now carried through. Videos keep their mimetype and gifPlayback flag, voice notes keep their mimetype and push-to-talk flag instead of being forced to audio/mp4, and replying to a sticker now posts the sticker instead of being ignored. Text behaviour, caption precedence, `all` mode and aliases are unchanged.

## 1.2.8

- Vision: `.vision` now uses Groq's `qwen/qwen3.8-27b` model. The old `meta-llama/llama-4-scout-17b-16e-instruct` model was shut down by Groq on 17/07/2026, which is why every vision request failed with a 404. The new model is the only vision model on Groq's current supported list, verified against Groq's own docs on 12/11/2026.
- AI chat: the shared Groq fallback list now only tries `openai/gpt-oss-120b` and `openai/gpt-oss-20b`. The Llama 3.3 and 3.1 entries were retired from self-serve Groq accounts on 16/08/2026 and only exist for enterprise contracts now, and the Llama 4 Scout entry is the same dead model as above, so every chat command (`.gpt`, `.groq`, `.chat`, `.gemini`, `.aicode`, `.darkgpt`) was wasting attempts on models that can never answer.
- Auto AI: the automatic vision path now tries only `qwen/qwen3.8-27b` instead of the retired `qwen/qwen3.6-27b` first.

## 1.2.7

- Group status: `.gstatus` now calls Baileys `sendGroupStatus` with the new `(jid, content)` shape from Baileys 1.8.0, which posts a real group status through the `groupStatusMessageV2` message. The old shape posted through the status-mentions mechanism and the status never showed inside the group. All `.gstatus` behaviour is unchanged: the same text, reply and media handling, `all` mode, group link and JID targeting, and aliases.
- App state: the bot now syncs all app-state collections when it connects, and the chat-modify retry now resyncs all collections too. The old code only resynced `critical_unblock_low`, while clear, archive, delete, mute and pin patches live in the `regular` collections, so `.clear`, `.archive`, `.deletechat` and `.unarchive` could keep failing with "app state not ready" right after starting.

## 1.2.6

- Channel status: new `.chstatus` command (owner only) with 12 aliases posts text or media as a status on the bot channel through Baileys `sendChannelStatus`. It takes plain text, reply-to-text, reply-to-image with its own caption, or reply-to-image plus command text, where the command text wins as the caption. It defaults to the bot channel and also accepts a channel JID or bare channel number as the first argument, and says clearly when the bot is not an admin of the channel.
- Group status: `.gstatus` now posts through Baileys `sendGroupStatus` instead of a hand-built message, with the same text, reply and media handling as `.chstatus`, the same `all` mode and group link or JID targeting, and three new aliases. The command text now wins over a media caption, matching `.chstatus`.
- Chat management: `.clear` now actually clears the chat through Baileys `clearChat` instead of deleting it, with an optional `keepstarred` argument that keeps starred messages. The other clear command and the `clearChatMessages` helper no longer use the invalid `clearChat` modification shape that always errored, and now clear through `clearChat` too.
- Chat management: `.archive` now uses Baileys `archiveChat`, and two new owner commands arrive: `.deletechat` deletes the chat and `.unarchive` brings an archived chat back. All four fall back to the matching `chatModify` shape when the Baileys wrapper is not available.

## 1.2.5

- LID handling: replying to a message in a DM with `.ban` no longer returns a LID. Quoted senders are now resolved from the original stored message (in-memory store and saved message record, using the original key's phone-number identity) and, in a DM, from the DM chat itself, with the new `resolveQuotedJid` helper in `lib/lidResolver.js` and a 4 second cap in `src/toxic.js` so an unresolvable quoted LID never stalls a message.
- LID handling: `.ban` no longer stores a LID as a banned number. A quoted or mentioned target that is still a LID after every resolver has run now gets the clear "couldn't resolve" message instead of banning the 15-digit LID as if it were a phone number, matching the `.addsudo` behaviour from 1.2.4. Group replies are unchanged: the DM chat fallback only runs outside groups, and group quoted targets still resolve through Baileys lidMapping, the stored map and fresh group metadata.

## 1.2.4

- LID handling: the sender and quoted sender are now resolved from LID to phone number before owner, dev and sudo checks run, using Baileys lidMapping, the stored LID-phone map and fresh group metadata, with a 2.5 second cap so an unresolvable LID never stalls a message.
- LID handling: an unresolved LID is no longer treated as a phone number. `resolvePhoneNumber` now returns empty instead of the LID digits, so `.addsudo`, `.delsudo` and `.unban` can no longer store a LID as a sudo or banned number. `.addsudo` and `.delsudo` now try the async resolver first and, when a LID still cannot be resolved, say so and ask for the number to be typed manually.
- LID handling: a LID is no longer matched against the dev number by its digits alone, and the startup group scan now uses the group metadata phoneNumber field for LID participants and now also warms the dev number's mapping, not just sudo users.
- No Baileys change: Baileys only learns a LID-to-phone mapping when a message carries both identities, so an unresolvable LID is a WhatsApp privacy limit, not a Baileys bug, and is now reported instead of stored wrongly.

## 1.2.3

- Performance: per-chat message store capped at 500 messages instead of scaling with the global cache limit, and message-map trimming now runs at most once per 1000 inserts instead of scanning the whole map on every message.
- Performance: CRM store trimming no longer sorts all stored messages on every save, the in-memory message cap is 20000, and disk writes are coalesced to at most once every 3 minutes.
- Performance: plugin loading no longer rewrites every plugin file on every startup.
- Performance: LID-to-phone lookups that miss now remember the miss for 60 seconds instead of scanning the whole Session folder on every message, and the push-name and LID mapping caches are capped.
- Performance: the group list fetched on connect is reused for the sudo scan instead of fetching all groups a second time, and the Baileys version fetch now times out after 8 seconds instead of stalling startup.
- Stability: session loading now accepts the full compressed session bundle from the pairing site, including signal and app-state keys, while still accepting the old credentials-only session ID. Invalid session data no longer overwrites a working session.
- Dependencies: floating `latest` and `*` versions are pinned to their current stable releases, with no major-version changes and the Baileys fork unchanged.

## 1.1.1

- CRM Store: JSON locally; auto-uses Heroku PostgreSQL when DATABASE_URL is set for better recovery and inspection.
- Improved LID mapping: more robust Linked Device ID handling.
- Higher message cache: MESSAGE_CACHE_LIMIT = 50000.
- Command reorganization: CRM and run tools moved to the Utils category.
- Prefix command UI: cleaner single-header styling.
