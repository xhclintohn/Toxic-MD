const MAX_CONTACTS = 4000;
const TRIM_TO     = 2500;
const MAX_MSGS_PER_CHAT = 50;
const MAX_MAP_ENTRIES   = 3000;

const makeStore = () => {
    const contacts   = {}
    const chats      = Object.create(null)
    const messageMap = Object.create(null)

    function trimContacts() {
        const keys = Object.keys(contacts);
        if (keys.length > MAX_CONTACTS) {
            const excess = keys.slice(0, keys.length - TRIM_TO);
            for (const k of excess) delete contacts[k];
        }
    }

    function trimMessageMap() {
        const keys = Object.keys(messageMap);
        if (keys.length > MAX_MAP_ENTRIES) {
            const excess = keys.slice(0, keys.length - Math.floor(MAX_MAP_ENTRIES * 0.6));
            for (const k of excess) delete messageMap[k];
        }
    }

    const bind = (ev) => {
        ev.on('messaging-history.set', ({ contacts: newContacts, messages: newMessages }) => {
            for (const contact of (newContacts || [])) {
                contacts[contact.id] = { ...(contacts[contact.id] || {}), ...contact }
            }
            trimContacts();

            if (Array.isArray(newMessages)) {
                for (const m of newMessages) {
                    if (!m?.key?.remoteJid || !m?.key?.id) continue;
                    const jid = m.key.remoteJid;
                    if (!chats[jid]) chats[jid] = [];
                    chats[jid].push(m);
                    if (chats[jid].length > MAX_MSGS_PER_CHAT) {
                        chats[jid] = chats[jid].slice(-MAX_MSGS_PER_CHAT);
                    }
                    messageMap[m.key.id] = { normalizedJid: jid };
                    trimMessageMap();
                }
            }
        })

        ev.on('contacts.upsert', (newContacts) => {
            for (const contact of newContacts) {
                contacts[contact.id] = { ...(contacts[contact.id] || {}), ...contact }
            }
            trimContacts();
        })

        ev.on('contacts.update', (updates) => {
            for (const update of updates) {
                if (contacts[update.id]) {
                    Object.assign(contacts[update.id], update)
                } else {
                    contacts[update.id] = update
                }
            }
        })

        ev.on('messages.upsert', ({ messages }) => {
            for (const m of (messages || [])) {
                if (!m?.key?.remoteJid || !m?.key?.id) continue;
                const jid = m.key.remoteJid;
                if (!chats[jid]) chats[jid] = [];
                chats[jid].push(m);
                if (chats[jid].length > MAX_MSGS_PER_CHAT) {
                    chats[jid] = chats[jid].slice(-MAX_MSGS_PER_CHAT);
                }
                messageMap[m.key.id] = { normalizedJid: jid };
                trimMessageMap();
            }
        })
    }

    const loadMessage = (jid, id) => {
        if (!jid || !id) return null
        const msgs = chats[jid]
        if (Array.isArray(msgs)) {
            const found = msgs.find(m => m?.key?.id === id)
            if (found) return found
        }
        const mapped = messageMap[id]
        if (mapped) {
            const mappedMsgs = chats[mapped.normalizedJid]
            if (Array.isArray(mappedMsgs)) {
                return mappedMsgs.find(m => m?.key?.id === id) || null
            }
        }
        return null
    }

    const getMessage = async (key) => {
        const msg = loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
    }

    const writeToFile = () => {}

    return {
        bind,
        contacts,
        chats,
        messageMap,
        loadMessage,
        getMessage,
        writeToFile,
    }
}

export { makeStore }
