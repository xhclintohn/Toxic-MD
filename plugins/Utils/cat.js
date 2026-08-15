import { sendInteractive } from '../../lib/sendInteractive.js';

  const TEXT_EXT = new Set([
      'js','ts','mjs','cjs','jsx','tsx','py','rb','php','java','c','cpp','cs','go','rs','swift',
      'kt','kts','sh','bash','zsh','fish','ps1','bat','cmd','lua','r','scala','pl','pm','hs',
      'ex','exs','clj','vim','sql','graphql','gql','html','htm','xml','svg','json','yaml','yml',
      'toml','ini','cfg','conf','env','md','mdx','rst','txt','csv','tsv','log','diff','patch',
      'gitignore','dockerignore','editorconfig','lock','gradle','pom','properties','makefile'
  ]);

  const TEXT_MIME = new Set([
      'text/plain','text/html','text/css','text/csv','text/xml','text/markdown',
      'application/json','application/javascript','application/typescript',
      'application/xml','application/x-python','application/x-sh','application/x-yaml'
  ]);

  function looksLikeText(buf) {
      const sample = buf.slice(0, 512);
      let bad = 0;
      for (const b of sample) { if (b < 9 || (b > 13 && b < 32) || b === 127) bad++; }
      return bad / sample.length < 0.1;
  }

  function isTextFile(fileName, mime) {
      if (mime && TEXT_MIME.has(mime.split(';')[0].trim())) return true;
      if (fileName) { const ext = fileName.split('.').pop()?.toLowerCase(); if (ext && TEXT_EXT.has(ext)) return true; }
      return false;
  }

  const fmtErr = (msg) => `╭─❏ 「 CAT」\n│ ${msg}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

  export default {
      name: 'cat',
      aliases: ['rawfile','filecat','readfile','showfile','catfile','raw'],
      description: 'Show raw contents of a replied-to document or text file',
      run: async (context) => {
          const { client, m } = context;
          client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } }).catch(() => {});

          const q = m.quoted;
          if (!q) {
              client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
              return sendInteractive(client, m, fmtErr('Reply to a file, document, or text file to read its contents.'));
          }

          const mtype    = q.mtype || '';
          const fileName = q.msg?.fileName || q.msg?.documentMessage?.fileName || q.fileName || '';
          const mimetype = q.msg?.mimetype || q.msg?.documentMessage?.mimetype || q.mimetype || '';

          const isDoc = mtype === 'documentMessage'
              || mtype === 'documentWithCaptionMessage'
              || mtype.includes('document')
              || !!fileName
              || !!q.msg?.fileName;

          if (!isDoc) {
              client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
              return sendInteractive(client, m, fmtErr('Reply to a document or text file — not a regular message or media.'));
          }

          let buf;
          try {
              if (typeof q.download === 'function') {
                  buf = await q.download();
              }
          } catch {}

          if (!buf?.length) {
              try { buf = await client.downloadMediaMessage(q.msg || q); } catch {}
          }

          if (!buf?.length) {
              client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
              return sendInteractive(client, m, fmtErr('Could not download the file. It may have expired.'));
          }

          const textFile = isTextFile(fileName, mimetype) || looksLikeText(buf);
          if (!textFile) {
              client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
              return sendInteractive(client, m, fmtErr(`Binary file (${fileName || 'unknown'}) — can only read text files, code, JSON, etc.`));
          }

          const text = buf.toString('utf8');
          const MAX  = 3800;
          const out  = text.length > MAX ? text.slice(0, MAX) + `\n\n... [${text.length - MAX} more chars truncated]` : text;
          const ext  = fileName.split('.').pop()?.toLowerCase() || 'txt';
          const hdr  = `📄 *${fileName || 'file'} (${(buf.length / 1024).toFixed(1)} KB)*\n`;

          client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } }).catch(() => {});
          await client.sendMessage(m.chat, { text: hdr + '```' + ext + '\n' + out + '\n```' });
      }
  };
  