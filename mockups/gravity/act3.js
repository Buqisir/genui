/*
 * 第 3 幕 · 尺度阶梯
 * 8 步：公式 · 第 1 级 · 第 2 级 · 练习 · 第 3 级 · 练习 · 第 4 级 + 潮汐 · 第 5 级。
 * 所有数值都在这里由 F = G·m₁m₂/r² 算出；阶梯图的纵轴是 log10(F)。
 * 进度、导航、绿框、左栏由 shell.js 负责，这里只管画布和作答区。
 */
(function () {
  'use strict';

  var GRAV = window.GRAV;
  var TAU = Math.PI * 2;

  // ---------- 常量与公式（规格第五节） ----------
  var K = {
    G: 6.67e-11, g: 9.8,
    M: 5.97e24, R: 6.371e6,          // 地球质量、半径
    Rst: 6.771e6,                     // 空间站轨道半径（离地 400 km，从地心量）
    mStu: 70, mApple: 0.2,           // 航天员、苹果
    mMoon: 7.35e22, Dm: 3.84e8,      // 月球质量、月地距离
    mSun: 1.99e30, Ds: 1.496e11      // 太阳质量、日地距离
  };
  function F(m1, m2, r) { return K.G * m1 * m2 / (r * r); }

  // ---------- 数字与字体 ----------
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(n) { return String(n).split('').map(function (c) { return SUP[c] || c; }).join(''); }
  function fmtF(f) { return (f >= 0.01 && f < 1e4) ? GRAV.fmt.num(f, 3) : GRAV.fmt.sci(f, 3); }
  function fmtN(f) { return fmtF(f) + ' N'; }
  function SYM(s) { return GRAV.h.sym(s); }
  function ITAL(px) { return 'italic ' + px + 'px "Source Serif 4", serif'; }
  function UI(px) { return px + 'px "Noto Sans SC", sans-serif'; }
  function NUM(px) { return px + 'px Inter, sans-serif'; }

  // ---------- 五级阶梯 ----------
  var LO = -8;   // 纵轴下端 10⁻⁸ N
  function level(name, m1, m2, r, shows, rNote) {
    var f = F(m1, m2, r), lg = Math.log10(f);
    // 显示范围上端 = 当前级的指数 + 3
    return { name: name, f: f, log: lg, top: Math.floor(lg) + 3, shows: shows, rNote: rNote };
  }
  var LV = [
    level('两个同学', 50, 50, 1, ['50 kg', '50 kg', '1 m'], ''),
    level('地球拉苹果', K.M, K.mApple, K.R, ['5.97×10²⁴ kg', '0.2 kg', '6.371×10⁶ m'], '地球半径'),
    level('地球拉空间站里的航天员', K.M, K.mStu, K.Rst, ['5.97×10²⁴ kg', '70 kg', '6.771×10⁶ m'], '离地 400 km'),
    level('地球拉月球', K.M, K.mMoon, K.Dm, ['5.97×10²⁴ kg', '7.35×10²² kg', '3.84×10⁸ m'], ''),
    level('太阳拉地球', K.mSun, K.M, K.Ds, ['1.99×10³⁰ kg', '5.97×10²⁴ kg', '1.496×10¹¹ m'], '')
  ];
  var SPAN = Math.round(Math.log10(LV[4].f / LV[0].f));   // 数量级跨度，29

  // 第 2 级练习的数值：苹果的加速度与地球的加速度
  var F2 = LV[1].f;
  var A_APPLE = GRAV.fmt.num(F2 / K.mApple, 2);          // 9.8
  var A_EARTH = GRAV.fmt.sci(F2 / K.M, 2);               // 3.3×10⁻²⁵

  // 空间站：地面与轨道的引力之比
  var F_GROUND = F(K.M, K.mStu, K.R);                    // 687 N
  var RATIO_ST = Math.pow(K.R / K.Rst, 2);               // 0.885
  var PCT_ST = Math.round(RATIO_ST * 100);               // 89
  var DRIFT = Math.round((K.Rst / K.R - 1) * 100);       // 6

  // 潮汐：k = 月地距离 / 地球半径
  var KR = K.Dm / K.R;
  var NEAR = Math.pow(KR / (KR - 1), 2);                 // 1.034
  var FAR = Math.pow(KR / (KR + 1), 2);                  // 0.968
  var PCT_NEAR = ((NEAR - 1) * 100).toFixed(1);          // 3.4
  var PCT_FAR = ((1 - FAR) * 100).toFixed(1);            // 3.2

  // ---------- 动画：拉远镜头 ----------
  function ease(x) {
    x = Math.min(1, Math.max(0, x));
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
  // 第 i 级的显示上端：从上一级的上端缓动到本级的上端，0.8 秒
  function topAt(i, t) {
    var end = LV[i].top, start = i > 0 ? LV[i - 1].top : end;
    return start + (end - start) * ease(t / 0.8);
  }

  // ---------- 画布工具 ----------
  // 一行多段文字；bg 给了就先在文字底下铺一块底色（盖住刻度线）
  function runs(ctx, list, x, y, bg) {
    var total = 0;
    list.forEach(function (it) { ctx.font = it.f; it.w = ctx.measureText(it.t).width; total += it.w; });
    ctx.save();
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(x - 4, y - 14, total + 8, 19); }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    var px = x;
    list.forEach(function (it) {
      ctx.font = it.f; ctx.fillStyle = it.c; ctx.fillText(it.t, px, y); px += it.w;
    });
    ctx.restore();
  }
  function dot(ctx, x, y, r, color) {
    ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
  }

  // ---------- 阶梯图 ----------
  function textW(ctx, str, font) {
    ctx.save(); ctx.font = font; var w = ctx.measureText(str).width; ctx.restore();
    return w;
  }

  // box: 画在哪个矩形里；top: 纵轴上端（指数）；cur: 当前级序号，0 起，已出现的级是 0..cur
  // compact: 窄栏时标签分两行（名称 / 数值）
  function drawStair(ctx, box, top, cur, C, compact) {
    var x0 = box.x + 56, y1 = box.y + 36, y2 = box.y + box.h - 22, span = top - LO;
    function yOf(L) { return y2 - (L - LO) / span * (y2 - y1); }
    var e, y, i;

    // 刻度每 10⁴ 一个，带水平细线
    ctx.save();
    // 刻度太密时（窄屏）改成每 10⁸ 一个
    var stepE = (y2 - y1) / span * 4 < 18 ? 8 : 4;
    for (e = LO; e <= top + 1e-6; e += stepE) {
      y = yOf(e);
      ctx.strokeStyle = C.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(box.x + box.w - 6, y); ctx.stroke();
      GRAV.draw.text(ctx, '10' + sup(e) + ' N', x0 - 8, y + 4, { font: 'num', size: 11, color: C.steel, align: 'right' });
    }
    // 纵轴
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y1 - 8); ctx.lineTo(x0, y2); ctx.stroke();
    ctx.restore();
    runs(ctx, [{ t: 'F', f: ITAL(14), c: C.graphite }, { t: '（N）', f: UI(12), c: C.graphite }], x0 + 6, y1 - 10);

    // 已出现的级：一个点 + 右侧标签；当前级外加一圈 ink 描边
    // 标签放不下时：当前级优先，其余离已放标签太近的只画点
    var placed = [], gap = compact ? 34 : 18;
    for (i = cur; i >= 0; i--) {
      if (i >= LV.length) continue;
      var yy = yOf(LV[i].log);
      if (i === cur || placed.every(function (q) { return Math.abs(q - yy) >= gap; })) placed.push(yy);
      else LV[i].hideLabel = true;
    }
    for (i = 0; i <= cur && i < LV.length; i++) {
      var L = LV[i], py = yOf(L.log), px = x0 + 22, isCur = i === cur;
      var hide = L.hideLabel; L.hideLabel = false;
      if (isCur) {
        ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(px, py, 10, 0, TAU); ctx.stroke(); ctx.restore();
      }
      dot(ctx, px, py, 5, C.vel);
      var tc = isCur ? C.ink : C.graphite, lx = px + 16;
      if (hide) continue;
      if (compact) {
        var wN = textW(ctx, L.name, UI(12)), wV = textW(ctx, fmtN(L.f), NUM(12));
        ctx.save(); ctx.fillStyle = C.card; ctx.fillRect(lx - 4, py - 15, Math.max(wN, wV) + 8, 32); ctx.restore();
        runs(ctx, [{ t: L.name, f: UI(12), c: tc }], lx, py - 2);
        runs(ctx, [{ t: fmtN(L.f), f: NUM(12), c: tc }], lx, py + 13);
      } else {
        runs(ctx, [
          { t: L.name, f: UI(13), c: tc },
          { t: ' · ', f: UI(13), c: tc },
          { t: fmtN(L.f), f: NUM(13), c: tc }
        ], lx, py + 5, C.card);
      }
    }
  }

  // ---------- 潮汐图（第 7 步左半边） ----------
  function drawTide(ctx, box, h, C) {
    var R = Math.min(box.w * 0.22, box.h * 0.26);
    var cx = box.x + box.w * 0.38, cy = box.y + box.h * 0.5;
    var mx = box.x + box.w - 24;               // 月球画在右边
    var L0 = R * 0.6;                          // 地心处箭头的基准长度
    var Ln = L0 * (1 + 10 * (NEAR - 1));       // 近月侧：差别放大 10 倍
    var Lf = L0 * (1 + 10 * (FAR - 1));        // 远月侧：差别放大 10 倍

    // 海水：被拉成椭圆，长轴指向月亮
    ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = C.vel;
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.3, R * 1.12, 0, 0, TAU); ctx.fill(); ctx.restore();
    // 地球
    ctx.save(); ctx.fillStyle = C.bar;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    // 月亮
    dot(ctx, mx, cy, 9, C.graphite);

    // 三个点各一根指向月亮的力箭头
    var rows = [
      { x: cx + R, len: Ln, name: '近月侧' },
      { x: cx, len: L0, name: '地心' },
      { x: cx - R, len: Lf, name: '远月侧' }
    ];
    var labelY = cy - R * 1.12 - 10;            // 标签放在海水椭圆的上方，不压在地球边线上
    rows.forEach(function (r) {
      dot(ctx, r.x, cy, 2.5, C.ink);
      GRAV.draw.arrow(ctx, r.x, cy, r.x + r.len, cy, C.force, 2.5);
      GRAV.draw.text(ctx, r.name, r.x, labelY, { font: 'ui', size: 11, color: C.steel, align: 'center' });
    });
    GRAV.draw.note(ctx, '箭头长短的差别放大画', box.w, h, C);
  }

  // 第 7 步：左边潮汐，右边阶梯（窄屏时上下排）
  function drawTideStep(ctx, w, h, t, C) {
    var wide = w >= 480;
    var stairBox = wide ? { x: w * 0.5, y: 0, w: w * 0.5, h: h } : { x: 0, y: 0, w: w, h: h * 0.44 };
    var tideBox = wide ? { x: 0, y: 0, w: w * 0.5, h: h } : { x: 0, y: h * 0.44, w: w, h: h * 0.56 };
    drawStair(ctx, stairBox, topAt(3, t), 3, C, wide);
    drawTide(ctx, tideBox, h, C);
  }

  // ---------- 第 1 步：两个球 ----------
  function drawBalls(ctx, w, h, t, C) {
    var Rb = Math.min(w * 0.17, h * 0.2), Rs = Rb * 0.45;   // 左大右小
    var cy = h * 0.42, xl = w * 0.3, xr = w * 0.76;
    var dy = cy + Rb + 40;                                  // 尺寸线的高度

    // 球心之间的虚线
    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.hair; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xl, cy); ctx.lineTo(xr, cy); ctx.stroke(); ctx.restore();

    [[xl, Rb], [xr, Rs]].forEach(function (b) {
      ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = C.graphite;
      ctx.beginPath(); ctx.arc(b[0], cy, b[1], 0, TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(b[0], cy, b[1], 0, TAU); ctx.stroke(); ctx.restore();
      dot(ctx, b[0], cy, 2.5, C.ink);
    });

    // 从球心引下去的虚线，接到尺寸线上
    ctx.save(); ctx.setLineDash([2, 3]); ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xl, cy); ctx.lineTo(xl, dy + 7);
    ctx.moveTo(xr, cy); ctx.lineTo(xr, dy + 7);
    ctx.stroke(); ctx.restore();

    // 尺寸线：两端短竖线，标 r
    ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xl, dy); ctx.lineTo(xr, dy);
    ctx.moveTo(xl, dy - 6); ctx.lineTo(xl, dy + 6);
    ctx.moveTo(xr, dy - 6); ctx.lineTo(xr, dy + 6);
    ctx.stroke(); ctx.restore();
    GRAV.draw.text(ctx, 'r', (xl + xr) / 2, dy - 8, { font: 'sym', size: 16, color: C.ink, align: 'center' });
  }

  // ---------- 第 4 步：苹果拉地球 ----------
  var won4 = false;   // 答对后才画地球上的反作用力
  function drawPull(ctx, w, h, t, C) {
    var R = Math.min(w * 0.42, h * 0.36), cx = w / 2, top = h * 0.62, cy = top + R;
    var ay = top - 100, L = 72;                  // 苹果的高度、箭头长度（两根箭头一样长）

    // 地球（一大段圆弧）
    ctx.save(); ctx.fillStyle = C.bar;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.restore();

    // 苹果和它受到的向下的力
    dot(ctx, cx, ay, 11, C.graphite);
    GRAV.draw.arrow(ctx, cx, ay + 16, cx, ay + 16 + L, C.force, 2.5);
    GRAV.draw.text(ctx, fmtF(F2) + ' N', cx - 12, ay + 16 + L / 2 + 5, { font: 'num', size: 14, color: C.force, align: 'right' });

    // 答对之后：地球表面一根同样长、向上的力
    if (won4) {
      var ex = cx + 36, ey = cy - Math.sqrt(R * R - 36 * 36) - 2;
      GRAV.draw.arrow(ctx, ex, ey, ex, ey - L, C.force, 2.5);
      GRAV.draw.text(ctx, fmtF(F2) + ' N', ex + 12, ey - L / 2 + 5, { font: 'num', size: 14, color: C.force, align: 'left' });
    }
  }

  // ---------- 第 6 步：空间站，按真实比例 ----------
  function drawOrbit(ctx, w, h, t, C) {
    var cx = w / 2, cy = h / 2;
    var Rp = Math.min(w * 0.36, h * 0.36);     // 地球半径（像素）
    var Ro = Rp * K.Rst / K.R;                 // 轨道半径 = 地球半径 × 6771/6371

    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, Ro, 0, TAU); ctx.stroke(); ctx.restore();

    ctx.save(); ctx.fillStyle = C.bar;
    ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, TAU); ctx.stroke(); ctx.restore();

    var a = -0.61, sx = cx + Ro * Math.cos(a), sy = cy + Ro * Math.sin(a);
    ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy); ctx.stroke(); ctx.restore();
    runs(ctx, [
      { t: 'r', f: ITAL(14), c: C.ink },
      { t: ' = 6771 km', f: NUM(12), c: C.ink }
    ], cx + (sx - cx) * 0.5 + 10, cy + (sy - cy) * 0.5 + 16);

    dot(ctx, sx, sy, 4, C.ink);
    runs(ctx, [{ t: '400 km', f: NUM(12), c: C.graphite }], sx + 10, sy - 8);
    GRAV.draw.note(ctx, '按真实比例', w, h, C);
  }

  // ---------- 第 8 步之外的阶梯：整块画布 ----------
  function stairStep(i) {
    return function (ctx, w, h, t, C) {
      drawStair(ctx, { x: 0, y: 0, w: w, h: h }, topAt(i, t), i, C);
    };
  }

  // ---------- 作答区 ----------
  var SUB_STYLE = [
    '.a3-formula{display:flex;align-items:center;flex-wrap:wrap;gap:12px;font:500 30px/1.45 "Noto Serif SC",serif;color:var(--c-ink);}',
    '.a3-formula .sym{font-size:34px;}',
    '.a3-frac{display:inline-flex;flex-direction:column;align-items:center;line-height:1.3;}',
    '.a3-frac>span{display:block;padding:4px 10px;}',
    '.a3-frac>span:first-child{border-bottom:1.5px solid var(--c-ink);}',
    '.a3-frac .sym{font-size:30px;}',
    '.a3-note{margin-top:20px;width:340px;max-width:100%;font-size:13px;line-height:1.7;color:var(--c-steel);}',
    '.a3-note .sym{font-size:14px;}',
    '@media (max-width:700px){.a3-formula{font-size:26px;}}'
  ].join('');
  if (!document.getElementById('act3-style')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'act3-style';
    styleEl.textContent = SUB_STYLE;
    document.head.appendChild(styleEl);
  }

  function mountFormula(el) {
    el.innerHTML =
      '<div class="a3-formula"><i class="sym">F</i><span>=</span>' +
      '<span class="a3-frac"><span>' + SYM('G') + ' <i class="sym">m₁m₂</i></span><span>' + SYM('r') + '²</span></span></div>' +
      '<div class="a3-note">' + SYM('r') + ' 是两个物体质心之间的距离；均匀球体取球心距。' +
      SYM('G') + ' = ' + GRAV.fmt.sci(K.G) + ' N·m²/kg²</div>';
  }

  // 代入卡：m₁、m₂、r 三行和结果 F
  function cardHTML(i) {
    var L = LV[i], s = L.shows;
    var rLabel = SYM('r') + (L.rNote ? '<span class="u">（' + L.rNote + '）</span>' : '');
    var h = '<div class="kvcard">' +
      '<div class="kv"><span>' + SYM('m₁') + '</span><span class="num">' + s[0] + '</span></div>' +
      '<div class="kv"><span>' + SYM('m₂') + '</span><span class="num">' + s[1] + '</span></div>' +
      '<div class="kv"><span>' + rLabel + '</span><span class="num">' + s[2] + '</span></div>';
    if (i === 2) h += '<div class="kv"><span>在地面</span><span class="num">' + fmtN(F_GROUND) + '</span></div>';
    h += '<div class="kv res-row"><span>' + SYM('F') + '</span><span class="num">' + fmtN(L.f) + '</span></div></div>';
    return h;
  }
  function cardStep(i) {
    return function (el) { el.innerHTML = cardHTML(i); };
  }

  // ---------- 步骤 ----------
  var STEPS = [
    {
      title: '任意两个物体之间都有引力',
      caption: '牛顿把它推广到任意两个物体：引力和两者质量的乘积成正比，和距离的平方成反比。',
      button: '从两个同学开始',
      draw: drawBalls,
      mount: mountFormula
    },
    {
      title: '两个同学：' + fmtN(LV[0].f),
      caption: '两个 50 kg 的同学相距 1 m，代进去算，引力只有 ' + fmtN(LV[0].f) + '。',
      button: '拉远',
      draw: function (ctx, w, h, t, C) { stairStep(0)(ctx, w, h, t, C); },
      mount: cardStep(0)
    },
    {
      title: '地球拉苹果：' + fmtN(LV[1].f),
      caption: '换成地球和一个 0.2 kg 的苹果，r 取地球半径。',
      button: '问你一个问题',
      draw: function (ctx, w, h, t, C) { stairStep(1)(ctx, w, h, t, C); },
      mount: cardStep(1)
    },
    {
      title: '苹果拉地球的力有多大？',
      caption: '地球拉 0.2 kg 的苹果，力是 ' + fmtN(F2) + '。那苹果拉地球的力是多少？',
      gate: true,
      draw: drawPull,
      mount: function (el, api) {
        won4 = false;
        GRAV.ui.choice(el, {
          options: [
            { html: '0',
              say: '苹果对地球也有引力。想想牛顿第三定律：作用力和反作用力是什么关系？' },
            { html: '远小于 ' + fmtF(F2) + ' N',
              say: '地球质量大，力就大吗？式子里 m₁、m₂ 是乘在一起的，两个物体交换一下，F 变不变？' },
            { html: fmtF(F2) + ' N', correct: true,
              say: '对。引力是相互的，两个力大小相等、方向相反。差别在效果：苹果的加速度是 ' + A_APPLE + ' m/s²，地球的只有 ' + A_EARTH + ' m/s²。' },
            { html: '无法确定',
              say: '数据已经够了。用牛顿第三定律想一想。' }
          ],
          hints: [
            '想想牛顿第三定律。',
            'F = G m₁m₂/r²，把两个物体交换，式子变不变？',
            '答案是 ' + fmtN(F2) + '：两个力大小相等、方向相反。'
          ],
          onCorrect: function () { won4 = true; }
        }, api);
      }
    },
    {
      title: '空间站里的航天员：' + fmtN(LV[2].f),
      caption: '空间站离地面约 400 km。70 kg 的航天员在那里受到的引力是 ' + fmtN(LV[2].f) + '。',
      button: '问你一个问题',
      draw: function (ctx, w, h, t, C) { stairStep(2)(ctx, w, h, t, C); },
      mount: cardStep(2)
    },
    {
      title: '太空里，引力还剩多少？',
      caption: '航天员在空间站受到的地球引力，大约是在地面时的多少？',
      gate: true,
      draw: drawOrbit,
      mount: function (el, api) {
        GRAV.ui.choice(el, {
          options: [
            { html: '0',
              say: '太空里也有引力，不然空间站早就飞走了。r 要从哪里量起？' },
            { html: '约 10%',
              say: '400 km 听起来很高，可地球半径有 6371 km。r 从地心量起，变了多少？' },
            { html: '约 50%',
              say: 'r 从地心量起，6371 km 变成 6771 km，并没有翻倍。' },
            { html: '约 90%', correct: true,
              say: '对，约 ' + PCT_ST + '%。r 要从地心量起：6371 km 变成 6771 km，只大了 ' + DRIFT + '%，引力变成 (6371/6771)² ≈ ' + RATIO_ST.toFixed(2) + ' 倍。航天员会"飘"，是因为引力全部用来让他绕地球转了，后面会细讲。' }
          ],
          hints: [
            'r 是从哪里量到哪里的距离？',
            'r 从 6371 km 变成 6771 km，变了百分之几？',
            '(6371/6771)² = ' + RATIO_ST.toFixed(3) + '，约为地面的 ' + PCT_ST + '%。'
          ]
        }, api);
      }
    },
    {
      title: '地球拉月球：' + fmtN(LV[3].f),
      caption: '月球拉近月一侧的海水，比拉地心大 ' + PCT_NEAR + '%；拉远月一侧的，比拉地心小 ' + PCT_FAR + '%。这个差别把海水往两边拉开，就是潮汐。第 1 幕的问题，答案在这里。',
      button: '拉远',
      draw: drawTideStep,
      mount: cardStep(3)
    },
    {
      title: '从两个同学到太阳：差了 ' + SPAN + ' 个数量级',
      caption: '同一个式子 F = G m₁m₂/r²，从两个同学之间的 10⁻⁷ N，一直算到太阳拉地球的 10²² N。',
      button: '下一幕',
      draw: function (ctx, w, h, t, C) { stairStep(4)(ctx, w, h, t, C); },
      mount: cardStep(4)
    }
  ];

  GRAV.act({
    id: 3,
    name: '尺度阶梯',
    tag: '第 3 幕 · 尺度阶梯',
    steps: STEPS
  });
})();
