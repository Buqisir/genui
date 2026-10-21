/* 第 1 幕 · 冰壶相撞的一瞬间：A 推 B、B 推 A 等大反向同时（牛顿第三定律）；对 A、B 分别用动量定理，推出总动量不变 */
(function () {
  'use strict';
  var S = GRAV.h.sym;

  // 两只冰壶（俯视）相撞，碰撞那段慢放：接近 1.2 s，接触 0.8 s，分开 1.2 s
  // 接触时两个力箭头等长反向；bars 为真时下面画 A、B 和"和"的动量柱子
  var T1 = 1.2, T2 = 0.8, T3 = 1.2;
  function collide(bars) {
    return function (ctx, w, h, t, C) {
      var tt = Math.min(t, T1 + T2 + T3);
      var y = bars ? h * 0.26 : h * 0.42, r = Math.max(20, Math.min(30, w * 0.045));
      var x0 = Math.max(10, w * 0.04), x1 = w - x0;
      MOM.sheet(ctx, x0, x1, y, C, 0, r * 2.4);
      var bx0 = w * 0.55, ax0 = x0 + r + 10, va = (bx0 - 2 * r - ax0) / T1;
      var xa, xb, u = 0, pa = 1, pb = 0;
      if (tt < T1) { xa = ax0 + va * tt; xb = bx0; }
      else if (tt < T1 + T2) {
        u = (tt - T1) / T2;                      // 0→1：力先增后减，速度从 A 转到 B
        var s = (1 - Math.cos(Math.PI * u)) / 2;
        pa = 1 - s; pb = s;
        xa = bx0 - 2 * r + 3 * s; xb = bx0 + 3 * s;
      } else { xa = bx0 - 2 * r + 3; xb = bx0 + 3 + va * (tt - T1 - T2); pa = 0; pb = 1; }
      xb = Math.min(xb, x1 - r - 4);
      MOM.stone(ctx, xa, y, r, C, 'A');
      MOM.stone(ctx, xb, y, r, C, 'B');
      if (tt >= T1 && tt < T1 + T2) {
        var L = 16 + 46 * Math.sin(Math.PI * u);
        IMP.force(ctx, xb + r * 0.2, y + r + 18, xb + r * 0.2 + L, y + r + 18, C, 'A 推 B', 'right');
        IMP.force(ctx, xa - r * 0.2, y + r + 18, xa - r * 0.2 - L, y + r + 18, C, 'B 推 A', 'left');
        GRAV.draw.text(ctx, '慢放：碰撞约 0.01 s', w / 2, y - r * 2.4 + 18, { size: 12, color: C.steel, align: 'center' });
      }
      GRAV.draw.note(ctx, '俯视图，两只一样重', w, h, C);
      if (!bars) return;
      var top = y + r * 2.4 + 40;
      CNS.bars(ctx, { x: x0 + 20, y: top, w: Math.min(360, w - 2 * x0 - 40), h: h - top - 24 }, [
        { label: 'A', v: pa, text: pa > 0.01 ? null : '0' },
        { label: 'B', v: pb },
        { label: '和', v: pa + pb, ink: true, text: '不变' }
      ], C, { max: 1.3, ref: 1, refLabel: '碰前的和', title: '动量 ' + 'p' });
    };
  }

  GRAV.act({
    id: 1,
    name: '冰壶相撞的一瞬间',
    tag: '第 1 幕 · 冰壶相撞的一瞬间',
    steps: [
      {
        title: '碰撞的一瞬间，A 推 B，B 推 A',
        beats: [
          { say: '上一节最后的问题：两只冰壶相撞的那 0.01 s 里，A 推 B，B 也推 A。' },
          { say: '这两个力有什么关系？' },
          { say: '牛顿第三定律：作用力和反作用力等大、反向，同时出现、同时消失。所以两个力的作用时间也一样长。' },
          { say: '力一样大、时间一样长、方向相反。那它们的动量变化呢？' }
        ],
        gateAt: 1,
        button: '推一推',
        play: true,
        draw: collide(false),
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '等大、反向，同时出现同时消失', correct: true, say: '对。这是一对作用力和反作用力。' },
              { html: 'A 撞 B，A 推 B 的力更大', say: '谁主动撞都一样：A 推 B 多大，B 就推 A 多大。' },
              { html: 'B 原来静止，B 不推 A', say: 'B 推了 A：A 正是被它推得停下来的。' }
            ],
            hints: ['想想牛顿第三定律。', '作用力和反作用力，大小、方向、时间各有什么关系？', '等大、反向、同时。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt < 1; });
        }
      },
      {
        title: '两只冰壶的动量变化',
        beats: [
          { say: '对 A、B 分别用动量定理。B 对 A 的力 F_BA 改变 A 的动量，A 对 B 的力 F_AB 改变 B 的动量。' },
          { say: '已知 F_AB = −F_BA，作用时间相同。Δp_A 和 Δp_B 是什么关系？' },
          { say: 'Δp_A = −Δp_B：A 少了多少，B 就多了多少。看柱子：A 降、B 升，和一直不变。' },
          { say: '推导里只用到 A、B 之间的相互作用力。如果还有别的物体施加的力呢？' }
        ],
        gateAt: 1,
        button: '有外力会怎样',
        play: true,
        tall: true,
        draw: collide(true),
        mount: function (el, api) {
          var wk = GRAV.ui.work(el), shown = 0;
          var box = document.createElement('div');
          box.className = 'q-gap';
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: 'Δ' + S('p') + '_A = Δ' + S('p') + '_B', say: '两个力方向相反，冲量也方向相反：一个增加，另一个减少。' },
              { html: 'Δ' + S('p') + '_A = −Δ' + S('p') + '_B', correct: true, say: '对。等大反向，加起来是 0。' },
              { html: '没有确定的关系', say: '有：两个冲量 F_BAΔt 和 F_ABΔt 等大反向。' }
            ],
            hints: ['两个力的冲量各是多少？', 'F_BAΔt 和 F_ABΔt，而 F_AB = −F_BA。', 'Δp_A = −Δp_B。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) {
            if (shown < 1) { wk.line(S('F') + '_BA Δ' + S('t') + ' = Δ' + S('p') + '_A'); wk.line(S('F') + '_AB Δ' + S('t') + ' = Δ' + S('p') + '_B'); shown = 1; }
            if (bt >= 2 && shown < 2) {
              wk.line('Δ' + S('p') + '_A + Δ' + S('p') + '_B = 0');
              wk.line(S('p') + '_A + ' + S('p') + '_B 不变');
              shown = 2;
            }
            box.hidden = bt !== 1;
          });
        }
      }
    ]
  });
})();
