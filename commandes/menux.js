const { zokou } = require("../framework/zokou");

module.exports = {
    nomCom: "menu",
    categorie: "General",
    reaction: "📜",

    async execute(dest, zk, { repondre }) {
        try {
            const menuText = `
乂 ⌜𝙏𝙤𝙭𝙞𝙘-𝙈𝘿⌟ 乂

《 ██████████▒▒》80%

❃ 𝐎𝐰𝐧𝐞𝐫 : 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
❃ 𝐌𝐨𝐝𝐞 : public
❃⭐
❃ 𝐓𝐢𝐦𝐞 : ${new Date().toLocaleTimeString()}  
❃ 𝐑𝐀𝐌 : 34.74 GB/61.79 GB

𝐓𝐎𝐗𝐈𝐂 𝐌𝐃 𝐂𝐌𝐃𝐒😸
꧁ *AI* ꧂  
> ᯤ gpt  
> ᯤ dalle  
> ᯤ ai  
> ᯤ toxic
╰═══════༈༈ 
꧁ *General* ꧂  
> ᯤ owner  
> ᯤ dev  
> ᯤ support  
> ᯤ alive  
> ᯤ bible  
> ᯤ poll  
> ᯤ sc  
> ᯤ menu  
> ᯤ test  
> ᯤ repo  
> ᯤ git  
> ᯤ script  
> ᯤ ping  
> ᯤ uptime  
> ᯤ ss  
> ᯤ vv
╰═══════༈༈ 
꧁ *Mods* ꧂  
> ᯤ restart  
> ᯤ left  
> ᯤ testbug  
> ᯤ telesticker  
> ᯤ crew  
> ᯤ left  
> ᯤ join  
> ᯤ jid  
> ᯤ block  
> ᯤ unblock  
> ᯤ ban  
> ᯤ bangroup  
> ᯤ sudo  
> ᯤ save  
> ᯤ mention  
> ᯤ reboot
╰═══════༈༈ 
[CONTINUED WITH ALL YOUR OTHER COMMAND CATEGORIES...]

◇ ◇

⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟
*𝐓𝐎𝐗𝐈𝐂 𝐓𝐄𝐂𝐇*                                         
☠️⃰͜͡؜⃟𝐱╰══════════`;

            await repondre(menuText);
        } catch (error) {
            console.error("Menu command error:", error);
            await repondre("❌ Error displaying menu");
        }
    }
};