/* 第 5 幕 · 动量的变化量：小球撞墙原速弹回，Δp 不是 0 */
(function () {
  'use strict';
  var S = GRAV.h.sym;
  var M = 0.1, V = 6;
  var P0 = M * V, P1 = -M * V, DP = P1 - P0;

  function draw(ctx, w, h, t, C, beat) {
    var wall = w - 50, y = h * 0.3, r = 12, x0 = 60;
    // 墙
    ctx.save();
    ctx.fillStyle = C.bar; ctx.fillRect(wall, y - 60, 16, 120);
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1; ctx.strokeRect(wall, y - 60, 16, 120);
    ctx.strokeStyle = MOM.rgba(C.graphite, 0.4);
    for (var k = -60; k < 60; k += 12) { ctx.beginPath(); ctx.moveTo(wall + 16, y + k); ctx.lineTo(wall + 26, y + k + 10); ctx.stroke(); }
    ctx.restore();
    // 小球去 1.6 秒、回 1.6 秒，停在回到起点、还在向左运动的那一刻
    var span = wall - r - x0, T = 1.6, tt = Math.min(t, 2 * T - 1e-3), x, v;
    if (tt < T) { x = x0 + span * tt / T; v = V; }
    else if (tt < 2 * T) { x = wall - r - span * (tt - T) / T; v = -V; }
    else { x = x0; v = 0; }
    GRAV.kit.ball(ctx, x, y, r, C, true);
    if (v) MOM.vArrow(ctx, x, y + 34, v, 9, C, (v > 0 ? '' : '−') + '6 m/s');
    GRAV.draw.text(ctx, '0.1 kg，向右为正', x0 - 20, y - 40, { size: 12, color: C.steel });
    if (beat < 2) return;
    // 矢量图：p 和 p′ 从同一点出发，Δp 从 p 的末端指向 p′ 的末端
    var ox = w * 0.5, oy = h * 0.72, s = Math.min(w * 0.3, 220) / 0.6;
    GRAV.draw.arrow(ctx, ox, oy - 16, ox + P0 * s, oy - 16, C.vel, 2.5);
    GRAV.draw.text(ctx, 'p = 0.6', ox + P0 * s / 2, oy - 26, { font: 'num', size: 14, color: C.vel, align: 'center' });
    GRAV.draw.arrow(ctx, ox, oy + 16, ox + P1 * s, oy + 16, C.vel, 2.5);
    GRAV.draw.text(ctx, 'p′ = −0.6', ox + P1 * s / 2, oy + 38, { font: 'num', size: 14, color: C.vel, align: 'center' });
    GRAV.draw.arrow(ctx, ox + P0 * s, oy + 52, ox + P1 * s, oy + 52, C.accel, 2.5);
    GRAV.draw.text(ctx, 'Δp = −1.2 kg·m/s', ox, oy + 76, { font: 'num', size: 14, color: C.accel, align: 'center' });
    ctx.save(); ctx.setLineDash([2, 4]); ctx.strokeStyle = C.steel;
    ctx.beginPath(); ctx.moveTo(ox, oy - 40); ctx.lineTo(ox, oy + 60); ctx.stroke(); ctx.restore();
  }

  GRAV.act({
    id: 5,
    name: '动量的变化量',
    tag: '第 5 幕 · 动量的变化量',
    steps: [
      {
        title: '小球撞墙弹回，动量变了多少？',
        beats: [
          { say: '0.1 kg 的小球以 6 m/s 向右撞墙，又以 6 m/s 向左弹回。' },
          { say: '动量变化了多少？Δp = p′ − p。' },
          { say: '画成箭头：p 向右，p′ 向左。从 p 的末端指到 p′ 的末端，就是 Δp，大小 1.2 kg·m/s，向左。' },
          { say: '这个过程中动能没变，动量却变了。这是动量和动能的又一个区别。' }
        ],
        gateAt: 1,
        button: '下一幕',
        play: true,
        tall: true,
        draw: draw,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '0', say: '速率没变，可方向变了。动量是矢量。' },
              { html: '0.6 kg·m/s', say: '取向右为正：p = 0.6，p′ = −0.6，再相减。' },
              { html: '1.2 kg·m/s，向右', say: 'Δp = p′ − p，p′ 是负的，减出来也是负的，方向向左。' },
              { html: '1.2 kg·m/s，向左', correct: true, say: '对。取向右为正：Δp = (−0.6) − 0.6 = −1.2 kg·m/s，负号表示向左。' }
            ],
            hints: ['先规定向右为正，写出 p 和 p′。', 'p = 0.1 × 6 = 0.6，p′ = 0.1 × (−6) = −0.6。', 'Δp = −0.6 − 0.6 = −1.2 kg·m/s，向左。']
          }, api);
          var wk = GRAV.ui.work(el), shown = false;
          api.onBeat(function (bt) {
            box.hidden = bt < 1;
            if (bt >= 2 && !shown) {
              shown = true;
              wk.line(S('p') + ' = 0.1 × 6 = ' + P0.toFixed(1) + ' kg·m/s');
              wk.line(S('p') + '′ = 0.1 × (−6) = ' + MOM.f(P1, 1) + ' kg·m/s');
              wk.line('Δ' + S('p') + ' = ' + MOM.f(P1, 1) + ' − ' + P0.toFixed(1) + ' = ' + MOM.f(DP, 1) + ' kg·m/s', '负号：向左');
            }
          });
        }
      }
    ]
  });
})();
