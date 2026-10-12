import { sendHtmlView } from './WABuilder.js';

/**
 * Send an HTML mini-app bubble. Accepts any sock alias.
 * Usage:
 *   await sendHtml(sock, jid, html)
 *   await sendHtml(client, jid, html)
 *   await sendHtml(tox, jid, html, { quoted: m })
 */
export async function sendHtml(sockOrClient, jid, html, opts = {}) {
    if (!sockOrClient) throw new Error('sendHtml: socket/client is required');
    if (!jid) throw new Error('sendHtml: jid is required');
    if (html == null) throw new Error('sendHtml: html is required');

    const sock = sockOrClient;
    return sendHtmlView(sock, jid, String(html), opts);
}

export default sendHtml;
