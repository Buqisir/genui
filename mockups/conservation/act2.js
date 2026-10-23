/* 第 2 幕 · 什么时候守恒：外力的冲量改变总动量（窗帘滑块）；内力摩擦不改变总动量，但机械能不守恒（木块滑上木板） */
(function () {
  'use strict';
  var f = MOM.f;

  // 窗帘滑块：电机恒力 F 推滑块 1；下面是两滑块总动量碰前、碰后和外力冲量的柱子
  function curtain(ctx, w, h, t, C, beat) {
    var y = h * 0.26, x0 = 24, x1 = w - 24, bw = 54;
    MOM.track(ctx, x0, x1, y, C);
    var xa = w * 0.22, xb = xa + bw + 30;
    MOM.cart(ctx, xa, y, bw, 32, C, { name: '1', label: '1 kg' });
    MOM.cart(ctx, xb, y, bw, 32, C, { name: '2', label: '1 kg' });
    IMP.force(ctx, xa - 46, y - 19, xa - 4, y - 19, C, 'F（电机）', 'left');
    GRAV.draw.text(ctx, '碰前 1 以 0.40 m/s 撞静止的 2；碰撞 0.04 s；碰后一起 0.22 m/s', x0, y + 34, { size: 12, color: C.steel });
    var items = [
      { label: '碰前总动量', v: 0.40, text: '0.40' },
      { label: '碰后总动量', v: 0.44, ink: true, text: '0.44' }
    ];
    if (beat >= 2) items.push({ label: 'F 的冲量', v: 0.04, color: C.force, text: '0.04' });
    CNS.bars(ctx, { x: x0 + 10, y: y + 60, w: Math.min(420, w - 60), h: h - y - 70 }, items, C, { max: 0.55, ref: 0.40, refLabel: '0.40', title: '单位 kg·m/s（N·s）' });
  }

  // 木块（1 kg，3 m/s）滑上光滑地面上的木板（2 kg），1 s 后共速 1 m/s（慢放 2 倍）
  var m = 1, M = 2, v0 = 3, ab = 2, ap = 1, tcP = 1;
  function st(tp) {
    if (tp < tcP) return { xb: v0 * tp - 0.5 * ab * tp * tp, xp: 0.5 * ap * tp * tp, vb: v0 - ab * tp, vp: ap * tp, slide: true };
    var xb = v0 * tcP - 0.5 * ab * tcP * tcP, xp = 0.5 * ap * tcP * tcP, d = tp - tcP;
    return { xb: xb + d, xp: xp + d, vb: 1, vp: 1, slide: false };
  }
  function plank(ctx, w, h, t, C) {
    var tp = Math.min(t / 2, 1.8), s = st(tp);
    var x0 = 16, gy = h * 0.3, px = (w - 2 * x0 - 20) / 3.5, pl = 2.0 * px, ph = 14;
    IMP.ground(ctx, x0, w - x0, gy, C);
    GRAV.draw.text(ctx, '光滑地面', w - x0, gy + 24, { size: 12, color: C.steel, align: 'right' });
    var plx = x0 + 6 + s.xp * px;
    ctx.save(); MOM.rr(ctx, plx, gy - ph, pl, ph, 3); ctx.fillStyle = C.bar; ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    GRAV.draw.text(ctx, '木板 2 kg', plx + 4, gy + 16, { size: 12, color: C.graphite });
    var bs = 30, bx = x0 + 6 + s.xb * px;
    ctx.save(); MOM.rr(ctx, bx, gy - ph - bs, bs, bs, 4); ctx.fillStyle = C.graphite; ctx.fill(); ctx.restore();
    GRAV.draw.text(ctx, '1 kg', bx + bs / 2, gy - ph - bs - 8, { size: 12, color: C.graphite, align: 'center' });
    if (s.slide) {
      IMP.force(ctx, bx, gy - ph - 6, bx - 26, gy - ph - 6, C, 'f', 'left');
      IMP.force(ctx, bx + bs, gy - ph + 8, bx + bs + 26, gy - ph + 8, C, 'f', 'right');
    }
    GRAV.draw.text(ctx, '木块 ' + f(s.vb, 2) + ' m/s　木板 ' + f(s.vp, 2) + ' m/s', x0, 20, { font: 'num', size: 14, color: C.vel });
    var top = gy + 44, bh = h - top - 8, half = Math.min(260, (w - 2 * x0) / 2 - 10);
    var pb = m * s.vb, pp = M * s.vp, kb = 0.5 * m * s.vb * s.vb, kp = 0.5 * M * s.vp * s.vp;
    CNS.bars(ctx, { x: x0, y: top, w: half, h: bh }, [
      { label: '木块', v: pb }, { label: '木板', v: pp }, { label: '和', v: pb + pp, ink: true, text: f(pb + pp, 1) }
    ], C, { max: 3.8, ref: 3, refLabel: '碰前 3', title: '动量（kg·m/s）' });
    CNS.bars(ctx, { x: x0 + half + 20, y: top, w: half, h: bh }, [
      { label: '木块', v: kb }, { label: '木板', v: kp }, { label: '和', v: kb + kp, ink: true, text: f(kb + kp, 1) }
    ], C, { max: 5.6, ref: 4.5, refLabel: '开始 4.5', title: '动能（J）' });
  }

  GRAV.act({
    id: 2,
    name: '什么时候守恒',
    tag: '第 2 幕 · 什么时候守恒',
    steps: [
      {
        title: '有外力推着，还守恒吗？',
        beats: [
          { say: '回到上一节的窗帘滑块：电机一直用恒力 F 推滑块 1。碰前两滑块总动量 1 × 0.40 = 0.40 kg·m/s，碰后 2 × 0.22 = 0.44 kg·m/s。' },
          { say: '两滑块组成的系统，总动量守恒吗？' },
          { say: '不守恒。电机的推力是两滑块以外的物体施加的，叫外力。它在 0.04 s 里的冲量是 0.04 N·s，正好是多出来的那部分（F = 1 N）。' },
          { say: '有外力的冲量，总动量就会变。那如果系统里面有摩擦呢？' }
        ],
        gateAt: 1,
        button: '系统里有摩擦呢',
        tall: true,
        draw: curtain,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '守恒，碰撞前后都是这两块滑块', say: '数一数：0.40 变成了 0.44，多了 0.04。是谁给的？' },
              { html: '不守恒：电机的推力是外力，它的冲量补上了 0.04 kg·m/s', correct: true, say: '对。外力的冲量会改变系统的总动量。' },
              { html: '不守恒：两滑块之间的作用力会改变总动量', say: '两滑块之间的力是一对内力，冲量等大反向，加起来是 0。' }
            ],
            hints: ['碰撞前后的总动量各是多少？', '0.40 → 0.44，多出来的 0.04 从哪来？', '电机的推力 F 是外力，0.04 s 内冲量 0.04 N·s。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        }
      },
      {
        title: '系统里有摩擦，还守恒吗？',
        beats: [
          { say: '光滑地面上，2 kg 的长木板静止，1 kg 的木块以 3 m/s 滑上木板。两者之间有摩擦，最后一起以 1 m/s 运动（慢放 2 倍）。' },
          { say: '木块和木板组成的系统，总动量守恒吗？机械能呢？' },
          { say: '动量：1 × 3 → 3 × 1，没变。摩擦力是木块和木板之间的作用力，是内力，一对内力的冲量等大反向。' },
          { say: '动能：4.5 J → 1.5 J，少了 3 J，变成了热。动量守恒，机械能却不守恒：两件事要分开判断。' }
        ],
        gateAt: 1,
        button: '碰撞时有摩擦呢',
        play: true,
        tall: true,
        draw: plank,
        mount: function (el, api) {
          var q = document.createElement('div');
          el.appendChild(q);
          var b1 = document.createElement('div'), b2 = document.createElement('div');
          b1.innerHTML = '<div class="stem">系统的总动量守恒吗？</div>';
          b2.innerHTML = '<div class="stem">系统的机械能守恒吗？</div>';
          b2.className = 'q-gap';
          b2.hidden = true;
          q.appendChild(b1); q.appendChild(b2);
          var api1 = Object.assign({}, api, { open: function () {}, win: function () {} });
          GRAV.ui.choice(b1, {
            options: [
              { html: '守恒：摩擦力是木块和木板之间的内力', correct: true, say: '对。看动量柱子：木块降多少，木板升多少，和一直是 3。' },
              { html: '不守恒：有摩擦', say: '这个摩擦在木块和木板之间，是内力。看动量柱子的"和"。' }
            ],
            hints: ['摩擦力是谁对谁的？', '木块和木板互相施加，都在系统里面。', '内力不改变总动量：守恒。'],
            onCorrect: function () { b2.hidden = false; }
          }, api1);
          GRAV.ui.choice(b2, {
            options: [
              { html: '不守恒：摩擦生热，动能从 4.5 J 降到 1.5 J', correct: true, say: '对。动量守恒和机械能守恒是两件事。' },
              { html: '守恒：动量守恒，机械能也守恒', say: '看动能柱子的"和"：4.5 J 降到了 1.5 J。' }
            ],
            hints: ['看动能柱子的"和"。', '开始 4.5 J，最后 1.5 J。', '少了的 3 J 变成了热：不守恒。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { q.hidden = bt !== 1; });
        }
      }
    ]
  });
})();
