/* ============================================================
   世界咖啡产区与庄园分布图 —— 渲染层
   依赖：world-geo.js (WORLD) / regions.js (REGIONS, PROCESS, SPECIES, ROAST)
   无第三方库，纯 SVG 手绘。
   ------------------------------------------------------------
   视觉变量设计（制图学四变量分配）：
     面 (area)  : 国家生豆年产量 → 6 级分级统计填色
     点 (point) : 位置＝产区；尺寸＝海拔中值；形状＝豆种大类；色相＝可切换
     线 (line)  : 咖啡带界线 ±25°、赤道、经纬网
     注记       : 一级产区常显注记，八方向候选位 + 矩形碰撞检测
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

/* ─────────── 1. Robinson 折衷投影（1963） ─────────── */
const RX = [1.0000,0.9986,0.9954,0.9900,0.9822,0.9730,0.9600,0.9427,0.9216,
            0.8962,0.8679,0.8350,0.7986,0.7597,0.7186,0.6732,0.6213,0.5722,0.5322];
const RY = [0.0000,0.0620,0.1240,0.1860,0.2480,0.3100,0.3720,0.4340,0.4958,
            0.5571,0.6176,0.6769,0.7346,0.7903,0.8435,0.8936,0.9394,0.9761,1.0000];

/** 归一化坐标：x∈[-2.666,2.666]（赤道处半宽 0.8487π），y∈[-1.3523,1.3523] */
function robinson(lon, lat) {
  const a = Math.min(90, Math.abs(lat));
  const i = Math.min(17, Math.floor(a / 5)), t = (a - i * 5) / 5;
  const X = RX[i] + (RX[i + 1] - RX[i]) * t;
  const Y = RY[i] + (RY[i + 1] - RY[i]) * t;
  return [0.8487 * X * lon * Math.PI / 180, -1.3523 * Y * (lat < 0 ? -1 : 1)];
}

/* ─────────── 2. 版式常量 ─────────── */
const VW = 1600, VH = 1100;          // 画布
const MW = 1560;                     // 地图满宽
const S  = MW / (2 * 0.8487 * Math.PI);   // 投影缩放 ≈292.56
const CX = 800, CY = 515;            // 投影原点（赤道与本初子午线交点）
const MAP_TOP = CY - 1.3523 * S, MAP_BOT = CY + 1.3523 * S;   // ≈119.4 / 910.6

function P(lon, lat) { const r = robinson(lon, lat); return [CX + r[0] * S, CY + r[1] * S]; }

/** 由屏幕 y 反解纬度绝对值（用于在极区空白三角内安放指北针、比例尺） */
function latAbsFromY(y) {
  const t = Math.min(1, Math.abs(y - CY) / (1.3523 * S));
  for (let i = 0; i < 18; i++) if (t >= RY[i] && t <= RY[i + 1]) {
    return (i + (t - RY[i]) / (RY[i + 1] - RY[i])) * 5;
  }
  return 90;
}
function robinsonHalfWidthFrac(latAbs) {
  const i = Math.min(17, Math.floor(latAbs / 5)), t = (latAbs - i * 5) / 5;
  return RX[i] + (RX[i + 1] - RX[i]) * t;
}
/** 给定屏幕 y，地图右边界的 x（用于避让） */
function mapRightAt(y) {
  return CX + S * 0.8487 * Math.PI * robinsonHalfWidthFrac(latAbsFromY(y));
}

/* ─────────── 3. 调色板 ─────────── */
const SEA   = '#0d131b';
const NOCOF = '#232a33';                                        // 无商业产量
const CHORO = ['#232a33','#3a3229','#503f2b','#674c2c','#80592a','#9c6c28','#bd8527'];
const GRADE_LABEL = ['无商业产量','<10 万袋','10–50 万袋','50–200 万袋',
                     '200–600 万袋','600–2000 万袋','>2000 万袋'];
const ROASTC  = ['#f6dcae','#e3b06a','#c98340','#96552c','#5b3218'];
const SPECIESC = { arabica:'#4fb3a5', robusta:'#c2673e', both:'#9a86c8', liberica:'#b0a04a' };

/* 风味族：由产区风味描述关键词归纳（优先级自上而下，先命中者为主族） */
const FLAVOR = [
  { k:'酒香/发酵', c:'#8e6fd8', w:['酒','发酵','厌氧','碳酸','朗姆','白兰地','菠萝','芒果','荔枝','热带水果'] },
  { k:'莓果',      c:'#c0392b', w:['蓝莓','草莓','莓','黑加仑','黑醋栗','葡萄','乌梅','桑葚','黑莓'] },
  { k:'花香',      c:'#cf7fb8', w:['茉莉','花香','玫瑰','薰衣草','桂花','橙花','花'] },
  { k:'柑橘/核果', c:'#e8b13a', w:['佛手柑','柠檬','柑橘','橙','柚','核果','桃','杏','青苹','橘子','青柠'] },
  { k:'香料/草本', c:'#4f9d69', w:['香料','草本','木质','土壤','烟熏','薄荷','雪松','胡椒','丁香','茶','药草'] },
  { k:'坚果/可可', c:'#a9764a', w:['坚果','巧','可可','焦糖','奶油','饼干','谷物','蜂蜜','太妃','糖浆','麦'] },
];
function flavorOf(fl) {
  const s = fl || '';
  for (const f of FLAVOR) for (const w of f.w) if (s.indexOf(w) >= 0) return f.k;
  return '坚果/可可';
}
const FLAVORC = {}; FLAVOR.forEach(f => FLAVORC[f.k] = f.c);

/* ─────────── 4. 数据预处理 ─────────── */
REGIONS.forEach((r, i) => {
  r.i  = i;
  r.md = (r.a[0] + r.a[1]) / 2;                 // 海拔中值
  r.rm = Math.round((r.ro[0] + r.ro[1]) / 2);   // 烘焙度中值 1–5
  r.fm = flavorOf(r.fl);                        // 风味主族
  r.spc = SPECIES[r.sp] ? r.sp : 'arabica';
  r.rd = 3.0 + 5.4 * Math.min(1, Math.max(0, (r.md - 150) / 2200));  // 半径 3.0–8.4
});
const ALT_MIN = Math.min(...REGIONS.map(r => r.a[0]));
const ALT_MAX = Math.max(...REGIONS.map(r => r.a[1]));

/* ─────────── 5. 状态 ─────────── */
const ST = {
  varKey: 'process',      // 点色变量
  species: 'all',         // 豆种筛选
  alt: 'all',             // 海拔筛选
  q: '',
  labels: true, belt: true, grid: true,
  k: 1, tx: 0, ty: 0,
  sel: -1,                // 选中的产区
};

/* ─────────── 用户自填的「口味描述」（可增 / 改 / 删，存 localStorage） ─────────── */
/* 以产区中文名为主键 —— 已校验 107 个产区名互不重复，改数据也不会错位。 */
const NOTE_KEY = 'coffee-map.taste.v1';
const NOTES = (() => {
  try { const o = JSON.parse(localStorage.getItem(NOTE_KEY) || '{}'); return (o && typeof o === 'object') ? o : {}; }
  catch (e) { return {}; }
})();
function noteSave() { try { localStorage.setItem(NOTE_KEY, JSON.stringify(NOTES)); } catch (e) {} }
function noteGet(r) { return NOTES[r.n] || ''; }
function noteSet(r, v) { v = String(v || '').trim(); if (v) NOTES[r.n] = v; else delete NOTES[r.n]; noteSave(); }
function noteCount() { return Object.keys(NOTES).length; }

function visible(r) {
  if (ST.species !== 'all' && r.spc !== ST.species) return false;
  if (ST.alt === 'hi' && r.md < 1500) return false;
  if (ST.alt === 'lo' && r.a[1] < 1000) return false;
  if (ST.q) {
    const s = (r.n + r.en + r.ct + r.va + r.fl + (r.nt || '') + r.fm + subText(r) + noteGet(r)).toLowerCase();
    if (s.indexOf(ST.q.toLowerCase()) < 0) return false;
  }
  return true;
}
/* 子产区检索串：搜「罕贝拉」「Hambella」「Uraga」都应命中古吉 */
function subText(r) {
  return r.sub ? r.sub.map(s => s.n + s.en).join('') : '';
}
/* 子产区区块 HTML（主图详情卡与国家页名册共用同一份结构） */
const SUBTYPE_ = (typeof SUBTYPE !== 'undefined') ? SUBTYPE : {};
function subBlockHTML(r) {
  if (!r.sub || !r.sub.length) return '';
  const items = r.sub.map(s => {
    const ty = SUBTYPE_[s.t] || { k:'—' };
    const pr = PROCESS[s.pr] || { k:'—', c:'#7d8794' };
    return `<div class="sub">
      <span class="snm">${s.n}</span><span class="sen">${s.en}</span>
      <span class="sty" title="${ty.d}">${ty.k}</span>
      <span class="smeta">${s.a[0]}–${s.a[1]} m　·　<span style="color:${pr.c}">${pr.k}</span></span>
      <span class="snt">${s.nt}</span></div>`;
  }).join('');
  return `<div class="subs">${items}</div>` +
    (r.sn ? `<div class="snote">子产区口径：${r.sn}</div>` : '');
}
function colorOf(r) {
  switch (ST.varKey) {
    case 'roast':   return ROASTC[Math.min(4, Math.max(0, r.rm - 1))];
    case 'species': return SPECIESC[r.spc] || '#4fb3a5';
    case 'flavor':  return FLAVORC[r.fm] || '#a9764a';
    default:        return (PROCESS[r.pr] || {}).c || '#888';
  }
}

/* ─────────── 6. 骨架 ─────────── */
const svg = $('map');
svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
/* 海洋底 + 图廓（必须最先绘制，位于所有图层之下） */
el('rect', { x:0, y:0, width:VW, height:VH, fill:SEA }, svg);
const defs = el('defs', null, svg);
const gGeo   = el('g', { id:'geo' }, svg);     // 随缩放变换：海陆、经纬网、咖啡带
const gBelt  = el('g', null, gGeo);
const gGrid  = el('g', null, gGeo);
const gLand  = el('g', null, gGeo);
const gPt    = el('g', { id:'pts' }, svg);     // 符号：位置随缩放，尺寸恒定
const gLab   = el('g', { id:'labs' }, svg);
const gFrame = el('g', null, svg);             // 标题、图例等固定装饰

/* ─────────── 7. 经纬网 ─────────── */
function buildGrid() {
  gGrid.innerHTML = '';
  const draw = (pts, cls) => {
    let d = '';
    pts.forEach((p, i) => { const q = P(p[0], p[1]); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); });
    el('path', { d, fill:'none', class:cls, 'vector-effect':'non-scaling-stroke' }, gGrid);
  };
  for (let lon = -180; lon <= 180; lon += 30) {
    const pts = []; for (let la = -84; la <= 84; la += 4) pts.push([lon, la]);
    draw(pts, 'grid-line');
  }
  for (let la = -60; la <= 60; la += 20) {
    if (la === 0) continue;
    const pts = []; for (let lo = -180; lo <= 180; lo += 5) pts.push([lo, la]);
    draw(pts, 'grid-line');
  }
  // 赤道：加重
  const eq = []; for (let lo = -180; lo <= 180; lo += 5) eq.push([lo, 0]);
  draw(eq, 'grid-eq');
}
const style = document.createElementNS(NS, 'style');
style.textContent = `
  .grid-line{fill:none;stroke:#1b2634;stroke-width:.7;stroke-dasharray:3 4}
  .grid-eq{fill:none;stroke:#31465c;stroke-width:1;stroke-dasharray:6 3}
  .belt-line{fill:none;stroke:#d9a441;stroke-width:1.1;stroke-dasharray:9 5;opacity:.75}
  .coast{stroke:#0a0e13;stroke-width:.55;fill-rule:evenodd}
  .coast.prod{stroke:#131a22;stroke-width:.5}
  .lead{stroke:#8d7a55;stroke-width:.8;opacity:.85}
  .lbtxt{font-size:11px;fill:#f0e6d6;paint-order:stroke;stroke:#0a0e13;stroke-width:3.2;
         stroke-linejoin:round;letter-spacing:.02em}
  .lbsub{font-size:9.2px;fill:#a99a80;paint-order:stroke;stroke:#0a0e13;stroke-width:2.8;stroke-linejoin:round}
  .lg-t{font-size:10.5px;fill:#8b95a3;letter-spacing:.14em}
  .lg-i{font-size:11px;fill:#cfd6de}
  .ttl{font-size:27px;fill:#f4ecd9;letter-spacing:.06em}
  .ttl2{font-size:12.5px;fill:#9aa5b2;letter-spacing:.04em}
  .ttl3{font-size:10.5px;fill:#6b7684;letter-spacing:.03em}
  .lgtitle{font-size:11.5px;fill:#d9a441;letter-spacing:.1em}
  .glabel{font-size:10.5px;fill:#c9a86a;paint-order:stroke;stroke:#0d131b;stroke-width:3;stroke-linejoin:round}
  .sym{stroke:#0a0e13;stroke-width:1}
  .sym.sel{stroke:#f0c46a;stroke-width:2.2}
`;
defs.appendChild(style);

/* ─────────── 8. 咖啡带 ±25° ─────────── */
function buildBelt() {
  gBelt.innerHTML = '';
  const up = [], dn = [];
  for (let lo = -180; lo <= 180; lo += 3) { up.push([lo, 25]); dn.push([lo, -25]); }
  let d = '';
  up.forEach((p, i) => { const q = P(p[0], p[1]); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); });
  dn.reverse().forEach(p => { const q = P(p[0], p[1]); d += 'L' + q[0].toFixed(1) + ' ' + q[1].toFixed(1); });
  d += 'Z';
  el('path', { d, fill:'#d9a441', 'fill-opacity':.055, stroke:'none' }, gBelt);
  [25, -25].forEach(la => {
    let p = '';
    for (let lo = -180; lo <= 180; lo += 3) { const q = P(lo, la); p += (lo === -180 ? 'M' : 'L') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
    el('path', { d:p, class:'belt-line', 'vector-effect':'non-scaling-stroke' }, gBelt);
  });
}

/* ─────────── 9. 面状：国家分级填色 ─────────── */
const countryPaths = [];
function buildLand() {
  gLand.innerHTML = '';
  countryPaths.length = 0;
  WORLD.forEach(f => {
    let d = '';
    f.d.forEach(ring => {
      if (ring.length < 3) return;
      ring.forEach((p, i) => {
        if (i === 0) {
          const a = P(p[0], p[1]); d += 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1);
        } else if (i % 1 === 0) {
          const a = P(p[0], p[1]); d += 'L' + a[0].toFixed(1) + ' ' + a[1].toFixed(1);
        }
      });
      d += 'Z';
    });
    if (!d) return;
    const path = el('path', {
      d, fill: CHORO[f.g], class: 'coast' + (f.g > 0 ? ' prod' : ''),
      'vector-effect': 'non-scaling-stroke'
    }, gLand);
    path.__feat = f;
    countryPaths.push(path);
  });
}

/* ─────────── 10. 点状符号 ─────────── */
function symPath(shape, r) {
  if (shape === 'diamond') return `M0 ${-r}L${r} 0L0 ${r}L${-r} 0Z`;
  return null; // circle / ring 用 <circle>
}
function drawPoints() {
  gPt.innerHTML = ''; gLab.innerHTML = '';
  const vis = REGIONS.filter(visible);
  const boxes = [];   // 注记避让盒
  const labs = [];

  vis.forEach(r => {
    const q0 = P(r.lo, r.la);
    const x = q0[0] * ST.k + ST.tx, y = q0[1] * ST.k + ST.ty;
    if (x < -30 || x > VW + 30 || y < -30 || y > VH + 30) return;
    const r0 = r.rd * (1 + (ST.k - 1) * 0.12);
    const col = colorOf(r);
    const g = el('g', { transform:`translate(${x.toFixed(1)},${y.toFixed(1)})`, class:'ptg' }, gPt);
    g.style.cursor = 'pointer';
    let node;
    if (r.spc === 'arabica') {
      node = el('circle', { r:r0.toFixed(2), fill:col, class:'sym' + (ST.sel === r.i ? ' sel' : '') }, g);
    } else if (r.spc === 'robusta') {
      node = el('path', { d:symPath('diamond', r0 * 1.22), fill:col, class:'sym' + (ST.sel === r.i ? ' sel' : '') }, g);
    } else {
      node = el('circle', { r:r0.toFixed(2), fill:col, 'fill-opacity':.28,
        stroke:col, 'stroke-width':Math.max(2.6, r0 * 0.62), class:'sym' + (ST.sel === r.i ? ' sel' : '') }, g);
      el('circle', { r:(r0 * 0.34).toFixed(2), fill:col }, g);
    }
    g.__r = r;
    // 有自填口味描述的产区：右上角挂一枚小金色标记，便于回找
    if (noteGet(r)) {
      const bx = r0 * 0.72 + 2.2, by = -r0 * 0.72 - 2.2;
      el('circle', { cx:bx.toFixed(1), cy:by.toFixed(1), r:3.1, fill:'#f0c46a',
        stroke:'#0b0f14', 'stroke-width':1.1 }, g);
    }
    // 选中项加光晕
    if (ST.sel === r.i) el('circle', { r:(r0 + 6).toFixed(1), fill:'none', stroke:'#f0c46a',
      'stroke-width':1.2, 'stroke-opacity':.6, 'stroke-dasharray':'3 3' }, g);

    if (r.lv === 1 && ST.labels) labs.push({ r, x, y, r0 });
    boxes.push([x - r0 - 1, y - r0 - 1, x + r0 + 1, y + r0 + 1]);
  });

  /* ---- 注记自动避让：主注记＋海拔副注记作为整块参与碰撞 ---- */
  if (ST.labels) {
    labs.sort((a, b) => b.r.md - a.r.md);
    const CAND = [[1,0],[-1,0],[0,-1],[0,1],[1,-1],[-1,-1],[1,1],[-1,1]];
    const placed = boxes.slice();
    placed.push([0, 0, VW, 116], [0, 916, VW, VH]);   // 标题带 / 图例带避让
    labs.forEach(L => {
      const main = L.r.n, sub = Math.round(L.r.a[0]) + '–' + Math.round(L.r.a[1]) + 'm';
      const wM = textW(main, 11), wS = textW(sub, 9.2);
      const W = Math.max(wM, wS) + 4, H = 24;
      let best = null;
      for (const c of CAND) {
        const gap = L.r0 + 6;
        const x0 = c[0] === 1 ? L.x + gap : c[0] === -1 ? L.x - gap - W : L.x - W / 2;
        const y0 = c[1] === -1 ? L.y - gap - H : c[1] === 1 ? L.y + gap : L.y - H / 2;
        const box = [x0 - 1, y0 - 1, x0 + W + 1, y0 + H + 1];
        if (box[0] < 6 || box[2] > VW - 6 || box[1] < 120 || box[3] > 914) continue;
        let hit = false;
        for (const bb of placed) {
          if (box[0] < bb[2] && box[2] > bb[0] && box[1] < bb[3] && box[3] > bb[1]) { hit = true; break; }
        }
        if (!hit) { best = { box, x0, y0, c }; break; }
      }
      if (!best) return;
      placed.push(best.box);
      /* 引线：符号边缘 → 注记块最近端 */
      const c = best.c;
      const lx1 = L.x + c[0] * (L.r0 + 2), ly1 = L.y + c[1] * (L.r0 + 2);
      let lx2, ly2;
      if (c[0] === 1)      { lx2 = best.box[0];        ly2 = best.y0 + 10; }
      else if (c[0] === -1){ lx2 = best.box[2];        ly2 = best.y0 + 10; }
      else if (c[1] === -1){ lx2 = L.x;                ly2 = best.box[3]; }
      else                 { lx2 = L.x;                ly2 = best.box[1]; }
      el('line', { x1:lx1.toFixed(1), y1:ly1.toFixed(1), x2:lx2.toFixed(1), y2:ly2.toFixed(1), class:'lead' }, gLab);
      const anc = c[0] === 1 ? 'start' : c[0] === -1 ? 'end' : 'middle';
      const tx  = c[0] === 1 ? best.box[0] + 2 : c[0] === -1 ? best.box[2] - 2 : (best.box[0] + best.box[2]) / 2;
      const t = el('text', { x:tx.toFixed(1), y:(best.y0 + 10).toFixed(1), class:'lbtxt', 'text-anchor':anc }, gLab);
      t.textContent = main;
      const s2 = el('text', { x:tx.toFixed(1), y:(best.y0 + 21).toFixed(1), class:'lbsub', 'text-anchor':anc }, gLab);
      s2.textContent = sub;
      if (ST.sel === L.r.i) t.setAttribute('fill', '#f0c46a');
    });
  }

  $('cnt').textContent = `显示 ${vis.length} / ${REGIONS.length} 个产区　·　${WORLD.filter(f=>f.g>0).length} 个产咖啡国家/地区` +
    (noteCount() ? `　·　我的口味描述 ${noteCount()} 条` : '');
}

/* ─────────── 11. 固定装饰：标题 / 指北针 / 比例尺 ─────────── */
function buildFrame() {
  gFrame.innerHTML = '';
  /* 标题块 */
  const t1 = el('text', { x:34, y:56, class:'ttl' }, gFrame);
  t1.textContent = '世界咖啡产区与庄园分布图';
  const t2 = el('text', { x:34, y:80, class:'ttl2' }, gFrame);
  t2.textContent = 'Coffee Origins & Estates of the World · 面状＝国家产量　点状＝产区（尺寸＝海拔　形状＝豆种　色相＝可切换）';
  const t3 = el('text', { x:34, y:99, class:'ttl3' }, gFrame);
  t3.textContent = 'Robinson 折衷投影 · 中央经线 0° · 底图：Natural Earth 1:110m（中国国界按国家测绘标准口径绘制）';
  el('line', { x1:34, y1:112, x2:VW - 34, y2:112, stroke:'#2a3542', 'stroke-width':1 }, gFrame);

  /* 指北针（置于图幅右下空白区） */
  const ny = 790, nx = mapRightAt(ny) + 46;
  const g = el('g', { transform:`translate(${nx},${ny})` }, gFrame);
  el('circle', { r:27, fill:'none', stroke:'#2f3d4e', 'stroke-width':1 }, g);
  el('path', { d:'M0 -21 L7 8 L0 2 L-7 8 Z', fill:'#d9a441' }, g);
  el('path', { d:'M0 21 L7 -8 L0 -2 L-7 -8 Z', fill:'#3b4655' }, g);
  const n = el('text', { x:0, y:-30, 'text-anchor':'middle', class:'glabel' }, g);
  n.textContent = 'N';

  /* 比例尺（仅在赤道附近近似有效） */
  const sy = 872, sx = mapRightAt(sy) + 26;
  // 赤道处 1° 经度 ≈ 111.32 km；投影上 1° 经度 = 0.8487 * π/180 * S 像素
  const pxPerDeg = 0.8487 * Math.PI / 180 * S;    // ≈4.302 px/度（赤道）
  const kmPerPx = 111.32 / pxPerDeg;
  const targetKm = 2000, barKm = 2000;
  const barPx = barKm / kmPerPx;
  const sg = el('g', { transform:`translate(${sx},${sy})` }, gFrame);
  for (let i = 0; i < 4; i++) {
    el('rect', { x:i * barPx / 4, y:0, width:barPx / 4, height:6,
      fill: i % 2 ? '#0d131b' : '#c9d2dc', stroke:'#5b6675', 'stroke-width':.6 }, sg);
  }
  const s0 = el('text', { x:0, y:-6, class:'glabel' }, sg); s0.textContent = '0';
  const s1 = el('text', { x:barPx, y:-6, 'text-anchor':'middle', class:'glabel' }, sg); s1.textContent = barKm + ' km';
  const s2 = el('text', { x:barPx / 2, y:19, 'text-anchor':'middle', class:'ttl3' }, sg);
  s2.textContent = '赤道附近近似比例尺';

  /* 咖啡带注记（图幅左上空白） */
  const by = 300, bx = 40;
  const bg = el('g', { transform:`translate(${bx},${by})` }, gFrame);
  el('rect', { x:0, y:0, width:214, height:64, rx:5, fill:'#d9a441', 'fill-opacity':.07,
    stroke:'#d9a441', 'stroke-opacity':.35, 'stroke-width':.8, 'stroke-dasharray':'4 3' }, bg);
  const b1 = el('text', { x:12, y:22, class:'lgtitle' }, bg); b1.textContent = '咖啡带 COFFEE BELT';
  const b2 = el('text', { x:12, y:39, class:'lg-i' }, bg); b2.textContent = '南北纬 25° 之间 —— 咖啡树';
  const b3 = el('text', { x:12, y:55, class:'lg-i' }, bg); b3.textContent = '的商业种植几乎全部落在此带内';
}

/* ─────────── 12. 图例 ─────────── */
/* 文本宽度估算：CJK 全宽，拉丁/数字 0.56 宽 */
function textW(s, fs) {
  fs = fs || 11; let w = 0;
  for (const ch of String(s)) w += ch.charCodeAt(0) > 0x2e7f ? fs : fs * 0.56;
  return w;
}
const LGY = [948, 986, 1024];   // 三行图例基线
function lgGroup(x, y, title, items, note) {
  const gt = el('text', { x, y, class:'lgtitle' }, gFrame);
  gt.textContent = title;
  let ix = x + textW(title, 11.5) + 14;
  const cy = y + 8;
  items.forEach(it => {
    const r = it.r || 7;
    if (it.k === 'rect') el('rect', { x:ix, y:cy - r + 1, width:it.w || 20, height:13, fill:it.c,
      stroke:'#0a0e13', 'stroke-width':.6 }, gFrame);
    else if (it.k === 'circle') el('circle', { cx:ix + r, cy:cy, r:r, fill:it.c,
      stroke:'#0a0e13', 'stroke-width':.9 }, gFrame);
    else if (it.k === 'ring') el('circle', { cx:ix + r, cy:cy, r:r, fill:it.c, 'fill-opacity':.28,
      stroke:it.c, 'stroke-width':2.4 }, gFrame);
    else if (it.k === 'diamond') el('path', {
      d:`M${ix + r} ${cy - r} L${ix + 2 * r} ${cy} L${ix + r} ${cy + r} L${ix} ${cy} Z`,
      fill:it.c, stroke:'#0a0e13', 'stroke-width':.9 }, gFrame);
    else if (it.k === 'size') el('circle', { cx:ix + r, cy:cy, r:r, fill:'#7d8794',
      stroke:'#0a0e13', 'stroke-width':.9 }, gFrame);
    const tx = el('text', { x:ix + (it.k === 'rect' ? (it.w || 20) + 6 : 2 * r + 5), y:cy + 6, class:'lg-i' }, gFrame);
    tx.textContent = it.t;
    ix += (it.k === 'rect' ? (it.w || 20) + 6 : 2 * r + 5) + textW(it.t, 11) + 15;
  });
  if (note) {
    const nt = el('text', { x:ix + 10, y:cy + 6, class:'ttl3' }, gFrame);
    nt.textContent = note;
    ix += 10 + textW(note, 10.5);
  }
  return ix;
}
function buildLegend() {
  el('line', { x1:30, y1:926, x2:VW - 30, y2:926, stroke:'#243040', 'stroke-width':1 }, gFrame);
  // 第一行：面状产量 + 烘焙度
  let x = lgGroup(34, LGY[0], '面状 · 国家生豆年产量（60kg 袋）',
    CHORO.map((c, i) => ({ k:'rect', c, t:GRADE_LABEL[i], w:22 })));
  lgGroup(x + 26, LGY[0], '烘焙度 · 常见区间（非产区属性）',
    ROAST.map((r, i) => ({ k:'rect', c:ROASTC[i], t:r.k, w:14 })));
  // 第二行：处理法 + 豆种 + 海拔
  x = lgGroup(34, LGY[1], '点 · 色相＝处理法（可切换）',
    Object.keys(PROCESS).map(k => ({ k:'circle', c:PROCESS[k].c, t:PROCESS[k].k })));
  x = lgGroup(x + 26, LGY[1], '形状＝豆种',
    [['arabica','阿拉比卡','circle'],['robusta','罗布斯塔','diamond'],['both','阿/罗兼产','ring']]
      .map(s => ({ k:s[2], c:SPECIESC[s[0]], t:s[1] })));
  lgGroup(x + 26, LGY[1], '尺寸＝海拔',
    [600, 1400, 2200].map(a => ({ k:'size', c:'#7d8794',
      r:+(3.0 + 5.4 * Math.min(1, Math.max(0, (a - 150) / 2200))).toFixed(1), t:a + 'm' })));
  // 第三行：风味主族 + 说明
  x = lgGroup(34, LGY[2], '点 · 色相＝风味主族（备选方案）',
    FLAVOR.map(f => ({ k:'circle', c:f.c, t:f.k })));
  lgGroup(x + 26, LGY[2], '注记',
    [], '一级产区常显（自动避让＋引线），其余悬停显示 · 点击产区或国家查看详情');
  const t2 = el('text', { x:34, y:LGY[2] + 34, class:'ttl3' }, gFrame);
  t2.textContent = '制图：WorkBuddy · 数据：USDA FAS（产量，量级近似）、产区属性为常见区间归纳 · 底图 Natural Earth 1:110m，中国国界按国家测绘标准口径绘制';
}

/* ─────────── 13. 交互：悬浮卡 / 详情面板 ─────────── */
const tip = $('tip'), card = $('card');
function tipHTML(r) {
  const pr = PROCESS[r.pr] || { k:'—' };
  return `<b>${r.n}</b> <span class="r">${r.en}</span>
    <div class="r">${r.ct} · 海拔 ${r.a[0]}–${r.a[1]} m</div>
    <div>${pr.k} · ${(SPECIES[r.spc] || {}).k || '—'} · ${r.fm}</div>
    <div class="r" style="margin-top:3px">${r.fl}</div>
    ${r.sub && r.sub.length ? `<div class="r" style="margin-top:4px;color:var(--gold2)">子产区：${r.sub.map(s => s.n).join('、')}</div>` : ''}
    ${noteGet(r) ? `<div class="r" style="margin-top:4px;color:var(--gold2)">我的口味描述：${esc(noteGet(r))}</div>` : ''}`;
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}
function showTip(r, ev) {
  const wrap = svg.parentNode.getBoundingClientRect();
  tip.innerHTML = tipHTML(r);
  tip.classList.add('on');
  const sx = ev.clientX - wrap.left + 14, sy2 = ev.clientY - wrap.top + 14;
  tip.style.left = Math.min(sx, wrap.width - 265) + 'px';
  tip.style.top = Math.min(sy2, wrap.height - 110) + 'px';
}
function hideTip() { tip.classList.remove('on'); }

function cardHTML(r) {
  const pr = PROCESS[r.pr] || { k:'—', d:'' };
  const sp = SPECIES[r.spc] || { k:'—', d:'' };
  const roastBar = ROAST.map((x, i) =>
    `<span class="${(i + 1 >= r.ro[0] && i + 1 <= r.ro[1]) ? 'on' : ''}" title="${x.d}"></span>`).join('');
  const altPct = a => ((a - 300) / (2400 - 300) * 100).toFixed(1);
  return `
    <div class="hd"><div>
      <div class="nm">${r.n}</div><div class="en">${r.en}</div></div>
      <div class="x" id="cardX">✕</div></div>
    <div class="row"><div class="k">所属国家 / 产区</div><div class="v">${r.ct}</div></div>
    <div class="row"><div class="k">海拔</div>
      <div class="v big">${r.a[0]} – ${r.a[1]} m</div>
      <div class="altbar"><i style="left:${Math.max(0, Math.min(100, altPct(r.md)))}%"></i></div>
      <div class="k" style="margin-top:4px">中值 ${Math.round(r.md)} m　·　全图范围 ${ALT_MIN}–${ALT_MAX} m</div></div>
    <div class="row"><div class="k">豆种 / 品种</div>
      <div class="v">${sp.k}　<span style="color:var(--gold2)">${r.va}</span></div>
      <div class="k" style="margin-top:3px">${sp.d}</div></div>
    <div class="row"><div class="k">主要处理法</div>
      <div class="v big" style="color:${pr.c}">${pr.k}</div>
      <div class="k" style="margin-top:3px">${pr.d}</div></div>
    <div class="row"><div class="k">常见烘焙区间</div>
      <div class="bar">${roastBar}</div>
      <div class="v">${ROAST[r.ro[0] - 1].k}${r.ro[1] > r.ro[0] ? ' → ' + ROAST[r.ro[1] - 1].k : ''}</div>
      <div class="k" style="margin-top:3px">${ROAST[r.rm - 1].d}</div></div>
    <div class="row"><div class="k">风味</div>
      <div class="tags">${r.fl.split(/[、,，]/).filter(Boolean).map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>
      <div class="k" style="margin-top:5px">主族归类：<b style="color:${FLAVORC[r.fm]}">${r.fm}</b></div></div>
    ${r.sub && r.sub.length ? `<div class="row"><div class="k">著名子产区（${r.sub.length}）</div>
      ${subBlockHTML(r)}</div>` : ''}
    ${r.nt ? `<div class="row"><div class="k">备注</div><div class="v">${r.nt}</div></div>` : ''}
    <div class="row"><div class="k">口味描述　<span class="nt-tag">我的记录 · 可增 / 改 / 删</span></div>
      <textarea id="noteTa" class="nta" rows="3" spellcheck="false"
        placeholder="写下你实际喝到的味道、烘焙度、冲煮参数、购买渠道…只有你自己看得到"></textarea>
      <div class="nbar">
        <button class="nbtn" id="noteSave">保存</button>
        <button class="nbtn ghost" id="noteDel">删除</button>
        <span class="nst" id="noteSt"></span>
      </div></div>
    <div class="row"><div class="k">坐标</div><div class="v">${Math.abs(r.la).toFixed(2)}°${r.la >= 0 ? 'N' : 'S'}　${Math.abs(r.lo).toFixed(2)}°${r.lo >= 0 ? 'E' : 'W'}</div></div>`;
}
function showCardRegion(r) {
  ST.sel = r.i; card.innerHTML = cardHTML(r); card.classList.add('on');
  const x = $('cardX'); if (x) x.onclick = () => { ST.sel = -1; card.classList.remove('on'); render(); };

  /* —— 口味描述：填值 + 增改删 —— */
  const ta = $('noteTa'), st = $('noteSt');
  if (ta) {
    ta.value = noteGet(r);                    // 用 .value 赋值，天然免疫 HTML 转义
    const say = (msg, ok) => { st.textContent = msg; st.className = 'nst' + (ok ? ' ok' : ''); };
    const save = () => {
      const v = ta.value.trim();
      noteSet(r, v);
      say(v ? '已保存' : '内容为空，未保存', !!v);
      render();                               // 刷新图面上的金色标记与计数
    };
    $('noteSave').onclick = save;
    $('noteDel').onclick = () => {
      if (!noteGet(r)) { say('本来就没有记录', false); return; }
      ta.value = ''; noteSet(r, ''); say('已删除', true); render();
    };
    ta.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); }
    });
    if (noteGet(r)) say('已有记录', true);
  }
  render();
}
function showCardCountry(f) {
  const rs = REGIONS.filter(r => r.ct === f.c);
  const entry = (typeof CLIST !== 'undefined') ? CLIST.find(c => c.c === f.c) : null;
  const alt = rs.length ? `${Math.min(...rs.map(r => r.a[0]))}–${Math.max(...rs.map(r => r.a[1]))} m` : '—';
  const prs = [...new Set(rs.map(r => (PROCESS[r.pr] || {}).k))];
  card.innerHTML = `
    <div class="hd"><div><div class="nm">${f.c}</div><div class="en">${f.n}</div></div>
      <div class="x" id="cardX">✕</div></div>
    <div class="row"><div class="k">生豆年产量（60kg 袋，量级近似）</div>
      <div class="v big">${f.p > 0 ? (f.p / 1000).toFixed(1) + ' 百万袋（约 ' + (f.p * 60 / 1000).toFixed(0) + ' 万吨）' : '无商业规模产量'}</div>
      <div class="k" style="margin-top:3px">分级：${GRADE_LABEL[f.g]}</div></div>
    ${f.r ? `<div class="row"><div class="k">产业角色</div><div class="v">${f.r}</div></div>` : ''}
    <div class="row"><div class="k">本图收录产区（${rs.length}）</div>
      <div class="v">${rs.map(r => r.n).join('、') || '—'}</div>
      <div class="k" style="margin-top:5px">海拔区间 ${alt}　·　处理法 ${prs.join('、') || '—'}</div></div>
    ${entry ? `<div class="row"><div class="k">国家级细部图</div>
      <a class="jump" href="countries/${entry.f}.html">打开《${f.c} 咖啡产区分布图》&#8594;</a>
      <div class="k" style="margin-top:4px">含定位插图 · 经纬网 · 产区名册（与图上符号联动）</div></div>` : ''}
    <div class="k" style="margin-top:9px;color:var(--dim)">提示：在国界上<b style="color:var(--gold2)">双击</b>可直接进入该国产区图</div>`;
  card.classList.add('on');
  const x = $('cardX'); if (x) x.onclick = () => card.classList.remove('on');
}

/* ─────────── 14. 缩放 / 平移 ─────────── */
const K_MIN = 1, K_MAX = 12;
/* 图幅在 SVG 坐标中的外接范围（面状底图 + 图例以外的实际地图区域） */
const MAPX0 = CX - MW / 2, MAPX1 = CX + MW / 2;      // ≈20 … 1580
/* 平移边界：视口中心必须落在图幅范围内。
   旧的 ±((k-1)·CX+260) 边界在大倍率下远小于合法范围（k=2.44 时真实可平移
   ±3055，旧式只给 ±1409），导致放大后在亚洲一带被"卡死"拖不动。 */
function clampPan() {
  const vx = VW / 2, vy = 550;
  const txMin = vx - MAPX1 * ST.k, txMax = vx - MAPX0 * ST.k;
  const tyMin = vy - MAP_BOT * ST.k, tyMax = vy - MAP_TOP * ST.k;
  ST.tx = Math.max(txMin, Math.min(txMax, ST.tx));
  ST.ty = Math.max(tyMin, Math.min(tyMax, ST.ty));
}
function applyGeo() {
  gGeo.setAttribute('transform', `translate(${ST.tx.toFixed(2)},${ST.ty.toFixed(2)}) scale(${ST.k.toFixed(4)})`);
  const zk = $('zK'); if (zk) zk.textContent = (ST.k < 10 ? ST.k.toFixed(1) : Math.round(ST.k)) + '×';
}

/* —— 视图动画：缩放/复位走缓动，避免跳变 —— */
let animId = null;
function setView(k, tx, ty) { ST.k = k; ST.tx = tx; ST.ty = ty; clampPan(); applyGeo(); render(); }
function animateView(tk, ttx, tty, ms) {
  if (animId) cancelAnimationFrame(animId);
  const k0 = ST.k, x0 = ST.tx, y0 = ST.ty, t0 = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  (function step() {
    const p = Math.min(1, (performance.now() - t0) / (ms || 260)), e = ease(p);
    setView(k0 + (tk - k0) * e, x0 + (ttx - x0) * e, y0 + (tty - y0) * e);
    animId = p < 1 ? requestAnimationFrame(step) : null;
  })();
}
/** 以屏幕点 (cx,cy) 为锚点缩放；省略时以图幅中心为锚点 */
function zoomBy(factor, cx, cy, animate) {
  if (cx === undefined) { cx = VW / 2; cy = CY + 60; }
  const nk = Math.max(K_MIN, Math.min(K_MAX, ST.k * factor));
  if (nk === ST.k) return;
  const u = (cx - ST.tx) / ST.k, v = (cy - ST.ty) / ST.k;
  const tx = cx - u * nk, ty = cy - v * nk;
  if (animate === false) { setView(nk, tx, ty); }
  else animateView(nk, tx, ty, 240);
}
function panBy(dxPx, dyPx, animate) {
  const tx = ST.tx + dxPx, ty = ST.ty + dyPx;
  if (animate === false) setView(ST.k, tx, ty); else animateView(ST.k, tx, ty, 180);
}
function fitAll() { animateView(1, 0, 0, 340); }

/* —— 滚轮缩放 —— */
svg.addEventListener('wheel', e => {
  e.preventDefault();
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  const r = svg.getBoundingClientRect();
  zoomBy(e.deltaY < 0 ? 1.16 : 1 / 1.16,
         (e.clientX - r.left) / r.width * VW,
         (e.clientY - r.top) / r.height * VH, false);
}, { passive: false });

/* —— 拖动平移（Pointer Events，鼠标 / 触控板 / 触屏通用） —— */
/* 说明：不使用 setPointerCapture —— 指针捕获会把随后的 click 事件重定向到 svg，
   导致点选产区/国家失效。改为在 window 上监听移动与抬起，兼顾鼠标与触屏。 */
let drag = null;
svg.addEventListener('pointerdown', e => {
  if (e.button !== undefined && e.button !== 0) return;
  drag = { x:e.clientX, y:e.clientY, tx:ST.tx, ty:ST.ty, moved:false };
  svg.classList.add('dragging');
});
window.addEventListener('pointermove', e => {
  if (!drag) return;
  const r = svg.getBoundingClientRect();
  const dx = (e.clientX - drag.x) / r.width * VW, dy = (e.clientY - drag.y) / r.height * VH;
  if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 2) return;   // 阈值：避免误判点击为拖动
  drag.moved = true;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  setView(ST.k, drag.tx + dx, drag.ty + dy);
});
let suppressClick = false;      // 真实拖动结束后，抑制随之而来的 click（避免误开卡片）
function endDrag() {
  if (drag && drag.moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 80); }
  drag = null; svg.classList.remove('dragging');
}
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);

/* —— 控制条 —— */
const STEP = 1.55;
$('zIn').addEventListener('click', () => zoomBy(STEP));
$('zOut').addEventListener('click', () => zoomBy(1 / STEP));
$('zFit').addEventListener('click', fitAll);
$('zFull').addEventListener('click', toggleFull);

/* —— 全屏 —— */
function toggleFull() {
  const wrap = svg.parentNode;
  if (document.fullscreenElement) { document.exitFullscreen(); return; }
  if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
  else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
}
document.addEventListener('fullscreenchange', () => {
  const on = !!document.fullscreenElement;
  $('zFull').classList.toggle('fs-on', on);
  $('zFull').textContent = on ? '⤡' : '⛶';
});

/* —— 键盘：＋ － 0 F 与方向键 —— */
window.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toUpperCase();
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
  const pan = Math.min(VW, VH) * 0.08;
  switch (e.key) {
    case '+': case '=': zoomBy(STEP); break;
    case '-': case '_': zoomBy(1 / STEP); break;
    case '0': fitAll(); break;
    case 'f': case 'F': toggleFull(); break;
    case 'ArrowLeft':  panBy(pan, 0); e.preventDefault(); break;
    case 'ArrowRight': panBy(-pan, 0); e.preventDefault(); break;
    case 'ArrowUp':    panBy(0, pan); e.preventDefault(); break;
    case 'ArrowDown':  panBy(0, -pan); e.preventDefault(); break;
    case 'Escape':
      if (document.fullscreenElement) document.exitFullscreen();
      else { ST.sel = -1; card.classList.remove('on'); render(); }
      break;
  }
});

/* 点/面事件 */
gPt.addEventListener('mousemove', e => {
  const g = e.target.closest('.ptg'); if (!g || !g.__r) return hideTip();
  showTip(g.__r, e);
});
gPt.addEventListener('mouseleave', hideTip);
gPt.addEventListener('click', e => {
  if (suppressClick) return;
  const g = e.target.closest('.ptg'); if (g && g.__r) showCardRegion(g.__r);
});
gLand.addEventListener('mousemove', e => {
  const f = e.target.__feat; if (!f) return;
  tip.innerHTML = `<b>${f.c}</b><div class="r">${f.p > 0 ? '年产量约 ' + (f.p / 1000).toFixed(1) + ' 百万袋' : '无商业规模产量'}</div>
    ${f.r ? '<div class="r">' + f.r + '</div>' : ''}<div class="r" style="margin-top:3px">点击查看该国产区</div>`;
  tip.classList.add('on');
  const wrap = svg.parentNode.getBoundingClientRect();
  tip.style.left = Math.min(e.clientX - wrap.left + 14, wrap.width - 265) + 'px';
  tip.style.top = Math.min(e.clientY - wrap.top + 14, wrap.height - 110) + 'px';
});
gLand.addEventListener('click', e => {
  if (suppressClick) return;
  const f = e.target.__feat; if (f) showCardCountry(f);
});
gLand.addEventListener('dblclick', e => {
  const f = e.target.__feat; if (!f || typeof CLIST === 'undefined') return;
  const entry = CLIST.find(c => c.c === f.c);
  if (entry) location.href = 'countries/' + entry.f + '.html';
});

/* ─────────── 15. 工具条 ─────────── */
function bindSeg(id, key, after) {
  const box = $(id);
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    [...box.querySelectorAll('button')].forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    ST[key] = b.dataset[Object.keys(b.dataset)[0]];
    (after || render)();
  });
}
bindSeg('segVar', 'varKey');
bindSeg('segSp', 'species');
bindSeg('segAlt', 'alt');
$('q').addEventListener('input', e => { ST.q = e.target.value.trim(); render(); });
const ctJump = $('ctJump');
if (ctJump && typeof CLIST !== 'undefined') {
  ctJump.innerHTML = '<option value="">选择国家产区图…</option>' +
    CLIST.map(c => `<option value="${c.f}">${c.c}（${c.n}）</option>`).join('');
  ctJump.addEventListener('change', () => {
    if (ctJump.value) location.href = 'countries/' + ctJump.value + '.html';
  });
}
$('btnReset').addEventListener('click', () => {
  ST.varKey = 'process'; ST.species = 'all'; ST.alt = 'all'; ST.q = '';
  ST.k = 1; ST.tx = 0; ST.ty = 0; ST.sel = -1;
  $('q').value = '';
  ['segVar|process', 'segSp|all', 'segAlt|all'].forEach(s => {
    const [id, v] = s.split('|');
    [...$(id).querySelectorAll('button')].forEach(b => b.classList.toggle('on', b.dataset[Object.keys(b.dataset)[0]] === v));
  });
  card.classList.remove('on');
  applyGeo(); render();
});
['chkLabel|labels', 'chkBelt|belt', 'chkGrid|grid'].forEach(s => {
  const [id, key] = s.split('|');
  const c = $(id); if (!c) return;
  c.classList.toggle('on', ST[key]);
  c.addEventListener('click', () => {
    ST[key] = !ST[key]; c.classList.toggle('on', ST[key]);
    if (key === 'belt') gBelt.style.display = ST.belt ? '' : 'none';
    if (key === 'grid') gGrid.style.display = ST.grid ? '' : 'none';
    render();
  });
});

/* ─────────── 16. 渲染 ─────────── */
function render() { drawPoints(); }

/* ─────────── 17. 启动 ─────────── */
buildGrid(); buildBelt(); buildLand(); buildFrame(); buildLegend();
applyGeo(); render();

})();
