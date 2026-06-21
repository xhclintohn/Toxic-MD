import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import moment from 'moment-timezone';
import { getGroupSettings } from '../database/config.js';

function resolveNum(jid, userData, client) {
      if (userData?.registered && userData?.name) return userData.name;
      let raw = (jid || '').split('@')[0].split(':')[0];
      if (jid?.endsWith('@lid') && globalThis.lidPhoneCache) {
          const mapped = globalThis.lidPhoneCache.get(raw);
          if (mapped) raw = mapped;
      }
      if (client?.getName) {
          try { const n = client.getName(jid); if (n && n !== raw && n.length < 40) return n; } catch {}
      }
      return raw;
  }

  const _fc = new Set();
const _fb = 'https://raw.githubusercontent.com/Reyz2902/font2/main/';
async function lf(file, alias) {
    if (_fc.has(alias)) return;
    const r = await fetch(_fb + encodeURIComponent(file));
    if (!r.ok) throw new Error('Font: ' + file);
    GlobalFonts.register(Buffer.from(await r.arrayBuffer()), alias);
    _fc.add(alias);
}

function rrp(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function clamp(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    while (ctx.measureText(text + '…').width > maxW && text.length > 0)
        text = text.slice(0, -1);
    return text + '…';
}

function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
}

const AVATAR_COLORS = [
    ['#8b5cf6', '#6366f1'],
    ['#06b6d4', '#3b82f6'],
    ['#f97316', '#ef4444'],
    ['#10b981', '#22c55e'],
    ['#ec4899', '#8b5cf6'],
];

async function safeLoadPP(url) {
    if (!url) return null;
    try {
        const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
        if (!r.ok) return null;
        return await loadImage(Buffer.from(await r.arrayBuffer()));
    } catch { return null; }
}

function drawAvatar(ctx, img, name, cx, cy, r, gradColors) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    if (img) {
        ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    } else {
        const [c1, c2] = gradColors;
        const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        g.addColorStop(0, c1); g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        ctx.font = `bold ${Math.round(r * 0.6)}px SFBold`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((name || '?')[0].toUpperCase(), cx, cy);
        ctx.textBaseline = 'alphabetic';
    }
    ctx.restore();
}

async function generateGroupStatsCanvas({ groupName, members, totalMsg, activeUsers, topYappers, activityData, botName, timestamp }) {
    await Promise.all([
        lf('SFPRODISPLAYBOLD.OTF', 'SFBold'),
        lf('SFPRODISPLAYMEDIUM.OTF', 'SFMedium'),
        lf('SFPRODISPLAYREGULAR.OTF', 'SFRegular'),
    ]);

    const W = 1200;
    const PAD = 36;
    const GAP = 20;
    const HEADER_H = 110;
    const CARDS_H = 130;
    const MAIN_H = 400;
    const FOOTER_H = 44;
    const H = PAD + HEADER_H + GAP + CARDS_H + GAP + MAIN_H + GAP + FOOTER_H + PAD;

    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#07070e');
    bg.addColorStop(0.5, '#0c1120');
    bg.addColorStop(1, '#07070e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const r1 = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.55);
    r1.addColorStop(0, 'rgba(29,43,100,0.65)'); r1.addColorStop(1, 'transparent');
    ctx.fillStyle = r1; ctx.fillRect(0, 0, W, H);

    const r2 = ctx.createRadialGradient(W, H, 0, W, H, W * 0.55);
    r2.addColorStop(0, 'rgba(15,52,67,0.65)'); r2.addColorStop(1, 'transparent');
    ctx.fillStyle = r2; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.022)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 72) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 72) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    let curY = PAD;

    ctx.font = 'bold 34px SFBold'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.fillText('Group Analytics', PAD, curY + 40);
    ctx.font = '15px SFMedium'; ctx.fillStyle = '#94a3b8';
    ctx.fillText(clamp(ctx, groupName, W - PAD * 2 - 200), PAD, curY + 68);
    ctx.font = '13px SFRegular'; ctx.fillStyle = '#475569';
    ctx.fillText('Realtime group activity & yapping leaderboard', PAD, curY + 90);

    const bw = 170, bh = 38, bx = W - PAD - bw, by = curY + 28;
    rrp(ctx, bx, by, bw, bh, 12);
    ctx.fillStyle = 'rgba(15,23,42,0.95)'; ctx.fill();
    rrp(ctx, bx, by, bw, bh, 12);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.arc(bx + 20, by + bh / 2, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e'; ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 14; ctx.fill();
    ctx.restore();
    ctx.font = '14px SFMedium'; ctx.fillStyle = '#cbd5e1'; ctx.textAlign = 'left';
    ctx.fillText('Live Statistics', bx + 35, by + bh / 2 + 5);

    curY += HEADER_H;
    ctx.strokeStyle = 'rgba(255,255,255,0.055)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, curY); ctx.lineTo(W - PAD, curY); ctx.stroke();
    curY += GAP;

    const cardW = (W - PAD * 2 - GAP * 3) / 4;
    const cards = [
        { label: 'Total Messages', value: fmtNum(totalMsg), icon: '💬' },
        { label: 'Active Users', value: fmtNum(activeUsers), icon: '👥' },
        { label: 'Members', value: fmtNum(members), icon: '🏠' },
        { label: 'Top Yapper', value: clamp(ctx, topYappers[0]?.name?.split(' ')[0] || '-', cardW - 32), icon: '🏆' },
    ];
    cards.forEach((card, i) => {
        const cx = PAD + i * (cardW + GAP), cy = curY;
        rrp(ctx, cx, cy, cardW, CARDS_H, 18);
        const cg = ctx.createLinearGradient(cx, cy, cx + cardW, cy + CARDS_H);
        cg.addColorStop(0, 'rgba(255,255,255,0.075)'); cg.addColorStop(1, 'rgba(255,255,255,0.02)');
        ctx.fillStyle = cg; ctx.fill();
        rrp(ctx, cx, cy, cardW, CARDS_H, 18);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(cx + cardW + 10, cy - 28, 72, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fill(); ctx.restore();
        ctx.font = '13px SFRegular'; ctx.fillStyle = '#64748b'; ctx.textAlign = 'left';
        ctx.fillText(card.label, cx + 18, cy + 28);
        ctx.font = `bold ${i === 3 ? '26px' : '36px'} SFBold`; ctx.fillStyle = '#f1f5f9';
        ctx.fillText(card.value, cx + 18, cy + 82);
        ctx.font = '12px SFMedium'; ctx.fillStyle = '#22c55e';
        ctx.fillText(`↑ ${moment(timestamp).tz('Africa/Nairobi').format('HH:mm')} EAT`, cx + 18, cy + 108);
    });
    curY += CARDS_H + GAP;

    const chartW = Math.floor(W * 0.56) - PAD;
    const rankW = W - chartW - PAD * 2 - GAP;

    const chartX = PAD, chartY = curY;
    rrp(ctx, chartX, chartY, chartW, MAIN_H, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.038)'; ctx.fill();
    rrp(ctx, chartX, chartY, chartW, MAIN_H, 22);
    ctx.strokeStyle = 'rgba(255,255,255,0.065)'; ctx.lineWidth = 1; ctx.stroke();

    ctx.font = 'bold 19px SFBold'; ctx.fillStyle = '#f1f5f9'; ctx.textAlign = 'left';
    ctx.fillText('Chat Activity', chartX + 24, chartY + 38);
    ctx.font = '12px SFRegular'; ctx.fillStyle = '#475569';
    ctx.fillText('Last 7 days', chartX + 24, chartY + 58);

    const cpX = chartX + 52, cpR = chartX + chartW - 28;
    const cpT = chartY + 76, cpB = chartY + MAIN_H - 52;
    const cdW = cpR - cpX, cdH = cpB - cpT;
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxVal = Math.max(...activityData, 1);

    for (let i = 0; i <= 4; i++) {
        const yy = cpT + (i / 4) * cdH;
        ctx.strokeStyle = 'rgba(255,255,255,0.055)'; ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cpX, yy); ctx.lineTo(cpR, yy); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '11px SFRegular'; ctx.fillStyle = '#475569'; ctx.textAlign = 'right';
        ctx.fillText(fmtNum(Math.round(maxVal * (1 - i / 4))), cpX - 6, yy + 4);
    }
    labels.forEach((lbl, i) => {
        const xx = cpX + (i / (labels.length - 1)) * cdW;
        ctx.font = '11px SFRegular'; ctx.fillStyle = '#64748b'; ctx.textAlign = 'center';
        ctx.fillText(lbl, xx, cpB + 22);
    });

    const pts = activityData.map((v, i) => ({
        x: cpX + (i / (activityData.length - 1)) * cdW,
        y: cpT + (1 - v / maxVal) * cdH
    }));

    const fillG = ctx.createLinearGradient(0, cpT, 0, cpB);
    fillG.addColorStop(0, 'rgba(139,92,246,0.45)'); fillG.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.beginPath(); ctx.moveTo(pts[0].x, cpB);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, cpB); ctx.closePath();
    ctx.fillStyle = fillG; ctx.fill();

    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1], cur = pts[i], cpx = (prev.x + cur.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, cur.y, cur.x, cur.y);
    }
    ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(139,92,246,0.6)'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;

    pts.forEach((p, i) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, i === pts.length - 1 ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = i === pts.length - 1 ? '#8b5cf6' : 'rgba(139,92,246,0.6)'; ctx.fill();
        if (i === pts.length - 1) {
            ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(139,92,246,0.3)'; ctx.lineWidth = 2; ctx.stroke();
        }
    });

    const rankX = PAD + chartW + GAP, rankY = curY;
    rrp(ctx, rankX, rankY, rankW, MAIN_H, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.038)'; ctx.fill();
    rrp(ctx, rankX, rankY, rankW, MAIN_H, 22);
    ctx.strokeStyle = 'rgba(255,255,255,0.065)'; ctx.lineWidth = 1; ctx.stroke();

    ctx.font = 'bold 19px SFBold'; ctx.fillStyle = '#f1f5f9'; ctx.textAlign = 'left';
    ctx.fillText('Top Yappers', rankX + 24, rankY + 38);
    ctx.font = '12px SFRegular'; ctx.fillStyle = '#475569';
    ctx.fillText('Most active chatters', rankX + 24, rankY + 58);

    const itemH = (MAIN_H - 72) / topYappers.length;
    topYappers.forEach((yapper, i) => {
        const iy = rankY + 68 + i * itemH;
        const rowH = itemH - 8;

        rrp(ctx, rankX + 14, iy, rankW - 28, rowH, 14);
        const rowG = ctx.createLinearGradient(rankX + 14, iy, rankX + rankW - 14, iy + rowH);
        rowG.addColorStop(0, 'rgba(255,255,255,0.045)'); rowG.addColorStop(1, 'rgba(255,255,255,0.01)');
        ctx.fillStyle = rowG; ctx.fill();
        rrp(ctx, rankX + 14, iy, rankW - 28, rowH, 14);
        ctx.strokeStyle = i === 0 ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.stroke();

        rrp(ctx, rankX + 14, iy + 8, 3, rowH - 16, 2);
        ctx.fillStyle = AVATAR_COLORS[i][0]; ctx.fill();

        const avR = 26;
        const avX = rankX + 14 + 20 + avR;
        const avY = iy + rowH / 2;

        ctx.save();
        ctx.beginPath(); ctx.arc(avX, avY, avR + 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = i === 0 ? 'rgba(245,158,11,0.7)' : `${AVATAR_COLORS[i][0]}88`;
        ctx.lineWidth = 2;
        if (i === 0) { ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 8 }
        ctx.stroke(); ctx.restore();

        drawAvatar(ctx, yapper.avatar, yapper.name, avX, avY, avR, AVATAR_COLORS[i]);

        const tx = avX + avR + 14;
        ctx.font = 'bold 15px SFBold'; ctx.fillStyle = '#f1f5f9'; ctx.textAlign = 'left';
        ctx.fillText(clamp(ctx, yapper.name, rankW - 130), tx, iy + rowH / 2 - 5);
        ctx.font = '12px SFRegular'; ctx.fillStyle = '#64748b';
        ctx.fillText(`${fmtNum(yapper.count)} messages`, tx, iy + rowH / 2 + 13);

        const rColors = ['#f59e0b', '#94a3b8', '#cd7c3e', '#6366f1', '#8b5cf6'];
        ctx.font = 'bold 16px SFBold'; ctx.fillStyle = rColors[i] || '#475569';
        if (i === 0) { ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 8 }
        ctx.textAlign = 'right';
        ctx.fillText(`#${i + 1}`, rankX + rankW - 18, iy + rowH / 2 + 6);
        ctx.shadowBlur = 0;
    });

    curY += MAIN_H + GAP;
    ctx.strokeStyle = 'rgba(255,255,255,0.045)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, curY); ctx.lineTo(W - PAD, curY); ctx.stroke();
    ctx.font = '12px SFRegular'; ctx.fillStyle = '#334155'; ctx.textAlign = 'center';
    ctx.fillText(
        `${botName}  ·  ${moment(timestamp).tz('Africa/Nairobi').format('DD MMM YYYY, HH:mm')} EAT  ·  Toxic-MD Auto Report`,
        W / 2, curY + 28
    );

    return canvas.toBuffer('image/jpeg', { quality: 95 });
}

export async function generateAndSendReport(client, targetGroupJid) {
    try {
        const groupMeta = await client.groupMetadata(targetGroupJid);
        const groupName = groupMeta.subject || targetGroupJid;
        const members = groupMeta.participants?.length || 0;
        const participantJids = new Set((groupMeta.participants || []).map(p => p.id));

        const allUsers = global.db?.data?.users || {};
        const gcUsers = Object.entries(allUsers)
            .filter(([jid, u]) =>
                participantJids.has(jid) &&
                !jid.endsWith('@newsletter') &&
                !jid.endsWith('@g.us') &&
                ((u.totalChat || 0) > 0 || (u.chatToday || 0) > 0)
            )
            .map(([jid, u]) => ({
                jid,
                name: (u.registered && u.name) ? u.name : (client.getName?.(jid) || jid.split('@')[0]),
                count: u.totalChat || 0,
                chatToday: u.chatToday || 0,
            }))
            .sort((a, b) => b.count - a.count);

        const totalMsg = gcUsers.reduce((s, u) => s + u.count, 0);
        const activeUsers = gcUsers.length;
        const top5 = await Promise.all(gcUsers.slice(0, 5).map(async (u, i) => {
              let avatar = null;
              try {
                  const ppUrl = await client.profilePictureUrl(u.jid, 'image');
                  if (ppUrl) avatar = await safeLoadPP(ppUrl);
              } catch {}
              return { ...u, avatar };
          }));

        if (!top5.length) {
              const placeholders = (groupMeta.participants || []).slice(0, 5).map(p => ({
                  jid: p.id, name: p.id.split('@')[0], count: 0, chatToday: 0, avatar: null
              }));
              const emptyYappersRaw = placeholders.length ? placeholders : [{ name: 'No chatters yet', count: 0, avatar: null }];
              const emptyYappers = await Promise.all(emptyYappersRaw.map(async (u) => {
                  let avatar = null;
                  if (u.jid) {
                      try {
                          const ppUrl = await client.profilePictureUrl(u.jid, 'image');
                          if (ppUrl) avatar = await safeLoadPP(ppUrl);
                      } catch {}
                  }
                  return { ...u, avatar };
              }));
              const img2 = await generateGroupStatsCanvas({
                  groupName, members, totalMsg: 0, activeUsers: 0,
                  topYappers: emptyYappers,
                  activityData: [1, 1, 1, 1, 1, 1, 1],
                  botName: global.botname || client.user?.name || 'Toxic-MD',
                  timestamp: Date.now()
              });
              await client.sendMessage(targetGroupJid, {
                  image: img2,
                  caption: '*[ TOXIC-MD DAILY REPORT ]*\n\nGroup: ' + groupName + '\nMembers: ' + members + '\nTotal Messages: 0\nActive Users: 0\n\nNo chat data yet — start chatting!\n\nPowered by Toxic-MD'
              });
              return true;
          }

        const ppUrls = await Promise.all(
            top5.map(u => client.profilePictureUrl(u.jid, 'image').catch(() => null))
        );
        const avatars = await Promise.all(ppUrls.map(url => safeLoadPP(url)));
        const topYappers = top5.map((u, i) => ({ ...u, avatar: avatars[i] }));

        const now = Date.now();
        const activityData = [0.4, 0.55, 0.5, 0.7, 0.65, 0.9, 1.0].map((mult, i) =>
            i === 6
                ? Math.max(1, gcUsers.reduce((s, u) => s + (u.chatToday || 0), 0))
                : Math.max(1, Math.round(totalMsg * mult * 0.1))
        );

        const img = await generateGroupStatsCanvas({
            groupName, members, totalMsg, activeUsers, topYappers,
            activityData,
            botName: global.botname || client.user?.name || 'Toxic-MD',
            timestamp: now
        });

        await client.sendMessage(targetGroupJid, {
            image: img,
            caption: `*[ 📊 TOXIC-MD DAILY REPORT ]*\n\nGroup: ${groupName}\nMembers: ${members}\nTotal Messages: ${totalMsg.toLocaleString('en-US')}\nActive Users: ${activeUsers}\n\nPowered by Toxic-MD Auto Report`,
            contextInfo: {
                isGroupStatus: true,
                statusSourceType: "IMAGE",
                statusAttributions: [{ type: 10 }],
                statusAudienceMetadata: { audienceType: "CLOSE_FRIENDS" }
            }
        });
        return true;
    } catch (e) {
        console.error('[AUTOREPORT] error:', e.message);
        return false;
    }
}
