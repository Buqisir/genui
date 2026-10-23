/* 第 1 幕 · 冰壶：先预测（锁定），再看结果，学生从结果里选出第一个猜想"速度之和不变" */
(function () {
  'use strict';

  var GUESS = ['A 停住', 'A 跟着 B 往前走', 'A 被弹回来'];

  // 冰面布局：A 从左边滑来，B 静止在中间偏右，靶心在右边
  function layout(w, h) {
    var y = h * 0.5, r = Math.max(22, Math.min(36, w * 0.05));
    var x0 = Math.max(10, w * 0.04), x1 = w - x0;
    return { y: y, r: r, x0: x0, x1: x1, bx: w * 0.55, house: w * 0.8, k: w * 0.22, sh: r * 2.6 };
  }

  // 碰前：A 滑向 B，在接触前停住（用于预测）
  function drawApproach(ctx, w, h, t, C, beat, tb) {
    var L = layout(w, h);
    MOM.sheet(ctx, L.x0, L.x1, L.y, C, L.house, L.sh);
    var start = L.x0 + L.r + 20, stop = L.bx - 2 * L.r - 18;
    var ax = Math.min(stop, start + L.k * tb);
    if (beat >= 1) ax = stop;
    MOM.stone(ctx, ax, L.y, L.r, C, 'A');
    MOM.stone(ctx, L.bx, L.y, L.r, C, 'B');
    MOM.vArrow(ctx, ax + L.r + 4, L.y + L.r + 22, 1, 50, C, '运动方向');
    GRAV.kit.label(ctx, '两只冰壶一样重，约 20 kg', L.x0 + 8, L.y + L.sh + 26, C);
    GRAV.draw.note(ctx, '俯视图', w, h, C);
  }

  // 碰撞全过程（等质量、近似弹性）：A 停住，B 带着 A 的速度滑到靶心停下。第 8 幕回到这里，也用它。
  function drawHit(ctx, w, h, t, C) {
    var L = layout(w, h);
    MOM.sheet(ctx, L.x0, L.x1, L.y, C, L.house, L.sh);
    var run = MOM.run(t, {
      xA0: L.x0 + 12, xB0: L.bx - L.r, wA: 2 * L.r, wB: 2 * L.r,
      vA: 1, vB: 0, vA2: 0, vB2: 1, k: L.k, x0: L.x0, x1: L.x1,
      after: (L.house - L.bx) / L.k   // B 停在靶心
    });
    var ax = run.xA + L.r, bx = run.xB + L.r;
    MOM.stone(ctx, ax, L.y, L.r, C, 'A');
    MOM.stone(ctx, bx, L.y, L.r, C, 'B');
    if (!run.after) MOM.vArrow(ctx, ax + L.r + 4, L.y + L.r + 22, 1, 50, C);
    else if (run.u < 1) MOM.vArrow(ctx, bx + L.r + 4, L.y + L.r + 22, 1, 50, C);   // B 停在靶心后不再画速度
    GRAV.draw.note(ctx, '俯视图', w, h, C);
  }
  MOM.curlHit = drawHit;

  // 预测：选了就锁定，不能改，也不判对错
  function mountGuess(el, api) {
    var box = document.createElement('div');
    box.className = 'opts';
    var btns = GUESS.map(function (g) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.innerHTML = '<span class="opt-html">' + g + '</span><span class="mark" aria-hidden="true"></span>';
      b.addEventListener('click', function () {
        if (GRAV.state.guess) return;
        GRAV.state.guess = g;
        lock();
        api.me('我猜「' + g + '」');
        api.say('记下了，不能再改。我们来看看实际会怎样。');
        api.open();
      });
      box.appendChild(b);
      return b;
    });
    function lock() {
      btns.forEach(function (b, i) {
        b.disabled = true;
        if (GUESS[i] === GRAV.state.guess) { b.classList.add('on'); b.querySelector('.mark').textContent = '已锁定'; }
      });
    }
    api.onBeat(function (bt) { box.hidden = bt < 1; });
    if (GRAV.state.guess) { lock(); api.open(); }
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
          { say: '两只壶一样重。撞上之后，A 会怎样？凭直觉选一个。选了就不能改，也不判对错。' }
        ],
        gateAt: 1,
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
              if (!g) return '如果你猜的是"A 停住"，那就猜对了。';
              return g === GUESS[0] ? '你猜的是「' + g + '」，猜对了。' : '你猜的是「' + g + '」，和实际不一样。没关系，这正是要弄明白的。';
            }
          },
          { say: '碰前只有 A 在动，速度记作 v；碰后 A 停住，B 的速度约是 v。下面哪个说法和这次看到的一致？' },
          { say: '这就是第一个猜想：碰撞前后，速度之和不变。它对所有碰撞都成立吗？换两辆不一样重的小车来测。' }
        ],
        gateAt: 2,
        button: '去测数据',
        play: true,
        draw: drawHit,
        mount: function (el, api) {
          var box = document.createElement('div');
          el.appendChild(box);
          GRAV.ui.choice(box, {
            options: [
              { html: '两只冰壶的速度之和不变', correct: true, say: '对。碰前 v + 0，碰后 0 + v，和没变。' },
              { html: '每只冰壶的速度都不变', say: 'A 从 v 变成了 0，B 从 0 变成了 v，每只都变了。' },
              { html: '速度之和变大了', say: '碰前 v + 0 = v，碰后 0 + v = v，一样大。' }
            ],
            hints: ['分别写出碰前、碰后两只的速度。', '碰前：A 是 v，B 是 0；碰后：A 是 0，B 约是 v。', '加起来都是 v：速度之和没变。'],
            onCorrect: function () { api.win(false); }
          }, api);
          api.onBeat(function (bt) { box.hidden = bt < 2; });
        }
      }
    ]
  });
})();
