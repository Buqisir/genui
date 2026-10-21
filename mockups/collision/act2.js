/* 第 2 幕 · 三种碰撞：慢放碰撞那一下（压紧、再弹回），讲清"弹性"是弹回原样；再命名三类碰撞，点破生活里的"弹性"；粘住也不会损失全部动能 */
(function () {
  'use strict';
  var f = MOM.f, D = COL.D;

  function compare(ctx, w, h, t, C) {
    var bw = Math.min(w - 40, 420);
    COL.keCompare(ctx, { x: (w - bw) / 2, y: 24, w: bw, h: h - 48 }, C, 3);
  }

  // ---------- 慢放碰撞那一下：上面三个特写（碰撞面像弹簧，压紧再弹回），下面三条动能–时间线 ----------
  // 前半段三种一样：压到最紧时两车共速 0.40 m/s，动能 0.048 J；后半段弹回多少因碰撞面而异（e = 弹回的相对速度 ÷ 接近的相对速度）
  var T0 = 1.0, TC = 1.6, T2 = 1.4, KMIN = 0.5 * 0.6 * 0.4 * 0.4;
  var KINDS = [
    { k: 'mag', e: 1, dash: [], note: '完全弹回' },
    { k: 'rub', e: 0.5, dash: [6, 4], note: '弹回一半' },
    { k: 'vel', e: 0, dash: [2, 3], note: '不弹回' }
  ];
  function squeezeAt(u, e) {          // 接触中第 u（0→1）段，压缩量（0 = 原长，1 = 最紧）
    return u <= 0.5 ? Math.sin(Math.PI * u) : 1 - e * (1 - Math.sin(Math.PI * u));
  }
  function keAt(t, kind) {
    var k0 = COL.ke(D.mag, false), kf = COL.ke(D[kind.k], true);
    if (t <= T0) return k0;
    if (t >= T0 + TC) return kf;
    var u = (t - T0) / TC;
    return u <= 0.5 ? k0 - (k0 - KMIN) * Math.sin(Math.PI * u) : kf - (kf - KMIN) * Math.sin(Math.PI * u);
  }
  function zigzag(ctx, x0, x1, y, amp, C) {
    var n = 7;
    ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, y);
    for (var i = 1; i < 2 * n; i++) ctx.lineTo(x0 + (x1 - x0) * i / (2 * n), y + (i % 2 ? -amp : amp));
    ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
  }
  function squeeze(ctx, w, h, t, C) {
    var tt = Math.min(t, T0 + TC + T2), narrow = w < 520;
    var colW = (w - 16) / 3, s = narrow ? 18 : 24, L0 = narrow ? 26 : 36, X = L0 * 0.6, G0 = colW * 0.22;
    var cy = narrow ? 60 : 70;
    KINDS.forEach(function (kd, i) {
      var cx = 8 + colW * (i + 0.5), d, rest;
      if (tt <= T0) { d = L0 + G0 * (1 - tt / T0); rest = L0; }
      else if (tt <= T0 + TC) { d = L0 - X * squeezeAt((tt - T0) / TC, kd.e); rest = d; }
      else { rest = L0 - X * (1 - kd.e); d = rest + kd.e * (G0 / T0) * (tt - T0 - TC); }
      var ax = cx - d / 2, bx = cx + d / 2;
      ctx.save(); ctx.fillStyle = C.graphite;
      MOM.rr(ctx, ax - s, cy - s / 2, s, s, 3); ctx.fill();
      MOM.rr(ctx, bx, cy - s / 2, s, s, 3); ctx.fill(); ctx.restore();
      zigzag(ctx, ax, ax + Math.min(d, rest), cy, s * 0.22, C);
      GRAV.draw.text(ctx, D[kd.k].name, cx, cy - s / 2 - 14, { size: 14, color: C.graphite, align: 'center' });
      if (tt > T0 + TC * 0.5) GRAV.draw.text(ctx, kd.note, cx, cy + s / 2 + 18, { size: 12, color: C.steel, align: 'center' });
    });
    // 动能–时间
    var top = cy + s / 2 + 44, box = { x: 8, y: top, w: Math.min(w - 16, 620), h: h - top - 8 };
    var L = box.x + 44, R = box.x + box.w - (narrow ? 70 : 96), T = box.y + 24, B = box.y + box.h - 22, KMAX = 0.08;
    var X_ = function (s) { return L + (R - L) * s / (T0 + TC + T2); }, Y = function (k) { return B - (B - T) * k / KMAX; };
    ctx.save();
    ctx.fillStyle = MOM.rgba(C.steel, 0.08); ctx.fillRect(X_(T0), T, X_(T0 + TC) - X_(T0), B - T);
    ctx.strokeStyle = C.steel; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T - 6); ctx.lineTo(L, B); ctx.lineTo(R + 6, B); ctx.stroke();
    ctx.setLineDash([3, 3]); ctx.strokeStyle = C.hair;
    [0.072, KMIN].forEach(function (k) { ctx.beginPath(); ctx.moveTo(L, Y(k)); ctx.lineTo(R, Y(k)); ctx.stroke(); });
    ctx.restore();
    GRAV.draw.text(ctx, '动能（J）', box.x, box.y + 10, { size: 12, color: C.steel });
    GRAV.draw.text(ctx, '接触（慢放）', (X_(T0) + X_(T0 + TC)) / 2, T - 8, { size: 12, color: C.steel, align: 'center' });
    GRAV.draw.text(ctx, '时间', R + 8, B + 4, { size: 12, color: C.steel });
    [[0, '0'], [KMIN, '0.048'], [0.072, '0.072']].forEach(function (p) {
      GRAV.draw.text(ctx, p[1], L - 6, Y(p[0]) + 4, { font: 'num', size: 12, color: C.steel, align: 'right' });
    });
    if (tt > T0 + TC * 0.5) GRAV.draw.text(ctx, '挤得最紧', X_(T0 + TC * 0.5), Y(KMIN) + 18, { size: 12, color: C.steel, align: 'center' });
    KINDS.forEach(function (kd) {
      ctx.save(); ctx.strokeStyle = C.charge; ctx.lineWidth = 2; ctx.setLineDash(kd.dash); ctx.beginPath();
      for (var s2 = 0, first = true; s2 <= tt + 1e-9; s2 += (T0 + TC + T2) / 200) {
        var px = X_(s2), py = Y(keAt(s2, kd));
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
      ctx.stroke(); ctx.restore();
    });
    if (tt >= T0 + TC + T2 * 0.3) {
      var ys = [];
      KINDS.forEach(function (kd) {
        var y = Y(COL.ke(D[kd.k], true)) + 4;
        ys.forEach(function (y0) { if (Math.abs(y - y0) < 15) y = y0 + 15; });
        ys.push(y);
        GRAV.draw.text(ctx, D[kd.k].name + ' ' + f(COL.ke(D[kd.k], true), 3), R + 8, y, { size: 12, color: C.graphite });
      });
    }
  }

  GRAV.act({
    id: 2,
    name: '三种碰撞',
    tag: '第 2 幕 · 三种碰撞',
    steps: [
      {
        title: '碰撞那一下：压紧，再弹回',
        beats: [
          { say: '把碰撞那一下放慢、放大：两车的碰撞面互相挤压，像压缩一根弹簧。三种碰撞面，前半段一模一样。' },
          { say: '挤得最紧时，两车速度相同，都是 0.24 ÷ 0.6 = 0.40 m/s，动能只剩 ½ × 0.6 × 0.40² = 0.048 J。少掉的 0.024 J 暂时存进了碰撞面的形变里。' },
          { say: '后半段才分出不同。粘扣那次，碰后动能停在约 0.048 J（实测 0.047 J），为什么？' },
          { say: '"弹性"说的就是弹回原样。形变完全弹回，存进去的动能全部还回来，叫弹性碰撞（磁体）；只弹回一部分，叫非弹性碰撞（橡皮）；一点也不弹回、两车粘在一起，叫完全非弹性碰撞（粘扣）。' },
          { say: '弹不回去的那部分形变能，最后变成了内能：碰撞面发热、留下凹痕、发出声音。总能量仍然守恒。' }
        ],
        gateAt: 2,
        button: '给三类碰撞起名',
        play: true,
        tall: true,
        draw: squeeze,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '粘住后形变不再弹回，存进去的 0.024 J 一点也没还回来', correct: true, say: '对。后半段该弹回的时候，粘扣卡住了。' },
              { html: '粘扣把动能全吸收了', say: '动能还剩 0.048 J，两车还以 0.40 m/s 一起走，没有被全吸收。' },
              { html: '测量误差', say: '误差只有百分之一二，这里少了三分之一，是实打实的。' }
            ],
            hints: ['挤得最紧时，动能是多少？', '0.048 J。粘扣那次碰后也约是 0.048 J。', '后半段该弹回的时候，粘扣卡住了，形变没有弹回。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt < 2; });
        }
      },
      {
        title: '三类碰撞',
        beats: [
          { say: '把三类碰撞记下来。判断看总动能：不变是弹性，减少是非弹性，粘在一起减少最多。磁体那次只差 1.5%，在误差以内，看作弹性碰撞。' },
          { say: '注意"弹性"这个词。生活里说"有弹性"，常指容易拉长，比如橡皮筋；物理里的弹性，指被压、被撞以后能弹回原样。第 1 幕里看着挺有弹性的橡皮，碰撞时反而是非弹性的。' },
          { say: '牛顿当年就是用"弹回来有多快"来量弹性的：碰后分开的速度和碰前接近的速度相比，玻璃球约 15 : 16，紧紧压实的毛线球只有约 5 : 9。' }
        ],
        button: '粘住会不会全损失',
        draw: compare,
        mount: function (el, api) {
          var d = document.createElement('div');
          d.className = 'def';
          d.innerHTML =
            '<div class="row"><b>弹性</b><span>形变完全弹回，碰撞前后总动能不变</span></div>' +
            '<div class="row"><b>非弹性</b><span>只弹回一部分，总动能减少（碰后可以分开）</span></div>' +
            '<div class="row"><b>完全非弹性</b><span>不弹回，碰后粘在一起，动能减少最多</span></div>' +
            '<div class="row"><b>都一样</b><span>三种碰撞，动量都守恒</span></div>' +
            '<div class="row" data-b="1"><b>注意</b><span>物理的"弹性"是弹回原样，不是容易拉长；判断看动能，不看弹没弹开</span></div>' +
            '<div class="row" data-b="2"><b>牛顿</b><span>玻璃球弹回约 15/16，毛线球约 5/9（《自然哲学的数学原理》运动定律附注）</span></div>';
          el.appendChild(d);
          Array.prototype.forEach.call(d.querySelectorAll('.row b'), function (b) { b.style.width = '80px'; });
          api.onBeat(function (bt) {
            Array.prototype.forEach.call(d.querySelectorAll('[data-b]'), function (r) { r.hidden = Number(r.getAttribute('data-b')) > bt; });
          });
        }
      },
      {
        title: '粘在一起，会不会一起停下？',
        beats: [
          { say: '粘扣那次动能少得最多。两车粘在一起后，有没有可能一起停下，动能变成 0？' },
          { say: '不能。碰前总动量 0.24 kg·m/s，碰后也得是 0.24：两车只能一起以 0.24 ÷ 0.6 = 0.40 m/s 运动，动能至少还剩 ½ × 0.6 × 0.40² = 0.048 J。' },
          { say: '只有碰前总动量为 0 时，比如两辆一样的车以同样的速率相向而行，粘住后才会一起停下，动能全部损失。' }
        ],
        gateAt: 0,
        button: '弹性碰撞后怎么动',
        play: true,
        tall: true,
        draw: COL.scene(D.vel, { label: '碰撞面：粘扣，碰后粘住' }),
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '不能：总动量 0.24 kg·m/s 要保持，两车只能一起以 0.40 m/s 运动', correct: true, say: '对。动量守恒管着它：总动量不是 0，两车就停不下来。' },
              { html: '能，只要粘得足够牢', say: '粘得再牢，总动量也要守恒：0.24 kg·m/s 不会变成 0。' },
              { html: '能，"完全非弹性"就是动能全部损失', say: '"完全"指的是粘在一起、损失最多，不是损失全部。看柱子：动能还剩 0.047 J。' }
            ],
            hints: ['碰后总动量必须是多少？', '还是 0.24 kg·m/s。两车一起停下，总动量是多少？', '总动量不为 0，两车只能一起以 0.40 m/s 运动。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var wk = GRAV.ui.work(el), shown = false;
          api.onBeat(function (bt) {
            if (bt >= 1 && !shown) {
              shown = true;
              wk.line('0.4 × 0.60 = (0.4 + 0.2)' + GRAV.h.sym('v'));
              wk.line(GRAV.h.sym('v') + ' = 0.40 m/s，动能 ' + f(0.5 * 0.6 * 0.16, 3) + ' J');
            }
          });
        }
      }
    ]
  });
})();
