const { zokou } = require("../framework/zokou");
const {getAllSudoNumbers,isSudoTableNotEmpty} = require("../bdd/sudo")
const conf = require("../set");

zokou({ nomCom: "owner", categorie: "General", reaction: "❣️" }, async (dest, zk, commandeOptions) => {
    const { ms , mybotpic } = commandeOptions;

  const thsudo = await isSudoTableNotEmpty()

  if (thsudo) {
     let msg = `╔════════════════╗
     ┃   *My Super-User*   ┃
     ╚════════════════╝

     ╔════════════════╗
     ┃  *Owner Number* ┃
     ╚════════════════╝
     
┣✦҈͜͡➣ @${conf.NUMERO_OWNER}

╔══════════════════════╗
┃   *Other Sudo Users*   ┃
╚══════════════════════╝`

 let sudos = await getAllSudoNumbers()
 // Keeping only first 2 sudo numbers
 sudos = sudos.slice(0, 2);

   for ( const sudo of sudos) {
    if (sudo) {
      sudonumero = sudo.replace(/[^0-9]/g, '');
      msg += `\n┣✦҈͜͡➣ @${sudonumero}`;
    } else {return}

   }   const ownerjid = conf.NUMERO_OWNER.replace(/[^0-9]/g) + "@s.whatsapp.net";
   const mentionedJid = sudos.concat([ownerjid])
   console.log(sudos);
   console.log(mentionedJid)
      zk.sendMessage(
        dest,
        {
          image : { url : mybotpic() },
          caption : msg,
          mentions : mentionedJid
        }
      )
  } else {
    const vcard =
        'BEGIN:VCARD\n' +
        'VERSION:3.0\n' +
        'FN:' + conf.OWNER_NAME + '\n' +
        'ORG:undefined;\n' +
        'TEL;type=CELL;type=VOICE;waid=' + conf.NUMERO_OWNER + ':+' + conf.NUMERO_OWNER + '\n' +
        'END:VCARD';
    zk.sendMessage(dest, {
        contacts: {
            displayName: conf.OWNER_NAME,
            contacts: [{ vcard }],
        },
    },{quoted:ms});
  }
});

zokou({ nomCom: "dev", categorie: "General", reaction: "💘" }, async (dest, zk, commandeOptions) => {
    const { ms, mybotpic } = commandeOptions;

    const devs = [
      { nom: "xhclinton", numero: "254735342808" },
      { nom: "᚛Toxic᚜", numero: "254799283147" }
      // Removed the third developer as requested
    ];

    let message = "╔══════════════════════════╗\n┃   WELCOME TO Toxic MD   ┃\n┃     HELP CENTER!       ┃\n╚══════════════════════════╝\n\nASK FOR HELP FROM OUR DEVELOPERS:\n\n";
    for (const dev of devs) {
      message += `╔════════════════╗\n┃ ✦ ${dev.nom} ✦ ┃\n╚════════════════╝\n☞ https://wa.me/${dev.numero}\n\n`;
    }
  var lien = mybotpic()
    if (lien.match(/\.(mp4|gif)$/i)) {
    try {
        zk.sendMessage(dest, { video: { url: lien }, caption:message }, { quoted: ms });
    }
    catch (e) {
        console.log("⚠️ Menu Error " + e);
        repondre("⚠️ Menu Error " + e);
    }
} 
else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
    try {
        zk.sendMessage(dest, { image: { url: lien }, caption:message }, { quoted: ms });
    }
    catch (e) {
        console.log("⚠️ Menu Error " + e);
        repondre("⚠️ Menu Error " + e);
    }
} 
else {
    repondre(lien)
    repondre("⚠️ Link Error");

}
});

zokou({ nomCom: "support", categorie: "General" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, auteurMessage, } = commandeOptions; 

  repondre(`╔══════════════════════════╗
┃ THANK YOU FOR CHOOSING ┃
┃        Toxic-MD       ┃
╚══════════════════════════╝

╔════════════════╗
┃  ☉ CHANNEL ☉  ┃
╚════════════════╝
❒ https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19

╔════════════════╗
┃   ☉ GROUP ☉   ┃
╚════════════════╝
❒ https://whatsapp.com/channel/0029VadQrNI8KM79BiHr3l

╔════════════════╗
┃  ☉ YOUTUBE ☉  ┃
╚════════════════╝
❒ https://www.youtube.com/@xh_clinton

╔════════════════╗
┃ *Created By*   ┃
┃   xhclinton    ┃
╚════════════════╝`) 
  await zk.sendMessage(auteurMessage,{text : `╔════════════════╗
┃ THANK YOU FOR  ┃
┃   CHOOSING     ┃
┃     Toxic      ┃
╚════════════════╝
`},{quoted :ms})

})