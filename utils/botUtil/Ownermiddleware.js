const Ownermiddleware = async (context, next) => {
    const { m, Owner } = context;

    if (!Owner) {
        return m.reply(`╭───(    TOXIC-MD    )───\n├───≫ Aᴄᴄᴇss Dᴇɴɪᴇᴅ ≪───\n├ \n├ You dare use an Owner command?\n├ Your mere existence insults\n├ my code. Crawl back to the\n├ abyss where mediocrity thrives.\n╰──────────────────☉\n> ©𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧`);
    }

    await next();
};

export default Ownermiddleware;
