import fetch from 'node-fetch';
import axios from 'axios';
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
  name: 'fetch',
  aliases: ['get', 'web'],
  description: 'Fetches and displays information from a URL',
  run: async (context) => {
    const { client, m, prefix, botname } = context;
    const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

    const url = m.body.replace(new RegExp(`^${prefix}(fetch|get|url|web)\\s*`, 'i'), '').trim();

    if (!url) {
      return client.sendMessage(m.chat, {
        text: `╭───(    TOXIC-MD    )───\n├───≫ FETCH ≪───\n├ \n├ You forgot the URL, genius.\n├ Usage: ${prefix}fetch https://example.com\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      }, { quoted: fq });
    }

    let targetUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      targetUrl = 'https://' + url;
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();

        const responseData = {
          success: true,
          message: "JSON data fetched successfully",
          url: targetUrl,
          status: response.status,
          contentType: contentType,
          data: data,
          timestamp: new Date().toISOString()
        };

        if (JSON.stringify(responseData).length > 1500) {
          responseData.data = "[Data too large - sent as file]";
          
          await client.sendMessage(m.chat, {
            text: `╭───(    TOXIC-MD    )───\n├───≫ FETCH RESULT ≪───\n├ \n├ URL: ${targetUrl}\n├ Status: ${response.status}\n├ Type: JSON (too large, sent as file)\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
          }, { quoted: fq });

          await client.sendMessage(m.chat, {
            document: Buffer.from(JSON.stringify({
              success: true,
              message: "JSON data fetched successfully",
              url: targetUrl,
              status: response.status,
              contentType: contentType,
              data: data,
              timestamp: new Date().toISOString()
            }, null, 2)),
            mimetype: 'application/json',
            fileName: `fetch_result_${Date.now()}.json`
          }, { quoted: fq });
        } else {
          await client.sendMessage(m.chat, {
            text: `╭───(    TOXIC-MD    )───\n├───≫ FETCH RESULT ≪───\n├ \n├ URL: ${targetUrl}\n├ Status: ${response.status}\n├ Type: JSON\n├ \n${JSON.stringify(responseData, null, 2)}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
          }, { quoted: fq });
        }

      } else if (contentType.includes('text/html')) {
        const html = await response.text();

        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : 'No title found';

        await client.sendMessage(m.chat, {
          text: `╭───(    TOXIC-MD    )───\n├───≫ FETCH RESULT ≪───\n├ \n├ URL: ${targetUrl}\n├ Status: ${response.status}\n├ Type: HTML\n├ Title: ${title}\n├ Length: ${html.length} chars\n├ Preview: ${html.replace(/<[^>]*>/g, '').substring(0, 200).trim()}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        }, { quoted: fq });

      } else if (contentType.includes('text/plain')) {
        const text = await response.text();

        if (text.length > 1500) {
          await client.sendMessage(m.chat, {
            text: `╭───(    TOXIC-MD    )───\n├───≫ FETCH RESULT ≪───\n├ \n├ URL: ${targetUrl}\n├ Status: ${response.status}\n├ Type: Plain Text (too large, sent as file)\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
          }, { quoted: fq });

          await client.sendMessage(m.chat, {
            document: Buffer.from(text),
            mimetype: 'text/plain',
            fileName: `fetch_result_${Date.now()}.txt`
          }, { quoted: fq });
        } else {
          await client.sendMessage(m.chat, {
            text: `╭───(    TOXIC-MD    )───\n├───≫ FETCH RESULT ≪───\n├ \n├ URL: ${targetUrl}\n├ Status: ${response.status}\n├ Type: Plain Text\n├ Content:\n├ ${text}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
          }, { quoted: fq });
        }

      } else if (contentType.includes('image/')) {
        const imageBuffer = await response.buffer();

        await client.sendMessage(m.chat, {
          image: imageBuffer,
          caption: `╭───(    TOXIC-MD    )───\n├───≫ FETCH RESULT ≪───\n├ \n├ URL: ${targetUrl}\n├ Status: ${response.status}\n├ Type: Image\n├ Size: ${(imageBuffer.length / 1024).toFixed(2)} KB\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        }, { quoted: fq });

      } else {
        const data = await response.text();

        await client.sendMessage(m.chat, {
          text: `╭───(    TOXIC-MD    )───\n├───≫ FETCH RESULT ≪───\n├ \n├ URL: ${targetUrl}\n├ Status: ${response.status}\n├ Type: ${contentType}\n├ Length: ${data.length} chars\n├ Preview: ${data.length > 500 ? data.substring(0, 500) + "..." : data}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
        }, { quoted: fq });
      }

    } catch (error) {
    await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      console.error('Fetch command error:', error);

      let errorMessage = error.message;
      if (error.name === 'TimeoutError') {
        errorMessage = 'Request timed out after 30 seconds, you impatient fool';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Could not resolve the URL. That domain doesn\'t exist, genius.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused. Server is dead, like your brain cells.';
      }

      await client.sendMessage(m.chat, {
        text: `╭───(    TOXIC-MD    )───\n├───≫ FETCH FAILED ≪───\n├ \n├ ${errorMessage}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`
      }, { quoted: fq });
    }
  }
};
