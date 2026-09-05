import { saveMessage, getMessage, deleteMessage, cleanupOldMsgStore } from '../database/config.js';

function cleanupOldMessages(maxAgeMs = 12 * 60 * 60 * 1000) {
    cleanupOldMsgStore(maxAgeMs);
}

export { saveMessage, getMessage, deleteMessage, cleanupOldMessages };
