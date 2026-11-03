# Changelog

## 1.2.3

- Performance: per-chat message store capped at 500 messages instead of scaling with the global cache limit, and message-map trimming now runs at most once per 1000 inserts instead of scanning the whole map on every message.
- Performance: CRM store trimming no longer sorts all stored messages on every save, the in-memory message cap is 20000, and disk writes are coalesced to at most once every 3 minutes.
- Performance: plugin loading no longer rewrites every plugin file on every startup.
- Performance: LID-to-phone lookups that miss now remember the miss for 60 seconds instead of scanning the whole Session folder on every message, and the push-name and LID mapping caches are capped.
- Performance: the group list fetched on connect is reused for the sudo scan instead of fetching all groups a second time, and the Baileys version fetch now times out after 8 seconds instead of stalling startup.
- Stability: session loading now accepts the full compressed session bundle from the pairing site, including signal and app-state keys, while still accepting the old credentials-only session ID. Invalid session data no longer overwrites a working session.
- Dependencies: floating `latest` and `*` versions are pinned to their current stable releases, with no major-version changes and the Baileys fork unchanged.
