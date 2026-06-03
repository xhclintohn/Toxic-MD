import fs from 'fs';
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';
  import path from 'path';
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const baileysBase = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Socket');
  const usyncPath = path.join(baileysBase, 'usync.js');

  if (fs.existsSync(usyncPath)) {
      let usync = fs.readFileSync(usyncPath, 'utf8');
      if (!usync.includes('__USYNC_TIMEOUT_PATCH__')) {
          const oldQuery = 'const result = await query(iq);';
          const newQuery = 'const result = await query(iq, 120000); /* __USYNC_TIMEOUT_PATCH__ */';
          if (usync.includes(oldQuery)) {
              usync = usync.replace(oldQuery, newQuery);
              fs.writeFileSync(usyncPath, usync);
              console.log('[patch-baileys] usync.js timeout increased to 120s');
          } else {
              console.log('[patch-baileys] usync.js anchor not found, no patch applied');
          }
      } else {
          console.log('[patch-baileys] usync.js already patched');
      }
  } else {
      console.log('[patch-baileys] usync.js not found, skipping');
  }

  const eventBufferPath = path.join(__dirname, 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Utils', 'event-buffer.js');

  if (fs.existsSync(eventBufferPath)) {
      let eventBuffer = fs.readFileSync(eventBufferPath, 'utf8');
      if (!eventBuffer.includes('const stringifyMessageKey = (key) => key ?')) {
          const oldFn = "const stringifyMessageKey = (key) => `${key.remoteJid},${key.id},${key.fromMe ? '1' : '0'}`;";
          const newFn = "const stringifyMessageKey = (key) => key ? `${key.remoteJid},${key.id},${key.fromMe ? '1' : '0'}` : `null,${Date.now()}-${Math.random().toString(36).slice(2)},0`;";
          if (eventBuffer.includes(oldFn)) {
              eventBuffer = eventBuffer.replace(oldFn, newFn);
              fs.writeFileSync(eventBufferPath, eventBuffer);
              console.log('[patch-baileys] event-buffer.js null key guard applied');
          } else {
              console.log('[patch-baileys] event-buffer.js anchor not found, no patch applied');
          }
      } else {
          console.log('[patch-baileys] event-buffer.js already patched');
      }
  } else {
      console.log('[patch-baileys] event-buffer.js not found, skipping');
  }

  console.log('[patch-baileys] Done');
  