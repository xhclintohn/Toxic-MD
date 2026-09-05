import fetch from 'node-fetch';

const STYLE_MAP = [
    ['cyberpunk-neon', 'cyberpunk neon glowing purple pink'],
    ['neon-text-in-the-dark', 'neon glowing text dark black background'],
    ['fire-text', 'fire flames burning orange red hot'],
    ['galaxy-3d', 'galaxy space stars 3D cosmic purple'],
    ['glitch-cyberpunk', 'glitch digital distorted RGB split cyberpunk'],
    ['glitter-text', 'glitter sparkle shiny rainbow holographic'],
    ['3d-graffiti', 'graffiti street art colorful spray paint urban'],
    ['ice-frozen', 'ice frozen crystal blue cold winter frost'],
    ['matrix', 'matrix green digital code rain dark'],
    ['golden-3d', 'golden metallic chrome 3D shiny luxurious'],
    ['colorful-neon-light', 'colorful neon light vibrant rainbow glow'],
    ['smoke-effect', 'smoke dark mysterious swirling mist'],
    ['3d-thunder', 'thunder lightning electric bolt 3D dramatic'],
];

function getStyle(url) {
    for (const [key, val] of STYLE_MAP) {
        if (url.includes(key)) return val;
    }
    return 'stylized glowing artistic';
}

async function ephoto(url, text) {
    const style = getStyle(url);
    const prompt = encodeURIComponent(
        `${style} text effect, the word "${text}" bold large centered, isolated dark background, photorealistic high quality 4k`
    );
    const seed = Math.floor(Math.random() * 999999);
    const imgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=700&height=350&nologo=true&model=flux&seed=${seed}`;

    const res = await fetch(imgUrl, { timeout: 90000 });
    if (!res.ok) throw new Error(`Generation failed: ${res.status}`);
    return res.buffer();
}

export { ephoto };
