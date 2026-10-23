/* 第 7 幕 · 练习：先看一道四段式示范例题（情境 → 策略 → 解答 → 讨论），再自己做一道同类的 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

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
      GRAV.draw.text(ctx, '碰撞面装粘扣：碰后粘在一起', x0, h * 0.2, { size: 12, color: C.steel });
    };
  }

  // 例题：0.4 kg 以 0.5 m/s 撞静止的 0.6 kg，粘住
  var mA = 0.4, vA = 0.5, mB = 0.6;
  var vEx = mA * vA / (mA + mB);                       // 0.20
  var ek0 = 0.5 * mA * vA * vA, ek1 = 0.5 * (mA + mB) * vEx * vEx;   // 0.05 → 0.02
  // 练习：0.3 kg 以 0.5 m/s 撞静止的 0.2 kg，粘住
  var vStick = 0.3 * 0.5 / (0.3 + 0.2);                // 0.30
  var vKE = Math.sqrt(0.3 * 0.5 * 0.5 / (0.3 + 0.2));  // 按动能不变算错得 0.387

  function section(el, label) {
    var d = document.createElement('div');
    d.className = 'ex-sec';
    d.innerHTML = '<div class="ex-l">' + label + '</div>';
    el.appendChild(d);
    return d;
  }

  GRAV.act({
    id: 7,
    name: '练习',
    tag: '第 7 幕 · 练习',
    steps: [
      {
        title: '例题：粘在一起后的速度',
        beats: [
          { say: '先看一道完整的例题。情境写在右边。' },
          { say: '策略：这次该用哪个量？' },
          { say: '解答：碰前 mv 之和 = 0.4 × 0.5 = 0.20；碰后两车一起，总质量 1.0 kg。0.20 = 1.0 × v，v = 0.20 m/s。' },
          { say: '讨论：0.20 m/s 比 0.5 m/s 小，合理。动能从 0.05 J 降到 0.02 J，少了 60%：粘住的碰撞里动能确实不守恒，不能拿它来算。' }
        ],
        gateAt: 1,
        button: '自己做一道',
        draw: carts({ m: mA, v: vA }, { m: mB, v: 0 }, true),
        mount: function (el, api) {
          var s1 = section(el, '情境');
          s1.insertAdjacentHTML('beforeend', '<div class="stem">A 车 0.4 kg 以 0.5 m/s 撞上静止的 B 车 0.6 kg，碰后粘在一起。求共同速度。</div>');
          var s2 = section(el, '策略');
          var box = document.createElement('div');
          s2.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: S('mv') + ' 之和', correct: true, say: '对。粘住的碰撞里，mv 的矢量和不变。' },
              { html: S('mv') + '² 之和', say: '第 2 轮刚看到：粘住时 mv² 之和会变小，不能用。' },
              { html: '两个都行', say: '粘住时 mv² 之和会变小，只有 mv 之和守得住。' }
            ],
            hints: ['回想第 2 轮：粘住的碰撞里，哪个量没变？', 'mv² 之和在粘住时明显变小。', '用 mv 之和。'],
            onCorrect: function () { api.win(false); }
          }, api);
          var s3 = section(el, '解答'), w3 = GRAV.ui.work(s3);
          var s4 = section(el, '讨论'), w4 = GRAV.ui.work(s4);
          var shown = 0;
          api.onBeat(function (bt) {
            s2.hidden = bt < 1;
            s3.hidden = bt < 2;
            s4.hidden = bt < 3;
            if (bt >= 2 && shown < 1) {
              shown = 1;
              w3.line('0.4 × 0.5 = (0.4 + 0.6) ' + S('v'));
              w3.line(S('v') + ' = ' + vEx.toFixed(2) + ' m/s');
            }
            if (bt >= 3 && shown < 2) {
              shown = 2;
              w4.line(S('E') + 'ₖ：' + ek0.toFixed(2) + ' J → ' + ek1.toFixed(2) + ' J', '少了 60%');
            }
          });
        }
      },
      {
        title: '粘在一起后，速度是多少？',
        beats: [{ say: 'A 车 0.3 kg 以 0.5 m/s 撞上静止的 B 车 0.2 kg，碰后粘在一起。共同速度是多少？' }],
        gateAt: 0,
        button: '收束',
        draw: carts({ m: 0.3, v: 0.5 }, { m: 0.2, v: 0 }, true),
        mount: function (el, api) {
          GRAV.ui.choice(el, {
            options: [
              { html: '0.50 m/s', say: '速度不会原样"传"过去。粘住以后是两辆车一起动。' },
              { html: '0.25 m/s', say: '不能把两车速度取平均。守得住的是 mv 之和。' },
              { html: vStick.toFixed(2) + ' m/s', correct: true, say: '对。0.3 × 0.5 = 0.15，再除以总质量 0.5 kg，得 ' + vStick.toFixed(2) + ' m/s。' },
              { html: vKE.toFixed(2) + ' m/s', say: '这是按"mv² 之和不变"算出来的。粘住的碰撞里，mv² 之和不守恒。' }
            ],
            hints: ['碰撞前后，哪个量守得住？', '碰前 mv 之和 = 0.3 × 0.5；碰后两车一起，总质量 0.5 kg。', '0.15 ÷ 0.5 = ' + vStick.toFixed(2) + ' m/s。']
          }, api);
        }
      }
    ]
  });
})();
