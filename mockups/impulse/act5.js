/* 第 5 幕 · 方向与合力：撞墙小球（接第 1 节）求墙的平均力和方向；竖直落地弹起，合力里要算重力 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  // 小球撞墙：去 1.6 s，接触瞬间，回 1.6 s；讲解到第 3 句起画 Δp 和墙对球的力
  function wall(ctx, w, h, t, C, beat) {
    var wx = w - 50, y = h * 0.28, r = 12, x0 = 60;
    IMP.wall(ctx, wx, y, 120, C);
    var span = wx - r - x0, T = 1.6, tt = Math.min(t, 2 * T - 1e-3), x, v;
    if (tt < T) { x = x0 + span * tt / T; v = 6; } else { x = wx - r - span * (tt - T) / T; v = -6; }
    GRAV.kit.ball(ctx, x, y, r, C, true);
    MOM.vArrow(ctx, x, y + 34, v, 9, C, (v > 0 ? '' : '−') + '6 m/s');
    GRAV.draw.text(ctx, '0.1 kg，向右为正，接触 0.01 s', x0 - 20, y - 40, { size: 12, color: C.steel });
    if (beat < 2) return;
    var ox = w * 0.5, oy = h * 0.66, s = Math.min(w * 0.3, 220) / 0.6;
    GRAV.draw.arrow(ctx, ox, oy - 16, ox + 0.6 * s, oy - 16, C.vel, 2.5);
    GRAV.draw.text(ctx, 'p = 0.6', ox + 0.3 * s, oy - 26, { font: 'num', size: 14, color: C.vel, align: 'center' });
    GRAV.draw.arrow(ctx, ox, oy + 16, ox - 0.6 * s, oy + 16, C.vel, 2.5);
    GRAV.draw.text(ctx, 'p′ = −0.6', ox - 0.3 * s, oy + 38, { font: 'num', size: 14, color: C.vel, align: 'center' });
    GRAV.draw.arrow(ctx, ox + 0.6 * s, oy + 54, ox - 0.6 * s, oy + 54, C.accel, 2.5);
    GRAV.draw.text(ctx, 'Δp = −1.2 kg·m/s', ox, oy + 78, { font: 'num', size: 14, color: C.accel, align: 'center' });
    if (beat >= 3) IMP.force(ctx, wx - 4, y - 70, wx - 70, y - 70, C, '墙对球 120 N', 'left');
  }

  // 竖直落地弹起：落 1 s、接触 0.5 s（慢放）、弹起 0.8 s；第 3 句起在旁边画受力图
  function bounce(ctx, w, h, t, C, beat) {
    var gx0 = 24, gx1 = Math.min(w * 0.55, 300), gy = h * 0.78, r = 14, cx = (gx0 + gx1) / 2;
    IMP.ground(ctx, gx0, gx1, gy, C);
    var top = h * 0.12, T1 = 1, T2 = 0.5, T3 = 0.8, tt = Math.min(t, T1 + T2 + T3), y, v, sq = 0;
    var top2 = gy - r - (gy - r - top) * 9 / 16;   // 弹起高度按 (3/4)² 缩小
    if (tt < T1) { var u = tt / T1; y = top + (gy - r - top) * u * u; v = -4 * u; }
    else if (tt < T1 + T2) { y = gy - r; v = 0; sq = Math.sin(Math.PI * (tt - T1) / T2); }
    else { var k = (tt - T1 - T2) / T3; y = gy - r - (gy - r - top2) * (1 - (1 - k) * (1 - k)); v = 3 * (1 - k); }
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, y + sq * 4, r * (1 + sq * 0.2), r * (1 - sq * 0.25), 0, 0, Math.PI * 2);
    ctx.fillStyle = C.graphite; ctx.fill(); ctx.restore();
    if (Math.abs(v) > 0.2) GRAV.draw.arrow(ctx, cx + 32, y, cx + 32, y - v * 14, C.vel, 2);
    GRAV.draw.text(ctx, '0.5 kg，向上为正，接触 0.1 s', gx0, 16, { size: 12, color: C.steel });
    if (beat < 2) return;
    // 受力图：接触时 N 向上 40 N，mg 向下 5 N（按比例）
    var fx = Math.min(w - 70, gx1 + (w - gx1) / 2), fy = h * 0.5, k = Math.min(3, (h * 0.32) / 40);
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, 12, 0, Math.PI * 2); ctx.fillStyle = C.graphite; ctx.fill(); ctx.restore();
    IMP.force(ctx, fx, fy - 12, fx, fy - 12 - 40 * k, C, 'N = 40 N', 'right');
    IMP.force(ctx, fx, fy + 12, fx, fy + 12 + 5 * k + 10, C, 'mg = 5 N', 'right');
    GRAV.draw.text(ctx, '接触时的受力', fx, fy + 60, { size: 12, color: C.steel, align: 'center' });
  }

  GRAV.act({
    id: 5,
    name: '方向与合力',
    tag: '第 5 幕 · 方向与合力',
    steps: [
      {
        title: '墙对小球的力，朝哪个方向？',
        beats: [
          { say: '回到上一节撞墙的小球：0.1 kg，以 6 m/s 撞墙，原速弹回，和墙接触了 0.01 s。' },
          { say: '墙对球的平均作用力多大、朝哪？' },
          { say: '取向右为正：Δp = (−0.6) − 0.6 = −1.2 kg·m/s。' },
          { say: 'F = Δp ÷ Δt = −1.2 ÷ 0.01 = −120 N，负号表示向左。力的方向和动量变化的方向相同，不一定和速度方向相同。' }
        ],
        gateAt: 1,
        button: '竖直方向呢',
        play: true,
        tall: true,
        draw: wall,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '0', say: '速率没变，可方向变了，动量变了，就一定有冲量。' },
              { html: '60 N，向左', say: '这只算了"停下来"那一半。球还被弹回去了。' },
              { html: '120 N，向右', say: '大小对了。Δp 是负的，力和 Δp 同向，向左。' },
              { html: '120 N，向左', correct: true, say: '对。Δp = −1.2 kg·m/s，F = −120 N，向左。' }
            ],
            hints: ['先规定向右为正，写出 p 和 p′。', 'Δp = −0.6 − 0.6 = −1.2 kg·m/s。', 'F = −1.2 ÷ 0.01 = −120 N，向左。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        }
      },
      {
        title: '竖直落地弹起，地面的力多大？',
        beats: [
          { say: '竖直方向：0.5 kg 的球以 4 m/s 落地，以 3 m/s 弹起，和地面接触 0.1 s。' },
          { say: '地面对球的平均作用力多大？' },
          { say: '接触时球受两个力：地面的支持力 N 向上，重力 mg 向下。动量定理用的是它们的合力。' },
          { say: '取向上为正：(N − mg)Δt = mv′ − mv = 0.5 × 3 − 0.5 × (−4) = 3.5，N − 5 = 35，N = 40 N。' },
          { say: '竖直方向的碰撞，合力里别忘了重力。' }
        ],
        gateAt: 1,
        button: '去做练习',
        play: true,
        tall: true,
        draw: bounce,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '40 N', correct: true, say: '对。合力的冲量 3.5 N·s，合力 35 N 向上，再加上 5 N 重力，N = 40 N。' },
              { html: '35 N', say: '35 N 是合力。地面的力还要顶住 5 N 的重力。' },
              { html: '10 N', say: '速率直接相减了：方向相反，动量变化是 0.5 × (3 + 4)。' },
              { html: '30 N', say: '重力的方向弄反了：N − mg = 35，N = 35 + 5。' }
            ],
            hints: ['接触时球受哪几个力？', '取向上为正：(N − mg) × 0.1 = 0.5 × 3 − 0.5 × (−4)。', 'N − 5 = 35，N = 40 N。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt !== 1; });
        }
      }
    ]
  });
})();
