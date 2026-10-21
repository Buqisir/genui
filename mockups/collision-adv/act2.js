/* 第 2 幕 · 碰撞全谱：拖"弹回程度"滑块，B 的速度只在 0.25v～0.5v 之间；两条守恒都过了也可能不行（后面的穿过前面的）；三条检查与恢复系数 */
(function () {
  'use strict';
  var LAB = ['A  m', 'B  3m'];
  var ST = { e: 0, enough: false };

  function spectrum(ctx, w, h, t, C) {
    var r = ADV.after(3, ST.e);
    ADV.pair(ctx, w, h, C, { k: 3, vA: r.a, vB: r.b, before: true, labels: LAB, bars: true, tag: '碰后（弹回程度 ' + MOM.f(ST.e, 2) + '）' });
  }

  // A 碰后 0.5v、B 碰后 v/6：A 从 B 身上穿过去
  function through(ctx, w, h, t, C, beat) {
    var x0 = 8, x1 = w - 8, y = h * 0.4, cw = w < 520 ? 64 : 84, ch = w < 520 ? 28 : 32, wA = cw * 0.85, wB = cw * 1.15;
    var go = beat >= 1, T1 = 1.0, tt = go ? Math.min(t, 4) : 0, k = (x1 - x0) * 0.22;
    var ax0 = x0 + 10, bx0 = ax0 + wA + k * T1, xa, xb;
    if (tt < T1) { xa = ax0 + k * tt; xb = bx0; }
    else { xa = ax0 + k * T1 + 0.5 * k * (tt - T1); xb = bx0 + (1 / 6) * k * (tt - T1); }
    MOM.track(ctx, x0, x1, y, C);
    var overlap = xa + wA > xb + 2;
    MOM.cart(ctx, xb, y, wB, ch, C, { name: 'B', label: LAB[1], heavy: true });
    ctx.save(); if (overlap) ctx.globalAlpha = 0.75;
    MOM.cart(ctx, xa, y, wA, ch, C, { name: 'A', label: LAB[0] }); ctx.restore();
    if (tt >= T1) {
      MOM.vArrow(ctx, xa + wA / 2, y + 26, 0.5, 90, C, '0.50v');
      MOM.vArrow(ctx, xb + wB / 2, y + 50, 1 / 6, 90, C, '0.17v');
    } else MOM.vArrow(ctx, xa + wA / 2, y + 26, 1, 90, C, 'v');
    if (overlap && xa > xb + 4) {
      txt(ctx, 'A 穿过了 B？不可能', (xa + xb + wB) / 2, y - ch - 30, { size: 14, color: C.force, align: 'center' });
    }
    txt(ctx, '有人说：碰后 A 0.5v、B v/6（同向）', x0, 16, { size: 12, color: C.steel });
    txt(ctx, '向右为正', x1, 16, { size: 12, color: C.steel, align: 'right' });
  }
  function txt(ctx, s, x, y, o) { GRAV.draw.text(ctx, s, x, y, o); }

  GRAV.act({
    id: 2,
    name: '碰撞全谱',
    tag: '第 2 幕 · 碰撞全谱',
    steps: [
      {
        title: 'B 的速度能取哪些值？',
        beats: [
          { say: '碰撞可能粘在一起，也可能完全弹回，还可能介于两者之间。拖动"弹回程度"滑块，从 0（粘在一起）到 1（完全弹回，弹性碰撞），看 B 的速度能取哪些值。至少看两个位置，选项才会出来。' },
          { say: '粘在一起时 B 最慢：mv = 4mv′，0.25v；完全弹回时 B 最快：2m/(4m) × v = 0.5v。介于两者之间的碰撞，B 的速度都在 0.25v～0.5v 之间。0.4v 在范围里，可能；0.6v 超出了。注意动量柱子的"和"一直贴着碰前的虚线，动能的"和"从少 25% 变到一点不少，从不超过虚线。' }
        ],
        gateAt: 0,
        button: '两条都过了呢',
        tall: true,
        draw: spectrum,
        mount: function (el, api) {
          var box = document.createElement('div');
          box.className = 'q-gap';
          box.hidden = !ST.enough;
          ADV.slider(el, {
            label: '弹回程度', min: 0, max: 1, step: 0.01, value: ST.e, need: 2,
            snaps: [{ v: 0, name: '粘在一起 0' }, { v: 0.6, name: 'B 为 0.4v' }, { v: 1, name: '完全弹回 1' }],
            fmt: function (v) { var r = ADV.after(3, v); return 'B ' + ADV.fmtV(r.b) + '，A ' + ADV.fmtV(r.a); },
            onChange: function (v) { ST.e = v; },
            onEnough: function () { ST.enough = true; box.hidden = false; }
          });
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '0.25v ≤ vB ≤ 0.5v', correct: true, say: '对。粘住时最慢，弹性时最快。' },
              { html: '只能是 0.5v：动能必须守恒', say: '只有弹性碰撞动能才守恒。滑块拖到中间，动能少了一些，照样是可能的碰撞。' },
              { html: '0 ≤ vB ≤ v', say: '拖到两头看看：B 最慢 0.25v，最快 0.5v，到不了 0，也到不了 v。' },
              { html: '只能是 0.25v', say: '那是粘在一起的情况。弹回得越多，B 越快。' }
            ],
            hints: ['分别拖到 0 和 1。', '0 时 B 是 0.25v，1 时 B 是 0.5v。', '中间的值都在这两者之间。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      },
      {
        title: '动量、动能都过了，就一定可能吗？',
        beats: [
          { say: '再看一组：碰后 A 0.5v、B v/6，同向。动量：0.5 + 3 × 1/6 = 1，守恒；动能：½ × 0.25 + ½ × 3 × 1/36 ≈ 0.17，比碰前 0.5 少。这组可能吗？' },
          { say: '不可能。碰后 A 还在 B 后面，却比 B 快，它得从 B 身上穿过去。同向运动时，碰后后面的不能比前面的快。这是第三条检查：速度要合理。' }
        ],
        gateAt: 0,
        button: '三条放在一起',
        play: true,
        playAt: 1,
        draw: through,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '可能：动量守恒，动能也没增加', say: '两条守恒都过了，可还有一条：看动画，A 碰后比 B 快，要从 B 身上穿过去。' },
              { html: '不可能：A 在后面却比 B 快，要穿过 B', correct: true, say: '对。碰撞后，后面的不能比前面的快。' },
              { html: '不可能：动能少了', say: '动能减少是允许的，非弹性碰撞都是这样。毛病在别处。' }
            ],
            hints: ['碰后谁在前、谁在后？', 'A 在后，B 在前。', 'A 0.5v 比 B 0.17v 快，会穿过去。'],
            onCorrect: function () { api.win(false); }
          }, api);
        }
      },
      {
        title: '三条检查，和一个系数',
        layout: 'answer',
        beats: [
          { say: '判断一组碰后速度是否可能，三条都要过：动量守恒；总动能不增加；速度合理。' },
          { say: '前面的滑块"弹回程度"，就是第 4 节提到的牛顿量的"弹回快慢"：碰后分离的速度 ÷ 碰前接近的速度，叫恢复系数 e。粘在一起 e = 0，弹性 e = 1，介于两者之间是非弹性。课标不要求它，但 2024 年湖南卷的压轴题考过。' }
        ],
        button: '质量比变了呢',
        mount: function (el, api) {
          var d = document.createElement('div');
          d.className = 'def';
          d.innerHTML =
            '<div class="row"><b>动量</b><span>碰撞前后总动量守恒</span></div>' +
            '<div class="row"><b>动能</b><span>碰后总动能不能比碰前多</span></div>' +
            '<div class="row"><b>速度</b><span>同向运动时，碰后后面的不能比前面的快</span></div>' +
            '<div class="row" data-b="1"><b>恢复系数</b><span>e = 碰后分离速度 ÷ 碰前接近速度；0（粘住）≤ e ≤ 1（弹性）</span></div>';
          Array.prototype.forEach.call(d.querySelectorAll('.row b'), function (b) { b.style.width = '72px'; });
          el.appendChild(d);
          api.onBeat(function (bt) {
            Array.prototype.forEach.call(d.querySelectorAll('[data-b]'), function (r) { r.hidden = Number(r.getAttribute('data-b')) > bt; });
          });
        }
      }
    ]
  });
})();
