import axios from 'axios';

export default {
    name: 'tinyurl',
    aliases: ['shortlink', 'short'],
    description: 'Shorten URLs with TinyURL',
    run: async (context) => {
        const { client, m, text } = context;
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const formatStylishReply = (message) => {
            return `╭─❏ 「 TINYURL 」\n│ ${message}\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;
        };

        if (!text) {
            return client.sendMessage(m.chat, {
                text: formatStylishReply("You forgot the URL, genius. 🤦🏻\nExample: .shorten https://github.com/xhclintohn/Toxic-MD")
            });
        }

        let url = text.trim();
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        try {
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

            const encodedUrl = encodeURIComponent(url);
            let shortUrl = '';
            let responseTime = 'N/A';
            const started = Date.now();

            try {
                const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodedUrl}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                    timeout: 15000
                });
                const body = String(response.data || '').trim();
                if (!/^https?:\/\/tinyurl\.com\//i.test(body)) throw new Error('TinyURL returned invalid response');
                shortUrl = body;
            } catch {
                const response = await axios.get(`https://is.gd/create.php?format=simple&url=${encodedUrl}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                    timeout: 15000
                });
                const body = String(response.data || '').trim();
                if (!/^https?:\/\//i.test(body)) throw new Error('Shortener returned invalid response');
                shortUrl = body;
            }
            responseTime = `${Date.now() - started}ms`;

            await client.sendMessage(m.chat, { react: { text: '✅', key: m.reactKey } });

            await client.sendMessage(m.chat, {
                interactiveMessage: {
                    header: `✅ URL SHORTENED SUCCESSFULLY`,
                    title: `Original URL:\n${url}\n\nShortened URL:\n${shortUrl}\n\nResponse Time: ${responseTime}`,
                    buttons: [
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "📋 Copy Short URL",
                                id: "copy_shorturl",
                                copy_code: shortUrl
                            })
                        },
                        {
                            name: "cta_copy",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🌐 Open in Browser",
                                id: "open_url",
                                copy_code: shortUrl
                            })
                        }
                    ]
                }
            });

        } catch (error) {
            console.error('Shorten error:', error);
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } });

            let errorMessage = "Failed to shorten URL, your link is probably trash. ";
            
            if (error.response?.status === 400) {
                errorMessage += "Invalid URL format. 🔗";
            } else if (error.response?.status === 429) {
                errorMessage += "Rate limit exceeded. Try again later. ⏳";
            } else if (error.message.includes('timeout')) {
                errorMessage += "API timeout, your link is too heavy. ⏱️";
            } else if (error.message.includes('ENOTFOUND')) {
                errorMessage += "Can't reach API server. 🌐";
            } else if (error.message.includes('Invalid response')) {
                errorMessage += "API returned garbage. 🗑️";
            } else {
                errorMessage += `Error: ${error.message}`;
            }

            await client.sendMessage(m.chat, {
                text: formatStylishReply(errorMessage)
            });
        }
    } };