# Changelog

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
