"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");

// Menu command
zokou({ 
  nomCom: "help", 
  reaction: "📜", 
  nomFichier: __filename 
}, async (dest, zk, commandeOptions) => {
    const { repondre, ms } = commandeOptions;
    
    // Get current time
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    
    const menuMessage = `
       乂 ⌜𝙏𝙤𝙭𝙞𝙘-𝙈𝘿⌟  乂
     
   《 ██████████▒▒》80%

 ❃ 𝐎𝐰𝐧𝐞𝐫 : 𝐱𝐡_𝐜𝐥𝐢𝐧𝐭𝐨𝐧
 ❃ 𝐌𝐨𝐝𝐞 : public
 ❃⭐  
 ❃ 𝐑𝐀𝐌 : 34.74 GB/61.79 GB
  
  𝐓𝐎𝐗𝐈𝐂 𝐌𝐃 𝐂𝐌𝐃𝐒
꧁ *AI* ꧂  
> ᯤ  gpt  
> ᯤ  dalle  
> ᯤ  ai  
> ᯤ  toxic
╰═══════༈༈ 
꧁ *General* ꧂  
> ᯤ  owner  
> ᯤ  dev  
> ᯤ  support  
> ᯤ  alive  
> ᯤ  bible  
> ᯤ  poll  
> ᯤ  sc  
> ᯤ  menu  
> ᯤ  test  
> ᯤ  repo  
> ᯤ  git  
> ᯤ  script  
> ᯤ  ping  
> ᯤ  uptime  
> ᯤ  ss  
> ᯤ  vv
╰═══════༈༈ 
꧁ *Mods* ꧂  
> ᯤ  restart  
> ᯤ  left  
> ᯤ  testbug  
> ᯤ  telesticker  
> ᯤ  crew  
> ᯤ  left  
> ᯤ  join  
> ᯤ  jid  
> ᯤ  block  
> ᯤ  unblock  
> ᯤ  ban  
> ᯤ  bangroup  
> ᯤ  sudo  
> ᯤ  save  
> ᯤ  mention  
> ᯤ  reboot
╰═══════༈༈ 
꧁ *Fun* ꧂  
> ᯤ  ranime  
> ᯤ  profile  
> ᯤ  rank  
> ᯤ  toprank
╰═══════༈༈ 
꧁ *Search* ꧂  
> ᯤ  google  
> ᯤ  imdb  
> ᯤ  movie  
> ᯤ  define  
> ᯤ  lyrics  
> ᯤ  github  
> ᯤ  lyrics  
> ᯤ  stickersearch  
> ᯤ  weather
╰═══════༈༈ 
꧁ *Conversion* ꧂  
> ᯤ  emomix  
> ᯤ  sticker  
> ᯤ  scrop  
> ᯤ  take  
> ᯤ  write  
> ᯤ  photo  
> ᯤ  trt  
> ᯤ  url
╰═══════༈༈ 
꧁ *Audio-Edit* ꧂  
> ᯤ  deep  
> ᯤ  bass  
> ᯤ  reverse  
> ᯤ  slow  
> ᯤ  smooth  
> ᯤ  tempo  
> ᯤ  nightcore
╰═══════༈༈ 
꧁ *User* ꧂  
> ᯤ  fact  
> ᯤ  quotes
╰═══════༈༈ 
꧁ *Image-Edit* ꧂  
> ᯤ  shit  
> ᯤ  wasted  
> ᯤ  wanted  
> ᯤ  trigger  
> ᯤ  trash  
> ᯤ  rip  
> ᯤ  sepia  
> ᯤ  rainbow  
> ᯤ  hitler  
> ᯤ  invert  
> ᯤ  jail  
> ᯤ  affect  
> ᯤ  beautiful  
> ᯤ  blur  
> ᯤ  circle  
> ᯤ  facepalm  
> ᯤ  greyscale  
> ᯤ  joke
╰═══════༈༈ 
꧁ *Games* ꧂  
> ᯤ  riddle  
> ᯤ  chifumi  
> ᯤ  quizz
╰═══════༈༈ 
꧁ *Group* ꧂  
> ᯤ  welcome  
> ᯤ  goodbye  
> ᯤ  antipromote  
> ᯤ  antidemote  
> ᯤ  tagall  
> ᯤ  link  
> ᯤ  promote  
> ᯤ  demote  
> ᯤ  remove  
> ᯤ  del  
> ᯤ  info  
> ᯤ  antilink  
> ᯤ  antibot  
> ᯤ  group  
> ᯤ  gname  
> ᯤ  gdesc  
> ᯤ  gpp  
> ᯤ  hidetag  
> ᯤ  automute  
> ᯤ  autounmute  
> ᯤ  fkick  
> ᯤ  nsfw  
> ᯤ  kickall  
> ᯤ  onlyadmin  
> ᯤ  vcf
╰═══════༈༈ 
꧁ *Reaction* ꧂  
> ᯤ  bully  
> ᯤ  cuddle  
> ᯤ  cry  
> ᯤ  hug  
> ᯤ  awoo  
> ᯤ  kiss  
> ᯤ  lick  
> ᯤ  pat  
> ᯤ  smug  
> ᯤ  bonk  
> ᯤ  yeet  
> ᯤ  blush  
> ᯤ  smile  
> ᯤ  wave  
> ᯤ  highfive  
> ᯤ  handhold  
> ᯤ  nom  
> ᯤ  bite  
> ᯤ  glomp  
> ᯤ  slap  
> ᯤ  kill  
> ᯤ  kick  
> ᯤ  happy  
> ᯤ  wink  
> ᯤ  poke  
> ᯤ  dance  
> ᯤ  cringe
╰═══════༈༈ 
꧁ *Weeb* ꧂  
> ᯤ  waifu  
> ᯤ  neko  
> ᯤ  shinobu  
> ᯤ  megumin  
> ᯤ  cosplay  
> ᯤ  couplepp
╰═══════༈༈ 

◇            ◇

      ⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟⃟
  *𝐓𝐎𝐗𝐈𝐂 𝐓𝐄𝐂𝐇 *                                         
☠️⃰͜͡؜⃟𝐱╰══════════`;

    await zk.sendMessage(dest, { 
      text: menuMessage 
    }, { quoted: ms });
});