/* 第 4 幕 · 动量：定义；动量和动能的区别（子弹与铅球） */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  var B = { m: 0.01, v: 800 }, P = { m: 2, v: 4 };
  function p(o) { return o.m * o.v; }
  function ek(o) { return 0.5 * o.m * o.v * o.v; }

  // 子弹与铅球：上半是动量条（一样长），下半是动能条（差 200 倍）
  function drawCompare(ctx, w, h, t, C, beat) {
    var x0 = 40, x1 = w - 40, full = x1 - x0 - 120;
    var rows = [{ o: B, name: '子弹', sub: '10 g · 800 m/s' }, { o: P, name: '铅球', sub: '2 kg · 4 m/s' }];
    var y = h * 0.18;
    GRAV.draw.text(ctx, '动量 p', x0, y, { size: 13, color: C.graphite });
    rows.forEach(function (r, i) {
      var yy = y + 30 + i * 46;
      GRAV.draw.text(ctx, r.name, x0, yy + 5, { size: 14, color: C.ink });
      GRAV.draw.text(ctx, r.sub, x0, yy + 22, { size: 11, color: C.steel });
      if (beat >= 2) {
        var L = full * p(r.o) / 8;
        ctx.fillStyle = C.vel; MOM.rr(ctx, x0 + 110, yy - 7, L, 12, 6); ctx.fill();
        GRAV.draw.text(ctx, p(r.o).toFixed(0) + ' kg·m/s', x0 + 110 + L - 4, yy - 12, { font: 'num', size: 12, color: C.vel, align: 'right' });
      }
    });
    if (beat < 3) return;
    var y2 = y + 150;
    GRAV.draw.text(ctx, '动能 Eₖ', x0, y2, { size: 13, color: C.graphite });
    var max = ek(B);
    rows.forEach(function (r, i) {
      var yy = y2 + 30 + i * 46;
      GRAV.draw.text(ctx, r.name, x0, yy + 5, { size: 14, color: C.ink });
      var L = Math.max(3, full * ek(r.o) / max);
      ctx.fillStyle = C.charge; MOM.rr(ctx, x0 + 110, yy - 7, L, 12, 6); ctx.fill();
      GRAV.draw.text(ctx, ek(r.o).toFixed(0) + ' J', x0 + 110 + Math.max(L, 40), yy - 12, { font: 'num', size: 12, color: C.charge, align: 'right' });
    });
  }

  GRAV.act({
    id: 4,
    name: '动量',
    tag: '第 4 幕 · 动量',
    steps: [
      {
        title: '动量',
        layout: 'answer',
        beats: [
          { say: '碰撞前后守得住的 mv，物理学给它起名叫"动量"，用 p 表示。' },
          { say: '单位是 kg·m/s。它是矢量，方向就是速度的方向。' },
          { say: '牛顿把它叫作"运动的量"：质量越大、跑得越快，"运动的量"就越多。' }
        ],
        mount: function (el, api) {
          var d = document.createElement('div');
          d.className = 'def';
          d.innerHTML = '<div class="big">' + S('p') + ' = ' + S('m') + S('v') + '</div>' +
            '<div class="row" data-b="1"><b>单位</b><span>kg·m/s</span></div>' +
            '<div class="row" data-b="1"><b>方向</b><span>与速度方向相同，是矢量</span></div>' +
            '<div class="row" data-b="2"><b>来历</b><span>牛顿：运动的量（quantity of motion）</span></div>';
          el.appendChild(d);
          api.onBeat(function (bt) {
            Array.prototype.forEach.call(d.querySelectorAll('[data-b]'), function (r) { r.hidden = Number(r.getAttribute('data-b')) > bt; });
          });
        }
      },
      {
        title: '动量和动能',
        beats: [
          { say: '动量和动能都由 m 和 v 决定，可它们不是一回事。' },
          { say: '一颗 10 g 的子弹以 800 m/s 飞行，一个 2 kg 的铅球以 4 m/s 运动。谁的动量大？' },
          { say: '两个都是 8 kg·m/s。' },
          { say: '再算动能：子弹 ' + ek(B).toFixed(0) + ' J，铅球 ' + ek(P).toFixed(0) + ' J，差了 ' + (ek(B) / ek(P)).toFixed(0) + ' 倍。' },
          { say: '动量跟 v 成正比，动能跟 v² 成正比。同样的动量，速度大的那个动能大得多。' }
        ],
        gateAt: 1,
        draw: drawCompare,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '子弹', say: '子弹快，可它很轻。算一算：0.01 × 800 = ？' },
              { html: '一样大', correct: true, say: '对。0.01 × 800 = 8，2 × 4 = 8。' },
              { html: '铅球', say: '铅球重，可它慢。算一算：2 × 4 = ？' }
            ],
            hints: ['p = mv，质量要换成千克。', '子弹 0.01 kg × 800 m/s，铅球 2 kg × 4 m/s。', '都是 8 kg·m/s，一样大。']
          }, api);
          var wk = GRAV.ui.work(el), shown = 0;
          api.onBeat(function (bt) {
            box.hidden = bt < 1;
            if (bt >= 2 && shown < 1) { wk.line(S('p') + '子弹 = 0.01 × 800 = 8 kg·m/s'); wk.line(S('p') + '铅球 = 2 × 4 = 8 kg·m/s'); shown = 1; }
            if (bt >= 3 && shown < 2) {
              wk.line(S('E') + 'ₖ子弹 = ½ × 0.01 × 800² = ' + ek(B).toFixed(0) + ' J');
              wk.line(S('E') + 'ₖ铅球 = ½ × 2 × 4² = ' + ek(P).toFixed(0) + ' J');
              shown = 2;
            }
          });
        }
      }
    ]
  });
})();
