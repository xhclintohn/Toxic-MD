import { encryptedStream, generateMessageIDV2, proto } from '@whiskeysockets/baileys';
import { unlink } from 'fs/promises';

export async function setGroupWallpaper(sock, jid, image, options = {}) {
    const media = Buffer.isBuffer(image)
        ? image
        : typeof image === 'string'
            ? { url: image }
            : image;

    const { mediaKey, encFilePath, fileSha256, fileEncSha256 } =
        await encryptedStream(media, 'chat-wallpaper-image', { logger: sock.logger });

    let directPath;
    try {
        const uploaded = await sock.waUploadToServer(encFilePath, {
            mediaType: 'chat-wallpaper-image',
            fileEncSha256B64: fileEncSha256.toString('base64'),
            timeoutMs: options.mediaUploadTimeoutMs
        });
        directPath = uploaded.directPath;
    } finally {
        await unlink(encFilePath).catch(() => {});
    }
    if (!directPath) throw new Error('wallpaper upload returned no directPath');

    const message = {
        protocolMessage: {
            type: proto.Message.ProtocolMessage.Type.CHAT_THEME_SETTING,
            chatThemeSetting: {
                settingTimestampMs: options.settingTimestampMs ?? Date.now(),
                customImage: {
                    directPath,
                    mediaKey,
                    fileEncSha256,
                    fileSha256,
                    dimLevel: options.dimLevel ?? 0
                }
            }
        }
    };

    const messageId = options.messageId || generateMessageIDV2(sock.user?.id);
    await sock.relayMessage(jid, message, {
        messageId,
        additionalAttributes: { type: 'media' }
    });
    return { key: { remoteJid: jid, fromMe: true, id: messageId }, message };
}
