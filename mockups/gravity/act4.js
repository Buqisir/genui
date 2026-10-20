/*
 * 第 4 幕 · 测出 G
 * 第 1 步：对数横条（体重 490 N 与两个同学之间的引力）。
 * 第 2–7 步：扭秤示意图。图上的状态只由变量 decided（已答对到第几个决定，0–4）决定。
 *   进入每一步时按步序重设 decided：决定 k 进入时 decided = k-1，答对后 decided = k。
 *   所以后退、或直接用 #a4s5 之类的地址打开，都按同一规则显示（前面的决定视为已答对）。
 * 第 3–6 步：四个设计决定，用 GRAV.ui.choice。
 * 第 8 步：称地球，用 GRAV.ui.choice。
 */
(function () {
  'use strict';

  var GRAV = window.GRAV;
  var TAU = Math.PI * 2;

  // ---------- 物理（全部在这里算） ----------
  var BIG_G = 6.67e-11, G_ACC = 9.8, R_EARTH = 6.371e6;
  var M_STU = 50;                                    // 两个同学各 50 kg，相距 1 m
  var F_CLASS = BIG_G * M_STU * M_STU / (1 * 1);     // 1.6675e-7 N
  var W_BODY = M_STU * G_ACC;                        // 490 N
  var F_RATIO_W = F_CLASS / W_BODY;                  // 3.4e-10
  var ORDERS = Math.log10(W_BODY / F_CLASS);         // 9.47
  var M_EARTH = G_ACC * R_EARTH * R_EARTH / BIG_G;   // 5.96e24 kg

  // 放大倍数是累乘：9 → 18 → 20（第三步 ×(1.0/0.9)，显示时取整） → 200
  // MAGS[n] 是已答对 n 个决定时的倍数，MAGS = [1, 9, 18, 20, 200]
  var MAGS = [1];
  [9, 2, 1.0 / 0.9, 10].forEach(function (f) { MAGS.push(MAGS[MAGS.length - 1] * f); });

  var decided = 0;

  // ---------- 小工具 ----------
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function pow10Text(e) {
    return '10' + String(e).split('').map(function (c) { return SUP[c]; }).join('');
  }

  // ---------- 第 1 步：对数横条 ----------
  function drawWeigh(ctx, w, h, t, C) {
    var x0 = 24, x1 = w - 24, AW = x1 - x0;
    var LO = -8, HI = 3;                              // 对数横轴：10⁻⁸ N 到 10³ N
    function X(v) { return x0 + (Math.log10(v) - LO) / (HI - LO) * AW; }
    var yA = 0.30 * h, yB = 0.52 * h, yAx = 0.74 * h;
    var bh = 14;

    GRAV.draw.text(ctx, '体重 ' + GRAV.fmt.num(W_BODY) + ' N', x0, yA - 12,
      { font: 'ui', size: 14, color: C.graphite });
    GRAV.draw.text(ctx, '两个同学之间的引力 ' + GRAV.fmt.sci(F_CLASS) + ' N', x0, yB - 12,
      { font: 'ui', size: 14, color: C.graphite });

    ctx.save();
    ctx.fillStyle = C.force;
    ctx.fillRect(x0, yA, X(W_BODY) - x0, bh);
    ctx.fillRect(x0, yB, X(F_CLASS) - x0, bh);
    ctx.restore();

    GRAV.draw.text(ctx, '相差约 ' + ORDERS.toFixed(1) + ' 个数量级', X(F_CLASS) + 14, yB + bh - 2,
      { font: 'ui', size: 15, color: C.ink });

    ctx.save();
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, yAx); ctx.lineTo(x1, yAx); ctx.stroke();
    for (var e = LO; e <= HI; e++) {
      var xe = X(Math.pow(10, e));
      ctx.beginPath(); ctx.moveTo(xe, yAx); ctx.lineTo(xe, yAx + (e % 2 === 0 ? 6 : 3)); ctx.stroke();
    }
    ctx.restore();
    for (var e2 = LO; e2 <= 2; e2 += 2) {
      GRAV.draw.text(ctx, pow10Text(e2), X(Math.pow(10, e2)), yAx + 22,
        { font: 'num', size: 12, color: C.steel, align: 'center' });
    }
    GRAV.draw.text(ctx, 'N', x1, yAx + 22, { font: 'ui', size: 12, color: C.steel, align: 'right' });
  }

  // ---------- 第 2–7 步：扭秤示意图 ----------
  function drawTorsion(ctx, w, h, t, C) {
    var n = decided;                                  // 已答对的决定个数
    var M = MAGS[n];
    var u = clamp(Math.log10(M) / Math.log10(200), 0, 1);   // 对数映射，0（×1）到 1（×200）
    var s = Math.sin(TAU * t / 2.6);                  // 摆动相位
    var xm = 0.4 * w, yTop = 0.06 * h, yMir = 0.37 * h, yRod = 0.66 * h;
    var L = (n >= 1 ? 0.5 : 0.18) * w;               // 横杆长度（决定 1 之后变长）
    var rb = clamp(0.06 * h, 18, 30);                 // 大球半径
    var rs = 6;                                       // 小球半径
    var Sh = 0.15 * h;                                // 刻度尺半长
    var th = 0.2 * (0.02 + 0.58 * u) * s;             // 横杆小幅摆角
    var cs = Math.cos(th), sn = Math.sin(th);
    function P(dx, dy) { return [xm + dx * cs - dy * sn, yRod + dx * sn + dy * cs]; }

    // 支点与细丝
    ctx.save();
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(xm - 22, yTop); ctx.lineTo(xm + 22, yTop); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(xm, yTop); ctx.lineTo(xm, yRod); ctx.stroke();
    ctx.restore();

    // 横杆
    var a = P(-L / 2, 0), b = P(L / 2, 0);
    ctx.save();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.restore();

    // 大球：决定 2 之前一端一个，之后两端各一个（错开方向，两个力矩同向）
    var bigs = [P(-L / 2, 0.09 * h)];
    if (n >= 2) bigs.push(P(L / 2, -0.09 * h));
    bigs.forEach(function (p) {
      ctx.save();
      ctx.globalAlpha = 0.12; ctx.fillStyle = C.graphite;
      ctx.beginPath(); ctx.arc(p[0], p[1], rb, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p[0], p[1], rb, 0, TAU); ctx.stroke();
      ctx.restore();
    });

    // 小球（横杆两端）
    ctx.save();
    ctx.fillStyle = C.graphite;
    ctx.beginPath(); ctx.arc(a[0], a[1], rs, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(b[0], b[1], rs, 0, TAU); ctx.fill();
    ctx.restore();

    // 决定 3 之后：光源、镜子、刻度尺、光点
    if (n >= 3) {
      var xs = xm + (n >= 4 ? 0.42 : 0.15) * w;      // 镜子到刻度尺的距离（决定 4 之后变远）
      var sx0 = 0.08 * w, sy0 = 0.22 * h;            // 光源位置
      var spotY = yMir + Sh * (0.02 + 0.58 * u) * s; // 光点：幅度不超出刻度尺

      ctx.save();
      ctx.strokeStyle = C.vel; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(sx0 + 6, sy0 + 6); ctx.lineTo(xm, yMir); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xm, yMir); ctx.lineTo(xs, spotY); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = C.ink;
      ctx.fillRect(sx0, sy0, 12, 12);
      ctx.restore();
      GRAV.draw.text(ctx, '光源', sx0, sy0 - 8, { font: 'ui', size: 11, color: C.steel });

      ctx.save();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(xm + 9 * sn, yMir - 9 * cs); ctx.lineTo(xm - 9 * sn, yMir + 9 * cs); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xs, yMir - Sh); ctx.lineTo(xs, yMir + Sh); ctx.stroke();
      for (var i = -5; i <= 5; i++) {
        var ty = yMir + i * Sh / 5, tl = (i % 5 === 0) ? 10 : 5;
        ctx.beginPath(); ctx.moveTo(xs, ty); ctx.lineTo(xs + tl, ty); ctx.stroke();
      }
      ctx.restore();
      GRAV.draw.text(ctx, '刻度尺', xs, yMir - Sh - 8, { font: 'ui', size: 11, color: C.steel, align: 'center' });

      ctx.save();
      ctx.fillStyle = C.vel;
      ctx.beginPath(); ctx.arc(xs, spotY, 4, 0, TAU); ctx.fill();
      ctx.restore();
    }

    // 右上角放大倍数；左下角说明
    GRAV.draw.text(ctx, '放大倍数', w - 14, 18, { font: 'ui', size: 11, color: C.steel, align: 'right' });
    GRAV.draw.text(ctx, '×' + Math.round(M), w - 14, 46, { font: 'num', size: 28, color: C.ink, align: 'right' });
    GRAV.draw.note(ctx, '示意图，不按比例', w, h, C);
  }

  // ---------- 四个设计决定（判对错，用 GRAV.ui.choice） ----------
  var DECISIONS = [
    {
      title: '横杆做长一些，还是短一些？',
      options: [
        { html: '长一些', correct: true, say: '对。同样的力，力臂越长，扭转的力矩越大。横杆从 0.2 m 加到 1.8 m，扭转大了 9 倍。' },
        { html: '短一些', say: '横杆短，力臂小，同样的力产生的扭转更小。' }
      ],
      hints: [
        '想想力臂：同样的力，作用点离转轴远一些，转动的效果会变吗？',
        '横杆两端的小球，离细丝有多远？',
        '答案是：长一些。力臂越长，同样的力产生的扭转越大。'
      ]
    },
    {
      title: '大球放一个，还是两个？',
      options: [
        { html: '一个', say: '只在一端放大球，扭转只有一半，横杆受力也不平衡。' },
        { html: '两个，两端各一个', correct: true, say: '对。两端各放一个大球，两边的引力朝同一个方向扭横杆，扭转再大一倍。' }
      ],
      hints: [
        '两个大球的引力，能不能同时把横杆往同一个方向扭？',
        '只在一端放大球，横杆两边的受力还平衡吗？',
        '答案是：两个，两端各一个。两边的引力朝同一个方向扭横杆。'
      ]
    },
    {
      title: '看横杆末端怎么动，还是在细丝上装一面小镜子、看反射光？',
      options: [
        { html: '直接看横杆末端', say: '横杆末端移动的距离太小，很难读出来。' },
        { html: '装镜子，看反射光', correct: true, say: '对。镜子跟着细丝一起转，反射光就像一根没有重量的长指针。不过刻度尺离得近的话，光点只多走一点点。下一步看怎么用好它。' }
      ],
      hints: [
        '横杆末端转过的角度很小，有什么办法把它放大？',
        '镜子转一个角度，反射光转过的角度会怎样？',
        '答案是：装镜子，看反射光。镜子跟着细丝转，反射光就像一根没有重量的长指针。'
      ]
    },
    {
      title: '刻度尺放近一些，还是远一些？',
      options: [
        { html: '远一些（5 m）', correct: true, say: '对。镜子转过一个角度，反射光转过两倍的角度；刻度尺放在 5 m 外，光点移动的距离是放在 0.5 m 处的 10 倍。' },
        { html: '近一些（0.5 m）', say: '离得近，光转过的角度再大，在尺上也只走一小段。' }
      ],
      hints: [
        '同样的偏转角，刻度尺离镜子远一些，光点走的距离会怎样？',
        '想想光线走过的路程：路程越长，光点的位移越大。',
        '答案是：远一些（5 m）。离得远，同样的偏转在尺上走得更远。'
      ]
    }
  ];

  function decisionStep(k) {
    var d = DECISIONS[k - 1];
    return {
      title: d.title,
      caption: '第 ' + k + ' 个决定（共 4 个）',
      gate: true,
      draw: drawTorsion,
      mount: function (el, api) {
        decided = k - 1;                               // 进入时显示这个决定之前的状态
        GRAV.ui.choice(el, {
          options: d.options,
          hints: d.hints,
          onCorrect: function () { decided = k; }
        }, api);
      }
    };
  }

  // ---------- 第 8 步：称地球 ----------
  var EARTH_OPTS = [
    {
      html: GRAV.h.sym('g') + GRAV.h.sym('R') + '/' + GRAV.h.sym('G'),
      say: '两边约去 m 以后，R² 还在分母上，乘过去是 R²，不是 R。'
    },
    {
      html: GRAV.h.sym('g') + GRAV.h.sym('R') + '²/' + GRAV.h.sym('G'),
      correct: true,
      say: '对。M = gR²/G = 9.8 × (6.371×10⁶)² ÷ (6.67×10⁻¹¹) ≈ ' + GRAV.fmt.sci(M_EARTH, 3) +
        ' kg。卡文迪什也因此被称为第一个"称出"地球质量的人。'
    },
    {
      html: GRAV.h.sym('G') + GRAV.h.sym('R') + '²/' + GRAV.h.sym('g'),
      say: '把 G 移到另一边，应该是除以 G。'
    },
    {
      html: GRAV.h.sym('g') + '/(' + GRAV.h.sym('G') + GRAV.h.sym('R') + '²)',
      say: '从 mg = GMm/R² 出发，把 M 单独留在一边。'
    }
  ];

  // ---------- 注册 ----------
  GRAV.act({
    id: 4,
    name: '测出 G',
    tag: '第 4 幕 · 测出 G',
    steps: [
      {
        title: '为什么感觉不到身边同学的引力？',
        caption: '第 3 幕算过，两个同学之间的引力是 1.67×10⁻⁷ N。它大约是一个同学体重（490 N）的多少？',
        gate: true,
        draw: drawWeigh,
        mount: function (el, api) {
          GRAV.ui.choice(el, {
            options: [
              { html: '1/2', say: '1.67×10⁻⁷ N 和 490 N 差了好多个数量级。用除法算一算。' },
              { html: '1/50', say: '引力不是按质量的比算的。用 1.67×10⁻⁷ N 去除以体重 490 N。' },
              { html: '3×10⁻³', say: '再算一次：1.67×10⁻⁷ ÷ 490，指数是多少？' },
              { html: '3×10⁻¹⁰', correct: true, say: '对，大约 ' + GRAV.fmt.sci(F_RATIO_W, 2) + '。体重比它大约 30 亿倍，所以你完全感觉不到身边同学的引力。牛顿写出了式子，却测不出这么小的力。' }
            ],
            hints: [
              '第 3 幕算过：两个同学之间的引力是 1.67×10⁻⁷ N。',
              '用 1.67×10⁻⁷ 除以 490。',
              '1.67×10⁻⁷ ÷ 490 ≈ 3.4×10⁻¹⁰。'
            ]
          }, api);
        }
      },
      {
        title: '1798 年，卡文迪什测出了 G',
        caption: '牛顿 1687 年写出定律，111 年后，卡文迪什用一台扭秤测出了 G。你来当一回卡文迪什：做四个设计决定，让光点动起来。',
        button: '开始设计',
        draw: drawTorsion,
        mount: function () { decided = 0; }
      },
      decisionStep(1),
      decisionStep(2),
      decisionStep(3),
      decisionStep(4),
      {
        title: '把看不见的力放大 200 倍',
        caption: '力臂、两对球、镜子、远处的刻度尺，一层层放大。1798 年卡文迪什测出 G ≈ 6.7×10⁻¹¹ N·m²/kg²，今天的推荐值是 6.674×10⁻¹¹。',
        button: '继续',
        draw: drawTorsion,
        mount: function () { decided = 4; }
      },
      {
        title: '有了 G，就能称地球',
        caption: '地面上 mg = GMm/R²。地球质量 M 等于什么？',
        button: '下一幕',
        layout: 'answer',
        gate: true,
        mount: function (el, api) {
          GRAV.ui.choice(el, { options: EARTH_OPTS, hints: ['先在两边约去 m。', 'g = GM/R²，再把 M 解出来。', 'M = gR²/G。'] }, api);
        }
      }
    ]
  });
})();
