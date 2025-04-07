zokou({
  nomCom: "gpt",
  categorie: "AI",
  reaction: "🤖"
}, async (dest, zk, command) => {
  const { ms: m, repondre: reply, arg } = command;
  const text = arg.join(" ");

  if (!text) {
    return reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧 𝐟𝐨𝐫 𝐂𝐡𝐚𝐭𝐆𝐏𝐓.");
  }

  try {
    const apiUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data?.result?.prompt) {
      await reply(`

${data.result.prompt}
`);
    } else {
      reply("⚠️ *𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐟𝐫𝐨𝐦 𝐀𝐏𝐈*");
    }
  } catch (error) {
    console.error("GPT Error:", error);
    reply(`⚠️ *𝐀𝐈 𝐄𝐫𝐫𝐨𝐫*  
${error.message}`);
  }
});