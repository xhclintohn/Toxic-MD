const { zokou } = require("../framework/zokou");

zokou({
  nomCom: "xtest",
  categorie: "Fun",
  reaction: "🤓"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;

  // Array of 10+ realistic, casual replies with the fancy font for branding
  const replies = [
    "𝗛𝗲𝘆, 𝗜’𝗺 𝗷𝘂𝘀𝘁 𝘁𝗲𝘀𝘁𝗶𝗻𝗴 𝘁𝗵𝗶𝗻𝗴𝘀 𝗼𝘂𝘁! How’s your day going? 😊",
    "𝗢𝗼𝗵, 𝘆𝗼𝘂 𝘄𝗮𝗻𝘁 𝘁𝗼 𝘁𝗲𝘀𝘁 𝗺𝗲? I’m ready! What’s up? 🤔",
    "𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧 here! Just messing around with some test replies. You good? 😎",
    "𝗟𝗲𝘁’𝘀 𝘀𝗲𝗲… Yup, I’m working fine! How about you, what’s cooking? 🍳",
    "𝗧𝗲𝘀𝘁, 𝘁𝗲𝘀𝘁, 𝟭-𝟮-𝟯! Haha, just kidding—how’s my favorite user doing? 😉",
    "𝐓𝐨𝐱𝐢𝐜 𝐌𝐃 𝗰𝗵𝗲𝗰𝗸𝗶𝗻𝗴 𝗶𝗻! Everything’s running smoothly. What’s on your mind? 🧠",
    "𝗛𝗺𝗺, 𝗹𝗲𝘁’𝘀 𝘁𝗲𝘀𝘁 𝘁𝗵𝗶𝘀 𝗼𝘂𝘁… Yup, I’m still awesome! How about you? 😏",
    "𝗧𝗲𝘀𝘁𝗶𝗻𝗴 𝗺𝗼𝗱𝗲 𝗮𝗰𝘁𝗶𝘃𝗮𝘁𝗲𝗱! I’m feeling chatty today—how about you? 🗣️",
    "𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧’𝘀 𝗯𝗼𝘁 𝘀𝗮𝘆𝘀 𝗵𝗶! Just testing some replies. What’s up with you? 👋",
    "𝗜’𝗺 𝗱𝗼𝗶𝗻𝗴 𝗮 𝗾𝘂𝗶𝗰𝗸 𝘁𝗲𝘀𝘁—looks like I’m still the coolest bot around! What do you think? 😜",
    "𝗧𝗲𝘀𝘁 𝗿𝘂𝗻 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹! I’m here for you—how’s your day going? 🌟",
    "𝐓𝐨𝐱𝐢𝐜 𝐌𝐃 𝗶𝘀 𝗼𝗻𝗹𝗶𝗻𝗲 𝗮𝗻𝗱 𝘁𝗲𝘀𝘁𝗶𝗻𝗴! Got any fun ideas for me to try? 🤗",
    "𝗛𝗲𝘆, 𝗜’𝗺 𝗷𝘂𝘀𝘁 𝗽𝗹𝗮𝘆𝗶𝗻𝗴 𝗮𝗿𝗼𝘂𝗻𝗱 𝘄𝗶𝘁𝗵 𝘀𝗼𝗺𝗲 𝘁𝗲𝘀𝘁 𝗿𝗲𝗽𝗹𝗶𝗲𝘀! What’s new with you? 🫶"
  ];

  // Pick a random reply from the array
  const randomReply = replies[Math.floor(Math.random() * replies.length)];

  // Send the random reply
  repondre(randomReply);
});