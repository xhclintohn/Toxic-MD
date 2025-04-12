const axios = require("axios");
const { zokou } = require("../framework/zokou");
const traduire = require("../framework/traduction");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

zokou({
  nomCom: "anime",
  categorie: "Fun",
  reaction: "📺"
},
async (origineMessage, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;

  const jsonURL = "https://api.jikan.moe/v4/random/anime";

  try {
    const response = await axios.get(jsonURL);
    const data = response.data.data;

    const title = data.title;
    const synopsis = data.synopsis;
    const imageUrl = data.images.jpg.image_url;
    const episodes = data.episodes;
    const status = data.status;

    const message = `📺 𝗧𝗶𝘁𝗹𝗲: ${title}\n🎬 𝗘𝗽𝗶𝘀𝗼𝗱𝗲𝘀: ${episodes}\n📡 𝗦𝘁𝗮𝘁𝘂𝘀: ${status}\n📝 𝗦𝘆𝗻𝗼𝗽𝘀𝗶𝘀: ${synopsis}\n🔗 𝗨𝗥𝗟: ${data.url}`;
    
    zk.sendMessage(origineMessage, { image: { url: imageUrl }, caption: message }, { quoted: ms });
  } catch (error) {
    console.error('Error fetching anime data:', error);
    repondre('Oops, something went wrong while fetching the anime data. Try again later!');
  }
});

zokou({
  nomCom: "google",
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre } = commandeOptions;
  
  if (!arg[0] || arg === "") {
    repondre("Hey, I need a search query to work with! Try something like: .google What is a bot?");
    return;
  }

  const google = require('google-it');
  try {
    const results = await google({ query: arg.join(" ") });
    let msg = `𝗚𝗼𝗼𝗴𝗹𝗲 𝗦𝗲𝗮𝗿𝗰𝗵 𝗳𝗼𝗿: ${arg.join(" ")}\n\n`;

    for (let result of results) {
      msg += `➣ 𝗧𝗶𝘁𝗹𝗲: ${result.title}\n`;
      msg += `➣ 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${result.snippet}\n`;
      msg += `➣ 𝗟𝗶𝗻𝗸: ${result.link}\n\n────────────────────────\n\n`;
    }
    
    repondre(msg);
  } catch (error) {
    repondre("Something broke while searching on Google. Let’s try again later!");
  }
});

zokou({
  nomCom: "imdb",
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms } = commandeOptions;

  if (!arg[0] || arg === "") {
    repondre("I need the name of a movie or series to search for! Like: .imdb The Matrix");
    return;
  }

  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${arg}&plot=full`);
    const imdbData = response.data;

    let imdbInfo = "⚍⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚍\n";
    imdbInfo += " ``` 𝗜𝗠𝗗𝗕 𝗦𝗘𝗔𝗥𝗖𝗛 ```\n";
    imdbInfo += "⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎\n";
    imdbInfo += "🎬 𝗧𝗶𝘁𝗹𝗲: " + imdbData.Title + "\n";
    imdbInfo += "📅 𝗬𝗲𝗮𝗿: " + imdbData.Year + "\n";
    imdbInfo += "⭐ 𝗥𝗮𝘁𝗶𝗻𝗴: " + imdbData.Rated + "\n";
    imdbInfo += "📆 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱: " + imdbData.Released + "\n";
    imdbInfo += "⏳ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: " + imdbData.Runtime + "\n";
    imdbInfo += "🌀 𝗚𝗲𝗻𝗿𝗲: " + imdbData.Genre + "\n";
    imdbInfo += "👨🏻‍💻 𝗗𝗶𝗿𝗲𝗰𝘁𝗼𝗿: " + imdbData.Director + "\n";
    imdbInfo += "✍ 𝗪𝗿𝗶𝘁𝗲𝗿𝘀: " + imdbData.Writer + "\n";
    imdbInfo += "👨 𝗔𝗰𝘁𝗼𝗿𝘀: " + imdbData.Actors + "\n";
    imdbInfo += "📃 𝗣𝗹𝗼𝘁: " + imdbData.Plot + "\n";
    imdbInfo += "🌐 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲: " + imdbData.Language + "\n";
    imdbInfo += "🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆: " + imdbData.Country + "\n";
    imdbInfo += "🎖️ 𝗔𝘄𝗮𝗿𝗱𝘀: " + imdbData.Awards + "\n";
    imdbInfo += "📦 𝗕𝗼𝘅 𝗢𝗳𝗳𝗶𝗰𝗲: " + imdbData.BoxOffice + "\n";
    imdbInfo += "🏙️ 𝗣𝗿𝗼𝗱𝘂𝗰𝘁𝗶𝗼𝗻: " + imdbData.Production + "\n";
    imdbInfo += "🌟 𝗦𝗰𝗼𝗿𝗲: " + imdbData.imdbRating + "\n";
    imdbInfo += "❎ 𝗜𝗠𝗗𝗕 𝗩𝗼𝘁𝗲𝘀: " + imdbData.imdbVotes + "";

    zk.sendMessage(dest, {
      image: {
        url: imdbData.Poster,
      },
      caption: imdbInfo,
    }, {
      quoted: ms,
    });
  } catch (error) {
    repondre("Sorry, something went wrong while searching IMDb. Try again later!");
  }
});

zokou({
  nomCom: "movie",
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms } = commandeOptions;

  if (!arg[0] || arg === "") {
    repondre("I need the name of a movie or series to search for! Like: .movie The Matrix");
    return;
  }

  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${arg}&plot=full`);
    const imdbData = response.data;

    let imdbInfo = "Tap the link to join our movie channel on Telegram and download movies: https://t.me/moviebox_free_movie_download\n";
    imdbInfo += " ``` 𝗧𝗼𝘅𝗶𝗰 𝗠𝗗 𝗙𝗶𝗹𝗺𝘀 ```\n";
    imdbInfo += "𝗠𝗮𝗱𝗲 𝗯𝘆 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧\n";
    imdbInfo += "🎬 𝗧𝗶𝘁𝗹𝗲: " + imdbData.Title + "\n";
    imdbInfo += "📅 𝗬𝗲𝗮𝗿: " + imdbData.Year + "\n";
    imdbInfo += "⭐ 𝗥𝗮𝘁𝗶𝗻𝗴: " + imdbData.Rated + "\n";
    imdbInfo += "📆 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱: " + imdbData.Released + "\n";
    imdbInfo += "⏳ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: " + imdbData.Runtime + "\n";
    imdbInfo += "🌀 𝗚𝗲𝗻𝗿𝗲: " + imdbData.Genre + "\n";
    imdbInfo += "👨🏻‍💻 𝗗𝗶𝗿𝗲𝗰𝘁𝗼𝗿: " + imdbData.Director + "\n";
    imdbInfo += "✍ 𝗪𝗿𝗶𝘁𝗲𝗿𝘀: " + imdbData.Writer + "\n";
    imdbInfo += "👨 𝗔𝗰𝘁𝗼𝗿𝘀: " + imdbData.Actors + "\n";
    imdbInfo += "📃 𝗣𝗹𝗼𝘁: " + imdbData.Plot + "\n";
    imdbInfo += "🌐 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲: " + imdbData.Language + "\n";
    imdbInfo += "🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆: " + imdbData.Country + "\n";
    imdbInfo += "🎖️ 𝗔𝘄𝗮𝗿𝗱𝘀: " + imdbData.Awards + "\n";
    imdbInfo += "📦 𝗕𝗼𝘅 𝗢𝗳𝗳𝗶𝗰𝗲: " + imdbData.BoxOffice + "\n";
    imdbInfo += "🏙️ 𝗣𝗿𝗼𝗱𝘂𝗰𝘁𝗶𝗼𝗻: " + imdbData.Production + "\n";
    imdbInfo += "🌟 𝗦𝗰𝗼𝗿𝗲: " + imdbData.imdbRating + "\n";
    imdbInfo += "❎ 𝗜𝗠𝗗𝗕 𝗩𝗼𝘁𝗲𝘀: " + imdbData.imdbVotes + "";

    zk.sendMessage(dest, {
      image: {
        url: imdbData.Poster,
      },
      caption: imdbInfo,
    }, {
      quoted: ms,
    });
  } catch (error) {
    repondre("Oops, something went wrong while searching for the movie. Try again later!");
  }
});

zokou({
  nomCom: "emojimix",
  categorie: "Conversion"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms, nomAuteurMessage } = commandeOptions;

  if (!arg[0] || arg.length !== 1) {
    repondre("Hey, that’s not how you use this! Try: .emojimix 😀;🥰");
    return;
  }

  const emojis = arg.join(' ').split(';');

  if (emojis.length !== 2) {
    repondre("You need to give me two emojis with a ';' between them, like: 😀;🥰");
    return;
  }

  const emoji1 = emojis[0].trim();
  const emoji2 = emojis[1].trim();

  try {
    const response = await axios.get(`https://levanter.onrender.com/emix?q=${emoji1}${emoji2}`);

    if (response.data.status === true) {
      let stickerMess = new Sticker(response.data.result, {
        pack: nomAuteurMessage,
        type: StickerTypes.CROPPED,
        categories: ["🤩", "🎉"],
        id: "12345",
        quality: 70,
        background: "transparent",
      });
      const stickerBuffer2 = await stickerMess.toBuffer();
      zk.sendMessage(dest, { sticker: stickerBuffer2 }, { quoted: ms });
    } else {
      repondre("I couldn’t mix those emojis. Maybe try a different pair?");
    }
  } catch (error) {
    repondre(`Something went wrong while mixing the emojis: ${error.message}`);
  }
});