zokou({
    nomCom: "bot",  /
    categorie: "General",
    reaction: "🤖" 
}, async (dest, zk, commandeOptions) => {
    const { repondre } = commandeOptions;
    
   
    const fancyResponse = `
𝐇𝐞𝐥𝐥𝐨! 𝐇𝐨𝐰 𝐜𝐚𝐧 𝐈 𝐡𝐞𝐥𝐩🙂🤚🏻
    
> ✗𝗗
    `;
    
    await repondre(fancyResponse);
});