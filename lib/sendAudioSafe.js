function safeFileName(name, ext = 'mp3') {
  const base = String(name || 'audio')
    .replace(/[^\w\s\-\.\(\)\[\]]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'audio';
  return base.toLowerCase().endsWith(`.${ext}`) ? base : `${base}.${ext}`;
}

export async function sendAudioSafe(client, jid, buffer, {
  title = 'audio',
  quoted = null,
  caption = '',
  mimetype = 'audio/mpeg'
} = {}) {
  const fileName = safeFileName(title, 'mp3');

  if (caption) {
    await client.sendMessage(jid, { text: caption }, quoted ? { quoted } : {});
  }

  await client.sendMessage(
    jid,
    {
      audio: buffer,
      mimetype,
      ptt: false,
      fileName
    },
    quoted ? { quoted } : {}
  );
}

export default sendAudioSafe;
