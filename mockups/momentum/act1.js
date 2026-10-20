/* 第 1 幕 · 冰壶：先预测，再看结果，引出"碰撞中的不变量" */
(function () {
  'use strict';

  var GUESS = ['A 停住', 'A 跟着 B 往前走', 'A 被弹回来'];

  // 冰面布局：A 从左边滑来，B 静止在中间偏右，靶心在右边
  function layout(w, h) {
    var y = h * 0.5, r = Math.max(18, Math.min(34, w * 0.04));
    var x0 = Math.max(10, w * 0.04), x1 = w - x0;
    return { y: y, r: r, x0: x0, x1: x1, bx: w * 0.55, house: w * 0.8, k: w * 0.22, sh: r * 2.6 };
  }

  // 碰前：A 以速度 1（单位 L.k 像素/秒）滑向 B，在接触前停住（用于预测）
  function drawApproach(ctx, w, h, t, C, beat, tb) {
    var L = layout(w, h);
    MOM.sheet(ctx, L.x0, L.x1, L.y, C, L.house, L.sh);
    var start = L.x0 + L.r + 20, stop = L.bx - 2 * L.r - 18;
    var ax = Math.min(stop, start + L.k * (tb % 4));
    if (beat >= 1) ax = stop;
    MOM.stone(ctx, ax, L.y, L.r, C, 'A');
    MOM.stone(ctx, L.bx, L.y, L.r, C, 'B');
    MOM.vArrow(ctx, ax + L.r + 4, L.y + L.r + 22, 1, 50, C, '运动方向');
    GRAV.kit.label(ctx, '两只冰壶一样重，约 20 kg', L.x0 + 8, L.y + L.sh + 26, C);
    GRAV.draw.note(ctx, '俯视图', w, h, C);
  }

  // 碰撞全过程（等质量、近似弹性）：A 停住，B 带着 A 的速度滑走
  function drawHit(ctx, w, h, t, C) {
    var L = layout(w, h);
    MOM.sheet(ctx, L.x0, L.x1, L.y, C, L.house, L.sh);
    var run = MOM.run(t, {
      xA0: L.x0 + 12, xB0: L.bx - L.r, wA: 2 * L.r, wB: 2 * L.r,
      vA: 1, vB: 0, vA2: 0, vB2: 1, k: L.k, x0: L.x0, x1: L.x1
    });
    var ax = run.xA + L.r, bx = run.xB + L.r;
    MOM.stone(ctx, ax, L.y, L.r, C, 'A');
    MOM.stone(ctx, bx, L.y, L.r, C, 'B');
    if (!run.after) MOM.vArrow(ctx, ax + L.r + 4, L.y + L.r + 22, 1, 50, C);
    else MOM.vArrow(ctx, bx + L.r + 4, L.y + L.r + 22, 1, 50, C);
    GRAV.draw.note(ctx, '俯视图', w, h, C);
  }

  function mountGuess(el, api) {
    var box = document.createElement('div');
    box.className = 'opts';
    GUESS.forEach(function (g) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt' + (GRAV.state.guess === g ? ' on' : '');
      b.innerHTML = '<span class="opt-html">' + g + '</span>';
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(box.children, function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        GRAV.state.guess = g;
        api.me('我猜「' + g + '」');
        api.say('记下了。我们来看看实际会怎样。');
        api.open();
      });
      box.appendChild(b);
    });
    api.onBeat(function (bt) { box.hidden = bt < 1; });
    if (GRAV.state.guess) api.open();
    el.appendChild(box);
  }

  GRAV.act({
    id: 1,
    name: '冰壶的一撞',
    tag: '第 1 幕 · 冰壶的一撞',
    steps: [
      {
        title: '冰壶 A 撞上静止的 B，会怎样？',
        beats: [
          { say: '冰壶比赛里常见这一幕：冰壶 A 正面撞上静止的冰壶 B。' },
          { say: '两只壶一样重。撞上之后，A 会怎样？先凭直觉选一个，不判对错。' }
        ],
        gateAt: 1,
        status: '',
        button: '看结果',
        draw: drawApproach,
        mount: mountGuess
      },
      {
        title: 'A 几乎停住了',
        beats: [
          { say: 'A 撞上 B 以后几乎停住，B 带着差不多 A 原来的速度滑走。' },
          {
            say: function () {
              var g = GRAV.state.guess;
              if (!g) return '如果你刚才猜的是"A 停住"，那就猜对了。';
              return g === GUESS[0] ? '你猜的是「' + g + '」，猜对了。' : '你猜的是「' + g + '」，和实际不一样。没关系，这正是要弄明白的。';
            }
          },
          { say: 'A 的运动好像整个"交"给了 B。碰撞前后，有没有什么量是不变的？这节课就来找它。' }
        ],
        button: '下一幕',
        draw: drawHit
      }
    ]
  });
})();
