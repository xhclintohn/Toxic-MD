const { tlang, ringtone, cmd,fetchJson, sleep, botpic,ffmpeg, getBuffer, pinterest, prefix, Config } = require('../lib')
const { mediafire } = require("../lib/mediafire.js");
const googleTTS = require("google-tts-api");
const ytdl = require('ytdl-secktor')
const fs = require('fs-extra')
var videotime = 60000 // 1000 min
var dlsize = 1000 // 1000mb
//---------------------------------------------------------------------------

cmd({

            pattern: "settings",           
            desc: "(setting list).",
            category: "_help",
            react: "⚙️",
            filename: __filename,
            use: '<text>',

        },

        async (Void,citel,text,{isCreator}) => {
       if(!isCreator) return citel.reply(tlang().owner);
        let buttons = [{

                    buttonId: `${prefix}system`,
                    buttonText: {
                    displayText: "System",
                    },

                    type: 1,
                },
                  {
                    buttonId: `${prefix}ping`,
                    buttonText: {
                    displayText: "Ping",

                    },
                    type: 1,
                },
            ];
            let buttonMessage = {
                image: {
                    url: 'https://telegra.ph/file/a6b9bbde7feaa92c69c7b.jpg',
                },

                caption: `

*⦁──🎃𝙎𝙀𝙏𝙏𝙄𝙉𝙂 𝙇𝙄𝙎𝙏📍──⦁*

1♻️➣ To put Antilink type :
Eg:- .setvar ANTILINK:false

2♻️➣ To on/off Auto reaction type :
Eg:- .setvar AUTO_REACTION:false/true

3♻️➣ To on/off Auto read status type : 
Eg:- .setvar AUTO_READ_STATUS:false/true

4♻️➣ To on/off Auto status save type :
Eg:- .setvar AUTO_STATUS_SAVER:false/true

5♻️➣ To on/off heroku type :
Eg:- .setvar heroku:false/true

6♻️➣ To put Heroku api key type :
Eg:- .setvar HEROKU_API_KEY:put api key

7♻️➣ To put Heroku app name type :
Eg:- .setvar HEROKU_APP_NAME:put app name

8♻️➣ To on/off Auto reaction type :
Eg:- .setvar HEROKU_API_KEY:put api key

9♻️➣ To on/off Auto reaction type :
Eg:- .setvar HEROKU_API_KEY:put api key

10♻️➣ To on/off Level up message type :
Eg:- .setvar LEVEL_UP_MESSAGE:false/true

11♻️➣ To put Mongodb url type :
Eg:- .setvar MONGODB_URI:put mongodb url

12♻️➣ To put Open api key type :
Eg:- .setvar OPENAI_API_KEY:put open api key

13♻️➣ To put Owner name type :
Eg:- .setvar OWNER_NUMBER:put any name

14♻️➣ To put Owner number type :
Eg:- .setvar OWNER_NUMBER:92xxxxxxxx

15♻️➣ To put Pack info type :
Eg:- .setvar PACK_INFO:put any name

16♻️➣ To put prefix type :
Eg:- .setvar PREFIX:.

17♻️➣ To on/off Auto Read message type :
Eg:- .setvar READ_MESSAGE:false/true

18♻️➣ To put thumb image type :
Eg:- .set THUMB_IMAGE:put image url

19♻️➣ To public/privert  type :
Eg:- .setvar WORKTYPE:public/private


©𝙂𝙀𝙉𝙀𝙍𝘼𝙏𝙀𝘿 𝘽𝙔 𝙏𝙊𝙓𝙄𝘾-𝙈𝘿
`,

                footer: tlang().footer,
                headerType: 4,
            };
            return Void.sendMessage(citel.chat, buttonMessage, {
                quoted: citel,
            });
        }
    )
