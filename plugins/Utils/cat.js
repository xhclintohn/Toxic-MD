import { downloadContentFromMessage } from '@whiskeysockets/baileys';
  import { sendInteractive } from '../../lib/sendInteractive.js';

  const TEXT_EXTENSIONS = new Set([
    'js','ts','mjs','cjs','jsx','tsx','py','rb','php','java','c','cpp','cs','go','rs','swift',
    'kt','kts','sh','bash','zsh','fish','ps1','bat','cmd','lua','r','scala','pl','pm','hs',
    'ml','ex','exs','clj','cljs','edn','vim','sql','graphql','gql','html','htm','xml','svg',
    'json','yaml','yml','toml','ini','cfg','conf','env','md','mdx','rst','txt','csv','tsv',
    'log','diff','patch','gitignore','dockerignore','editorconfig','lock','gradle','pom'
  ]);

  const TEXT_MIMETYPES = new Set([
    'text/plain','text/html','text/css','text/csv','text/xml','text/markdown',
    'application/json','application/javascript','application/typescript',
    'application/xml','application/x-python','application/x-sh','application/x-yaml'
  ]);

  function isTextFile(fileName, mimetype) {
    if (mimetype && TEXT_MIMETYPES.has(mimetype.split(';')[0].trim())) return true;
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (ext && TEXT_EXTENSIONS.has(ext)) return true;
    }
    return false;
  }

  function looksLikeText(buf) {
    const sample = buf.slice(0, 512);
    let nonPrintable = 0;
    for (const byte of sample) {
      if (byte < 9 || (byte > 13 && byte < 32) || byte === 127) nonPrintable++;
    }
    return nonPrintable / sample.length < 0.1;
  }

  const fmt = (title, msg) => `╭─❏ 「 ${title}」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  export default {
    name: 'cat',
    aliases: ['rawfile','filecat','readfile','showfile','catfile','raw'],
    description: 'Show raw contents of a replied-to file or document',
    run: async (context) => {
      const { client, m } = context;
      client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

      const q = m.quoted || (m.message?.documentMessage ? m : null);
      if (!q) {
        client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('CAT', 'Reply to a file, document, or text file to read its raw contents.'));
      }

      const msgObj = q.message || q.msg || {};
      const doc = msgObj.documentMessage || msgObj.documentWithCaptionMessage?.message?.documentMessage
        || (q.mtype === 'documentMessage' ? q.msg : null);
      const fileName = doc?.fileName || q.fileName || 'unknown';
      const mimetype = doc?.mimetype || q.mimetype || '';

      const mediaKeys = ['documentMessage','imageMessage','videoMessage','audioMessage','pttMessage'];
      const mediaType = mediaKeys.find(k => msgObj[k]) || (q.mtype?.replace('Message','') + 'Message');
      const mediaMsg = msgObj[mediaType];

      if (!mediaMsg && !doc) {
        client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('CAT', 'Reply to a file or document — not a regular message.'));
      }

      let buf;
      try {
        const dlType = mediaType.replace('Message','').replace('documentWithCaption','document') || 'document';
        const stream = await downloadContentFromMessage(mediaMsg || doc, dlType);
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        buf = Buffer.concat(chunks);
      } catch {
        try {
          buf = await client.downloadMediaMessage(q);
        } catch (e) {
          client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
          return sendInteractive(client, m, fmt('CAT', 'Could not download the file. Try again.'));
        }
      }

      if (!buf?.length) {
        client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('CAT', 'Downloaded file is empty.'));
      }

      const textFile = isTextFile(fileName, mimetype) || looksLikeText(buf);

      if (!textFile) {
        client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
        return sendInteractive(client, m, fmt('CAT', `Binary file (${fileName}) — cannot display raw binary content. Use a text/code file.`));
      }

      const text = buf.toString('utf8');
      const MAX = 4000;
      const output = text.length > MAX ? text.slice(0, MAX) + `\n\n... [${text.length - MAX} more chars truncated]` : text;
      const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';
      const header = `📄 ${fileName} (${(buf.length / 1024).toFixed(1)} KB)\n`;

      client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
      await client.sendMessage(m.chat, {
        text: header + '```' + ext + '\n' + output + '\n```'
      });
    }
  };
  