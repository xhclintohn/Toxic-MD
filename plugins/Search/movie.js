import { getFakeQuoted } from '../../lib/fakeQuoted.js';
  import axios from 'axios';
export default async (context) => {
  const { client, m, text } = context;
  const fq = getFakeQuoted(m);
  await client.sendMessage(m.chat, { react: { text: '⌛', key: m.reactKey } });

  if (!text) {
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.reactKey } }).catch(() => {});
      return m.reply("🚫 Please provide a movie name or TV show");
  }

  try {
    let fids = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${text}&plot=full`);
    let imdbt = "";

    imdbt += "╭───(    TOXIC-MD    )───\n";
    imdbt += "├ TOXIC-MD MOVIE SEARCH\n";
    imdbt += "╭───(    TOXIC-MD    )───\n";
    imdbt += "│ 🎬 Title       : " + fids.data.Title + "\n";
    imdbt += "│ 📅 Year        : " + fids.data.Year + "\n";
    imdbt += "│ ⭐ Rated       : " + fids.data.Rated + "\n";
    imdbt += "│ 📆 Released    : " + fids.data.Released + "\n";
    imdbt += "│ ⏳ Runtime     : " + fids.data.Runtime + "\n";
    imdbt += "│ 🌀 Genre       : " + fids.data.Genre + "\n";
    imdbt += "│ 👨‍💼 Director   : " + fids.data.Director + "\n";
    imdbt += "│ ✍️ Writer      : " + fids.data.Writer + "\n";
    imdbt += "│ 👥 Actors      : " + fids.data.Actors + "\n";
    imdbt += "│ 📜 Plot        : " + fids.data.Plot + "\n";
    imdbt += "│ 🌐 Language    : " + fids.data.Language + "\n";
    imdbt += "│ 🌍 Country     : " + fids.data.Country + "\n";
    imdbt += "│ 🏆 Awards      : " + fids.data.Awards + "\n";
    imdbt += "│ 💰 BoxOffice   : " + fids.data.BoxOffice + "\n";
    imdbt += "│ 🏭 Production  : " + fids.data.Production + "\n";
    imdbt += "│ 🌟 imdbRating  : " + fids.data.imdbRating + "\n";
    imdbt += "│ 🗳️ imdbVotes   : " + fids.data.imdbVotes + "\n";
    imdbt += "╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧";

    await client.sendMessage(
      m.chat,
      {
        image: {
          url: fids.data.Poster,
        },
        caption: imdbt,
      },
      { quoted: fq }
    );
  } catch (e) {
    m.reply("❌ I cannot find that movie\n\n" + e);
  }
};