zokou({
  nomCom: "gpt",
  categorie: "AI",
  reaction: "🤖"
}, async (dest, zk, command) => {
  const { ms, repondre, arg } = command;

  if (!arg || arg.length === 0) {
    return repondre("𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧 𝐟𝐨𝐫 𝐂𝐡𝐚𝐭𝐆𝐏𝐓.\n𝐄𝐱𝐚𝐦𝐩𝐥𝐞: !𝐠𝐩𝐭 𝐇𝐨𝐰 𝐝𝐨𝐞𝐬 𝐩𝐡𝐨𝐭𝐨𝐬𝐲𝐧𝐭𝐡𝐞𝐬𝐢𝐬 𝐰𝐨𝐫𝐤?");
  }

  try {
    const question = arg.join(" ");
    const apiUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(question)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

    const data = await response.json();
    
    if (!data?.result?.prompt) {
      return repondre("⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐟𝐨𝐫𝐦𝐚𝐭 𝐟𝐫𝐨𝐦 𝐀𝐏𝐈");
    }

    await repondre(`🤖 *𝐓𝐨𝐱𝐢𝐜-𝐌𝐃 𝐀𝐈 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞*:\n\n${data.result.prompt}\n\n👑 *𝐎𝐰𝐧𝐞𝐫: 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧*`);

  } catch (error) {
    console.error("GPT Command Error:", error);
    repondre(`⚠️ *𝐄𝐫𝐫𝐨𝐫*:\n${error.message}\n\n𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.`);
  }
});