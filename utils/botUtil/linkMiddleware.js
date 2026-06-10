export default async (context, next) => {
    const { m, isBotAdmin } = context;

    if (!m.isGroup) {
        return m.reply(`╭─❏ 「 Gʀᴏᴜᴘ Oɴʟʏ」
│ This command only works in groups!\n│ Private chat? For this? Pathetic.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    if (!isBotAdmin) {
        return m.reply(`╭─❏ 「 Aᴅᴍɪɴ Rᴇϙᴜɪʀᴇᴅ」
│ I need admin rights to get the group link!\n│ Make me admin or watch me do nothing.\n╰───────────────\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    await next();
};