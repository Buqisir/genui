/* 第 5 幕 · 实验验证（学生必做实验）：斜槽平抛法。落地时间相同，水平距离代替速度；入射球要更重；数据差 0.75% */
(function () {
  'use strict';
  var S = GRAV.h.sym;
  var m1 = 20, m2 = 10, OP = 40.0, OM = 13.2, ON = 53.0;   // g、cm

  function scene(showMN) {
    return function (ctx, w, h, t, C, beat) {
      var x0 = Math.max(130, w * 0.24), y0 = h * 0.3, gy = h * 0.74;
      var px = Math.min((w - x0 - 40) / 0.62, 700);
      var pts = [{ name: 'P', x: OP / 100 }];
      if (showMN === true || (typeof showMN === 'number' && beat >= showMN)) pts.push({ name: 'M', x: OM / 100 }, { name: 'N', x: ON / 100 });
      CNS.chute(ctx, x0, y0, gy, px, C, { points: pts });
      GRAV.draw.text(ctx, '1 单独落到 P；碰后 1 落到 M、2 落到 N', 16, 18, { size: 12, color: C.steel });
    };
  }

  GRAV.act({
    id: 5,
    name: '实验验证',
    tag: '第 5 幕 · 实验验证',
    steps: [
      {
        title: '测不了速度，怎么验证？',
        beats: [
          { say: '学生必做实验：验证动量守恒定律。小球 1 从斜槽同一位置滚下，先单独落到 P；再在槽口放上小球 2，碰后小球 1 落到 M，小球 2 落到 N。O 是槽口正下方。' },
          { say: '速度不好测。为什么可以用水平距离 OP、OM、ON 代替速度？' },
          { say: '两球都从槽口这个高度平抛，落地时间相同，水平距离和速度成正比。要验证的 m₁v₁ = m₁v₁′ + m₂v₂′，就变成 m₁·OP = m₁·OM + m₂·ON。' }
        ],
        gateAt: 1,
        button: '还有一个要求',
        tall: true,
        draw: scene(true),
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '两球从同一高度平抛，落地时间相同，水平距离和速度成正比', correct: true, say: '对。时间相同，x = vt，x 就和 v 成正比。' },
              { html: '水平距离越大，速度越大，所以可以替代', say: '"越大越大"不够：要成正比，等式两边才能同时约掉时间。' },
              { html: '实验里测不了速度，只能近似替代', say: '这不是近似：落地时间相同时，x 和 v 严格成正比。' }
            ],
            hints: ['平抛的水平距离 x = vt。', '两球下落的高度一样，时间 t 呢？', 't 相同，x 和 v 成正比。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var wk = GRAV.ui.work(el), shown = false;
          api.onBeat(function (bt) {
            box.hidden = bt !== 1;
            if (bt >= 2 && !shown) {
              shown = true;
              wk.line(S('m') + '₁' + S('v') + '₁ = ' + S('m') + '₁' + S('v') + '₁′ + ' + S('m') + '₂' + S('v') + '₂′');
              wk.line(S('m') + '₁·OP = ' + S('m') + '₁·OM + ' + S('m') + '₂·ON', '两边约去时间 t');
            }
          });
        }
      },
      {
        title: '入射球为什么要更重？数据对得上吗？',
        beats: [
          { say: '还有一个要求：入射的小球 1 要比被碰的小球 2 重。为什么？' },
          { say: '数据：m₁ = 20 g，m₂ = 10 g，OP = 40.0 cm，OM = 13.2 cm，ON = 53.0 cm。' },
          { say: 'm₁·OP = 800 g·cm；m₁·OM + m₂·ON = 264 + 530 = 794 g·cm。只差 0.75%，在实验误差内，动量守恒。' }
        ],
        gateAt: 0,
        button: '去做练习',
        tall: true,
        draw: scene(true),
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '防止入射球碰后反弹回斜槽', correct: true, say: '对。轻球撞重球会被弹回去，就落不到前方的 M 了。' },
              { html: '让被碰球飞得更远，好测量', say: '飞得远不是目的。想想：轻球撞重球，轻球会怎样？' },
              { html: '质量大的球不容易受空气阻力影响', say: '这不是主要原因。想想：入射球如果更轻，碰后会往哪走？' }
            ],
            hints: ['第 1 节第 3 轮：轻车撞重车，轻车怎样了？', '被弹了回来。', '入射球弹回斜槽，就落不到 M。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var tb = document.createElement('table');
          tb.className = 'dt dt-gap';
          tb.innerHTML = '<tr><th></th><th>质量（g）</th><th>距离（cm）</th><th>质量 × 距离</th></tr>' +
            '<tr><td>碰前：1 落到 P</td><td>' + m1 + '</td><td>' + OP.toFixed(1) + '</td><td>' + (m1 * OP).toFixed(0) + '</td></tr>' +
            '<tr><td>碰后：1 落到 M</td><td>' + m1 + '</td><td>' + OM.toFixed(1) + '</td><td>' + (m1 * OM).toFixed(0) + '</td></tr>' +
            '<tr><td>碰后：2 落到 N</td><td>' + m2 + '</td><td>' + ON.toFixed(1) + '</td><td>' + (m2 * ON).toFixed(0) + '</td></tr>' +
            '<tr><td>碰后之和</td><td></td><td></td><td>' + (m1 * OM + m2 * ON).toFixed(0) + '</td></tr>';
          el.appendChild(tb);
          api.onBeat(function (bt) { box.hidden = bt !== 0; tb.hidden = bt < 1; });
        }
      }
    ]
  });
})();
