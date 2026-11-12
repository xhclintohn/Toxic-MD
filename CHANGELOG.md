# Changelog

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
