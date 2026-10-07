/* ============================================================
   《<国家> 咖啡产区分布图》—— 国家级细部渲染器
   依赖：country-geo.js (CGEO) / regions.js (REGIONS, PROCESS, SPECIES, ROAST)
        / countries.js (CLIST) ；页面通过 window.CTNAME 传入国家名。
   ------------------------------------------------------------
   与总图一致的四变量编码：尺寸=海拔　形状=豆种　色相=可切换(处理法/烘焙/豆种/风味)
   国家级图补充：墨卡托投影自适应、经纬网刻度与图廓注记、邻国底衬、
   定位插图、比例尺、产区名册（与图上符号双向联动）
   ============================================================ */
(function () {
'use strict';

const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const $ = id => document.getElementById(id);

/* ─────────── 主题常量（与总图保持一致） ─────────── */
const SEA = '#0d131b';
const CHORO = ['#232a33','#3a3229','#503f2b','#674c2c','#80592a','#9c6c28','#bd8527'];
const GRADE_LABEL = ['无商业产量','<10 万袋','10–50 万袋','50–200 万袋',
                     '200–600 万袋','600–2000 万袋','>2000 万袋'];
const ROASTC = ['#f6dcae','#e3b06a','#c98340','#96552c','#5b3218'];
const SPECIESC = { arabica:'#4fb3a5', robusta:'#c2673e', both:'#9a86c8', liberica:'#b0a04a' };
const FLAVOR = [
  { k:'酒香/发酵', c:'#8e6fd8', w:['酒','发酵','厌氧','碳酸','朗姆','白兰地','菠萝','芒果','荔枝','热带水果'] },
  { k:'莓果',      c:'#c0392b', w:['蓝莓','草莓','莓','黑加仑','黑醋栗','葡萄','乌梅','桑葚','黑莓'] },
  { k:'花香',      c:'#cf7fb8', w:['茉莉','花香','玫瑰','薰衣草','桂花','橙花','花'] },
  { k:'柑橘/核果', c:'#e8b13a', w:['佛手柑','柠檬','柑橘','橙','柚','核果','桃','杏','青苹','橘子','青柠'] },
  { k:'香料/草本', c:'#4f9d69', w:['香料','草本','木质','土壤','烟熏','薄荷','雪松','胡椒','丁香','茶','药草'] },
  { k:'坚果/可可', c:'#a9764a', w:['坚果','巧','可可','焦糖','奶油','饼干','谷物','蜂蜜','太妃','糖浆','麦'] },
];
const FLAVORC = {}; FLAVOR.forEach(f => FLAVORC[f.k] = f.c);
function flavorOf(fl) {
  const s = fl || '';
  for (const f of FLAVOR) for (const w of f.w) if (s.indexOf(w) >= 0) return f.k;
  return '坚果/可可';
}
function textW(s, fs) {
  fs = fs || 11; let w = 0;
  for (const ch of String(s)) w += ch.charCodeAt(0) > 0x2e7f ? fs : fs * 0.56;
  return w;
}

/* 产区表中以「国家（属地）」形式标注的特殊项 → 精细底图中的几何对象 */
const CT_ALIAS = {
  '美国（夏威夷）':      { geo:'美国',         scope:'夏威夷群岛' },
  '英国（圣赫勒拿岛）':  { geo:'Saint Helena', scope:'圣赫勒拿岛' },
};

/* ─────────── 数据准备 ─────────── */
const CT = window.CTNAME;
const ALIAS = CT_ALIAS[CT] || null;
const MINE = REGIONS.filter(r => r.ct === CT);
MINE.forEach((r, i) => {
  r.i = i;
  r.md = (r.a[0] + r.a[1]) / 2;
  r.rm = Math.round((r.ro[0] + r.ro[1]) / 2);
  r.fm = flavorOf(r.fl);
  r.spc = SPECIES[r.sp] ? r.sp : 'arabica';
  r.rd = 5.5 + 8.5 * Math.min(1, Math.max(0, (r.md - 150) / 2200));
});
const FEAT = CGEO.find(f => f.c === CT)
          || (ALIAS && (CGEO.find(f => f.c === ALIAS.geo) || CGEO.find(f => f.n === ALIAS.geo)));

/* ─────────── 图幅计算 ─────────── */
function bboxOf(rings) {
  let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
  rings.forEach(r => r.forEach(p => {
    if (p[0] < a) a = p[0]; if (p[0] > b) b = p[0];
    if (p[1] < c) c = p[1]; if (p[1] > d) d = p[1];
  }));
  return { x0:a, x1:b, y0:c, y1:d };
}
const rbRaw = MINE.length
  ? { x0:Math.min(...MINE.map(r => r.lo)), x1:Math.max(...MINE.map(r => r.lo)),
      y0:Math.min(...MINE.map(r => r.la)), y1:Math.max(...MINE.map(r => r.la)) }
  : null;

/* 图幅策略（按产区分三种情形）：
   ① 产区附近存在"大块国土"（环面积 ≥ 全国包围盒 25%，如巴西本部、埃塞俄比亚）
      → 图幅取全国全部领土，完整呈现产区在全国中的位置；
   ② 产区附近只有小岛（如夏威夷、圣赫勒拿）
      → 图幅只取产区周边的环，剔除阿拉斯加 / 阿森松岛等远域，避免图幅被撑开；
   ③ 产区与国土中心距离都很远但国家紧凑（如澳大利亚、印度）
      → 无近旁环时回退为全国全图。
   "附近"判定（双阈值，防止大环因包围盒中心偏远被误删、小岛因距离近被误留）：
     · bboxGap   —— 环包围盒与产区包围盒的间隔 ≤ thrC（与本区重叠即记 0）；
     · centerDist —— 环包围盒中心与产区质心的距离 ≤ thrC2（剔除远隔重洋的领地）。 */
let NEAR = [], FB;
if (FEAT && rbRaw) {
  const rbSpanLon = rbRaw.x1 - rbRaw.x0, rbSpanLat = rbRaw.y1 - rbRaw.y0;
  const cLon = (rbRaw.x0 + rbRaw.x1) / 2, cLat = (rbRaw.y0 + rbRaw.y1) / 2;
  const span = Math.max(rbSpanLon, rbSpanLat);
  const thrC  = Math.max(6,  0.6 * span);
  const thrC2 = Math.max(25, 1.2 * span);
  const near = FEAT.d.filter(r => {
    const b = bboxOf([r]);
    const gap = Math.max(
      Math.max(rbRaw.x0 - b.x1, b.x0 - rbRaw.x1, 0),
      Math.max(rbRaw.y0 - b.y1, b.y0 - rbRaw.y1, 0));
    if (gap > thrC) return false;
    return Math.max(Math.abs((b.x0 + b.x1) / 2 - cLon),
                    Math.abs((b.y0 + b.y1) / 2 - cLat)) <= thrC2;
  });
  const full = bboxOf(FEAT.d);
  const fullArea = (full.x1 - full.x0) * (full.y1 - full.y0);
  const nearLarge = near.some(r => {
    const b = bboxOf([r]);
    return (b.x1 - b.x0) * (b.y1 - b.y0) >= 0.25 * fullArea;
  });
  if (!near.length || nearLarge) {
    NEAR = FEAT.d;
    FB = { x0:full.x0, x1:full.x1, y0:full.y0, y1:full.y1 };
  } else {
    NEAR = near;
    FB = bboxOf(NEAR);
  }
  if (rbRaw) {
    const pad = 0.6;
    FB = { x0:Math.min(FB.x0, rbRaw.x0 - pad), x1:Math.max(FB.x1, rbRaw.x1 + pad),
           y0:Math.min(FB.y0, rbRaw.y0 - pad), y1:Math.max(FB.y1, rbRaw.y1 + pad) };
  }
} else if (rbRaw) {
  const pad = Math.max(1.5, (rbRaw.x1 - rbRaw.x0) * 0.6);
  FB = { x0:rbRaw.x0 - pad, x1:rbRaw.x1 + pad, y0:rbRaw.y0 - pad, y1:rbRaw.y1 + pad };
} else {
  FB = { x0:-20, x1:20, y0:-20, y1:20 };
}

/* ─────────── 墨卡托投影 + 自适应 ─────────── */
const VW = 1500, VH = 890;
const X0 = 62, Y0 = 52, X1 = 1182, Y1 = 706;      // 图廓（内图幅）
const MW = X1 - X0, MH = Y1 - Y0;
const RAIL = 1210;                                 // 右侧栏起点
function mercU(lon) { return lon * Math.PI / 180; }
function mercV(lat) { return Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)); }

const u0 = mercU(FB.x0), u1 = mercU(FB.x1);
const v0 = mercV(FB.y0), v1 = mercV(FB.y1);
const SPANU = Math.max(u1 - u0, 1e-6), SPANV = Math.max(v1 - v0, 1e-6);
const SP = Math.min(MW / SPANU, MH / SPANV);
const OX = X0 + (MW - SPANU * SP) / 2;
const OY = Y1 - (MH - SPANV * SP) / 2;
function P(lon, lat) { return [OX + (mercU(lon) - u0) * SP, OY - (mercV(lat) - v0) * SP]; }

const CENTER_LAT = (FB.y0 + FB.y1) / 2;
const KM_PER_PX = 111.32 * Math.cos(CENTER_LAT * Math.PI / 180) * 180 / (SP * Math.PI);

/* ─────────── 状态 ─────────── */
const ST = { varKey:'process', labels:true, hi:-1, sel:-1 };

/* ─────────── 骨架 ─────────── */
const svg = $('map');
svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
el('rect', { x:0, y:0, width:VW, height:VH, fill:SEA }, svg);
const defs = el('defs', null, svg);
const cp = el('clipPath', { id:'frameClip' }, defs);
el('rect', { x:X0, y:Y0, width:MW, height:MH }, cp);

const style = document.createElementNS(NS, 'style');
style.textContent = `
  .grid{fill:none;stroke:#1e2a38;stroke-width:.7;stroke-dasharray:3 4}
  .grid.em{stroke:#31465c;stroke-dasharray:none;stroke-width:.9}
  .belt{fill:none;stroke:#d9a441;stroke-width:1;stroke-dasharray:8 5;opacity:.7}
  .tick{stroke:#3b4655;stroke-width:.9}
  .neat{fill:none;stroke:#4a5766;stroke-width:1.2}
  .ticklab{font-size:10.5px;fill:#8b95a3}
  .ctx{stroke:#0a0e13;stroke-width:.5}
  .lead{stroke:#8d7a55;stroke-width:.85;opacity:.9}
  .lbtxt{font-size:13px;fill:#f5ecdc;paint-order:stroke;stroke:#0a0e13;stroke-width:3.6;stroke-linejoin:round}
  .lbsub{font-size:10.5px;fill:#a99a80;paint-order:stroke;stroke:#0a0e13;stroke-width:3;stroke-linejoin:round}
  .lg-t{font-size:10.5px;fill:#8b95a3}
  .lg-i{font-size:11px;fill:#cfd6de}
  .lgtitle{font-size:11.5px;fill:#d9a441;letter-spacing:.1em}
  .h1{font-size:23px;fill:#f4ecd9;letter-spacing:.05em}
  .h2{font-size:11.5px;fill:#9aa5b2}
  .h3{font-size:10.5px;fill:#6b7684}
  .rail-t{font-size:11.5px;fill:#d9a441;letter-spacing:.1em}
  .rail-k{font-size:10px;fill:#6b7684;letter-spacing:.06em}
  .rail-v{font-size:12px;fill:#cfd6de}
  .rail-b{font-size:11px;fill:#e6ddcb}
  .glabel{font-size:10.5px;fill:#c9a86a;paint-order:stroke;stroke:#0d131b;stroke-width:3;stroke-linejoin:round}
  .sym{stroke:#0a0e13;stroke-width:1.1}
  .sym.sel{stroke:#f0c46a;stroke-width:2.6}
`;
defs.appendChild(style);

const gGeo  = el('g', { 'clip-path':'url(#frameClip)' }, svg);
const gGrid = el('g', null, gGeo);
const gCtx  = el('g', null, gGeo);
const gTgt  = el('g', null, gGeo);
const gPt   = el('g', null, svg);
const gLab  = el('g', null, svg);
const gFrame = el('g', null, svg);

/* ─────────── 经纬网 + 图廓刻度 ─────────── */
function niceStep(span, target) {
  const raw = span / target;
  const steps = [0.05,0.1,0.2,0.25,0.5,1,2,3,5,10,15,20,30];
  for (const s of steps) if (s >= raw) return s;
  return 30;
}
const STEP_LON = niceStep(FB.x1 - FB.x0, 6);
const STEP_LAT = niceStep(FB.y1 - FB.y0, 5);
function fmt(v, isLon) {
  const a = Math.abs(v);
  const s = (STEP_LON < 1 || STEP_LAT < 1) ? a.toFixed(Math.min(2, Math.max(0, Math.ceil(-Math.log10(Math.min(STEP_LON, STEP_LAT)))))) : String(+a.toFixed(2));
  return s + '°' + (v === 0 ? '' : isLon ? (v > 0 ? 'E' : 'W') : (v > 0 ? 'N' : 'S'));
}
function buildGrid() {
  const lon0 = Math.ceil(FB.x0 / STEP_LON) * STEP_LON;
  for (let lo = lon0; lo <= FB.x1 + 1e-9; lo += STEP_LON) {
    const a = P(lo, FB.y0), b = P(lo, FB.y1);
    el('line', { x1:a[0], y1:a[1], x2:b[0], y2:b[1], class:'grid' }, gGrid);
  }
  const lat0 = Math.ceil(FB.y0 / STEP_LAT) * STEP_LAT;
  for (let la = lat0; la <= FB.y1 + 1e-9; la += STEP_LAT) {
    const a = P(FB.x0, la), b = P(FB.x1, la);
    el('line', { x1:a[0], y1:a[1], x2:b[0], y2:b[1], class:'grid' + (la === 0 ? ' em' : '') }, gGrid);
  }
  /* 咖啡带 / 赤道 */
  [25, -25].forEach(la => {
    if (la < FB.y0 || la > FB.y1) return;
    const a = P(FB.x0, la), b = P(FB.x1, la);
    el('line', { x1:a[0], y1:a[1], x2:b[0], y2:b[1], class:'belt' }, gGrid);
    const t = el('text', { x:X0 + 7, y:a[1] - 4, class:'glabel' }, gGrid);
    t.textContent = la > 0 ? '北咖啡带界 25°N' : '南咖啡带界 25°S';
  });
  /* 图廓 + 刻度注记 */
  el('rect', { x:X0, y:Y0, width:MW, height:MH, class:'neat' }, gFrame);
  for (let lo = lon0; lo <= FB.x1 + 1e-9; lo += STEP_LON) {
    const a = P(lo, FB.y0);
    if (a[0] < X0 + 12 || a[0] > X1 - 12) continue;
    el('line', { x1:a[0], y1:Y1, x2:a[0], y2:Y1 + 5, class:'tick' }, gFrame);
    const t = el('text', { x:a[0], y:Y1 + 17, class:'ticklab', 'text-anchor':'middle' }, gFrame);
    t.textContent = fmt(lo, true);
  }
  for (let la = lat0; la <= FB.y1 + 1e-9; la += STEP_LAT) {
    const a = P(FB.x0, la);
    if (a[1] < Y0 + 10 || a[1] > Y1 - 10) continue;
    el('line', { x1:X0 - 5, y1:a[1], x2:X0, y2:a[1], class:'tick' }, gFrame);
    const t = el('text', { x:X0 - 8, y:a[1] + 3.5, class:'ticklab', 'text-anchor':'end' }, gFrame);
    t.textContent = fmt(la, false);
  }
}

/* ─────────── 海陆 ─────────── */
function ringPath(rings) {
  let d = '';
  rings.forEach(r => {
    r.forEach((p, i) => { const q = P(p[0], p[1]); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); });
    d += 'Z';
  });
  return d;
}
function intersects(b, f, pad) {
  return !(b.x1 + pad < f.x0 || b.x0 - pad > f.x1 || b.y1 + pad < f.y0 || b.y0 - pad > f.y1);
}
const PAD = Math.max((FB.x1 - FB.x0), (FB.y1 - FB.y0)) * 0.25 + 1;
function buildLand() {
  CGEO.forEach(f => {
    if (FEAT && f === FEAT) return;
    if (!intersects(bboxOf(f.d), FB, PAD)) return;
    el('path', { d:ringPath(f.d), fill:'#1a222c', class:'ctx' }, gCtx);
  });
  if (NEAR.length) {
    const fill = FEAT && FEAT.g > 0 ? CHORO[FEAT.g] : '#4a3f30';
    el('path', { d:ringPath(NEAR), fill, stroke:'#d9a441', 'stroke-width':1.3,
      'stroke-linejoin':'round' }, gTgt);
  }
}

/* ─────────── 点状符号 + 注记 ─────────── */
function colorOf(r) {
  switch (ST.varKey) {
    case 'roast':   return ROASTC[Math.min(4, Math.max(0, r.rm - 1))];
    case 'species': return SPECIESC[r.spc] || '#4fb3a5';
    case 'flavor':  return FLAVORC[r.fm] || '#a9764a';
    default:        return (PROCESS[r.pr] || {}).c || '#888';
  }
}
function drawPoints() {
  gPt.innerHTML = ''; gLab.innerHTML = '';
  const boxes = [], labs = [];
  MINE.forEach(r => {
    const q = P(r.lo, r.la);
    const x = q[0], y = q[1], r0 = r.rd, col = colorOf(r);
    const g = el('g', { transform:`translate(${x.toFixed(1)},${y.toFixed(1)})`, class:'ptg' }, gPt);
    g.style.cursor = 'pointer';
    const sel = (ST.sel === r.i || ST.hi === r.i);
    if (r.spc === 'arabica') {
      el('circle', { r:r0.toFixed(2), fill:col, class:'sym' + (sel ? ' sel' : '') }, g);
    } else if (r.spc === 'robusta') {
      const t = r0 * 1.2;
      el('path', { d:`M0 ${-t}L${t} 0L0 ${t}L${-t} 0Z`, fill:col, class:'sym' + (sel ? ' sel' : '') }, g);
    } else {
      el('circle', { r:r0.toFixed(2), fill:col, 'fill-opacity':.3, stroke:col,
        'stroke-width':Math.max(3, r0 * .62), class:'sym' + (sel ? ' sel' : '') }, g);
      el('circle', { r:(r0 * .34).toFixed(2), fill:col }, g);
    }
    if (sel) el('circle', { r:(r0 + 7).toFixed(1), fill:'none', stroke:'#f0c46a',
      'stroke-width':1.3, 'stroke-opacity':.65, 'stroke-dasharray':'3 3' }, g);
    g.__r = r;
    labs.push({ r, x, y, r0 });
    boxes.push([x - r0 - 2, y - r0 - 2, x + r0 + 2, y + r0 + 2]);
  });

  if (ST.labels) {
    labs.sort((a, b) => b.r.md - a.r.md);
    const CAND = [[1,0],[-1,0],[0,-1],[0,1],[1,-1],[-1,-1],[1,1],[-1,1]];
    const placed = boxes.slice();
    placed.push([0, 0, VW, Y0 - 4], [0, Y1 + 4, VW, VH], [0, 0, X0 - 4, VH], [X1 + 4, 0, VW, VH]);
    labs.forEach(L => {
      const main = L.r.n;
      const sub = Math.round(L.r.a[0]) + '–' + Math.round(L.r.a[1]) + 'm · ' + (PROCESS[L.r.pr] || {}).k;
      const wM = textW(main, 13), wS = textW(sub, 10.5);
      const W = Math.max(wM, wS) + 4, H = 30;
      let best = null;
      for (const c of CAND) {
        const gap = L.r0 + 7;
        const x0 = c[0] === 1 ? L.x + gap : c[0] === -1 ? L.x - gap - W : L.x - W / 2;
        const y0 = c[1] === -1 ? L.y - gap - H : c[1] === 1 ? L.y + gap : L.y - H / 2;
        const box = [x0 - 1, y0 - 1, x0 + W + 1, y0 + H + 1];
        if (box[0] < X0 + 2 || box[2] > X1 - 2 || box[1] < Y0 + 2 || box[3] > Y1 - 2) continue;
        let hit = false;
        for (const b of placed) if (box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]) { hit = true; break; }
        if (!hit) { best = { box, x0, y0, c }; break; }
      }
      if (!best) return;
      placed.push(best.box);
      const c = best.c;
      const lx1 = L.x + c[0] * (L.r0 + 2), ly1 = L.y + c[1] * (L.r0 + 2);
      let lx2, ly2;
      if (c[0] === 1)       { lx2 = best.box[0]; ly2 = best.y0 + 12; }
      else if (c[0] === -1) { lx2 = best.box[2]; ly2 = best.y0 + 12; }
      else if (c[1] === -1) { lx2 = L.x;         ly2 = best.box[3]; }
      else                  { lx2 = L.x;         ly2 = best.box[1]; }
      el('line', { x1:lx1.toFixed(1), y1:ly1.toFixed(1), x2:lx2.toFixed(1), y2:ly2.toFixed(1), class:'lead' }, gLab);
      const anc = c[0] === 1 ? 'start' : c[0] === -1 ? 'end' : 'middle';
      const tx = c[0] === 1 ? best.box[0] + 2 : c[0] === -1 ? best.box[2] - 2 : (best.box[0] + best.box[2]) / 2;
      const t = el('text', { x:tx.toFixed(1), y:(best.y0 + 13).toFixed(1), class:'lbtxt', 'text-anchor':anc }, gLab);
      t.textContent = main;
      const s = el('text', { x:tx.toFixed(1), y:(best.y0 + 25).toFixed(1), class:'lbsub', 'text-anchor':anc }, gLab);
      s.textContent = sub;
      if (ST.sel === L.r.i) t.setAttribute('fill', '#f0c46a');
    });
  }
}

/* ─────────── 右侧栏：定位插图 / 指北针 / 比例尺 / 统计 / 构成 ─────────── */
function buildRail() {
  /* 定位插图（Robinson 世界，标出本国） */
  const IW = 268, IS = IW / (2 * 0.8487 * Math.PI), IX = RAIL + 1, IY = 66;
  const RXt = [1,0.9986,0.9954,0.99,0.9822,0.973,0.96,0.9427,0.9216,0.8962,0.8679,0.835,0.7986,0.7597,0.7186,0.6732,0.6213,0.5722,0.5322];
  const RYt = [0,0.062,0.124,0.186,0.248,0.31,0.372,0.434,0.4958,0.5571,0.6176,0.6769,0.7346,0.7903,0.8435,0.8936,0.9394,0.9761,1];
  function IP(lon, lat) {
    const a = Math.min(90, Math.abs(lat)), i = Math.min(17, Math.floor(a / 5)), t = (a - i * 5) / 5;
    const X = RXt[i] + (RXt[i+1] - RXt[i]) * t, Y = RYt[i] + (RYt[i+1] - RYt[i]) * t;
    return [IX + IW / 2 + 0.8487 * X * lon * Math.PI / 180 * IS, IY + 1.3523 * IS - 1.3523 * Y * (lat < 0 ? -1 : 1) * IS];
  }
  const t0 = el('text', { x:RAIL, y:56, class:'rail-t' }, gFrame); t0.textContent = '位置示意 LOCATOR';
  CGEO.forEach(f => {
    let d = '';
    f.d.forEach(r => { r.forEach((p, i) => { const q = IP(p[0], p[1]); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }); d += 'Z'; });
    el('path', { d, fill:'#1a222c', stroke:'none' }, gFrame);
  });
  if (NEAR.length) {
    let d = '';
    NEAR.forEach(r => { r.forEach((p, i) => { const q = IP(p[0], p[1]); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }); d += 'Z'; });
    el('path', { d, fill:'#d9a441', stroke:'none' }, gFrame);
  }
  /* 图幅范围框 */
  const c1 = IP(FB.x0, FB.y1), c2 = IP(FB.x1, FB.y0);
  el('rect', { x:Math.min(c1[0], c2[0]) - 1, y:Math.min(c1[1], c2[1]) - 1,
    width:Math.abs(c2[0] - c1[0]) + 2, height:Math.abs(c2[1] - c1[1]) + 2,
    fill:'none', stroke:'#e0663c', 'stroke-width':1.2 }, gFrame);

  /* 指北针 */
  const nx = RAIL + 34, ny = 262, ng = el('g', { transform:`translate(${nx},${ny})` }, gFrame);
  el('circle', { r:24, fill:'none', stroke:'#2f3d4e', 'stroke-width':1 }, ng);
  el('path', { d:'M0 -19L6.5 7L0 1.8L-6.5 7Z', fill:'#d9a441' }, ng);
  el('path', { d:'M0 19L6.5 -7L0 -1.8L-6.5 -7Z', fill:'#3b4655' }, ng);
  const nn = el('text', { x:0, y:-27, 'text-anchor':'middle', class:'glabel' }, ng); nn.textContent = 'N';

  /* 比例尺 */
  const sy = 316, barW = 168;
  const cand = [10,20,50,100,200,500,1000,2000];
  let km = cand[0];
  for (const c of cand) if (c / KM_PER_PX <= barW) km = c;
  const px = km / KM_PER_PX;
  const sg = el('g', { transform:`translate(${RAIL},${sy})` }, gFrame);
  for (let i = 0; i < 4; i++)
    el('rect', { x:i * px / 4, y:0, width:px / 4, height:6, fill:i % 2 ? '#0d131b' : '#c9d2dc',
      stroke:'#5b6675', 'stroke-width':.6 }, sg);
  const s0 = el('text', { x:0, y:-6, class:'glabel' }, sg); s0.textContent = '0';
  const s1 = el('text', { x:px, y:-6, 'text-anchor':'middle', class:'glabel' }, sg); s1.textContent = km + ' km';
  const s2 = el('text', { x:px / 2, y:19, 'text-anchor':'middle', class:'h3' }, sg);
  s2.textContent = `墨卡托 · 中央纬线 ${Math.abs(CENTER_LAT).toFixed(1)}°${CENTER_LAT >= 0 ? 'N' : 'S'} 处准确`;

  /* 统计块 */
  let ry = 356;
  const altMin = MINE.length ? Math.min(...MINE.map(r => r.a[0])) : 0;
  const altMax = MINE.length ? Math.max(...MINE.map(r => r.a[1])) : 0;
  const rows = [
    ['产区数', MINE.length + ' 个'],
    ['海拔区间', MINE.length ? altMin + ' – ' + altMax + ' m' : '—'],
    ['纬度带', MINE.length ? `${Math.abs(FB.y0).toFixed(1)}°–${Math.abs(FB.y1).toFixed(1)}°${FB.y1 >= 0 ? 'N' : 'S'}` : '—'],
    ['生豆年产量', FEAT && FEAT.p > 0 ? (FEAT.p / 1000).toFixed(2) + ' 百万袋（' + (FEAT.p * 60 / 1000).toFixed(0) + ' 万吨）' : '无商业规模统计'],
  ];
  const st = el('text', { x:RAIL, y:ry, class:'rail-t' }, gFrame); st.textContent = '全国概览 OVERVIEW';
  ry += 20;
  rows.forEach(rw => {
    const k = el('text', { x:RAIL, y:ry, class:'rail-k' }, gFrame); k.textContent = rw[0];
    const v = el('text', { x:RAIL, y:ry + 15, class:'rail-b' }, gFrame); v.textContent = rw[1];
    ry += 34;
  });
  if (FEAT && FEAT.r) {
    const k = el('text', { x:RAIL, y:ry, class:'rail-k' }, gFrame); k.textContent = '产业角色';
    const words = FEAT.r, per = 22;
    for (let i = 0, ln = 0; i < words.length; i += per, ln++) {
      const v = el('text', { x:RAIL, y:ry + 15 + ln * 15, class:'rail-v' }, gFrame);
      v.textContent = words.slice(i, i + per);
    }
    ry += 15 + Math.ceil(words.length / per) * 15 + 14;
  }

  /* 构成条形 */
  function compose(title, items, yStart) {
    const t = el('text', { x:RAIL, y:yStart, class:'rail-t' }, gFrame); t.textContent = title;
    const tot = items.reduce((s, x) => s + x.v, 0) || 1;
    let yy = yStart + 16;
    items.forEach(it => {
      const w = 150 * it.v / tot;
      el('rect', { x:RAIL, y:yy, width:Math.max(2, w), height:8, fill:it.c }, gFrame);
      const lb = el('text', { x:RAIL + 158, y:yy + 8, class:'rail-v' }, gFrame);
      lb.textContent = `${it.k} ${it.v}`;
      yy += 17;
    });
    return yy + 8;
  }
  let cy = Math.min(ry + 8, 596);
  cy = compose('处理法构成', Object.keys(PROCESS).map(k => ({
    k:PROCESS[k].k, c:PROCESS[k].c, v:MINE.filter(r => r.pr === k).length })).filter(x => x.v), cy);
  cy = compose('豆种构成', Object.keys(SPECIES).map(k => ({
    k:SPECIES[k].k, c:SPECIESC[k] || '#888', v:MINE.filter(r => r.spc === k).length })).filter(x => x.v), cy);
  compose('烘焙度构成', ROAST.map((x, i) => ({
    k:x.k, c:ROASTC[i], v:MINE.filter(r => r.rm === i + 1).length })).filter(x => x.v), cy);
}

/* ─────────── 图例 ─────────── */
const LGY = [754, 792];
function lgGroup(x, y, title, items) {
  const gt = el('text', { x, y, class:'lgtitle' }, gFrame); gt.textContent = title;
  let ix = x + textW(title, 11.5) + 14;
  const cy = y + 8;
  items.forEach(it => {
    const r = it.r || 7;
    if (it.k === 'rect') el('rect', { x:ix, y:cy - 6, width:it.w || 20, height:13, fill:it.c, stroke:'#0a0e13', 'stroke-width':.6 }, gFrame);
    else if (it.k === 'circle') el('circle', { cx:ix + r, cy:cy, r:r, fill:it.c, stroke:'#0a0e13', 'stroke-width':.9 }, gFrame);
    else if (it.k === 'ring') el('circle', { cx:ix + r, cy:cy, r:r, fill:it.c, 'fill-opacity':.28, stroke:it.c, 'stroke-width':2.4 }, gFrame);
    else if (it.k === 'diamond') el('path', { d:`M${ix + r} ${cy - r}L${ix + 2*r} ${cy}L${ix + r} ${cy + r}L${ix} ${cy}Z`, fill:it.c, stroke:'#0a0e13', 'stroke-width':.9 }, gFrame);
    else if (it.k === 'size') el('circle', { cx:ix + r, cy:cy, r:r, fill:'#7d8794', stroke:'#0a0e13', 'stroke-width':.9 }, gFrame);
    const off = it.k === 'rect' ? (it.w || 20) + 6 : 2 * r + 5;
    const tx = el('text', { x:ix + off, y:cy + 6, class:'lg-i' }, gFrame); tx.textContent = it.t;
    ix += off + textW(it.t, 11) + 15;
  });
  return ix;
}
function buildLegend() {
  el('line', { x1:30, y1:732, x2:VW - 30, y2:732, stroke:'#243040', 'stroke-width':1 }, gFrame);
  let x = lgGroup(34, LGY[0], '色相＝处理法（可切换）',
    Object.keys(PROCESS).map(k => ({ k:'circle', c:PROCESS[k].c, t:PROCESS[k].k })));
  x = lgGroup(x + 26, LGY[0], '形状＝豆种',
    [['arabica','阿拉比卡','circle'],['robusta','罗布斯塔','diamond'],['both','阿/罗兼产','ring']]
      .map(s => ({ k:s[2], c:SPECIESC[s[0]], t:s[1] })));
  lgGroup(x + 26, LGY[0], '尺寸＝海拔',
    [600, 1400, 2200].map(a => ({ k:'size', c:'#7d8794',
      r:+(5.5 + 8.5 * Math.min(1, Math.max(0, (a - 150) / 2200))).toFixed(1), t:a + 'm' })));
  x = lgGroup(34, LGY[1], '色相＝烘焙度',
    ROAST.map((r, i) => ({ k:'rect', c:ROASTC[i], t:r.k, w:14 })));
  lgGroup(x + 26, LGY[1], '色相＝风味主族',
    FLAVOR.map(f => ({ k:'circle', c:f.c, t:f.k })));
  const ft = el('text', { x:34, y:LGY[1] + 40, class:'h3' }, gFrame);
  ft.textContent = '底图 Natural Earth 1:50m（中国国界按国家测绘标准口径绘制） · 产区属性为产区层面的常见区间与典型描述，烘焙度为该产区豆性对应的市场常见区间（非产地标准）';
}

/* ─────────── 子产区区块（名册用，与主图详情卡同源同构） ─────────── */
const SUBTYPE_ = (typeof SUBTYPE !== 'undefined') ? SUBTYPE : {};
function subCell(r) {
  if (!r.sub || !r.sub.length) return '<td class="subs none">—</td>';
  const items = r.sub.map(s => {
    const ty = SUBTYPE_[s.t] || { k:'—', d:'' };
    const pr = PROCESS[s.pr] || { k:'—', c:'#7d8794' };
    return `<div class="srow"><span class="snm">${s.n}</span>` +
      `<span class="sen">${s.en}</span>` +
      `<span class="sty" title="${ty.d}">${ty.k}</span>` +
      `<span class="smeta">${s.a[0]}–${s.a[1]} m　·　<span style="color:${pr.c}">${pr.k}</span></span>` +
      `<span class="snt">${s.nt}</span></div>`;
  }).join('');
  return `<td class="subs">${items}` +
    (r.sn ? `<div class="snote">子产区口径：${r.sn}</div>` : '') + `</td>`;
}

/* ─────────── 产区名册 ─────────── */
function buildRoster() {
  const box = $('roster');
  if (!MINE.length) { box.innerHTML = '<div class="empty">该国家/地区暂无收录产区</div>'; return; }
  const sorted = MINE.slice().sort((a, b) => b.md - a.md);
  const nSub = MINE.reduce((s, r) => s + (r.sub ? r.sub.length : 0), 0);
  let h = `<h4>产区名册 · 按海拔中值降序（与图上符号双向联动）${nSub ? '　·　含 ' + nSub + ' 个著名子产区' : ''}</h4><table><thead><tr>` +
    '<th>产区</th><th>著名子产区</th><th>海拔</th><th>处理法</th><th>豆种 / 品种</th><th>常见烘焙</th><th>风味</th></tr></thead><tbody>';
  sorted.forEach(r => {
    const pr = PROCESS[r.pr] || { k:'—', c:'#888' };
    const sp = SPECIES[r.spc] || { k:'—' };
    const bar5 = ROAST.map((x, i) => `<i class="${i + 1 >= r.ro[0] && i + 1 <= r.ro[1] ? 'on' : ''}"></i>`).join('');
    h += `<tr data-i="${r.i}">` +
      `<td class="nm">${r.n}<span>${r.en}</span></td>` +
      subCell(r) +
      `<td class="alt">${r.a[0]}–${r.a[1]} m</td>` +
      `<td><span class="chip" style="background:${pr.c}"></span>${pr.k}</td>` +
      `<td>${sp.k}<div style="color:var(--gold2);margin-top:2px">${r.va}</div></td>` +
      `<td>${ROAST[r.ro[0] - 1].k}${r.ro[1] > r.ro[0] ? '–' + ROAST[r.ro[1] - 1].k : ''}<div class="bar5" style="margin-top:3px">${bar5}</div></td>` +
      `<td><div class="tags">${r.fl.split(/[、,，]/).filter(Boolean).map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div></td>` +
      `</tr>`;
  });
  h += '</tbody></table>';
  box.innerHTML = h;
  box.querySelectorAll('tr[data-i]').forEach(tr => {
    tr.addEventListener('mouseenter', () => { ST.hi = +tr.dataset.i; drawPoints(); });
    tr.addEventListener('mouseleave', () => { ST.hi = -1; drawPoints(); });
    tr.addEventListener('click', () => { ST.sel = +tr.dataset.i; drawPoints(); });
  });
}

/* ─────────── 悬浮 / 点击 ─────────── */
const tip = $('tip');
gPt.addEventListener('mousemove', e => {
  const g = e.target.closest('.ptg'); if (!g || !g.__r) return;
  const r = g.__r, pr = PROCESS[r.pr] || { k:'—' };
  tip.innerHTML = `<b>${r.n}</b> <span class="r">${r.en}</span>
    <div class="r">海拔 ${r.a[0]}–${r.a[1]} m · 中值 ${Math.round(r.md)} m</div>
    <div>${pr.k} · ${(SPECIES[r.spc] || {}).k} · ${r.fm}</div>
    <div class="r" style="margin-top:3px">${r.fl}</div>
    ${r.sub && r.sub.length ? `<div class="r" style="margin-top:4px;color:var(--gold2)">子产区：${r.sub.map(s => s.n).join('、')}</div>` : ''}`;
  tip.classList.add('on');
  const w = svg.parentNode.getBoundingClientRect();
  tip.style.left = Math.min(e.clientX - w.left + 14, w.width - 285) + 'px';
  tip.style.top = Math.min(e.clientY - w.top + 14, w.height - 120) + 'px';
  if (ST.hi !== r.i) { ST.hi = r.i; drawPoints(); }
});
gPt.addEventListener('mouseleave', () => { tip.classList.remove('on'); if (ST.hi !== -1) { ST.hi = -1; drawPoints(); } });
gPt.addEventListener('click', e => {
  const g = e.target.closest('.ptg'); if (!g || !g.__r) return;
  ST.sel = g.__r.i; drawPoints();
});

/* ─────────── 工具条 ─────────── */
$('segVar').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  [...$('segVar').querySelectorAll('button')].forEach(x => x.classList.remove('on'));
  b.classList.add('on'); ST.varKey = b.dataset.v; drawPoints();
});
const chk = $('chkLabel');
if (chk) chk.addEventListener('click', () => {
  ST.labels = !ST.labels; chk.classList.toggle('on', ST.labels); drawPoints();
});
const sel = $('ctSel');
if (sel && typeof CLIST !== 'undefined') {
  sel.innerHTML = CLIST.map(c => `<option value="${c.f}"${c.c === CT ? ' selected' : ''}>${c.c}（${c.n}）</option>`).join('');
  sel.addEventListener('change', () => { location.href = sel.value + '.html'; });
}

/* ─────────── 页头 ─────────── */
(function header() {
  const en = (FEAT && FEAT.n) || (ALIAS ? ALIAS.scope : '') || '';
  $('h1').textContent = CT + ' · 咖啡产区分布图';
  $('h2').textContent = en + (ALIAS ? '　（' + ALIAS.scope + '）' : '');
  const altMin = MINE.length ? Math.min(...MINE.map(r => r.a[0])) : 0;
  const altMax = MINE.length ? Math.max(...MINE.map(r => r.a[1])) : 0;
  const nSub = MINE.reduce((s, r) => s + (r.sub ? r.sub.length : 0), 0);
  $('h3').innerHTML =
    `<span><i>产区</i><b>${MINE.length}</b> 个</span>` +
    (nSub ? `<span><i>子产区</i><b>${nSub}</b> 个</span>` : '') +
    `<span><i>海拔</i><b>${MINE.length ? altMin + '–' + altMax : '—'}</b> m</span>` +
    `<span><i>生豆年产量</i><b>${FEAT && FEAT.p > 0 ? (FEAT.p / 1000).toFixed(2) + ' 百万袋' : '无统计'}</b></span>` +
    (FEAT && FEAT.g > 0 ? `<span><i>全球分级</i><b>${GRADE_LABEL[FEAT.g]}</b></span>` : '');
  document.title = CT + ' · 咖啡产区分布图';
})();

/* ─────────── 启动 ─────────── */
buildGrid(); buildLand(); buildRail(); buildLegend(); buildRoster(); drawPoints();

})();
