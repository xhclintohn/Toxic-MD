import path from 'path';
import fs from 'fs';
import axios from 'axios';

const SOURCE_URL = 'https://github.com/xhclintohn/Toxic-MD';
const FONT_BOLD = path.join(process.cwd(), 'assets', 'fonts', 'Roboto-Bold.ttf');
const FONT_REG = path.join(process.cwd(), 'assets', 'fonts', 'Roboto-Medium.ttf');
let fontBold = 'sans-serif';
let fontReg = 'sans-serif';
let canvasLib = null;
async function getCanvas() {
    if (canvasLib) return canvasLib;
    canvasLib = await import('@napi-rs/canvas');
    try {
        if (fs.existsSync(FONT_BOLD)) { canvasLib.GlobalFonts.registerFromPath(FONT_BOLD, 'WcBold'); fontBold = 'WcBold'; }
        if (fs.existsSync(FONT_REG)) { canvasLib.GlobalFonts.registerFromPath(FONT_REG, 'WcReg'); fontReg = 'WcReg'; }
    } catch {}
    return canvasLib;
}

const W = 1000;
const H = 560;

function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function cover(ctx, img, x, y, w, h) {
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s;
    const dh = img.height * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function clean(str) {
    return String(str || '').replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, '').replace(/\s+/g, ' ').trim();
}
function fit(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t.trimEnd() + '…';
}

async function toImage(src) {
    if (!src) return null;
    try {
        const { loadImage } = await getCanvas();
        if (Buffer.isBuffer(src)) return await loadImage(src);
        const { data } = await axios.get(src, { responseType: 'arraybuffer', timeout: 10000 });
        return await loadImage(Buffer.from(data));
    } catch {
        return null;
    }
}

async function getPP(client, jid) {
    const url = await client.profilePictureUrl(jid, 'image').catch(() => null);
    return toImage(url);
}

export async function makeWelcomeCard({ userPP, groupPP, groupName, memberName, memberCount, joinedCount = 1 }) {
    const { createCanvas } = await getCanvas();
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    if (groupPP || userPP) {
        ctx.save();
        ctx.filter = 'blur(14px)';
        cover(ctx, groupPP || userPP, -30, -30, W + 60, H + 60);
        ctx.restore();
        ctx.fillStyle = 'rgba(8,8,18,0.35)';
        ctx.fillRect(0, 0, W, H);
    } else {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#2b1055');
        g.addColorStop(1, '#7597de');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    const ax = 80, ay = 130, as = 300;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 30;
    rr(ctx, ax, ay, as, as, 64);
    ctx.fillStyle = '#10101a';
    ctx.fill();
    ctx.restore();

    ctx.save();
    rr(ctx, ax, ay, as, as, 64);
    ctx.clip();
    if (userPP) {
        cover(ctx, userPP, ax, ay, as, as);
    } else {
        ctx.fillStyle = '#3a3f55';
        ctx.fillRect(ax, ay, as, as);
        ctx.fillStyle = '#c9ccd8';
        ctx.beginPath(); ctx.arc(ax + as / 2, ay + 115, 55, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(ax + as / 2, ay + 255, 95, 78, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    const cx = 450, cy = 90, cw = 490, ch = 380;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    rr(ctx, cx, cy, cw, ch, 40);
    ctx.fillStyle = 'rgba(18,18,24,0.78)';
    ctx.fill();
    ctx.restore();

    const px = cx + 44;
    const pw = cw - 88;
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#8f93a6';
    ctx.font = `22px ${fontReg}`;
    ctx.fillText('W E L C O M E', px, cy + 70);

    const title = clean(memberName) || `${joinedCount} member joined`;
    let size = 44;
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size}px ${fontBold}`;
    while (size > 26 && ctx.measureText(title).width > pw) {
        size -= 2;
        ctx.font = `bold ${size}px ${fontBold}`;
    }
    ctx.fillText(fit(ctx, title, pw), px, cy + 135);

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(px, cy + 170, pw, 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = `italic bold 34px ${fontBold}`;
    ctx.fillText(fit(ctx, clean(groupName) || 'Group', pw), px, cy + 235);

    const pill = `${memberCount} members`;
    ctx.font = `22px ${fontReg}`;
    const tw = ctx.measureText(pill).width;
    rr(ctx, px, cy + 275, tw + 36, 46, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#e8e9f0';
    ctx.fillText(pill, px + 18, cy + 307);

    return canvas.toBuffer('image/png');
}

export async function sendWelcomeCard({ client, groupId, jid, metadata, memberCount, text, mentions = [], ephemeral = 0 }) {
    const [userPP, groupPPraw] = await Promise.all([
        getPP(client, jid),
        getPP(client, groupId),
    ]);

    const count = typeof memberCount === 'number' ? memberCount : (metadata?.participants?.length || 0);
    const memberName = await client.getName(jid).catch(() => '');
    const thumbnail = await makeWelcomeCard({
        memberName,
        userPP,
        groupPP: groupPPraw,
        groupName: metadata?.subject,
        memberCount: count,
    });

    const body = text || `Welcome @${jid.split('@')[0]} to the group ${metadata?.subject || ''}`;

    return client.sendMessage(groupId, {
        text: body,
        mentions: [...new Set([jid, ...mentions])].filter(Boolean),
        contextInfo: {
            externalAdReply: {
                title: `Welcome to ${metadata?.subject || 'the group'}`,
                body: `@${jid.split('@')[0]} joined the group`,
                thumbnail,
                mediaType: 1,
                renderLargerThumbnail: true,
                sourceUrl: SOURCE_URL,
            },
        },
    }, { ephemeralExpiration: ephemeral });
}
