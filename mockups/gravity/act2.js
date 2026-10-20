/*
 * 第 2 幕 · 月亮来作证
 * 移植自 mockups/player-moon.html：五步、揭晓逻辑、两个月亮、写死的四句说明、牛顿横条。
 * 进度、导航、绿框、左栏由 shell.js 负责，这里只管画布和作答区。
 */
(function () {
  'use strict';

  var GRAV = window.GRAV;
  var TAU = Math.PI * 2;

  // ---------- 物理（全部由这里计算） ----------
  var PHYS = { g: 9.8, R: 6.371e6, r: 3.84e8, T_REAL: 27.3, r_meas: 3.8e8, DAY: 86400, SEC_PER_DAY: 0.25 };
  var CANDS = [0, 1, 2, 3].map(function (n) {
    var a = PHYS.g * Math.pow(PHYS.R / PHYS.r, n);
    var T = 2 * Math.PI * Math.sqrt(PHYS.r / a) / PHYS.DAY;
    return { n: n, a: a, T: T, ok: Math.abs(T - PHYS.T_REAL) / PHYS.T_REAL < 0.02 };
  });
  var A_PRED = PHYS.g / (60 * 60);
  var A_MEAS = 4 * Math.PI * Math.PI * PHYS.r_meas / Math.pow(PHYS.T_REAL * PHYS.DAY, 2);
  var DIFF_PCT = Math.round(Math.abs(A_PRED - A_MEAS) / A_PRED * 100);

  var LAW = ['不随距离变', '∝ 1/<i class="sym">r</i>', '∝ 1/<i class="sym">r</i>²', '∝ 1/<i class="sym">r</i>³'];
  var NOTE = {
    0: '月亮 11 小时就该转一圈，和真实差太远。',
    1: '3.5 天一圈，还是太快。',
    2: '27.4 天，和真实的 27.3 天几乎一样。',
    3: '要 213 天才转一圈，太慢了。'
  };
  var TITLES = [
    '如果是同一种力，它随距离怎么变？',
    '如果是同一种力，它随距离怎么变？',
    '月亮自己说：27.3 天',
    '同一种力，和距离的平方成反比',
    '牛顿当年比的是加速度'
  ];
  var BTN = ['试一试', '翻开实际周期', '继续', '继续', '下一幕'];

  // ---------- 字体 ----------
  function ITAL(px) { return 'italic ' + px + 'px "Source Serif 4", serif'; }
  function UI(px) { return px + 'px "Noto Sans SC", sans-serif'; }
  function NUM(px) { return px + 'px Inter, sans-serif'; }

  function fmtA(a) {
    if (a >= 1) return a.toPrecision(2);
    if (a >= 0.01) return a.toPrecision(3);
    return GRAV.fmt.sci(a);
  }
  function fmtT(T) { return T < 10 ? T.toPrecision(2) : T.toPrecision(3); }

  // ---------- 状态 ----------
  // S.cur 是本幕当前步序号（0 起）；pick / tried 放在 GRAV.state.moon，从头再来时清空。
  var S = { cur: 0, el: null, api: null };
  var pred = { n: null, base: 0, anchor: 0, omega: 0 };
  var realAnchor = 0;
  var OMEGA_REAL = 2 * Math.PI / (PHYS.T_REAL * PHYS.SEC_PER_DAY);

  function now() { return performance.now() / 1000; }
  function MS() {
    return GRAV.state.moon || (GRAV.state.moon = { pick: null, tried: [] });
  }
  function effPick() { return S.cur >= 3 ? 2 : MS().pick; }

  function omegaOf(n) { return 2 * Math.PI / (CANDS[n].T * PHYS.SEC_PER_DAY); }
  function predAngle(t) { return pred.base + pred.omega * (t - pred.anchor); }
  function realAngle(t) { return OMEGA_REAL * (t - realAnchor); }
  function setPred(n, reset, t) {
    var base = (reset || pred.n === null) ? 0 : predAngle(t);
    pred = { n: n, base: base, anchor: t, omega: n === null ? 0 : omegaOf(n) };
  }
  function syncPred(reset, t) {
    var e = effPick();
    if (reset || e !== pred.n) setPred(e, reset, t);
  }

  // ---------- 作答区 ----------
  function resHTML(c) {
    if (S.cur === 2) return '<div class="res">' + NOTE[c.n] + '</div>';
    return '<div class="res">月亮处 ' + GRAV.h.sym('a') + ' = <span class="num acc">' + fmtA(c.a) +
      '</span> <span class="u">m/s²</span>' + (c.T < 1 ? '，约 ' + Math.round(c.T * 24) + ' 小时一圈' : '') + '</div>';
  }

  function optsHTML() {
    var m = MS(), cur = S.cur;
    var h = '<div class="opts" role="group" aria-label="候选规律">';
    CANDS.forEach(function (c) {
      var on = m.pick === c.n, done = m.tried.indexOf(c.n) >= 0;
      var cls = cur === 2 && done ? (c.ok ? ' win' : ' lose') : '';
      var t = done ? fmtT(c.T) + ' 天' + (cur === 2 && c.ok ? ' ✓' : '') : '';
      h += '<button type="button" class="opt' + (on ? ' on' : '') + cls + '" data-n="' + c.n +
        '" aria-pressed="' + on + '"><span>' + LAW[c.n] + '</span><span class="t">' + t + '</span></button>';
      if (on) h += resHTML(c);
    });
    h += '</div><div class="real' + (cur >= 2 ? ' shown' : '') + '"><span>实际周期</span><span class="num">' +
      (cur >= 2 ? '27.3 天' : '？') + '</span></div>';
    return h;
  }

  function conclHTML() {
    return '<div class="concl">地球的引力 ∝ 1/<i class="sym">r</i>²</div>' +
      '<div class="concl-sub">从地面到月球，距离变成 <span class="num">60</span> 倍，引力变成 <span class="num">1/3600</span>。</div>';
  }

  function barsHTML() {
    var maxV = Math.max(A_PRED, A_MEAS);
    var L = function (v) { return Math.round(280 * v / maxV); };
    return '<div class="bars">' +
      '<div><div class="bar-lab">预测 ' + GRAV.h.sym('g') + '/3600 = <span class="num acc">' + GRAV.fmt.sci(A_PRED) +
      '</span> <span class="u">m/s²</span></div><div class="bar" style="width:' + L(A_PRED) + 'px"></div></div>' +
      '<div><div class="bar-lab">实测 4π²' + GRAV.h.sym('r') + '/' + GRAV.h.sym('T') + '² = <span class="num acc">' +
      GRAV.fmt.sci(A_MEAS) + '</span> <span class="u">m/s²</span></div><div class="bar" style="width:' + L(A_MEAS) + 'px"></div></div>' +
      '<div class="bar-note">相差约 ' + DIFF_PCT + '%</div></div>';
  }

  function answerHTML() {
    if (S.cur === 0) return '';
    if (S.cur === 4) return barsHTML();
    if (S.cur === 3) return conclHTML();
    return optsHTML();
  }

  function statusText() {
    var m = MS(), cur = S.cur;
    if (cur === 0) return '点下面的按钮往下走';
    if (cur === 1) return m.pick === null ? '等你选择……' : '可以再试别的，也可以翻开实际周期';
    if (cur === 2) {
      if (m.pick === null) return '';
      return m.pick === 2
        ? '<span class="ok">对上了：实际周期和 ∝ 1/r² 的预测一致</span>'
        : '<span class="no">对不上：这一种规律的周期和实际不符</span>';
    }
    if (cur === 3) return '点继续往下';
    return '点下一幕';
  }

  function paint() {
    var m = MS(), cur = S.cur;
    S.el.innerHTML = answerHTML();
    if (cur === 1 && m.tried.length) S.api.open();
    S.api.win(cur >= 2 && effPick() === 2);
    S.api.status(statusText());
  }

  function pickN(n) {
    var m = MS();
    m.pick = n;
    if (m.tried.indexOf(n) < 0) m.tried.push(n);
    syncPred(false, now());
    paint();
  }

  function onAnswerClick(e) {
    var b = e.target.closest ? e.target.closest('.opt') : null;
    if (!b || !b.hasAttribute('data-n')) return;
    pickN(Number(b.getAttribute('data-n')));
  }

  function mountAt(idx) {
    return function (el, api) {
      var prev = S.cur;
      S.cur = idx;
      var t = now();
      if (prev < 2 && idx >= 2) { realAnchor = t; syncPred(true, t); }
      else syncPred(false, t);
      S.el = el;
      S.api = api;
      el.onclick = onAnswerClick;
      paint();
    };
  }

  // ---------- 画布 ----------
  function runs(ctx, list, x, y, align) {
    var total = 0;
    list.forEach(function (it) { ctx.font = it.f; it.w = ctx.measureText(it.t).width; total += it.w; });
    var px = align === 'center' ? x - total / 2 : x;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    list.forEach(function (it) {
      ctx.font = it.f; ctx.fillStyle = it.c; ctx.fillText(it.t, px, y); px += it.w;
    });
    ctx.restore();
  }

  function drawLegend(ctx, w, C, real) {
    var rows = [{ kind: 'fill', text: '预测', color: C.vel }];
    if (real) rows.push({ kind: 'ring', text: '实际（27.3 天）', color: C.graphite });
    rows.forEach(function (r, i) {
      var y = 16 + i * 18;
      ctx.font = UI(12);
      var tw = ctx.measureText(r.text).width;
      var xr = w - 4;
      GRAV.draw.text(ctx, r.text, xr, y, { size: 12, color: C.steel, align: 'right' });
      var dx = xr - tw - 14;
      ctx.save();
      ctx.beginPath();
      ctx.arc(dx, y - 4, 4, 0, TAU);
      if (r.kind === 'fill') { ctx.fillStyle = r.color; ctx.fill(); }
      else { ctx.strokeStyle = r.color; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.restore();
    });
  }

  function drawScene(ctx, w, h, t, C) {
    var tn = now();
    var cur = S.cur;
    var s = Math.min(w, h), rho = 0.42 * s;
    var cx = w / 2, cy = h - rho - 28, RE = rho / 60.27;

    // 轨道（虚线）
    ctx.save();
    ctx.setLineDash([2, 4]); ctx.strokeStyle = C.hair; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, rho, 0, TAU); ctx.stroke();
    ctx.restore();

    // 半径线与标注
    ctx.save();
    ctx.globalAlpha = 0.7; ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + RE, cy); ctx.lineTo(cx + rho, cy); ctx.stroke();
    ctx.restore();
    runs(ctx, [
      { t: 'r', f: ITAL(15), c: C.graphite },
      { t: ' = 60', f: NUM(13), c: C.graphite },
      { t: 'R', f: ITAL(15), c: C.graphite }
    ], cx + rho * 0.5, cy - 10, 'center');

    // 地球（按比例）
    ctx.save();
    ctx.globalAlpha = 0.3; ctx.fillStyle = C.vel;
    ctx.beginPath(); ctx.arc(cx, cy, RE, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, RE, 0, TAU); ctx.stroke();
    GRAV.draw.text(ctx, '地球', cx, cy + RE + 18, { font: 'ui', size: 12, color: C.graphite, align: 'center' });
    GRAV.draw.note(ctx, '距离按比例；月球圆点放大画', w, h, C);

    // 左上角插图：苹果下落 + g
    var x0 = 14, y0 = 14, gy = y0 + 84, ax = x0 + 22, ra = 6;
    var f = Math.min(1, (tn % 1.6) / 1.2);
    var yTop = y0 + 14, yEnd = gy - ra;
    var ay = yTop + (yEnd - yTop) * f * f;
    ctx.save();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + 90, gy); ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = C.graphite;
    ctx.beginPath(); ctx.arc(ax, ay, ra, 0, TAU); ctx.fill();
    ctx.restore();
    runs(ctx, [
      { t: 'g', f: ITAL(14), c: C.graphite },
      { t: ' = ', f: UI(12), c: C.graphite },
      { t: String(PHYS.g), f: NUM(12), c: C.accel },
      { t: ' m/s²', f: NUM(12), c: C.graphite }
    ], x0 + 46, y0 + 26, 'left');
    GRAV.draw.text(ctx, '地面', x0, gy + 15, { font: 'ui', size: 11, color: C.steel });

    // 预测月球（没选时停在最右侧；选了就按 T_n 转，后面拖一段渐隐尾迹）
    var th = pred.n === null ? 0 : predAngle(tn);
    if (pred.n !== null) {
      var span = Math.PI / 3, N = 24;
      ctx.save();
      ctx.strokeStyle = C.vel; ctx.lineWidth = 3;
      for (var i = 0; i < N; i++) {
        ctx.globalAlpha = 0.55 * (1 - i / N);
        ctx.beginPath();
        ctx.arc(cx, cy, rho, th - span * (i + 1) / N, th - span * i / N);
        ctx.stroke();
      }
      ctx.restore();
    }
    var mx = cx + rho * Math.cos(th), my = cy + rho * Math.sin(th);
    ctx.save();
    ctx.fillStyle = C.vel;
    ctx.beginPath(); ctx.arc(mx, my, 6, 0, TAU); ctx.fill();
    ctx.restore();
    if (pred.n !== null) {
      var Ts = CANDS[pred.n].T * PHYS.SEC_PER_DAY;
      if (Ts < 0.3) GRAV.draw.text(ctx, '太快了', mx, my - 14, { font: 'ui', size: 12, color: C.graphite, align: 'center' });
      else if (Ts > 20) GRAV.draw.text(ctx, '几乎不动', mx, my - 14, { font: 'ui', size: 12, color: C.graphite, align: 'center' });
    }

    // 真实月球（翻开后出现，空心圆）
    if (cur >= 2) {
      var ath = realAngle(tn);
      ctx.save();
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx + rho * Math.cos(ath), cy + rho * Math.sin(ath), 6, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    if (cur >= 1) drawLegend(ctx, w, C, cur >= 2);
  }

  // ---------- 文案 ----------
  function stanceCaption() {
    var st = GRAV.state.stance;
    return '苹果落地和月亮绕地球，是同一种力在起作用。' +
      (st ? '你开头选的是「' + st + '」，现在有答案了。' : '现在有答案了。');
  }

  var CAPTION = [
    '上一节，太阳拉行星的力和距离的平方成反比。地球拉苹果、拉月亮，会不会也是这样？',
    '从苹果的 ' + GRAV.h.sym('g') + ' 出发，按你选的规律算一算：月亮应该几天绕地球一圈？',
    '翻开来：月亮绕地球一圈是 27.3 天。哪一种规律对得上？',
    stanceCaption,
    '牛顿比的是加速度：预测 ' + GRAV.h.sym('g') + '/3600，实测月球的向心加速度 4π²' + GRAV.h.sym('r') +
      '/' + GRAV.h.sym('T') + '²。和我们比周期，是同一件事。'
  ];

  // ---------- 注册 ----------
  GRAV.act({
    id: 2,
    name: '月亮来作证',
    tag: '第 2 幕 · 月亮来作证',
    steps: [
      { title: TITLES[0], caption: CAPTION[0], button: BTN[0], draw: drawScene, mount: mountAt(0) },
      { title: TITLES[1], caption: CAPTION[1], button: BTN[1], gate: true, draw: drawScene, mount: mountAt(1) },
      { title: TITLES[2], caption: CAPTION[2], button: BTN[2], draw: drawScene, mount: mountAt(2) },
      { title: TITLES[3], caption: CAPTION[3], button: BTN[3], draw: drawScene, mount: mountAt(3) },
      { title: TITLES[4], caption: CAPTION[4], button: BTN[4], draw: drawScene, mount: mountAt(4) }
    ]
  });
})();
