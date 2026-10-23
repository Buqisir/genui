/*
 * 进阶课 A 的画法与滑块（window.ADV）：A（质量 m）以 v 正碰静止的 B（质量 k·m），碰后速度、动量与动能柱子；
 * 带吸附点的滑块（拖过至少两个吸附点才算看过证据）；质量比–动能传递曲线。
 * 颜色只从调色板 C 取：速度 velocity，能量 charge；"和"用 ink，单个物体用 steel。
 */
(function () {
  'use strict';
  var ADV = window.ADV = {};
  var f = MOM.f, rgba = MOM.rgba;
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  // 一维正碰：A 质量 1、速度 1 撞静止的 B（质量 k），弹回程度 e（恢复系数）
  ADV.after = function (k, e) { return { a: (1 - k * e) / (1 + k), b: (1 + e) / (1 + k) }; };
  ADV.fmtV = function (x) { return (Math.abs(x) < 0.005 ? '0' : f(x, 2)) + 'v'; };
  ADV.share = function (k) { return 4 * k / ((1 + k) * (1 + k)); };   // 弹性正碰传给 B 的动能比例

  // ---------- 画一对小车：碰前一行（可选），碰后一行；下面动量、动能柱子 ----------
  // o: { k, vA, vB, before: 是否画碰前, labels: ['A m','B 3m'], bars: true, tag: 碰后那一行的说明, bad: 标红的文字 }
  ADV.pair = function (ctx, w, h, C, o) {
    var narrow = w < 520, x0 = 8, x1 = w - 8, cw = narrow ? 64 : 84, ch = narrow ? 28 : 32;
    var wA = cw * 0.85, wB = cw * (o.k >= 2 ? 1.15 : 0.95);
    var sc = narrow ? 70 : 100, rows = [];
    if (o.before) rows.push({ y: 58, label: '碰前', vA: 1, vB: 0 });
    rows.push({ y: o.before ? 178 : 84, label: o.tag || '碰后', vA: o.vA, vB: o.vB });
    rows.forEach(function (r, i) {
      MOM.track(ctx, x0, x1, r.y, C);
      var ax = w * 0.3 - wA, bx = w * 0.3 + 6;
      MOM.cart(ctx, ax, r.y, wA, ch, C, { name: 'A', label: o.labels[0] });
      MOM.cart(ctx, bx, r.y, wB, ch, C, { name: 'B', label: o.labels[1], heavy: o.k > 1 });
      txt(ctx, r.label, x0, r.y - ch - 20, { size: 12, color: C.steel });
      var ay = r.y + 26;
      if (r.vA == null) txt(ctx, '？', ax + wA / 2, ay + 4, { size: 14, color: C.vel, align: 'center' });
      else MOM.vArrow(ctx, r.vA < 0 ? ax + wA / 2 : ax + wA / 2 - 8, ay, r.vA, sc, C, ADV.fmtV(r.vA));
      if (r.vB == null) txt(ctx, '？', bx + wB / 2, ay + 28, { size: 14, color: C.vel, align: 'center' });
      else MOM.vArrow(ctx, Math.min(bx + wB / 2, x1 - 4 - Math.max(0, r.vB) * sc), ay + 24, r.vB, sc, C, ADV.fmtV(r.vB));
    });
    txt(ctx, '向右为正', x1, 16, { size: 12, color: C.steel, align: 'right' });
    if (o.bad) txt(ctx, o.bad, x1, rows[rows.length - 1].y - ch - 20, { size: 14, color: C.force, align: 'right' });
    if (!o.bars || o.vA == null || o.vB == null) return;
    var top = rows[rows.length - 1].y + 86, bh = h - top - 6, half = Math.min(260, (w - 2 * x0) / 2 - 10);
    if (bh < 120) return;
    var pA = o.vA, pB = o.k * o.vB, kA = 0.5 * o.vA * o.vA, kB = 0.5 * o.k * o.vB * o.vB, kS = kA + kB;
    // 刻度按数值定：正向装得下最高的柱子，负向留出 A 弹回时的空间；两组共用零线
    var pos = Math.max(1.2, pA, pB, pA + pB) * 1.15, negMag = Math.max(0, -pA) * 1.35;
    var neg = Math.max(0.12, negMag / (pos + negMag));
    RCL.bars(ctx, { x: x0, y: top, w: half, h: bh }, [
      { label: 'A', v: pA, text: f(pA, 2) }, { label: 'B', v: pB, text: f(pB, 2) }, { label: '和', v: pA + pB, ink: true, text: f(pA + pB, 2) }
    ], C, { max: pos, neg: neg, ref: 1, refLabel: '碰前', title: '动量（单位 mv）' });
    RCL.bars(ctx, { x: x0 + half + 20, y: top, w: half, h: bh }, [
      { label: 'A', v: kA, text: f(kA, 2), color: rgba(C.charge, 0.7) }, { label: 'B', v: kB, text: f(kB, 2), color: rgba(C.charge, 0.7) },
      { label: '和', v: kS, ink: true, text: f(kS, 2), color: kS > 0.5 + 1e-6 ? C.force : C.ink }
    ], C, { max: Math.max(0.9, kS * 1.15), neg: neg, ref: 0.5, refLabel: '碰前', title: '动能（单位 mv²）' });
  };

  // ---------- 质量比–传递比例曲线：横轴 log10(k) 从 −2 到 2 ----------
  ADV.shareCurve = function (ctx, box, k, C) {
    var L = box.x + 40, R = box.x + box.w - 12, T = box.y + 24, B = box.y + box.h - 40;
    var X = function (lk) { return L + (R - L) * (lk + 2) / 4; }, Y = function (s) { return B - (B - T) * s; };
    ctx.save(); ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T - 4); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    ctx.strokeStyle = C.charge; ctx.lineWidth = 2; ctx.beginPath();
    for (var i = 0; i <= 200; i++) { var lk = -2 + 4 * i / 200, s = ADV.share(Math.pow(10, lk)); if (i) ctx.lineTo(X(lk), Y(s)); else ctx.moveTo(X(lk), Y(s)); }
    ctx.stroke(); ctx.restore();
    [[-2, '1/100'], [-1, '1/10'], [0, '1'], [1, '10'], [2, '100']].forEach(function (p) {
      txt(ctx, p[1], X(p[0]), B + 16, { font: 'num', size: 12, color: C.steel, align: 'center' });
    });
    [[0, '0'], [0.5, '50%'], [1, '100%']].forEach(function (p) { txt(ctx, p[1], L - 6, Y(p[0]) + 4, { font: 'num', size: 12, color: C.steel, align: 'right' }); });
    txt(ctx, '传给 B 的动能比例', box.x, box.y + 10, { size: 12, color: C.steel });
    txt(ctx, 'B 与 A 的质量比', R, B + 34, { size: 12, color: C.steel, align: 'right' });
    var lk0 = Math.log(k) / Math.LN10, s0 = ADV.share(k);
    ctx.save(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X(lk0), Y(s0), 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    txt(ctx, Math.round(s0 * 100) + '%', X(lk0) + (lk0 > 1 ? -10 : 10), Y(s0) - 10, { font: 'num', size: 14, color: C.ink, align: lk0 > 1 ? 'right' : 'left' });
  };

  // ---------- 带吸附点的滑块 ----------
  // o: { label, min, max, step, value, snaps: [{ v, name }], fmt(v), onChange(v), need: 至少拖过几个吸附点, onEnough() }
  ADV.slider = function (el, o) {
    var wrap = document.createElement('div');
    wrap.className = 'adv-slider';
    wrap.innerHTML = '<div class="as-h"><span>' + o.label + '</span><b class="as-v"></b></div>' +
      '<input type="range" min="' + o.min + '" max="' + o.max + '" step="' + o.step + '" value="' + o.value + '">' +
      '<div class="as-snaps"></div><div class="as-tip"></div>';
    el.appendChild(wrap);
    var inp = wrap.querySelector('input'), vEl = wrap.querySelector('.as-v'), tip = wrap.querySelector('.as-tip');
    var snapsEl = wrap.querySelector('.as-snaps'), seen = {}, enough = false;
    (o.snaps || []).forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'as-snap'; b.textContent = s.name;
      b.addEventListener('click', function () { inp.value = s.v; update(); });
      s.btn = b;
      snapsEl.appendChild(b);
    });
    function update() {
      var v = Number(inp.value), span = o.max - o.min;
      (o.snaps || []).forEach(function (s) {
        if (Math.abs(v - s.v) < span * 0.02) { v = s.v; inp.value = v; }
        var on = v === s.v;
        s.btn.classList.toggle('on', on);
        if (on) seen[s.name] = true;
      });
      vEl.textContent = o.fmt(v);
      o.onChange(v);
      var n = Object.keys(seen).length, need = o.need || 0;
      if (need) tip.textContent = n >= need ? '' : '拖动滑块，或点下面的位置，至少看 ' + need + ' 个（已看 ' + n + ' 个）';
      if (!enough && n >= need) { enough = true; if (o.onEnough) o.onEnough(); }
    }
    inp.addEventListener('input', update);
    update();
    return { set: function (v) { inp.value = v; update(); } };
  };
})();
