// viz.js — all canvas animations for the portfolio
// Single RAF loop drives hero flow field + 10 project visualizations.
// Each viz: (ctx, w, h, t, state) => void

(function () {
  'use strict';

  // Hex approximations of the CSS oklch palette (blueprint paper).
  const C = {
    bg:     '#ecedf3',
    bgSoft: '#dfe2eb',
    fg:     '#181c2a',
    mute:   '#4d5263',
    faint:  '#959aa6',
    line:   '#cbd0db',
    signal: '#2a55d4',   /* cobalt */
    cyan:   '#b3852b',   /* warm ochre */
    lime:   '#3f7a4d',
    portraitBg: '#161a28',
    portraitFg: '#ecedf3',
    portraitHi: '#4f7df0',
  };

  // ── helpers ──────────────────────────────────────────────
  function hidpi(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.max(1, Math.floor(rect.width  * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }
  function fillBg(ctx, w, h) { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h); }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

  // ── viz registry ────────────────────────────────────────
  const VIZ = {};

  // 1. AST tree (Query Optimizer)
  VIZ.ast = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    if (!state.tree) {
      state.tree = [
        {x:0.5, y:0.16, lbl:'SELECT', kids:[1,2,3]},
        {x:0.22,y:0.42, lbl:'cols',   kids:[4,5]},
        {x:0.5, y:0.42, lbl:'FROM',   kids:[6]},
        {x:0.78,y:0.42, lbl:'WHERE',  kids:[7,8]},
        {x:0.14,y:0.72, lbl:'id',     kids:[]},
        {x:0.30,y:0.72, lbl:'name',   kids:[]},
        {x:0.50,y:0.72, lbl:'users',  kids:[], idx:true},
        {x:0.66,y:0.72, lbl:'age',    kids:[]},
        {x:0.86,y:0.72, lbl:'city',   kids:[], idx:true},
      ];
    }
    const cycle = (t % 7) / 7;
    state.tree.forEach((n, i) => {
      n.kids.forEach(k => {
        const c = state.tree[k];
        const p = Math.max(0, Math.min(1, cycle * 5 - 0.15 * i));
        if (p <= 0) return;
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 1;
        const x1 = n.x * w, y1 = n.y * h + 11;
        const x2 = c.x * w, y2 = c.y * h - 11;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (x2 - x1) * p, y1 + (y2 - y1) * p);
        ctx.stroke();
      });
    });
    ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    state.tree.forEach((n, i) => {
      const ap = cycle * 5 - 0.12 * i;
      if (ap < -0.05) return;
      const x = n.x * w, y = n.y * h;
      const tw = Math.max(46, ctx.measureText(n.lbl).width + 16);
      const th = 22;
      const showIdx = n.idx && cycle > 0.78;
      ctx.fillStyle = C.bgSoft;
      ctx.strokeStyle = showIdx ? C.signal : C.line;
      ctx.lineWidth = showIdx ? 1.5 : 1;
      ctx.fillRect(x - tw/2, y - th/2, tw, th);
      ctx.strokeRect(x - tw/2, y - th/2, tw, th);
      ctx.fillStyle = showIdx ? C.signal : C.fg;
      ctx.fillText(n.lbl, x, y + 1);
      if (showIdx) {
        ctx.fillStyle = C.signal;
        ctx.fillRect(x + tw/2 + 4, y - 7, 26, 14);
        ctx.fillStyle = C.bg;
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText('IDX', x + tw/2 + 17, y + 1);
        ctx.font = '10px "JetBrains Mono", monospace';
      }
    });
    // top-left label
    ctx.fillStyle = C.mute;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('parsed query plan', 14, 24);
  };

  // 2. Collab editor
  VIZ.collab = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    const padx = 18, pady = 18, gap = 12;
    const paneW = (w - padx * 2 - gap) / 2;
    const paneH = h - pady * 2;
    for (let i = 0; i < 2; i++) {
      const x = padx + i * (paneW + gap);
      ctx.fillStyle = C.bgSoft;
      ctx.fillRect(x, pady, paneW, 20);
      ctx.strokeStyle = C.line;
      ctx.strokeRect(x + 0.5, pady + 0.5, paneW - 1, paneH - 1);
      ctx.fillStyle = i === 0 ? C.signal : C.cyan;
      ctx.beginPath();
      ctx.arc(x + 10, pady + 10, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.mute;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(i === 0 ? 'sami.tsx' : 'alex.tsx', x + 20, pady + 10);
    }
    const lines = [
      'function App() {',
      '  const [n, setN]',
      '    = useState(0)',
      '  return <Btn',
      '    onClick={()',
      '    => setN(n+1)',
      '    } />',
      '}',
    ];
    ctx.font = '10px "JetBrains Mono", monospace';
    const lineH = 13;
    const total = lines.join('').length;
    for (let i = 0; i < 2; i++) {
      const x = padx + i * (paneW + gap) + 10;
      const yStart = pady + 30;
      const phase = i === 0 ? t * 16 : t * 16 - 18;
      const cursor = Math.floor(phase % (total + 30));
      let c = 0;
      for (let ln = 0; ln < lines.length; ln++) {
        const yy = yStart + ln * lineH;
        const line = lines[ln];
        const visible = Math.max(0, Math.min(line.length, cursor - c));
        ctx.fillStyle = C.fg;
        ctx.fillText(line.substring(0, visible), x, yy + 6);
        if (cursor >= c && cursor < c + line.length) {
          const xx = x + ctx.measureText(line.substring(0, visible)).width;
          ctx.fillStyle = i === 0 ? C.signal : C.cyan;
          ctx.fillRect(xx, yy, 1.5, 11);
        }
        c += line.length;
      }
    }
    // sync orb between panes
    const ax = padx + paneW + gap / 2;
    const ay = pady + paneH / 2;
    ctx.fillStyle = C.bgSoft;
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ax, ay, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.cyan;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OT', ax, ay + 1);
    // little arrows
    ctx.strokeStyle = C.cyan;
    ctx.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t * 2.4));
    ctx.beginPath();
    ctx.moveTo(ax - 18, ay); ctx.lineTo(ax - 12, ay);
    ctx.moveTo(ax + 12, ay); ctx.lineTo(ax + 18, ay);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  // 3. Uncertainty grid (Selective Prediction)
  VIZ.uncertainty = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    const cols = 36, rows = 24;
    const cw = w / cols, ch = h / rows;
    const cx = cols / 2, cy = rows / 2;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dx = (x - cx), dy = (y - cy);
        const r = Math.sqrt(dx * dx + dy * dy * 1.4);
        const inBlob = r < 7.5 + Math.sin(x * 0.5 + y * 0.3) * 1.5;
        const edge = Math.exp(-((r - 7.5) ** 2) / 4.5);
        const pulse = (Math.sin(t * 1.4 + r * 0.5) + 1) / 2;
        let v = 0.04;
        if (inBlob) v = 0.16 + 0.14 * Math.sin(x * 0.4 + y * 0.5 + t * 0.7);
        ctx.fillStyle = `rgba(236,230,216,${v})`;
        ctx.fillRect(x * cw, y * ch, cw - 1, ch - 1);
        const ua = edge * (0.4 + 0.6 * pulse);
        if (ua > 0.05) {
          ctx.fillStyle = `rgba(236,113,66,${ua * 0.85})`;
          ctx.fillRect(x * cw, y * ch, cw - 1, ch - 1);
        }
      }
    }
    // crosshair
    ctx.strokeStyle = C.cyan;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, cy * ch); ctx.lineTo(w, cy * ch);
    ctx.moveTo(cx * cw, 0); ctx.lineTo(cx * cw, h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    // readout
    ctx.fillStyle = C.cyan;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    const conf = (0.74 + 0.08 * Math.sin(t * 0.6)).toFixed(3);
    ctx.fillText(`σ=${conf}  defer=true`, w - 14, 24);
  };

  // 4. Hierarchical regions (Weighted Segmentation)
  VIZ.hierarchical = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    const cx = w / 2, cy = h / 2;
    const base = Math.min(w, h);
    const rings = [
      { r: 0.42, c: 'rgba(127,212,200,0.14)' },
      { r: 0.32, c: 'rgba(127,212,200,0.22)' },
      { r: 0.22, c: 'rgba(236,113,66,0.30)'  },
      { r: 0.12, c: 'rgba(236,113,66,0.65)'  },
    ];
    rings.forEach((rg, i) => {
      const rr = base * rg.r * (1 + Math.sin(t * 0.6 + i) * 0.025);
      ctx.fillStyle = rg.c;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rr * 1.1, rr * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // dashed contour rings
    for (let k = 0; k < 4; k++) {
      const r0 = base * (0.12 + k * 0.1);
      ctx.strokeStyle = C.signal;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.globalAlpha = 0.25 + 0.18 * Math.sin(t * 1.2 + k);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r0 * 1.1, r0 * 0.92, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    // axial slice marker bars
    ctx.fillStyle = C.mute;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (let i = 0; i < 5; i++) {
      const yy = h * (0.15 + i * 0.18);
      ctx.fillRect(12, yy, 4, 1);
      ctx.fillText(`z=${(i * 8).toString().padStart(2, '0')}`, 20, yy - 4);
    }
    // bottom-right legend
    ctx.fillStyle = C.fg;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('w₄ > w₃ > w₂ > w₁', w - 14, h - 28);
    ctx.fillStyle = C.mute;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('hierarchical loss', w - 14, h - 14);
  };

  // 5. Crypto stream
  VIZ.crypto = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    const lockX = w * 0.5;
    const rows = 4;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < rows; r++) {
      const y = h * (0.22 + r * 0.18);
      const offset = (t * 26 + r * 11) % 18;
      ctx.textAlign = 'left';
      for (let i = 0; i < 14; i++) {
        const x = (i * 18 - offset);
        if (x < 4 || x > lockX - 30) continue;
        const ch = String.fromCharCode(65 + ((i * 7 + r * 3) % 26));
        ctx.fillStyle = C.mute;
        ctx.fillText(ch, x + 4, y);
      }
      for (let i = 0; i < 14; i++) {
        const x = lockX + 30 + (i * 18 - offset);
        if (x < lockX + 30 || x > w - 10) continue;
        const hex = '0123456789abcdef';
        const a = hex[(i * 11 + r * 5 + Math.floor(t * 7)) % 16];
        const b = hex[(i * 7  + r * 3 + Math.floor(t * 11)) % 16];
        ctx.fillStyle = C.signal;
        ctx.fillText(a + b, x, y);
      }
    }
    // lock box
    ctx.fillStyle = C.bgSoft;
    ctx.strokeStyle = C.signal;
    ctx.lineWidth = 1.5;
    const lh = h * 0.55, ly = h * 0.5 - lh / 2;
    ctx.fillRect(lockX - 26, ly, 52, lh);
    ctx.strokeRect(lockX - 26, ly, 52, lh);
    ctx.fillStyle = C.signal;
    ctx.textAlign = 'center';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('AES', lockX, h * 0.5 - 8);
    ctx.fillText('256', lockX, h * 0.5 + 8);
    // arrows
    ctx.strokeStyle = C.cyan;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(lockX - 38, h * 0.5); ctx.lineTo(lockX - 30, h * 0.5);
    ctx.moveTo(lockX + 30, h * 0.5); ctx.lineTo(lockX + 38, h * 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  // 6. Sokoban
  VIZ.sokoban = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    if (!state.lvl) {
      state.lvl = {
        cols: 9, rows: 6,
        walls: new Set([
          '0,0','1,0','2,0','3,0','4,0','5,0','6,0','7,0','8,0',
          '0,5','1,5','2,5','3,5','4,5','5,5','6,5','7,5','8,5',
          '0,1','0,2','0,3','0,4',
          '8,1','8,2','8,3','8,4',
          '3,2','5,3'
        ]),
        targets: [[2,4],[6,2]],
      };
    }
    const lvl = state.lvl;
    const cw = w / lvl.cols, ch = h / lvl.rows;
    const size = Math.min(cw, ch) * 0.82;
    // grid
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    for (let y = 0; y < lvl.rows; y++) {
      for (let x = 0; x < lvl.cols; x++) ctx.strokeRect(x * cw, y * ch, cw, ch);
    }
    // walls
    lvl.walls.forEach(k => {
      const [x, y] = k.split(',').map(Number);
      ctx.fillStyle = C.bgSoft;
      ctx.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2);
      ctx.fillStyle = C.mute;
      const px = x * cw + cw/2;
      const py = y * ch + ch/2;
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(px - size/2 + i * (size/4), py - size/2 + 2, size/4 - 1.5, size/4 - 1);
        ctx.fillRect(px - size/2 + i * (size/4), py, size/4 - 1.5, size/4 - 1);
      }
    });
    // targets
    lvl.targets.forEach(([x, y]) => {
      const px = x * cw + cw/2;
      const py = y * ch + ch/2;
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - size/4, py - size/4);
      ctx.lineTo(px + size/4, py + size/4);
      ctx.moveTo(px + size/4, py - size/4);
      ctx.lineTo(px - size/4, py + size/4);
      ctx.stroke();
    });
    // animation — all cells visited by player/boxes are verified non-wall.
    // Cycle (8s):
    //   step 0 push box1 down (player 2,1→2,2 ; box1 2,2→2,3)
    //   step 1 push box1 down (player 2,2→2,3 ; box1 2,3→2,4 target)
    //   step 2 walk           (player 2,3→3,3)
    //   step 3 walk           (player 3,3→4,3)
    //   step 4 walk up        (player 4,3→4,2)
    //   step 5 push box2 right(player 4,2→5,2 ; box2 5,2→6,2 target)
    //   steps 6–7 hold (victory)
    const T = (t * 0.45) % 8;
    function drawBox(x, y, placed) {
      const xx = x * cw + (cw - size) / 2;
      const yy = y * ch + (ch - size) / 2;
      ctx.fillStyle = placed ? C.cyan : C.signal;
      ctx.fillRect(xx, yy, size, size);
      ctx.fillStyle = C.bg;
      ctx.fillRect(xx + 3, yy + 3, size - 6, size - 6);
      ctx.fillStyle = placed ? C.cyan : C.signal;
      ctx.fillRect(xx + size/2 - 1, yy + 3, 2, size - 6);
      ctx.fillRect(xx + 3, yy + size/2 - 1, size - 6, 2);
    }
    function lerp(a, b, k) { return a + (b - a) * k; }
    // Box1: [2,2] → [2,3] → [2,4]
    let b1x = 2, b1y = 2;
    if (T < 1) { b1y = lerp(2, 3, T); }
    else if (T < 2) { b1y = lerp(3, 4, T - 1); }
    else { b1y = 4; }
    // Box2: [5,2] → [6,2]
    let b2x = 5, b2y = 2;
    if (T < 5) { b2x = 5; }
    else if (T < 6) { b2x = lerp(5, 6, T - 5); }
    else { b2x = 6; }
    drawBox(b1x, b1y, T >= 2);
    drawBox(b2x, b2y, T >= 6);
    // Player
    let px = 2, py = 1;
    if (T < 1)      { px = 2;             py = lerp(1, 2, T);     }
    else if (T < 2) { px = 2;             py = lerp(2, 3, T - 1); }
    else if (T < 3) { px = lerp(2, 3, T - 2); py = 3;             }
    else if (T < 4) { px = lerp(3, 4, T - 3); py = 3;             }
    else if (T < 5) { px = 4;             py = lerp(3, 2, T - 4); }
    else if (T < 6) { px = lerp(4, 5, T - 5); py = 2;             }
    else            { px = 5;             py = 2;                 }
    ctx.fillStyle = C.fg;
    ctx.beginPath();
    ctx.arc(px * cw + cw/2, py * ch + ch/2, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
  };

  // 7. Phone mock (Grocery)
  VIZ.phone = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    const pw = Math.min(h * 0.55, w * 0.45);
    const ph = pw * 1.95;
    const px = (w - pw) / 2;
    const py = (h - ph) / 2;
    ctx.fillStyle = C.bgSoft;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    const r = 22;
    roundRect(ctx, px, py, pw, ph, r); ctx.fill(); ctx.stroke();
    // screen
    const sx = px + 8, sy = py + 22, sw = pw - 16, sh = ph - 40;
    ctx.fillStyle = C.bg;
    roundRect(ctx, sx, sy, sw, sh, 10); ctx.fill();
    // notch
    ctx.fillStyle = C.bgSoft;
    roundRect(ctx, px + pw/2 - 22, py + 6, 44, 8, 4); ctx.fill();
    // status
    ctx.fillStyle = C.mute;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('9:41', sx + 10, sy + 6);
    ctx.textAlign = 'right';
    ctx.fillText('●●●●', sx + sw - 10, sy + 6);
    // title
    ctx.fillStyle = C.fg;
    ctx.font = '13px "Bricolage Grotesque", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('pantry.', sx + 10, sy + 22);
    ctx.fillStyle = C.signal;
    ctx.fillRect(sx + 10, sy + 42, 18, 2);
    // section
    ctx.fillStyle = C.mute;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText('EXPIRING', sx + 10, sy + 50);
    // items
    const items = [
      { name: 'Milk',     days: 2,  warn: true  },
      { name: 'Tomatoes', days: 1,  warn: true  },
      { name: 'Yogurt',   days: 3,  warn: false },
      { name: 'Bread',    days: 5,  warn: false },
      { name: 'Eggs',     days: 12, warn: false },
    ];
    const phase = (t * 0.55) % (items.length + 1);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < items.length; i++) {
      const yy = sy + 66 + i * 22;
      const ap = phase - i;
      if (ap < 0) continue;
      const slide = Math.max(0, Math.min(1, ap));
      ctx.globalAlpha = slide;
      ctx.fillStyle = C.bgSoft;
      roundRect(ctx, sx + 8, yy, sw - 16, 18, 3); ctx.fill();
      ctx.fillStyle = items[i].warn ? C.signal : C.fg;
      ctx.textAlign = 'left';
      ctx.fillText('• ' + items[i].name, sx + 14, yy + 9);
      ctx.fillStyle = items[i].warn ? C.signal : C.mute;
      ctx.textAlign = 'right';
      ctx.fillText(items[i].days + 'd', sx + sw - 14, yy + 9);
      ctx.globalAlpha = 1;
    }
    // scan beam over current item
    const cur = Math.min(items.length - 1, Math.floor(phase));
    const yy = sy + 66 + cur * 22;
    const beam = (Math.sin(t * 4) + 1) / 2;
    ctx.fillStyle = `rgba(127,212,200,${0.18 + 0.3 * beam})`;
    ctx.fillRect(sx + 8, yy, sw - 16, 18);
  };

  // 8. Scatter classifier
  VIZ.scatter = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    if (!state.pts) {
      const rng = mulberry32(21);
      state.pts = [];
      for (let i = 0; i < 70; i++) {
        const cls = rng() > 0.5 ? 0 : 1;
        const cx = cls ? 0.68 : 0.32;
        const cy = cls ? 0.4  : 0.65;
        state.pts.push({
          cls,
          x: cx + (rng() - 0.5) * 0.28,
          y: cy + (rng() - 0.5) * 0.28,
        });
      }
    }
    const ml = 32, mb = 26, mt = 14, mr = 14;
    const pX = ml, pY = mt;
    const pW = w - ml - mr, pH = h - mt - mb;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(pX, pY, pW, pH);
    ctx.setLineDash([2, 4]);
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(pX + (i/4) * pW, pY); ctx.lineTo(pX + (i/4) * pW, pY + pH);
      ctx.moveTo(pX, pY + (i/4) * pH); ctx.lineTo(pX + pW, pY + (i/4) * pH);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const cycle = (t * 0.18) % 1;
    const limit = Math.floor(cycle * state.pts.length);
    for (let i = 0; i < limit; i++) {
      const p = state.pts[i];
      ctx.fillStyle = p.cls ? C.signal : C.cyan;
      ctx.beginPath();
      ctx.arc(pX + p.x * pW, pY + p.y * pH, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (cycle > 0.55) {
      ctx.strokeStyle = C.fg;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      const reveal = (cycle - 0.55) / 0.45;
      ctx.beginPath();
      for (let s = 0; s <= reveal; s += 0.01) {
        const xx = pX + s * pW;
        const yy = pY + (0.5 + Math.sin(s * Math.PI * 1.6) * 0.16) * pH;
        if (s === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = C.mute;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('feature.x →', pX, pY + pH + 8);
    ctx.save();
    ctx.translate(10, pY + pH);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('feature.y →', 0, 0);
    ctx.restore();
    ctx.textAlign = 'right';
    ctx.fillStyle = C.cyan;
    ctx.fillText(`acc=${(0.86 + 0.04 * Math.sin(t)).toFixed(3)}`, w - 14, mt - 2);
  };

  // 9. Multi-agent pathfind — CSP-solved push routes
  VIZ.pathfind = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    const cols = 14, rows = 8;
    const cw = w / cols, ch = h / rows;

    if (!state.pf) {
      // Each agent path ends in the GOAL cell where its box settles.
      // The robot animates over path[0 .. path.length-2]; the box (when pushed)
      // is always one step ahead of the robot. Rows are picked so no two
      // robots ever occupy the same cell — collision-free by construction.
      state.pf = {
        agents: [
          {
            color: C.signal,
            path: [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1]],
            boxIdx: 3, // box starts at path[3]; goal = path.last
            speed: 0.55,
            offset: 0.0,
          },
          {
            color: C.lime,
            path: [[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6]],
            boxIdx: 4,
            speed: 0.55,
            offset: 0.9,
          },
          {
            color: C.cyan,
            path: [[13,4],[12,4],[11,4],[10,4],[9,4],[8,4],[7,4],[6,4],[5,4]],
            boxIdx: 3,
            speed: 0.55,
            offset: 1.7,
          },
        ],
        // Unmatched freight & unmatched goal slots (the "leftovers").
        // Counts must match: |staticBoxes| == |staticGoals| so total
        // boxes == total goals across the whole grid.
        staticBoxes: [[2,3],[10,2]],
        staticGoals: [[12,7],[3,5]],
      };
    }

    // grid
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) ctx.strokeRect(x * cw, y * ch, cw, ch);
    }

    // helper: draw a crate centered on canvas coords
    const crateInset = Math.min(cw, ch) * 0.18;
    function drawCrate(px, py, color) {
      const bw = cw - crateInset * 2, bh = ch - crateInset * 2;
      const x = px - bw / 2, y = py - bh / 2;
      ctx.fillStyle = C.bgSoft;
      ctx.fillRect(x, y, bw, bh);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.1;
      ctx.strokeRect(x, y, bw, bh);
      ctx.beginPath();
      ctx.moveTo(x, y);          ctx.lineTo(x + bw, y + bh);
      ctx.moveTo(x + bw, y);     ctx.lineTo(x, y + bh);
      ctx.stroke();
    }

    // goals: dashed outline cells (colored = assigned to an agent, faint = leftover)
    const goalInset = Math.min(cw, ch) * 0.22;
    function drawGoal(gx, gy, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(gx * cw + goalInset, gy * ch + goalInset,
                     cw - goalInset * 2, ch - goalInset * 2);
      ctx.setLineDash([]);
    }
    state.pf.agents.forEach(a => {
      const g = a.path[a.path.length - 1];
      drawGoal(g[0], g[1], a.color);
    });
    state.pf.staticGoals.forEach(g => drawGoal(g[0], g[1], C.faint));

    // static / leftover boxes
    state.pf.staticBoxes.forEach(b => {
      drawCrate(b[0] * cw + cw / 2, b[1] * ch + ch / 2, C.mute);
    });

    // agents + their pushed boxes
    state.pf.agents.forEach(a => {
      // Robot occupies path[0 .. robotEnd]; box occupies path[1 .. goalIdx].
      // robotEnd = path.length - 2 guarantees robot is always exactly one
      // cell behind the crate it is pushing (no overlap, ever).
      const robotEnd = a.path.length - 2;
      const goalIdx  = a.path.length - 1;
      const cycle    = robotEnd + 2.6;          // small dwell before reset
      const tp = (t * a.speed + a.offset) % cycle;
      const p  = Math.max(0, Math.min(robotEnd, tp));
      const i0 = Math.min(robotEnd, Math.floor(p));
      const i1 = Math.min(robotEnd, i0 + 1);
      const f  = p - i0;
      const c0 = a.path[i0], c1 = a.path[i1];
      const rx = (c0[0] + (c1[0] - c0[0]) * f) * cw + cw / 2;
      const ry = (c0[1] + (c1[1] - c0[1]) * f) * ch + ch / 2;

      // box position: 1 cell ahead of robot once push has started
      let bx, by;
      const pushStartP = a.boxIdx - 1;
      if (p < pushStartP) {
        const b = a.path[a.boxIdx];
        bx = b[0] * cw + cw / 2;
        by = b[1] * ch + ch / 2;
      } else {
        const bi0 = Math.min(goalIdx, i0 + 1);
        const bi1 = Math.min(goalIdx, i1 + 1);
        const b0 = a.path[bi0], b1 = a.path[bi1];
        bx = (b0[0] + (b1[0] - b0[0]) * f) * cw + cw / 2;
        by = (b0[1] + (b1[1] - b0[1]) * f) * ch + ch / 2;
      }

      // trail: cell centers up through i0, then a final segment to the
      // live ball position so the line never lags behind the moving robot
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.42;
      ctx.beginPath();
      for (let k = 0; k <= i0; k++) {
        const x = a.path[k][0] * cw + cw / 2;
        const y = a.path[k][1] * ch + ch / 2;
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineTo(rx, ry);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // pushed crate
      drawCrate(bx, by, a.color);

      // robot
      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.arc(rx, ry, Math.min(cw, ch) * 0.22, 0, Math.PI * 2);
      ctx.fill();
      // small inner notch so it reads as a chassis, not just a dot
      ctx.fillStyle = C.bg;
      ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
    });
  };

  // 10. Pub/sub flow
  VIZ.pubsub = (ctx, w, h, t, state) => {
    fillBg(ctx, w, h);
    const pubX = w * 0.13;
    const queueX1 = w * 0.32, queueX2 = w * 0.68;
    const queueY = h * 0.5;
    const consX = w * 0.87;
    const consY = [h * 0.25, h * 0.5, h * 0.75];
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // publisher
    ctx.fillStyle = C.bgSoft;
    ctx.strokeStyle = C.signal;
    ctx.lineWidth = 1.2;
    ctx.fillRect(pubX - 30, queueY - 18, 60, 36);
    ctx.strokeRect(pubX - 30, queueY - 18, 60, 36);
    ctx.fillStyle = C.signal;
    ctx.fillText('PUB', pubX, queueY + 1);
    // queue tube
    ctx.fillStyle = C.bgSoft;
    ctx.fillRect(queueX1, queueY - 9, queueX2 - queueX1, 18);
    ctx.strokeStyle = C.line;
    ctx.strokeRect(queueX1, queueY - 9, queueX2 - queueX1, 18);
    ctx.fillStyle = C.mute;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('queue · fifo', (queueX1 + queueX2) / 2, queueY - 18);
    // consumers
    consY.forEach((cy, i) => {
      const slow = i === 2;
      ctx.fillStyle = C.bgSoft;
      ctx.strokeStyle = slow ? C.signal : C.cyan;
      ctx.lineWidth = 1.2;
      ctx.fillRect(consX - 30, cy - 14, 60, 28);
      ctx.strokeRect(consX - 30, cy - 14, 60, 28);
      ctx.fillStyle = slow ? C.signal : C.cyan;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('SUB ' + (i + 1), consX, cy + 1);
    });
    // messages
    for (let m = 0; m < 7; m++) {
      const phase = (t * 0.45 + m * 0.14) % 1;
      const target = m % 3;
      let mx, my;
      if (phase < 0.22) {
        const p = phase / 0.22;
        mx = pubX + 30 + (queueX1 - pubX - 30) * p;
        my = queueY;
      } else if (phase < 0.68) {
        const p = (phase - 0.22) / 0.46;
        mx = queueX1 + 6 + (queueX2 - queueX1 - 12) * p;
        my = queueY;
      } else {
        const p = (phase - 0.68) / 0.32;
        const cy = consY[target];
        mx = queueX2 + (consX - 30 - queueX2) * p;
        my = queueY + (cy - queueY) * p;
      }
      ctx.fillStyle = target === 2 ? C.signal : C.cyan;
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // arrows pub→queue
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    ctx.moveTo(pubX + 30, queueY); ctx.lineTo(queueX1, queueY);
    ctx.moveTo(queueX2, queueY); ctx.lineTo(consX - 30, queueY);
    ctx.stroke();
  };

  // ── Hero canvas (drifting topographic contours) ────────
  function startHero(canvas) {
    let ctx = hidpi(canvas);
    let rectCache = canvas.getBoundingClientRect();
    let resizeT;
    function onResize() {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        ctx = hidpi(canvas);
        rectCache = canvas.getBoundingClientRect();
      }, 100);
    }
    window.addEventListener('resize', onResize);

    function frame(time) {
      const t = time / 1000;
      const W = rectCache.width, H = rectCache.height;

      // base cream
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      // soft tick grid — a quiet baseline rhythm
      ctx.fillStyle = C.line;
      ctx.globalAlpha = 0.35;
      const gx = 56, gy = 56;
      for (let y = gy; y < H; y += gy) {
        for (let x = gx; x < W; x += gx) {
          ctx.fillRect(x - 2, y, 4, 1);
          ctx.fillRect(x, y - 2, 1, 4);
        }
      }
      ctx.globalAlpha = 1;

      // drifting contour lines — calm, editorial
      const step = 22;
      const drift = (t * 9) % step;
      ctx.lineCap = 'round';
      for (let i = -1, y0 = -step + drift; y0 < H + step; y0 += step, i++) {
        // depth fade: lines further from middle are quieter
        const dC = Math.abs((y0 / H) - 0.5);
        const alpha = 0.10 + (1 - Math.min(1, dC * 1.6)) * 0.45;
        ctx.strokeStyle = C.fg;
        ctx.globalAlpha = alpha * 0.55;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const amp1 = 18 + Math.sin(y0 * 0.012 + t * 0.18) * 10;
        const amp2 = 6 + Math.cos(y0 * 0.02 - t * 0.25) * 3;
        const f1 = 0.0055 + ((y0 % 220) / 220) * 0.0025;
        const f2 = 0.013;
        for (let x = -8; x <= W + 8; x += 4) {
          const yy = y0
            + Math.sin(x * f1 + t * 0.32 + i * 0.4) * amp1
            + Math.cos(x * f2 - t * 0.22 + i * 0.7) * amp2;
          if (x === -8) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // single "active elevation" line in signal-orange — slow & sinuous
      const baseY = H * (0.46 + Math.sin(t * 0.13) * 0.06);
      ctx.strokeStyle = C.signal;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (let x = -8; x <= W + 8; x += 3) {
        const yy = baseY
          + Math.sin(x * 0.0075 + t * 0.42) * 22
          + Math.cos(x * 0.018 - t * 0.28) * 9;
        if (x === -8) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();

      // travelling marker dot riding the orange line
      {
        const phase = (t * 0.07) % 1;
        const x = phase * W;
        const yy = baseY
          + Math.sin(x * 0.0075 + t * 0.42) * 22
          + Math.cos(x * 0.018 - t * 0.28) * 9;
        ctx.globalAlpha = 1;
        ctx.fillStyle = C.signal;
        ctx.beginPath();
        ctx.arc(x, yy, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(x, yy, 9, 0, Math.PI * 2);
        ctx.fill();
        // crosshair readout
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = C.signal;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, H);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ── Portrait dither ─────────────────────────────────────
  function startPortrait(canvas, src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    function render() {
      const ctx = hidpi(canvas);
      const rect = canvas.getBoundingClientRect();
      const targetW = rect.width;
      const targetH = rect.height;
      const px = 1.4;
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.floor(targetW / px));
      off.height = Math.max(1, Math.floor(targetH / px));
      const oc = off.getContext('2d');
      const ar = img.width / img.height;
      const tar = off.width / off.height;
      let dw, dh, dx, dy;
      // zoom in slightly so the face dominates the frame
      const zoom = 1.18;
      if (ar > tar) { dh = off.height * zoom; dw = dh * ar; }
      else          { dw = off.width  * zoom; dh = dw / ar; }
      // bias upward so we keep the eyes, lose the suit edges
      dx = (off.width  - dw) / 2;
      dy = (off.height - dh) * 0.35;
      oc.drawImage(img, dx, dy, dw, dh);
      const data = oc.getImageData(0, 0, off.width, off.height);
      const bayer = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
      // dark inset background
      ctx.fillStyle = C.portraitBg;
      ctx.fillRect(0, 0, targetW, targetH);
      // vignette params — center on face, fade edges into dark navy
      const cxn = 0.50, cyn = 0.42, ax = 0.42, ay = 0.55;
      for (let y = 0; y < off.height; y++) {
        for (let x = 0; x < off.width; x++) {
          const i = (y * off.width + x) * 4;
          const r = data.data[i], g = data.data[i+1], b = data.data[i+2];
          const rawLum = 0.299*r + 0.587*g + 0.114*b;
          // radial falloff so the photo's bright bg dissolves into the inset
          const nx = (x / off.width  - cxn) / ax;
          const ny = (y / off.height - cyn) / ay;
          const d = Math.sqrt(nx*nx + ny*ny);
          const vig = Math.max(0, 1 - Math.pow(d, 1.8) * 1.1);
          const lum = rawLum * vig;
          const thr = (bayer[y%4][x%4] / 16) * 200 + 28;
          const on = lum > thr;
          const high = lum > 200 && ((x + y) % 11 === 0);
          if (high) {
            ctx.fillStyle = C.portraitHi;
            ctx.fillRect(x * px, y * px, Math.ceil(px), Math.ceil(px));
          } else if (on) {
            ctx.fillStyle = C.portraitFg;
            ctx.fillRect(x * px, y * px, Math.ceil(px), Math.ceil(px));
          }
        }
      }
    }
    img.onload = render;
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (img.complete) render(); }, 150);
    });
    img.src = src;
  }

  // ── Init ────────────────────────────────────────────────
  function init() {
    const hero = document.querySelector('canvas[data-hero]');
    if (hero) startHero(hero);
    const portrait = document.querySelector('canvas[data-portrait]');
    if (portrait) startPortrait(portrait, portrait.getAttribute('data-src'));

    const slots = document.querySelectorAll('[data-viz]');
    const vizList = [];
    slots.forEach(slot => {
      const kind = slot.getAttribute('data-viz');
      if (!VIZ[kind]) return;
      const c = document.createElement('canvas');
      slot.appendChild(c);
      vizList.push({ c, kind, state: {}, ctx: hidpi(c) });
    });
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { vizList.forEach(v => { v.ctx = hidpi(v.c); }); }, 100);
    });

    const visible = new Set();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        });
      }, { rootMargin: '120px' });
      vizList.forEach(v => io.observe(v.c));
    } else {
      vizList.forEach(v => visible.add(v.c));
    }
    function tick(time) {
      const t = time / 1000;
      vizList.forEach(v => {
        if (!visible.has(v.c)) return;
        const r = v.c.getBoundingClientRect();
        VIZ[v.kind](v.ctx, r.width, r.height, t, v.state);
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Reveal-on-scroll
    if ('IntersectionObserver' in window) {
      const ro = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
      document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
    } else {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
