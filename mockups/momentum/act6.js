/* 第 6 幕 · 课堂练习：粘住后的速度、相向运动的总动量、动量和动能的判断 */
(function () {
  'use strict';

  function carts(cfgA, cfgB, sticky) {
    return function (ctx, w, h, t, C) {
      var x0 = 24, x1 = w - 24, y = h * 0.45, cw = Math.max(70, Math.min(130, w * 0.15));
      MOM.track(ctx, x0, x1, y, C);
      var xa = w * 0.22, xb = w * 0.6;
      MOM.cart(ctx, xa, y, cw, 34, C, { name: 'A', label: cfgA.m + ' kg', face: 1, side: sticky ? 'velcro' : 'mag' });
      MOM.cart(ctx, xb, y, cw, 34, C, { name: 'B', label: cfgB.m + ' kg', face: -1, side: sticky ? 'velcro' : 'mag' });
      MOM.vArrow(ctx, xa + cw / 2, y + 32, cfgA.v, 110, C, MOM.f(cfgA.v, 1) + ' m/s');
      MOM.vArrow(ctx, xb + cw / 2, y + 32, cfgB.v, 110, C, cfgB.v ? MOM.f(cfgB.v, 1) + ' m/s' : undefined);
      GRAV.draw.text(ctx, '向右为正', x1, h * 0.2, { size: 12, color: C.steel, align: 'right' });
    };
  }

  // 练习 3 的数值
  var vStick = 0.3 * 0.5 / (0.3 + 0.2);                       // 0.30
  var vKE = Math.sqrt(0.3 * 0.5 * 0.5 / (0.3 + 0.2));         // 用 mv² 算错得 0.387
  // 练习 4 的数值
  var pTot = 0.2 * 0.6 + 0.4 * (-0.3);                        // 0

  GRAV.act({
    id: 6,
    name: '课堂练习',
    tag: '第 6 幕 · 课堂练习',
    steps: [
      {
        title: '粘在一起后，速度是多少？',
        beats: [{ say: 'A 车 0.3 kg 以 0.5 m/s 撞上静止的 B 车 0.2 kg，碰后粘在一起。共同速度是多少？' }],
        gateAt: 0,
        draw: carts({ m: 0.3, v: 0.5 }, { m: 0.2, v: 0 }, true),
        mount: function (el, api) {
          GRAV.ui.choice(el, {
            options: [
              { html: '0.50 m/s', say: '速度不会原样"传"过去。粘住以后是两辆车一起动。' },
              { html: '0.25 m/s', say: '不能把两车速度取平均。守得住的是 mv 之和。' },
              { html: vStick.toFixed(2) + ' m/s', correct: true, say: '对。0.3 × 0.5 = 0.15，再除以总质量 0.5 kg，得 ' + vStick.toFixed(2) + ' m/s。' },
              { html: vKE.toFixed(2) + ' m/s', say: '这是用"mv² 之和不变"算出来的。粘住的碰撞里，mv² 之和不守恒。' }
            ],
            hints: ['碰撞前后，哪个量守得住？', '碰前 mv 之和 = 0.3 × 0.5；碰后两车一起，总质量 0.5 kg。', '0.15 ÷ 0.5 = ' + vStick.toFixed(2) + ' m/s。']
          }, api);
        }
      },
      {
        title: '相向运动的两车，总动量是多少？',
        beats: [{ say: 'A 车 0.2 kg 以 0.6 m/s 向右，B 车 0.4 kg 以 0.3 m/s 向左。两车的总动量是多少？' }],
        gateAt: 0,
        draw: carts({ m: 0.2, v: 0.6 }, { m: 0.4, v: -0.3 }, false),
        mount: function (el, api) {
          GRAV.ui.choice(el, {
            options: [
              { html: '0.24 kg·m/s', say: '这是把两个动量的大小直接相加了。B 向左，要记作负值。' },
              { html: '0.12 kg·m/s', say: '只算了一辆车。两辆车都要算进去。' },
              { html: '无法确定', say: '数据够了。先规定向右为正，再分别算两车的动量。' },
              { html: Math.abs(pTot) < 1e-9 ? '0' : MOM.f(pTot, 2), correct: true, say: '对。0.2 × 0.6 + 0.4 × (−0.3) = 0.12 − 0.12 = 0。' }
            ],
            hints: ['动量是矢量，B 向左。', 'A：0.2 × 0.6；B：0.4 × (−0.3)。', '0.12 + (−0.12) = 0。']
          }, api);
        }
      },
      {
        title: '下面哪种说法正确？',
        layout: 'answer',
        beats: [{ say: '最后一道，想清楚动量和动能的区别。' }],
        gateAt: 0,
        button: '下一幕',
        mount: function (el, api) {
          GRAV.ui.choice(el, {
            options: [
              { html: '物体的动量变了，动能一定变', say: '想想第 5 幕的小球：动量变了，动能没变。' },
              { html: '动能相同的两个物体，质量大的动量大', correct: true, say: '对。p = √(2mEₖ)，动能相同时，质量越大，动量越大。' },
              { html: '动量是标量，只有大小', say: '动量的方向和速度方向相同，是矢量。' },
              { html: '速率不变时，动量一定不变', say: '速率不变，方向可以变。方向变了，动量就变了。' }
            ],
            hints: ['动量是矢量，动能是标量。', '把 Eₖ = ½mv² 和 p = mv 联系起来，消去 v。', 'p = √(2mEₖ)，选"质量大的动量大"。']
          }, api);
        }
      }
    ]
  });
})();
