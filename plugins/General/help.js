import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { getFakeQuoted } from '../../lib/fakeQuoted.js';

export default {
    name: 'help',
    aliases: ['h', 'usage', 'howto'],
    description: 'Shows help and usage for a specific command',
    run: async (context) => {
        const { client, m, args, prefix } = context;
        const fq = getFakeQuoted(m);
        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

        const effectivePrefix = prefix || '.';

        const fmt = (title, body) =>
            `╭───(    TOXIC-MD    )───\n├───≫ ${title} ≪───\n├ \n${body}\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`;

        if (!args || args.length === 0) {
            const pluginsDir = path.join(__dirname, '..');
            const categories = fs.readdirSync(pluginsDir).filter(f => fs.statSync(path.join(pluginsDir, f)).isDirectory());
            let allCommands = [];
            for (const cat of categories) {
                const files = fs.readdirSync(path.join(pluginsDir, cat)).filter(f => f.endsWith('.js'));
                for (const file of files) {
                    allCommands.push(file.replace('.js', ''));
                }
            }
            allCommands.sort();

            const body = allCommands.map(cmd => `├ *${effectivePrefix}${cmd}*`).join('\n');
            await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });
            return await client.sendMessage(m.chat, {
                text: fmt('ALL COMMANDS', `├ Total: ${allCommands.length} commands\n├ Use *${effectivePrefix}help <command>* for usage\n├ \n${body}`)
            }, { quoted: fq });
        }

        const cmdName = args[0].toLowerCase().replace(/^\./, '');

        const helpData = {
            waifu: { usage: `${effectivePrefix}waifu`, desc: 'Get a random anime waifu image. Aliases: animegirl, waifupic' },
            neko: { usage: `${effectivePrefix}neko`, desc: 'Get a random neko (catgirl) image. Aliases: catgirl, nekopic' },
            husbando: { usage: `${effectivePrefix}husbando`, desc: 'Get a random husbando image. Aliases: animeguy, husbandopic' },
            maid: { usage: `${effectivePrefix}maid`, desc: 'Get a random anime maid image.' },
            uniform: { usage: `${effectivePrefix}uniform`, desc: 'Get a random anime uniform image.' },
            glossysilver: { usage: `${effectivePrefix}glossysilver <text>`, desc: 'Generate glossy silver 3D text (max 50 chars).' },
            glitchtext: { usage: `${effectivePrefix}glitchtext <text>`, desc: 'Generate digital glitch text effect.' },
            advancedglow: { usage: `${effectivePrefix}advancedglow <text>`, desc: 'Generate advanced glowing text.' },
            neonglitch: { usage: `${effectivePrefix}neonglitch <text>`, desc: 'Generate neon glitch text effect.' },
            gradienttext: { usage: `${effectivePrefix}gradienttext <text>`, desc: 'Generate 3D gradient text.' },
            glowingtext: { usage: `${effectivePrefix}glowingtext <text>`, desc: 'Generate glowing text effect.' },
            luxurygold: { usage: `${effectivePrefix}luxurygold <text>`, desc: 'Generate luxury gold text.' },
            multicolored: { usage: `${effectivePrefix}multicolored <text>`, desc: 'Generate multicolored neon text.' },
            galaxytext: { usage: `${effectivePrefix}galaxytext <text>`, desc: 'Generate galaxy style text wallpaper.' },
            makingneon: { usage: `${effectivePrefix}makingneon <text>`, desc: 'Generate royal neon text.' },
            writetext: { usage: `${effectivePrefix}writetext <text>`, desc: 'Generate wet glass text effect.' },
            underwater: { usage: `${effectivePrefix}underwater <text>`, desc: 'Generate 3D underwater text.' },
            pixelglitch: { usage: `${effectivePrefix}pixelglitch <text>`, desc: 'Generate pixel glitch text.' },
            summerbeach: { usage: `${effectivePrefix}summerbeach <text>`, desc: 'Generate summer beach text.' },
            papercut: { usage: `${effectivePrefix}papercut <text>`, desc: 'Generate 3D paper cut text.' },
            cloudtext: { usage: `${effectivePrefix}cloudtext <text>`, desc: 'Generate text in clouds effect.' },
            gradientlogo: { usage: `${effectivePrefix}gradientlogo <text>`, desc: 'Generate 3D gradient logo.' },
            galaxylogo: { usage: `${effectivePrefix}galaxylogo <text>`, desc: 'Generate galaxy style logo.' },
            colorfulneon: { usage: `${effectivePrefix}colorfulneon <text>`, desc: 'Generate colorful neon text.' },
            greenneon: { usage: `${effectivePrefix}greenneon <text>`, desc: 'Generate green neon text.' },
            '1917text': { usage: `${effectivePrefix}1917text <text>`, desc: 'Generate 1917 war style text.' },
            texteffect: { usage: `${effectivePrefix}texteffect <text>`, desc: 'Generate 3D hologram text effect.' },
            lighteffect: { usage: `${effectivePrefix}lighteffect <text>`, desc: 'Generate green light effect text.' },
            bearlogo: { usage: `${effectivePrefix}bearlogo <text>`, desc: 'Generate a bear mascot logo.' },
            typography: { usage: `${effectivePrefix}typography <text>`, desc: 'Generate typography pavement text.' },
            hackerneon: { usage: `${effectivePrefix}hackerneon <text>`, desc: 'Generate hacker cyan neon text.' },
            blackpinklogo: { usage: `${effectivePrefix}blackpinklogo <text>`, desc: 'Generate Blackpink style logo.' },
            blackpinkstyle: { usage: `${effectivePrefix}blackpinkstyle <text>`, desc: 'Generate Blackpink style text.' },
            erasertext: { usage: `${effectivePrefix}erasertext <text>`, desc: 'Generate eraser deleting text effect.' },
            cartoonstyle: { usage: `${effectivePrefix}cartoonstyle <text>`, desc: 'Generate cartoon graffiti text.' },
            sora: { usage: `${effectivePrefix}sora <description>`, desc: 'Generate a cinematic AI image scene. Aliases: soraai, aifilm' },
            menu: { usage: `${effectivePrefix}menu`, desc: 'Shows the main interactive menu with all categories.' },
            fullmenu: { usage: `${effectivePrefix}fullmenu`, desc: 'Shows all commands listed by category.' },
            help: { usage: `${effectivePrefix}help [command]`, desc: 'Shows help/usage for all or a specific command.' },
            ping: { usage: `${effectivePrefix}ping`, desc: 'Check the bot response speed/latency.' },
            alive: { usage: `${effectivePrefix}alive`, desc: 'Check if the bot is online and running.' },
            uptime: { usage: `${effectivePrefix}uptime`, desc: 'Shows how long the bot has been running.' },
            settings: { usage: `${effectivePrefix}settings`, desc: 'View current bot settings.' },
            mode: { usage: `${effectivePrefix}mode <public|private|sudo>`, desc: 'Change the bot mode. Public = everyone, Private = owner only, Sudo = sudo users too.' },
            prefix: { usage: `${effectivePrefix}prefix <newprefix>`, desc: 'Change the command prefix.' },
            presence: { usage: `${effectivePrefix}presence <online|offline|typing|recording>`, desc: 'Set the bot presence status in private chats.' },
            autoread: { usage: `${effectivePrefix}autoread <on|off>`, desc: 'Auto read private messages.' },
            autoview: { usage: `${effectivePrefix}autoview <on|off>`, desc: 'Auto view status updates.' },
            autolike: { usage: `${effectivePrefix}autolike <on|off>`, desc: 'Auto like/react to status updates.' },
            autobio: { usage: `${effectivePrefix}autobio <on|off>`, desc: 'Auto update bio with current time.' },
            anticall: { usage: `${effectivePrefix}anticall <on|off>`, desc: 'Auto reject incoming calls and ban caller.' },
            antilink: { usage: `${effectivePrefix}antilink <delete|remove|off>`, desc: 'Per-group antilink. delete = warn & delete, remove = kick sender, off = disabled. Must be in a group.' },
            antitag: { usage: `${effectivePrefix}antitag <on|off>`, desc: 'Per-group antitag. Removes members who mass-tag others. Must be in a group.' },
            antistatusmention: { usage: `${effectivePrefix}antistatusmention <delete|remove|off>`, desc: 'Per-group anti status mention. delete = delete & warn, remove = kick, off = disabled. Must be in a group.' },
            antidelete: { usage: `${effectivePrefix}antidelete <on|off>`, desc: 'Forward deleted messages to your DM.' },
            antiedit: { usage: `${effectivePrefix}antiedit <on|off>`, desc: 'Forward original message when someone edits.' },
            antidemote: { usage: `${effectivePrefix}antidemote <on|off>`, desc: 'Per-group: re-promote admins if someone demotes them.' },
            antipromote: { usage: `${effectivePrefix}antipromote <on|off>`, desc: 'Per-group: prevent unauthorized promotions.' },
            antiforeign: { usage: `${effectivePrefix}antiforeign <on|off>`, desc: 'Remove non-local phone numbers from the group.' },
            autoai: { usage: `${effectivePrefix}autoai <on|off>`, desc: 'Enable AI auto-reply in DMs and when mentioned in groups. AI can also execute bot commands intelligently.' },
            chatbotpm: { usage: `${effectivePrefix}chatbotpm <on|off>`, desc: 'Enable AI chatbot in private messages (same as autoai).' },
            toxicai: { usage: `${effectivePrefix}toxicai <on|off>`, desc: 'Enable ToxicAgent (GitHub AI assistant) for the developer.' },
            gcpresence: { usage: `${effectivePrefix}gcpresence <on|off>`, desc: 'Set typing/recording presence in groups.' },
            events: { usage: `${effectivePrefix}events <on|off>`, desc: 'Toggle group join/leave event messages.' },
            stickerwm: { usage: `${effectivePrefix}stickerwm <packname>`, desc: 'Set custom sticker watermark/packname.' },
            ban: { usage: `${effectivePrefix}ban @user`, desc: 'Ban a user from using the bot.' },
            unban: { usage: `${effectivePrefix}unban @user`, desc: 'Unban a previously banned user.' },
            banlist: { usage: `${effectivePrefix}banlist`, desc: 'View all banned users.' },
            addsudo: { usage: `${effectivePrefix}addsudo @user`, desc: 'Add a sudo/trusted user.' },
            delsudo: { usage: `${effectivePrefix}delsudo @user`, desc: 'Remove a sudo user.' },
            checksudo: { usage: `${effectivePrefix}checksudo`, desc: 'List all sudo users.' },
            sticker: { usage: `${effectivePrefix}sticker`, desc: 'Convert image/video/gif to sticker. Reply to media.' },
            toimg: { usage: `${effectivePrefix}toimg`, desc: 'Convert sticker to image. Reply to sticker.' },
            tovid: { usage: `${effectivePrefix}tovid`, desc: 'Convert sticker/gif to video. Reply to media.' },
            togif: { usage: `${effectivePrefix}togif`, desc: 'Convert video to GIF.' },
            tts: { usage: `${effectivePrefix}tts <text>`, desc: 'Convert text to speech audio.' },
            tr: { usage: `${effectivePrefix}tr <lang> <text>`, desc: 'Translate text. Example: .tr es Hello World' },
            ytmp3: { usage: `${effectivePrefix}ytmp3 <url|title>`, desc: 'Download YouTube audio as MP3.' },
            ytmp4: { usage: `${effectivePrefix}ytmp4 <url|title>`, desc: 'Download YouTube video as MP4.' },
            yts: { usage: `${effectivePrefix}yts <query>`, desc: 'Search YouTube for videos.' },
            tikdl: { usage: `${effectivePrefix}tikdl <url>`, desc: 'Download TikTok video without watermark.' },
            tikaudio: { usage: `${effectivePrefix}tikaudio <url>`, desc: 'Download TikTok audio.' },
            igdl: { usage: `${effectivePrefix}igdl <url>`, desc: 'Download Instagram post/reel.' },
            fbdl: { usage: `${effectivePrefix}fbdl <url>`, desc: 'Download Facebook video.' },
            twtdl: { usage: `${effectivePrefix}twtdl <url>`, desc: 'Download Twitter/X video.' },
            spotify: { usage: `${effectivePrefix}spotify <song name>`, desc: 'Search and download Spotify track.' },
            alldl: { usage: `${effectivePrefix}alldl <url>`, desc: 'Universal media downloader.' },
            play: { usage: `${effectivePrefix}play <song name>`, desc: 'Search and play a song.' },
            song: { usage: `${effectivePrefix}song <title>`, desc: 'Download a song by title.' },
            image: { usage: `${effectivePrefix}image <query>`, desc: 'Search for images.' },
            video: { usage: `${effectivePrefix}video <query>`, desc: 'Search for videos.' },
            gpt: { usage: `${effectivePrefix}gpt <prompt>`, desc: 'Chat with GPT AI.' },
            gemini: { usage: `${effectivePrefix}gemini <prompt>`, desc: 'Chat with Google Gemini AI.' },
            groq: { usage: `${effectivePrefix}groq <prompt>`, desc: 'Chat with Groq AI (fast).' },
            darkgpt: { usage: `${effectivePrefix}darkgpt <prompt>`, desc: 'Chat with DarkGPT (no restrictions).' },
            imagine: { usage: `${effectivePrefix}imagine <prompt>`, desc: 'Generate AI images from text.' },
            sora: { usage: `${effectivePrefix}sora <prompt>`, desc: 'Generate AI video from text.' },
            remini: { usage: `${effectivePrefix}remini`, desc: 'Enhance/upscale an image. Reply to image.' },
            vision: { usage: `${effectivePrefix}vision <question>`, desc: 'Ask AI about an image. Reply to image with question.' },
            transcribe: { usage: `${effectivePrefix}transcribe`, desc: 'Transcribe audio to text. Reply to audio.' },
            tagall: { usage: `${effectivePrefix}tagall [message]`, desc: 'Tag all group members with optional message.' },
            hidetag: { usage: `${effectivePrefix}hidetag [message]`, desc: 'Tag all members silently (hidden mention).' },
            promote: { usage: `${effectivePrefix}promote @user`, desc: 'Make a group member admin.' },
            demote: { usage: `${effectivePrefix}demote @user`, desc: 'Remove admin from a group member.' },
            remove: { usage: `${effectivePrefix}remove @user`, desc: 'Remove/kick a member from the group.' },
            add: { usage: `${effectivePrefix}add <number>`, desc: 'Add a member to the group.' },
            open: { usage: `${effectivePrefix}open`, desc: 'Open the group to all members.' },
            close: { usage: `${effectivePrefix}close`, desc: 'Close the group (admins only).' },
            link: { usage: `${effectivePrefix}link`, desc: 'Get the group invite link.' },
            revoke: { usage: `${effectivePrefix}revoke`, desc: 'Reset the group invite link.' },
            groupmeta: { usage: `${effectivePrefix}groupmeta`, desc: 'Show group metadata/info.' },
            gpp: { usage: `${effectivePrefix}gpp`, desc: 'Get group profile picture.' },
            gstatus: { usage: `${effectivePrefix}gstatus <text>`, desc: 'Set group description.' },
            listonline: { usage: `${effectivePrefix}listonline`, desc: 'List online members in group.' },
            requests: { usage: `${effectivePrefix}requests`, desc: 'View pending join requests.' },
            'approve-all': { usage: `${effectivePrefix}approve-all`, desc: 'Approve all pending join requests.' },
            'reject-all': { usage: `${effectivePrefix}reject-all`, desc: 'Reject all pending join requests.' },
            foreigners: { usage: `${effectivePrefix}foreigners`, desc: 'List non-local phone numbers in group.' },
            xkill: { usage: `${effectivePrefix}xkill`, desc: 'Kick all non-admin members from the group.' },
            google: { usage: `${effectivePrefix}google <query>`, desc: 'Search Google.' },
            wiki: { usage: `${effectivePrefix}wiki <query>`, desc: 'Search Wikipedia.' },
            github: { usage: `${effectivePrefix}github <username>`, desc: 'Get GitHub user profile.' },
            lyrics: { usage: `${effectivePrefix}lyrics <song name>`, desc: 'Get song lyrics.' },
            movie: { usage: `${effectivePrefix}movie <title>`, desc: 'Get movie info.' },
            npm: { usage: `${effectivePrefix}npm <package>`, desc: 'Get NPM package info.' },
            wallpaper: { usage: `${effectivePrefix}wallpaper <query>`, desc: 'Search wallpapers.' },
            stickersearch: { usage: `${effectivePrefix}stickersearch <query>`, desc: 'Search sticker packs.' },
            weather: { usage: `${effectivePrefix}weather <city>`, desc: 'Get weather info for a city.' },
            dev: { usage: `${effectivePrefix}dev`, desc: 'Get developer contact info.' },
            support: { usage: `${effectivePrefix}support`, desc: 'Get support group link.' },
            script: { usage: `${effectivePrefix}script`, desc: 'Get the bot script/source code link.' },
            credits: { usage: `${effectivePrefix}credits`, desc: 'Show bot credits.' },
            pair: { usage: `${effectivePrefix}pair <number>`, desc: 'Pair bot with a WhatsApp number.' },
            update: { usage: `${effectivePrefix}update`, desc: 'Check for bot updates on Heroku.' },
            setvar: { usage: `${effectivePrefix}setvar <KEY> <VALUE>`, desc: 'Set a Heroku config var.' },
            getvar: { usage: `${effectivePrefix}getvar <KEY>`, desc: 'Get a Heroku config var.' },
            allvar: { usage: `${effectivePrefix}allvar`, desc: 'List all Heroku config vars.' },
            eval: { usage: `${effectivePrefix}eval <code>`, desc: 'Execute JavaScript code (owner only).' },
            shell: { usage: `${effectivePrefix}shell <command>`, desc: 'Execute shell commands (owner only).' },
            restart: { usage: `${effectivePrefix}restart`, desc: 'Restart the bot (owner only).' },
            broadcast: { usage: `${effectivePrefix}broadcast <message>`, desc: 'Broadcast a message to all chats.' },
            botgc: { usage: `${effectivePrefix}botgc`, desc: 'List all groups the bot is in.' },
            joingc: { usage: `${effectivePrefix}joingc <link>`, desc: 'Make bot join a group via invite link.' },
            leavegc: { usage: `${effectivePrefix}leavegc`, desc: 'Make bot leave the current group.' },
            block: { usage: `${effectivePrefix}block @user`, desc: 'Block a user.' },
            unblock: { usage: `${effectivePrefix}unblock @user`, desc: 'Unblock a user.' },
            profile: { usage: `${effectivePrefix}profile @user`, desc: 'View a user profile/info.' },
            screenshot: { usage: `${effectivePrefix}screenshot <url>`, desc: 'Take a screenshot of a website.' },
            shorten: { usage: `${effectivePrefix}shorten <url>`, desc: 'Shorten a long URL.' },
            tinyurl: { usage: `${effectivePrefix}tinyurl <url>`, desc: 'Shorten URL using TinyURL.' },
            checkid: { usage: `${effectivePrefix}checkid <group link|channel link>`, desc: 'Get the ID from a group or channel link.' },
            privacy: { usage: `${effectivePrefix}privacy <setting> <value>`, desc: 'Manage WhatsApp privacy settings.' },
            lastseen: { usage: `${effectivePrefix}lastseen <on|off>`, desc: 'Toggle last seen visibility.' },
            mypp: { usage: `${effectivePrefix}mypp`, desc: 'View your own profile picture.' },
            mystatus: { usage: `${effectivePrefix}mystatus <text>`, desc: 'Set your WhatsApp status/about.' },
            online: { usage: `${effectivePrefix}online <on|off>`, desc: 'Toggle online status.' },
            groupadd: { usage: `${effectivePrefix}groupadd <on|off>`, desc: 'Control who can add the bot to groups.' },
            del: { usage: `${effectivePrefix}del`, desc: 'Delete a message. Reply to the message to delete.' },
            retrieve: { usage: `${effectivePrefix}retrieve`, desc: 'Retrieve/reveal a view-once message.' },
            fetch: { usage: `${effectivePrefix}fetch <url>`, desc: 'Fetch data from a URL.' },
            upload: { usage: `${effectivePrefix}upload`, desc: 'Upload media to get a URL. Reply to media.' },
            mediafire: { usage: `${effectivePrefix}mediafire <url>`, desc: 'Download from Mediafire.' },
            apk: { usage: `${effectivePrefix}apk <app name>`, desc: 'Download an APK.' },
            gitclone: { usage: `${effectivePrefix}gitclone <url>`, desc: 'Clone a GitHub repository.' },
            pinterest: { usage: `${effectivePrefix}pinterest <query>`, desc: 'Search Pinterest images.' },
            shazam: { usage: `${effectivePrefix}shazam`, desc: 'Identify a song from audio. Reply to audio.' },
            carbon: { usage: `${effectivePrefix}carbon <code>`, desc: 'Generate a Carbon code image.' },
            encrypt: { usage: `${effectivePrefix}encrypt <text>`, desc: 'Encrypt text.' },
            'run-js': { usage: `${effectivePrefix}run-js <code>`, desc: 'Run JavaScript code.' },
            'run-py': { usage: `${effectivePrefix}run-py <code>`, desc: 'Run Python code.' },
            hentai: { usage: `${effectivePrefix}hentai`, desc: 'NSFW content (18+ groups only).' },
            xvideos: { usage: `${effectivePrefix}xvideos <query>`, desc: 'NSFW content search (18+ groups only).' },
            vvx: { usage: `${effectivePrefix}vvx`, desc: 'View view-once messages. Reply to view-once.' },
            hug: { usage: `${effectivePrefix}hug @user`, desc: 'Send a hug anime GIF to a user.' },
            kiss: { usage: `${effectivePrefix}kiss @user`, desc: 'Send a kiss anime GIF to a user.' },
            slap: { usage: `${effectivePrefix}slap @user`, desc: 'Send a slap anime GIF to a user.' },
            pat: { usage: `${effectivePrefix}pat @user`, desc: 'Send a pat anime GIF to a user.' },
            blush: { usage: `${effectivePrefix}blush`, desc: 'Send a blushing anime image.' },
            smug: { usage: `${effectivePrefix}smug`, desc: 'Send a smug anime image.' },
            shinobu: { usage: `${effectivePrefix}shinobu`, desc: 'Get a random Shinobu image.' },
            miko: { usage: `${effectivePrefix}miko`, desc: 'Get a random miko anime image.' },
            kitsune: { usage: `${effectivePrefix}kitsune`, desc: 'Get a random kitsune anime image.' },
            oppai: { usage: `${effectivePrefix}oppai`, desc: 'NSFW: random oppai image (18+ groups only).' },
            waifu: { usage: `${effectivePrefix}waifu`, desc: 'Get a random anime waifu image.' },
            neko: { usage: `${effectivePrefix}neko`, desc: 'Get a random neko (catgirl) image.' },
            husbando: { usage: `${effectivePrefix}husbando`, desc: 'Get a random husbando image.' },
            maid: { usage: `${effectivePrefix}maid`, desc: 'Get a random anime maid image.' },
            uniform: { usage: `${effectivePrefix}uniform`, desc: 'Get a random anime uniform image.' },
            advice: { usage: `${effectivePrefix}advice`, desc: 'Get a random piece of advice.' },
            catfact: { usage: `${effectivePrefix}catfact`, desc: 'Get a random cat fact.' },
            fact: { usage: `${effectivePrefix}fact`, desc: 'Get a random fact.' },
            quote: { usage: `${effectivePrefix}quote`, desc: 'Get a random inspirational quote.' },
            joke: { usage: `${effectivePrefix}joke`, desc: 'Get a random joke.' },
            coinflip: { usage: `${effectivePrefix}coinflip`, desc: 'Flip a coin — heads or tails.' },
            dice: { usage: `${effectivePrefix}dice`, desc: 'Roll a dice.' },
            calc: { usage: `${effectivePrefix}calc <expression>`, desc: 'Calculate a math expression. Example: .calc 2+2*5' },
            country: { usage: `${effectivePrefix}country <name>`, desc: 'Get info about a country.' },
            alay: { usage: `${effectivePrefix}alay <text>`, desc: 'Convert text to alay style.' },
            afk: { usage: `${effectivePrefix}afk [reason]`, desc: 'Set AFK status. Bot will auto-reply when someone mentions you.' },
            warn: { usage: `${effectivePrefix}warn @user`, desc: 'Warn a group member. Removes them on reaching warn limit.' },
            poll: { usage: `${effectivePrefix}poll <question|option1|option2>`, desc: 'Create a poll in the group.' },
            pin: { usage: `${effectivePrefix}pin`, desc: 'Pin a message. Reply to the message to pin.' },
            xkill: { usage: `${effectivePrefix}xkill`, desc: 'Kick all non-admin members from the group (owner only).' },
            foreigners: { usage: `${effectivePrefix}foreigners`, desc: 'List members with non-local phone numbers in group.' },
            gstatus: { usage: `${effectivePrefix}gstatus <text>`, desc: 'Set the group description/status.' },
            qr: { usage: `${effectivePrefix}qr <text>`, desc: 'Generate a QR code from text or URL.' },
            password: { usage: `${effectivePrefix}password <length>`, desc: 'Generate a random secure password.' },
            base64: { usage: `${effectivePrefix}base64 <text>`, desc: 'Encode text to Base64.' },
            stt: { usage: `${effectivePrefix}stt`, desc: 'Speech to text. Reply to a voice note to transcribe it.' },
            telesticker: { usage: `${effectivePrefix}telesticker`, desc: 'Download a Telegram sticker pack.' },
            bilibili: { usage: `${effectivePrefix}bilibili <url>`, desc: 'Download video from Bilibili.' },
            capcut: { usage: `${effectivePrefix}capcut <url>`, desc: 'Download a CapCut template video.' },
            snackvideo: { usage: `${effectivePrefix}snackvideo <url>`, desc: 'Download from Snack Video.' },
            soundcloud: { usage: `${effectivePrefix}soundcloud <query>`, desc: 'Search and download from SoundCloud.' },
            threads: { usage: `${effectivePrefix}threads <url>`, desc: 'Download Threads (Meta) video/image.' },
            video: { usage: `${effectivePrefix}video <query>`, desc: 'Search and send a YouTube video.' },
            yt: { usage: `${effectivePrefix}yt <query>`, desc: 'YouTube search. Alias for yts.' },
            reaction: { usage: `${effectivePrefix}reaction <on|off>`, desc: 'Toggle auto reactions to messages.' },
            multiprefix: { usage: `${effectivePrefix}multiprefix <on|off>`, desc: 'Enable multiple command prefixes (., !, #, /, etc).' },
            startmessage: { usage: `${effectivePrefix}startmessage <on|off>`, desc: 'Toggle the bot greeting message on start.' },
            stealth: { usage: `${effectivePrefix}stealth <on|off>`, desc: 'Stealth mode — bot only responds to owner, hides from everyone else.' },
            toanime: { usage: `${effectivePrefix}toanime`, desc: 'Convert an image to anime art style. Reply to image.' },
            aicode: { usage: `${effectivePrefix}aicode <lang> <prompt>`, desc: 'Generate code using AI. Example: .aicode python fibonacci' },
            codegen: { usage: `${effectivePrefix}codegen <description>`, desc: 'Generate code from a description using AI.' },
            darkgpt: { usage: `${effectivePrefix}darkgpt <prompt>`, desc: 'Uncensored AI chat (DarkGPT). Use responsibly.' },
            sora: { usage: `${effectivePrefix}sora <description>`, desc: 'Generate an AI scene/image from a cinematic description.' },
            logogen: { usage: `${effectivePrefix}logogen <title|idea|slogan>`, desc: 'Generate a logo image using AI.' },
            rip: { usage: `${effectivePrefix}rip`, desc: 'Generate a RIP/tombstone image. Reply to a user or image.' },
            trigger: { usage: `${effectivePrefix}trigger`, desc: 'Generate a "TRIGGERED" meme. Reply to image.' },
            trash: { usage: `${effectivePrefix}trash`, desc: 'Put someone in the trash. Reply to image or user.' },
            wanted: { usage: `${effectivePrefix}wanted`, desc: 'Generate a wanted poster. Reply to image.' },
            wasted: { usage: `${effectivePrefix}wasted`, desc: 'Generate a GTA wasted screen. Reply to image.' },
            emix: { usage: `${effectivePrefix}emix <emoji>`, desc: 'Mix two emojis together.' },
            removebg: { usage: `${effectivePrefix}removebg`, desc: 'Remove background from an image. Reply to image.' },
            brat: { usage: `${effectivePrefix}brat <text>`, desc: 'Generate a brat-style text image.' },
            bratvid: { usage: `${effectivePrefix}bratvid <text>`, desc: 'Generate a brat-style text video.' },
            inspectweb: { usage: `${effectivePrefix}inspectweb <url>`, desc: 'Inspect/analyze a website URL.' },
            broadcast: { usage: `${effectivePrefix}broadcast <message>`, desc: 'Broadcast a message to all chats (owner only).' },
            autolikeemoji: { usage: `${effectivePrefix}autolikeemoji <emoji|random>`, desc: 'Set the emoji used for auto-liking statuses.' },
            requests: { usage: `${effectivePrefix}requests`, desc: 'View pending join requests in the group.' },
            'approve-all': { usage: `${effectivePrefix}approve-all`, desc: 'Approve all pending join requests.' },
            'reject-all': { usage: `${effectivePrefix}reject-all`, desc: 'Reject all pending join requests.' },
              canvas: { usage: `${effectivePrefix}canvas Title | type | text | watermark`, desc: 'Generate a themed canvas card from a replied image. Types: spotify, youtube, google, tiktok, duckduckgo, brave, applemusic, soundcloud, pinterest, playstore, happymod, apkpure, unsplash, wallpaper, wattpad, weather, sticker, lyrics, shazam, web, image. Aliases: canvascard, spotifycard, youtubecard, tiktokcard' },
              canvascard: { usage: `${effectivePrefix}canvas Title | type | text | watermark`, desc: 'Alias for canvas — themed canvas card generator.' },
              spotifycard: { usage: `${effectivePrefix}canvas Title | spotify | text | watermark`, desc: 'Alias for canvas with spotify type.' },
              remini: { usage: `${effectivePrefix}remini`, desc: 'Enhance and upscale a replied image using AI. Reply to an image. Aliases: hd, enhance, upscale' },
              hd: { usage: `${effectivePrefix}hd`, desc: 'Alias for remini — AI image enhancement.' },
              enhance: { usage: `${effectivePrefix}enhance`, desc: 'Alias for remini — AI image enhancement.' },
              upscale: { usage: `${effectivePrefix}upscale`, desc: 'Alias for remini — AI image upscaling.' },
              imgedit: { usage: `${effectivePrefix}imgedit <prompt>`, desc: 'AI-edit a replied image using a text prompt. E.g: .imgedit make it look like anime. Aliases: imageedit, aiedit, editimg' },
              imageedit: { usage: `${effectivePrefix}imgedit <prompt>`, desc: 'Alias for imgedit — AI image editing via prompt.' },
              aiedit: { usage: `${effectivePrefix}aiedit <prompt>`, desc: 'Alias for imgedit — AI image editing.' },
              rc: { usage: `${effectivePrefix}rc <prompt>`, desc: 'Generate an AI image from a text prompt. E.g: .rc a futuristic city at night. Aliases: imagine, texttoimage, tti' },
              imagine: { usage: `${effectivePrefix}imagine <prompt>`, desc: 'Alias for rc — AI image generation.' },
              tti: { usage: `${effectivePrefix}tti <prompt>`, desc: 'Alias for rc — text-to-image.' },
              aisong: { usage: `${effectivePrefix}aisong <description>`, desc: 'Generate an AI-created song from a description. E.g: .aisong a sad lofi song about loneliness. Aliases: gensong, makesong' },
              gensong: { usage: `${effectivePrefix}gensong <description>`, desc: 'Alias for aisong — AI song generation.' },
              makesong: { usage: `${effectivePrefix}makesong <description>`, desc: 'Alias for aisong — AI song generator.' },
              allow: { usage: `${effectivePrefix}allow add|remove|list [@user]`, desc: 'Owner only. Manage the bot whitelist. Sub-commands: add @user — add to whitelist, remove @user — remove, list — show all allowed users.' },
            device: { usage: `${effectivePrefix}device <android|ios|default>`, desc: 'Set the button display mode. android/default = select-list buttons; ios = text-only responses (no buttons). Owner only.' },
            setdevice: { usage: `${effectivePrefix}setdevice <android|ios|default>`, desc: 'Alias for device — set button display mode.' },
            devicemode: { usage: `${effectivePrefix}devicemode <android|ios|default>`, desc: 'Alias for device — set button display mode.' },
            platform: { usage: `${effectivePrefix}platform <android|ios|default>`, desc: 'Alias for device — set button display mode.' },
            script: { usage: `${effectivePrefix}script`, desc: 'Shows the bot\'s GitHub repository link. Aliases: repo, source, github-src' },
            repo: { usage: `${effectivePrefix}repo`, desc: 'Alias for script — shows the GitHub repo link.' },
            up: { usage: `${effectivePrefix}up`, desc: 'Alias for uptime — check how long the bot has been running.' },
            p: { usage: `${effectivePrefix}p`, desc: 'Alias for ping — checks the bot response speed.' },
            m: { usage: `${effectivePrefix}m`, desc: 'Alias for menu — shows the interactive command menu.' },
            h: { usage: `${effectivePrefix}h [command]`, desc: 'Alias for help — show help for all or a specific command.' },
            logomenu: { usage: `${effectivePrefix}logomenu`, desc: 'Shows all available logo and effects text commands. Aliases: effectsmenu, effectslist, logolist' },
            effectsmenu: { usage: `${effectivePrefix}effectsmenu`, desc: 'Alias for logomenu — shows all effects commands.' },
            autolikeemoji: { usage: `${effectivePrefix}autolikeemoji <emoji|random>`, desc: 'Set which emoji is used when auto-liking status updates.' },
            promoteall: { usage: `${effectivePrefix}promoteall`, desc: 'Promote all group members to admin at once (owner only).' },
            demoteall: { usage: `${effectivePrefix}demoteall`, desc: 'Demote all group admins (owner only).' },
            listonline: { usage: `${effectivePrefix}listonline`, desc: 'List all currently online members in a group. Aliases: whoonline, activemembers' },
            hidetag: { usage: `${effectivePrefix}hidetag [message]`, desc: 'Tag all members silently with a hidden mention. No one sees the tag bubble.' },
            blocklist: { usage: `${effectivePrefix}blocklist`, desc: 'Show all blocked contacts. Aliases: listblock, lb' },
            dev: { usage: `${effectivePrefix}dev`, desc: 'Shows developer info and contact.' },
            credits: { usage: `${effectivePrefix}credits`, desc: 'Shows bot credits and contributors.' },
        };

        if (helpData[cmdName]) {
            const info = helpData[cmdName];
            const body = `├ 📌 *Command:* ${cmdName}\n├ 📖 *Usage:* ${info.usage}\n├ ℹ️ *Description:*\n├ ${info.desc}`;
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
            return await client.sendMessage(m.chat, { text: fmt(`HELP: ${cmdName.toUpperCase()}`, body) }, { quoted: fq });
        }

        const pluginsDir = path.join(__dirname, '..');
        const categories = fs.readdirSync(pluginsDir).filter(f => fs.statSync(path.join(pluginsDir, f)).isDirectory());
        let found = false;
        for (const cat of categories) {
            const files = fs.readdirSync(path.join(pluginsDir, cat)).filter(f => f.endsWith('.js'));
            if (files.includes(cmdName + '.js')) {
                found = true;
                const body = `├ 📌 *Command:* ${cmdName}\n├ 📁 *Category:* ${cat}\n├ 📖 *Usage:* ${effectivePrefix}${cmdName}\n├ ℹ️ No detailed help available for this command yet.`;
                await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
                return await client.sendMessage(m.chat, { text: fmt(`HELP: ${cmdName.toUpperCase()}`, body) }, { quoted: fq });
            }
        }

        if (!found) {
            await client.sendMessage(m.chat, {
                text: fmt('HELP', `├ ❌ Command "*${cmdName}*" not found.\n├ Use *${effectivePrefix}help* to list all commands.`)
            }, { quoted: fq });
        }
    }
};
