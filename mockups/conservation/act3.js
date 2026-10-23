/* 第 3 幕 · 近似守恒与某方向守恒：碰撞时摩擦的冲量只占 0.1%；光滑斜面体上物块下滑，水平方向动量守恒 */
(function () {
  'use strict';

  // 碰撞瞬间：两只冰壶之间的相互作用力很大，冰面摩擦力很小（箭头长度只示意大小关系）
  function contact(ctx, w, h, t, C, beat) {
    var y = h * 0.4, r = Math.max(22, Math.min(32, w * 0.05)), cx = w / 2;
    MOM.sheet(ctx, 12, w - 12, y, C, 0, r * 2.4);
    MOM.stone(ctx, cx - r, y, r, C, 'A');
    MOM.stone(ctx, cx + r, y, r, C, 'B');
    IMP.force(ctx, cx + r * 1.2, y + r + 22, cx + r * 1.2 + 90, y + r + 22, C, 'A 推 B：很大', 'right');
    IMP.force(ctx, cx - r * 1.2, y + r + 22, cx - r * 1.2 - 90, y + r + 22, C, 'B 推 A：很大', 'left');
    GRAV.draw.arrow(ctx, cx + r, y - r - 16, cx + r - 10, y - r - 16, C.force, 1.5);
    GRAV.draw.arrow(ctx, cx - r, y - r - 16, cx - r - 6, y - r - 16, C.force, 1.5);
    GRAV.draw.text(ctx, '冰面摩擦：约 4 N', cx, y - r - 28, { size: 12, color: C.force, align: 'center' });
    GRAV.draw.note(ctx, '碰撞那 0.01 s 的受力，箭头长短只示意', w, h, C);
    if (beat >= 2) {
      CNS.bars(ctx, { x: 30, y: y + r + 50, w: Math.min(300, w - 60), h: h - y - r - 70 }, [
        { label: '总动量', v: 40, ink: true, text: '40' },
        { label: '摩擦的冲量', v: 0.04, color: C.force, text: '0.04' }
      ], C, { max: 48, title: '单位 kg·m/s（N·s）' });
    }
  }

  // 光滑斜面体（3 kg）在光滑地面上，物块（1 kg）从顶端滑下；水平方向：物块走 3/4、斜面体退 1/4
  function wedge(ctx, w, h, t, C, beat) {
    var gy = h * 0.62, B = Math.min(w * 0.42, 240), H = B * 0.62;
    var x0 = Math.max(70, w * 0.3 - B / 2), T = 2.2, u = Math.min(t / T, 1), s = u * u;
    IMP.ground(ctx, 16, w - 16, gy, C);
    GRAV.draw.text(ctx, '光滑地面', w - 16, gy + 24, { size: 12, color: C.steel, align: 'right' });
    var wx = x0 - B / 4 * s;
    CNS.wedge(ctx, wx, gy, B, H, C);
    GRAV.draw.text(ctx, '3 kg', wx + 14, gy - 10, { size: 12, color: C.graphite });
    var ang = Math.atan2(H, B), bs = 22;
    var bx = wx + s * B, by = gy - H * (1 - s);
    ctx.save(); ctx.translate(bx, by); ctx.rotate(ang);
    MOM.rr(ctx, -bs / 2, -bs, bs, bs, 3); ctx.fillStyle = C.graphite; ctx.fill(); ctx.restore();
    GRAV.draw.text(ctx, '1 kg', bx + 16, by - 16, { size: 12, color: C.graphite });
    if (u >= 1) {
      GRAV.draw.arrow(ctx, bx + 8, gy + 34, bx + 8 + 66, gy + 34, C.vel, 2);
      GRAV.draw.text(ctx, '3 m/s', bx + 41, gy + 26, { font: 'num', size: 12, color: C.vel, align: 'center' });
      if (beat >= 3) {
        GRAV.draw.arrow(ctx, wx + B / 2, gy + 34, wx + B / 2 - 22, gy + 34, C.vel, 2);
        GRAV.draw.text(ctx, '1 m/s', wx + B / 2 - 11, gy + 26, { font: 'num', size: 12, color: C.vel, align: 'center' });
      }
    }
    if (beat >= 2) {
      GRAV.draw.text(ctx, '竖直方向：重力、地面支持力，合力不为零 → 不守恒', 16, 20, { size: 12, color: C.graphite });
      GRAV.draw.text(ctx, '水平方向：没有外力 → 守恒', 16, 38, { size: 12, color: C.ink });
    }
  }

  GRAV.act({
    id: 3,
    name: '近似守恒与某方向守恒',
    tag: '第 3 幕 · 近似守恒与某方向守恒',
    steps: [
      {
        title: '碰撞时冰面也有摩擦，为什么还能用？',
        beats: [
          { say: '冰壶相撞时，冰面对它们也有摩擦力，是外力。为什么还能说总动量不变？' },
          { say: 'A 20 kg、2 m/s，碰撞约 0.01 s，冰面摩擦力约 4 N。碰撞那一下，摩擦力的冲量占总动量的多少？' },
          { say: '4 × 0.01 = 0.04 N·s，总动量 40 kg·m/s，只占 0.1%。' },
          { say: '碰撞、爆炸这类过程时间极短，内力远大于外力，外力的冲量可以忽略，看作守恒。' }
        ],
        gateAt: 1,
        button: '只在一个方向上没有外力呢',
        tall: true,
        draw: contact,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '约 0.1%', correct: true, say: '对。4 × 0.01 = 0.04，40 的千分之一。' },
              { html: '约 10%', say: '算一算：摩擦的冲量 4 × 0.01 = 0.04 N·s，总动量 20 × 2 = 40 kg·m/s。' },
              { html: '约 1%', say: '再算一次：0.04 ÷ 40。' }
            ],
            hints: ['摩擦力的冲量是多少？', '4 N × 0.01 s = 0.04 N·s。', '0.04 ÷ 40 = 0.1%。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        }
      },
      {
        title: '斜面体会往哪边退？',
        beats: [
          { say: '光滑地面上放着 3 kg 的光滑斜面体，1 kg 的物块从顶端由静止滑下。' },
          { say: '物块到底端时，水平速度 3 m/s 向右。此时斜面体的速度多大、朝哪？' },
          { say: '竖直方向：重力和地面支持力，合力不为零，竖直方向动量不守恒。' },
          { say: '水平方向：没有外力，水平动量守恒。开始都静止，0 = 1 × 3 + 3v，v = −1 m/s，向左。' }
        ],
        gateAt: 1,
        button: '归纳成定律',
        play: true,
        tall: true,
        draw: wedge,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '0，斜面体被物块压着不动', say: '地面光滑，斜面体会被物块推着向左退。' },
              { html: '1 m/s，向左', correct: true, say: '对。水平方向：0 = 1 × 3 + 3v，v = −1 m/s。' },
              { html: '1 m/s，向右', say: '开始水平动量是 0，物块向右，斜面体就得向左。' },
              { html: '3 m/s，向左', say: '速度大小不一定相等，要乘上质量：3 kg 的斜面体只需 1 m/s。' }
            ],
            hints: ['整个系统在哪个方向上不受外力？', '水平方向：开始静止，总动量是 0。', '0 = 1 × 3 + 3v。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        }
      }
    ]
  });
})();
