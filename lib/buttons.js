import { generateWAMessageFromContent } from '@whiskeysockets/baileys';

class ButtonV2 {
    #client;

    constructor(client) {
        if (!client) throw new Error('Socket is required');
        this.#client = client;
        this._body = '';
        this._footer = '';
        this._title = '';
        this._subtitle = '';
        this._buttons = [];
    }

    setBody(body) {
        this._body = body;
        return this;
    }

    setFooter(footer) {
        this._footer = footer;
        return this;
    }

    addButton(displayText = '', buttonId = crypto.randomUUID()) {
        this._buttons.push({
            buttonId,
            buttonText: { displayText },
            type: 1,
        });
        return this;
    }

    async build(jid, { mentions, ...options } = {}) {
        const contextInfo = {};
        if (mentions?.length) contextInfo.mentionedJid = mentions;

        const msg = generateWAMessageFromContent(
            jid,
            {
                buttonsMessage: {
                    contentText: this._body,
                    footerText: this._footer,
                    headerType: 6,
                    locationMessage: {
                        degreesLatitude: 0,
                        degreesLongitude: 0,
                        name: this._title,
                        address: this._subtitle,
                        jpegThumbnail: null,
                    },
                    viewOnce: true,
                    contextInfo,
                    buttons: [...this._buttons],
                },
            },
            { ...options },
        );
        return msg;
    }

    async send(jid, { ...options } = {}) {
        if (this._buttons.length < 1) throw new Error('ButtonV2 requires at least one button');
        const msg = await this.build(jid, options);

        await this.#client.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id,
            additionalNodes: [
                {
                    tag: 'biz',
                    attrs: {},
                    content: [
                        {
                            tag: 'interactive',
                            attrs: { type: 'native_flow', v: '1' },
                            content: [
                                { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } },
                            ],
                        },
                    ],
                },
            ],
            ...options,
        });
        return msg;
    }
}

export { ButtonV2 };
