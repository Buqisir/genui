/*
 * 第 2 幕 · 月亮来作证（v2 重做）
 * 逐句讲解：每步的 beats；画面用 GRAV.kit 画；演算板用 GRAV.ui.work。
 * 全部数值由下面的 PHYS 与 CANDS 计算后格式化。
 * 进度、导航、绿框、讲解记录由 shell.js 负责，这里只管画布和作答区。
 */
(function () {
  'use strict';

  var GRAV = window.GRAV;
  var TAU = Math.PI * 2;
  var kit = GRAV.kit;

  // ---------- 物理（全部由这里计算） ----------
  var PHYS = {
    g: 9.8, r: 3.84e8, SCALE: 60,            // 统一用 60 倍；r = 3.84×10⁸ m
    DAY: 86400, DAY_SCREEN: 0.25,            // 屏幕上 1 天 = 0.25 秒
    T_REAL_DAYS: 27.3                        // 实际周期
  };
  // 四种规律：a = g·(1/60)ⁿ，T = 2π√(r/a)
  var CANDS = [0, 1, 2, 3].map(function (n) {
    var a = PHYS.g / Math.pow(PHYS.SCALE, n);
    var T = 2 * Math.PI * Math.sqrt(PHYS.r / a);          // 秒
    var Td = T / PHYS.DAY;                                 // 天
    return { n: n, a: a, T: T, Td: Td, ok: Math.abs(Td - PHYS.T_REAL_DAYS) / PHYS.T_REAL_DAYS < 0.02 };
  });
  var T_REAL = PHYS.T_REAL_DAYS * PHYS.DAY;                // 秒
  var A_PRED = PHYS.g / (60 * 60);                         // g/60²
  var A_MEAS = 4 * Math.PI * Math.PI * PHYS.r / (T_REAL * T_REAL);   // 4π²r/T²
  var OMEGA_REAL = TAU / (PHYS.T_REAL_DAYS * PHYS.DAY_SCREEN);

  // ---------- 格式化 ----------
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(s) {
    return String(s).split('').map(function (c) { return SUP[c] || c; }).join('');
  }
  function sym(s) { return GRAV.h.sym(s); }
  function fmtA(a) {
    if (a >= 1) return a.toPrecision(2);
    if (a >= 0.01) return a.toPrecision(3);
    return GRAV.fmt.sci(a, 3);
  }
  function fmtDays(d) { return d < 10 ? d.toPrecision(2) : d.toPrecision(3); }
  function fmtSec(T) { return GRAV.fmt.sci(T, 3); }
  function clamp01(x) { return Math.min(1, Math.max(0, x)); }
  function now() { return performance.now() / 1000; }

  var LAW_HTML = ['不随距离变', '∝ 1/' + sym('r'), '∝ 1/' + sym('r') + '²', '∝ 1/' + sym('r') + '³'];
  var LAW_TXT = ['不随距离变', '∝ 1/r', '∝ 1/r²', '∝ 1/r³'];

  // 点了候选以后老师的点评（不透露哪个对）
  var COMMENT = [
    '力不变的话，月亮受的加速度和苹果一样大，' + Math.round(CANDS[0].Td * 24) + ' 小时就转一圈。',
    '这就是刚才算的，' + fmtDays(CANDS[1].Td) + ' 天。',
    fmtDays(CANDS[2].Td) + ' 天。先记下这个数。',
    '力减弱得太厉害，要 ' + Math.round(CANDS[3].Td) + ' 天才转一圈。'
  ];

  // 演算板每句对应的一行（null 表示这句不加行）
  var LINES_STEP2 = [
    { html: sym('a') + ' = ' + sym('g') + ' × 1/60 = ' + fmtA(CANDS[1].a) + ' m/s²' },
    { html: sym('T') + ' = 2π√(' + sym('r') + '/' + sym('a') + ')',
      note: '由 ' + sym('a') + ' = 4π²' + sym('r') + '/' + sym('T') + '² 变形' },
    { html: sym('T') + ' = 2π√(' + GRAV.fmt.sci(PHYS.r) + ' ÷ ' + fmtA(CANDS[1].a) + ') ≈ ' + fmtSec(CANDS[1].T) + ' s' },
    { html: '≈ ' + fmtDays(CANDS[1].Td) + ' 天' },
    null
  ];
  var LINES_STEP5 = [
    null,
    { html: sym('g') + '/60² = ' + fmtA(PHYS.g) + ' ÷ 3600 = ' + GRAV.fmt.sci(A_PRED) + ' m/s²' },
    { html: '4π²' + sym('r') + '/' + sym('T') + '² = ' + GRAV.fmt.sci(A_MEAS) + ' m/s²',
      note: sym('r') + ' = ' + GRAV.fmt.sci(PHYS.r) + ' m，' + sym('T') + ' = ' + fmtDays(PHYS.T_REAL_DAYS) + ' 天' },
    null
  ];

  // ---------- 镜头（近景 → 全景）与月球的运动 ----------
  var cam = { from: 0, to: 0, t0: 0 };
  function camValue() {
    var k = clamp01((now() - cam.t0) / 1.2);
    var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    return cam.from + (cam.to - cam.from) * e;
  }
  function setCam(to, snap) {
    var cur = camValue();
    cam.from = snap ? to : cur;
    cam.to = to;
    cam.t0 = now();
  }

  // 预测月球：n 为规律序号（null 时停在最右侧）
  var MOON = { n: null, base: 0, anchor: 0, omega: 0 };
  // 真实月球：揭晓后才出现，和预测月球同时从最右侧出发
  var REAL = { on: false, anchor: 0 };
  function omegaOf(n) { return TAU / (CANDS[n].Td * PHYS.DAY_SCREEN); }
  function predAngle(t) { return MOON.base + MOON.omega * (t - MOON.anchor); }
  function setMoon(n, t, reset) {
    if (!reset && n === MOON.n) return;
    var base = reset ? 0 : predAngle(t);
    MOON.n = n;
    MOON.base = base;
    MOON.anchor = t;
    MOON.omega = n === null ? 0 : omegaOf(n);
  }

  // 状态：本幕当前步（idx）、当前句（beat）、候选区与演算板
  var ST = { idx: 0, beat: 0, api: null, cands: null, WK: null, shown: 0 };
  function MS() {
    return GRAV.state.moon || (GRAV.state.moon = { pick: null, tried: [] });
  }

  // 此刻预测月球应该按哪个规律转
  function wantN() {
    var m = MS(), i = ST.idx, b = ST.beat;
    if (i === 0) return null;
    if (i === 1) return b >= 3 ? 1 : null;
    if (i === 2 || i === 3) return m.pick;
    return 2;   // 第 5 步：∝ 1/r²
  }

  // ---------- 作答区 ----------
  function candsHTML() {
    var m = MS(), i = ST.idx, b = ST.beat;
    if (i === 0) {
      if (b < 3) return '';
      return '<div class="opts">' + LAW_HTML.map(function (h) {
        return '<div class="opt plain"><span class="opt-html">' + h + '</span></div>';
      }).join('') + '</div>';
    }
    if (i !== 2 && i !== 3) return '';
    var rev = i === 3 && b >= 1;      // 第 4 步第 2 句起，按对错变色
    var h = '<div class="opts" role="group" aria-label="候选规律">';
    CANDS.forEach(function (c) {
      var on = m.pick === c.n, tried = m.tried.indexOf(c.n) >= 0;
      var show = tried || (rev && c.ok);
      var cls = rev && tried ? (c.ok ? ' win' : ' lose') : '';
      var t = show ? fmtDays(c.Td) + ' 天' + (rev && tried && c.ok ? ' ✓' : '') : '';
      h += '<button type="button" class="opt' + (on ? ' on' : '') + cls + '" data-n="' + c.n +
        '" aria-pressed="' + on + '"><span class="opt-html">' + LAW_HTML[c.n] + '</span><span class="t">' + t + '</span></button>';
    });
    h += '</div>';
    if (i === 3) {
      h += '<div class="real shown"><span>实际周期</span><span class="num">' + fmtDays(PHYS.T_REAL_DAYS) + ' 天</span></div>';
    }
    return h;
  }

  function statusHTML() {
    var m = MS(), i = ST.idx, b = ST.beat;
    if (i === 2) return m.pick === null ? '等你试一种规律……' : '可以再试别的，也可以翻开实际周期';
    if (i === 3 && b >= 1 && m.pick !== null) {
      return m.pick === 2
        ? '<span class="ok">对上了：实际周期和 ∝ 1/r² 的预测一致</span>'
        : '<span class="no">对不上：这一种规律的周期和实际不符</span>';
    }
    return '';
  }

  function refresh() {
    if (ST.cands) ST.cands.innerHTML = candsHTML();
    if (ST.api) ST.api.status(statusHTML());
  }

  // 演算板：按句追加行；往回退时清空重写（不重复淡入已有的行）
  function syncLines(list, b) {
    if (!ST.WK) return;
    if (b < ST.shown - 1) { ST.WK.clear(); ST.shown = 0; }
    while (ST.shown <= b) {
      var L = list[ST.shown];
      if (L) ST.WK.line(L.html, L.note);
      ST.shown++;
    }
  }

  // 第 3 步：点了一种规律后，演算板写三行
  function writeBoard(n) {
    var c = CANDS[n];
    ST.WK.clear();
    ST.WK.line(n === 0
      ? sym('a') + ' = ' + sym('g') + ' = ' + fmtA(PHYS.g) + ' m/s²'
      : sym('a') + ' = ' + sym('g') + ' × (1/60)' + sup(n) + ' = ' + fmtA(c.a) + ' m/s²');
    ST.WK.line(sym('T') + ' = 2π√(' + sym('r') + '/' + sym('a') + ') ≈ ' + fmtSec(c.T) + ' s');
    ST.WK.line('≈ ' + fmtDays(c.Td) + ' 天');
  }

  function onPick(n) {
    var m = MS();
    m.pick = n;
    if (m.tried.indexOf(n) < 0) m.tried.push(n);
    if (ST.idx === 2) {
      ST.api.open();
      writeBoard(n);
      ST.api.me('试试「' + LAW_TXT[n] + '」');
      ST.api.say(COMMENT[n]);
    } else {
      ST.api.me('对比「' + LAW_TXT[n] + '」');
    }
    setMoon(n, now(), false);
    refresh();
  }

  function onAnswerClick(e) {
    var b = e.target.closest ? e.target.closest('.opt[data-n]') : null;
    if (!b) return;
    onPick(Number(b.getAttribute('data-n')));
  }

  // ---------- 画布 ----------
  function withAlpha(ctx, a, fn) {
    if (a <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * a;
    fn();
    ctx.restore();
  }

  function drawOrbit(ctx, cx, cy, rho, C) {
    ctx.save();
    ctx.setLineDash([2, 4]); ctx.strokeStyle = C.hair; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, rho, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  function drawRadius(ctx, cx, cy, rho, C) {
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * 0.7;
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rho, cy); ctx.stroke();
    ctx.restore();
    kit.math(ctx, [{ t: 'r', sym: true }, { t: ' = 60' }, { t: 'R', sym: true }],
      cx + rho * 0.5, cy - 10, C, { size: 14, color: C.graphite, align: 'center' });
  }

  function drawMoons(ctx, cx, cy, rho, tn, C) {
    var th = MOON.n === null ? 0 : predAngle(tn);
    if (MOON.n !== null) {
      // 60° 渐隐尾迹
      var span = Math.PI / 3, N = 24, base = ctx.globalAlpha;
      ctx.save();
      ctx.strokeStyle = C.vel; ctx.lineWidth = 3;
      for (var i = 0; i < N; i++) {
        ctx.globalAlpha = base * 0.55 * (1 - i / N);
        ctx.beginPath();
        ctx.arc(cx, cy, rho, th - span * (i + 1) / N, th - span * i / N);
        ctx.stroke();
      }
      ctx.restore();
    }
    var mx = cx + rho * Math.cos(th), my = cy + rho * Math.sin(th);
    kit.moon(ctx, mx, my, 7, C);
    if (MOON.n !== null) {
      var Ts = CANDS[MOON.n].Td * PHYS.DAY_SCREEN;   // 屏幕上一圈要几秒
      if (Ts < 0.3) GRAV.draw.text(ctx, '太快了', mx, my - 14, { font: 'ui', size: 12, color: C.graphite, align: 'center' });
      else if (Ts > 20) GRAV.draw.text(ctx, '几乎不动', mx, my - 14, { font: 'ui', size: 12, color: C.graphite, align: 'center' });
    }
    if (REAL.on) {
      var ath = OMEGA_REAL * (tn - REAL.anchor);
      ctx.save();
      ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx + rho * Math.cos(ath), cy + rho * Math.sin(ath), 7, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }

  function drawLegend(ctx, w, C) {
    var rows = [];
    if (MOON.n !== null) rows.push({ fill: true, text: '预测', color: C.vel });
    if (REAL.on) rows.push({ fill: false, text: '实际（' + fmtDays(PHYS.T_REAL_DAYS) + ' 天）', color: C.graphite });
    rows.forEach(function (r, i) {
      var y = 16 + i * 18, xr = w - 4;
      ctx.font = '12px "Noto Sans SC", sans-serif';
      var tw = ctx.measureText(r.text).width;
      GRAV.draw.text(ctx, r.text, xr, y, { size: 12, color: C.steel, align: 'right' });
      var dx = xr - tw - 14;
      ctx.save();
      ctx.beginPath(); ctx.arc(dx, y - 4, 4, 0, TAU);
      if (r.fill) { ctx.fillStyle = r.color; ctx.fill(); }
      else { ctx.strokeStyle = r.color; ctx.lineWidth = 1.5; ctx.stroke(); }
      ctx.restore();
    });
  }

  // 全景左上角的小插图：地面 + 苹果 + g
  function drawInset(ctx, tn, C) {
    var x0 = 14, y0 = 14, gy = y0 + 84, ax = x0 + 22, ra = 6;
    var f = Math.min(1, (tn % 1.6) / 1.2);
    var yTop = y0 + 14, yEnd = gy - ra;
    var ay = yTop + (yEnd - yTop) * f * f;
    ctx.save();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + 90, gy); ctx.stroke();
    ctx.restore();
    kit.apple(ctx, ax, ay, ra, C);
    kit.math(ctx, [{ t: 'g', sym: true }, { t: ' = ' + fmtA(PHYS.g) + ' m/s²' }], x0 + 46, y0 + 26, C, { size: 13, color: C.graphite });
    GRAV.draw.text(ctx, '地面', x0, gy + 15, { font: 'ui', size: 11, color: C.steel });
  }

  // 近景：地球顶端的地面上，苹果反复下落，标 g
  function drawNear(ctx, cx, topN, h, tn, C) {
    var ra = 9;
    var y0 = topN - 0.3 * h, yEnd = topN - ra;
    var f = Math.min(1, (tn % 1.6) / 1.2);
    kit.apple(ctx, cx, y0 + (yEnd - y0) * f * f, ra, C);
    kit.math(ctx, [{ t: 'g', sym: true }, { t: ' = ' + fmtA(PHYS.g) + ' m/s²' }],
      cx + 26, topN - 0.2 * h, C, { size: 16, color: C.ink });
  }

  // 所有步共用的一个画面：镜头从近景（地球占画面高度 45%）拉远到全景（地球按真实比例变成小点）
  function drawScene(ctx, w, h, t, C) {
    var tn = now();
    var k = camValue();                          // 0 近景，1 全景
    var s = Math.min(w, h), rho = 0.42 * s;      // 轨道半径（画布像素）
    var cx = w / 2, cyF = h - rho - 28;          // 全景：地球位置（轨道中心）
    var REF = rho / PHYS.SCALE;                  // 全景地球半径 = 轨道半径 / 60
    var RN = 0.225 * h, cyN = 0.72 * h;          // 近景：地球直径 = 0.45h
    var ey = cyN + (cyF - cyN) * k;
    var er = Math.exp(Math.log(RN) + (Math.log(REF) - Math.log(RN)) * k);   // 半径按对数缓动
    var topN = cyN - RN;

    withAlpha(ctx, k, function () { drawOrbit(ctx, cx, cyF, rho, C); });
    kit.earth(ctx, cx, ey, er, C);
    withAlpha(ctx, k, function () {
      drawRadius(ctx, cx, cyF, rho, C);
      drawMoons(ctx, cx, cyF, rho, tn, C);
      drawInset(ctx, tn, C);
      drawLegend(ctx, w, C);
      GRAV.draw.text(ctx, '距离按比例；月球画大了', w - 14, h - 6, { font: 'ui', size: 11, color: C.steel, align: 'right' });
    });
    withAlpha(ctx, 1 - k, function () { drawNear(ctx, cx, topN, h, tn, C); });
  }

  // ---------- 挂载：每步进入时调用一次 ----------
  function mountFor(idx) {
    return function (el, api) {
      ST.idx = idx;
      ST.api = api;
      el.innerHTML = '<div class="a2-cands"></div><div class="a2-board"></div>';
      ST.cands = el.querySelector('.a2-cands');
      ST.WK = GRAV.ui.work(el.querySelector('.a2-board'));
      ST.shown = 0;
      el.onclick = onAnswerClick;

      // 真实月球：第 4 步起出现；刚出现时两个月亮从最右侧同时出发
      var reveal = idx >= 3 && !REAL.on;
      var reset = idx <= 2 || reveal;
      if (idx >= 3) {
        if (reveal) REAL.anchor = now();
        REAL.on = true;
      } else {
        REAL.on = false;
      }

      var seen = false;
      api.onBeat(function (b) {
        var first = !seen;
        seen = true;
        ST.beat = b;
        setCam(idx === 0 ? (b >= 1 ? 1 : 0) : 1, first);
        setMoon(wantN(), now(), first && reset);
        if (idx === 1) syncLines(LINES_STEP2, b);
        if (idx === 4) syncLines(LINES_STEP5, b);
        if (idx === 3) api.win(b >= 1);
        refresh();
      });

      // 第 3 步：之前试过，就直接解锁并把演算板补上
      if (idx === 2 && MS().pick !== null) {
        api.open();
        writeBoard(MS().pick);
      }
    };
  }

  // ---------- 文案 ----------
  var TITLES = [
    '如果是同一种力，它随距离怎么变？',
    '先算一种：∝ 1/r',
    '你来试：月亮应该几天转一圈？',
    '月亮自己说：' + fmtDays(PHYS.T_REAL_DAYS) + ' 天',
    '同一种力，和距离的平方成反比'
  ];

  var BEATS1 = [
    { say: '苹果在地面，下落的加速度是 ' + sym('g') + ' = ' + fmtA(PHYS.g) + ' m/s²。' },
    { say: '把镜头拉远。月亮离地心约 60 个地球半径，大约 ' + GRAV.fmt.sci(PHYS.r) + ' m。' },
    { say: '如果拉苹果和拉月亮的是同一种力，那它传到月亮那里会弱多少？这取决于它随距离怎么变。' },
    { say: '我们试四种可能：不随距离变、∝ 1/' + sym('r') + '、∝ 1/' + sym('r') + '²、∝ 1/' + sym('r') + '³。先拿 ∝ 1/' + sym('r') + ' 算一遍给你看。' }
  ];

  var BEATS2 = [
    { say: '假设力 ∝ 1/' + sym('r') + '。距离变成 60 倍，力就变成原来的 1/60，加速度也一样。' },
    { say: '月亮在做圆周运动。圆周运动的加速度 ' + sym('a') + ' = 4π²' + sym('r') + '/' + sym('T') + '²，倒过来就能求周期。' },
    { say: '把 ' + sym('r') + ' = ' + GRAV.fmt.sci(PHYS.r) + ' m 和 ' + sym('a') + ' = ' + fmtA(CANDS[1].a) + ' m/s² 代进去。' },
    { say: '换成天：约 ' + fmtDays(CANDS[1].Td) + ' 天。也就是说，如果力 ∝ 1/' + sym('r') + '，月亮 ' + fmtDays(CANDS[1].Td) + ' 天就该绕地球一圈。' },
    { say: '剩下三种你自己来。' }
  ];

  var BEATS3 = [
    { say: '点一种规律，看它算出的周期。四种都可以试。' }
  ];

  var BEATS4 = [
    { say: '翻开来：月亮绕地球一圈，实际是 ' + fmtDays(PHYS.T_REAL_DAYS) + ' 天。' },
    { say: '对一下：只有 ∝ 1/' + sym('r') + '² 算出的 ' + fmtDays(PHYS.T_REAL_DAYS) + ' 天对得上，其他三种差得远。' },
    { say: '画面上两个月亮一起转：选中 ∝ 1/' + sym('r') + '² 时，它们几乎重合。你可以点别的规律对比一下。' }
  ];

  var BEATS5 = [
    { say: function () {
      var st = GRAV.state.stance;
      return st
        ? '第 1 幕你选的是「' + st + '」。数据给出的答案是：拉苹果和拉月亮的，是同一种力。'
        : '数据给出的答案是：拉苹果和拉月亮的，是同一种力。';
    } },
    { say: '而且它和距离的平方成反比：距离变成 60 倍，力变成 1/3600。' },
    { say: '牛顿当年就是这么检验的：用月球的轨道算出它的加速度 4π²' + sym('r') + '/' + sym('T') + '²，和 ' + sym('g') + '/3600 比。' },
    { say: '两个数对上了。这就是著名的"月-地检验"。' }
  ];

  // ---------- 注册 ----------
  GRAV.act({
    id: 2,
    name: '月亮来作证',
    tag: '第 2 幕 · 月亮来作证',
    steps: [
      { title: TITLES[0], beats: BEATS1, button: '看怎么算', draw: drawScene, mount: mountFor(0) },
      { title: TITLES[1], beats: BEATS2, button: '我来试', draw: drawScene, mount: mountFor(1) },
      { title: TITLES[2], beats: BEATS3, gateAt: 0, button: '翻开实际周期', draw: drawScene, mount: mountFor(2) },
      { title: TITLES[3], beats: BEATS4, button: '继续', draw: drawScene, mount: mountFor(3) },
      { title: TITLES[4], beats: BEATS5, button: '下一幕', draw: drawScene, mount: mountFor(4) }
    ]
  });
})();
