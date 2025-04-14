const { zokou } = require("../framework/zokou");
const axios = require('axios');
const cheerio = require('cheerio');
let hdb = require('../bdd/hentai');

zokou({
    nomCom: "hentaivid",
    categorie: "Hentai",
    reaction: "🍑"
},
async (origineMessage, zk, commandeOptions) => {
    const { repondre, ms, verifGroupe, superUser } = commandeOptions;

    console.log(`[DEBUG] hentaivid command triggered by ${ms.key.participant || ms.key.remoteJid} in ${origineMessage}`);

    if (!verifGroupe && !superUser) {
        console.log(`[DEBUG] hentaivid: Not a group chat`);
        repondre(`𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐬 𝐫𝐞𝐬𝐞𝐫𝐯𝐞𝐝 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩𝐬 𝐨𝐧𝐥𝐲 🚫`);
        return;
    }

    let isHentaiGroupe = await hdb.checkFromHentaiList(origineMessage);
    console.log(`[DEBUG] hentaivid: NSFW group status: ${isHentaiGroupe}`);

    if (!isHentaiGroupe && !superUser) {
        console.log(`[DEBUG] hentaivid: Group is not NSFW-enabled`);
        repondre(`𝐓𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩 𝐢𝐬 𝐧𝐨𝐭 𝐚 𝐠𝐫𝐨𝐮𝐩 𝐨𝐟 𝐩𝐞𝐫𝐯𝐞𝐫𝐭𝐬, 𝐜𝐚𝐥𝐦 𝐝𝐨𝐰𝐧 𝐦𝐲 𝐟𝐫𝐢𝐞𝐧𝐝 🚫`);
        return;
    }

    try {
        console.log(`[DEBUG] hentaivid: Fetching videos from sfmcompile.club`);
        let videos = await hentai();
        console.log(`[DEBUG] hentaivid: Videos fetched: ${videos.length}`);

        if (!videos || videos.length === 0) {
            console.log(`[DEBUG] hentaivid: No videos found`);
            repondre(`𝐍𝐨 𝐡𝐞𝐧𝐭𝐚𝐢 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐨𝐮𝐧𝐝. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫 🚫`);
            return;
        }

        let length = videos.length > 10 ? 10 : videos.length;
        let i = Math.floor(Math.random() * length);

        console.log(`[DEBUG] hentaivid: Selected video index: ${i}, URL: ${videos[i].video_1}`);
        await zk.sendMessage(origineMessage, {
            video: { url: videos[i].video_1 },
            caption: `
𝐓𝐎𝐗𝐈𝐂-𝐌𝐃

◈━━━━━━━━━━━━━━━━◈
│❒ 𝗛𝗲𝗻𝘁𝗮𝗶 𝗩𝗶𝗱𝗲𝗼 🍑
│❒ 𝗧𝗶𝘁𝗹𝗲: ${videos[i].title}
│❒ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${videos[i].category}
◈━━━━━━━━━━━━━━━━◈`
        }, { quoted: ms });

        console.log(`[DEBUG] hentaivid: Video sent successfully`);
    } catch (error) {
        console.error(`[DEBUG] hentaivid: Error: ${error.message}`);
        repondre(`𝐄𝐫𝐫𝐨𝐫 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐡𝐞𝐧𝐭𝐚𝐢 𝐯𝐢𝐝𝐞𝐨: ${error.message}`);
    }
});

async function hentai() {
    return new Promise((resolve, reject) => {
        const page = Math.floor(Math.random() * 1153);
        console.log(`[DEBUG] hentaivid: Fetching page: https://sfmcompile.club/page/${page}`);

        axios.get('https://sfmcompile.club/page/' + page)
            .then((data) => {
                const $ = cheerio.load(data.data);
                const hasil = [];

                $('#primary > div > div > ul > li > article').each(function (a, b) {
                    const video = {
                        title: $(b).find('header > h2').text(),
                        link: $(b).find('header > h2 > a').attr('href'),
                        category: $(b).find('header > div.entry-before-title > span > span').text().replace('in ', ''),
                        share_count: $(b).find('header > div.entry-after-title > p > span.entry-shares').text(),
                        views_count: $(b).find('header > div.entry-after-title > p > span.entry-views').text(),
                        type: $(b).find('source').attr('type') || 'video/mp4',
                        video_1: $(b).find('source').attr('src') || $(b).find('img').attr('data-src'),
                        video_2: $(b).find('video > a').attr('href') || ''
                    };

                    if (video.video_1) {
                        hasil.push(video);
                    }
                });

                console.log(`[DEBUG] hentaivid: Videos parsed on page ${page}: ${hasil.length}`);
                resolve(hasil);
            })
            .catch((error) => {
                console.error(`[DEBUG] hentaivid: Error in hentai() function: ${error.message}`);
                reject(error);
            });
    });
}