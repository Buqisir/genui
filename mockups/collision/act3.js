/* 第 3 幕 · 弹性碰撞后怎么动：一样重的两车（交换速度）、轻的撞重的（轻的被弹回）。先锁定预测，再看第 1 节的实测，用"动量守恒、动能不变"两条检查每个选项 */
(function () {
  'use strict';
  var D = COL.D;

  // 预测：选了就锁定，不判对错；之后按选的那项给检查结果
  function guess(key, list, after) {
    return function (el, api) {
      var box = document.createElement('div');
      box.className = 'opts';
      var btns = list.map(function (g) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'opt';
        b.innerHTML = '<span class="opt-html">' + g.html + '</span><span class="mark" aria-hidden="true"></span>';
        b.addEventListener('click', function () {
          if (GRAV.state[key] != null) return;
          GRAV.state[key] = list.indexOf(g);
          lock();
          api.me('我猜「' + g.html + '」');
          api.say(after);
          api.open();
        });
        box.appendChild(b);
        return b;
      });
      function lock() {
        btns.forEach(function (b, i) {
          b.disabled = true;
          if (i === GRAV.state[key]) { b.classList.add('on'); b.querySelector('.mark').textContent = '已锁定'; }
        });
      }
      if (GRAV.state[key] != null) { lock(); api.open(); }
      el.appendChild(box);
    };
  }
  // 讲解里检查学生选的那一项
  function verdict(key, list) {
    return function () {
      var i = GRAV.state[key];
      if (i == null) return list.filter(function (g) { return g.ok; })[0].check;
      var g = list[i];
      return (g.ok ? '你猜的是「' + g.html + '」，猜对了。' : '你猜的是「' + g.html + '」。') + g.check;
    };
  }

  var EQ = [
    { html: 'A 停下，B 以 0.60 m/s 前进', ok: true, check: '检查：动量 0.12 → 0 + 0.12，动能 0.036 J → 0 + 0.036 J，两条都守住了。' },
    { html: 'A、B 各以 0.30 m/s 前进', check: '检查：动量 0.12 → 0.06 + 0.06，守住了；动能 0.036 J → 0.009 + 0.009 = 0.018 J，只剩一半。那是粘住的结果，不是弹性碰撞。' },
    { html: 'A 以 0.60 m/s 弹回，B 不动', check: '检查：动量从 +0.12 变成 −0.12，动量不守恒，不可能。' },
    { html: 'A、B 都以 0.60 m/s 前进', check: '检查：动量从 0.12 变成 0.24，翻了一倍，不可能。' }
  ];
  var LH = [
    { html: 'A 停下，B 以 0.30 m/s 前进', check: '检查：动量 0.12 → 0.4 × 0.30 = 0.12，守住了；动能 0.036 J → 0.018 J，只剩一半，不是弹性碰撞。撞人的一方停下，只在一样重时才发生。' },
    { html: 'A 减速，继续向前', check: '检查：A 还向前，B 的速度就要比 A 大；两车的动量加起来是 0.12，动能却凑不回 0.036 J。实测是 A 被弹回。' },
    { html: 'A 被弹回', ok: true, check: '检查：动量 0.120 → −0.039 + 0.158 = 0.119；动能 0.036 J → 0.004 + 0.031 = 0.035 J。两条都守住了。' },
    { html: '两车一起以 0.20 m/s 前进', check: '检查：动量 0.12 → 0.6 × 0.20 = 0.12，守住了；可两车一起走就是粘住了，动能只剩 0.012 J。' }
  ];

  GRAV.act({
    id: 3,
    name: '弹性碰撞后怎么动',
    tag: '第 3 幕 · 弹性碰撞后怎么动',
    steps: [
      {
        title: '一样重的两车，弹性碰撞',
        beats: [
          { say: '换成两辆一样重的车（各 0.2 kg），碰撞面装磁体，是弹性碰撞。A 以 0.60 m/s 撞静止的 B，碰后会怎样？选了就锁定。' },
          { say: '第 1 节的实测：A 停下，B 以 0.594 m/s 前进。' },
          { say: verdict('g5', EQ) },
          { say: '一样重的两物体发生弹性正碰：交换速度。第 1 节的冰壶就是这样。' }
        ],
        gateAt: 0,
        button: '轻的撞重的呢',
        play: true,
        playAt: 1,
        tall: true,
        draw: COL.scene(D.eq, { holdUpTo: 0, label: '一样重，碰撞面装磁体' }),
        mount: guess('g5', EQ, '记下了。看实测。')
      },
      {
        title: '轻的撞重的，弹性碰撞',
        beats: [
          { say: '再换：0.2 kg 的 A 以 0.60 m/s 撞静止的 0.4 kg 的 B，还是弹性碰撞。碰后 A 怎样？选了就锁定。' },
          { say: '第 1 节第 3 轮的实测：A 以 0.197 m/s 被弹回，B 以 0.396 m/s 前进。' },
          { say: verdict('g6', LH) },
          { say: '轻的撞静止的重的，轻的被弹回。撞人的一方停下，只是一样重时的特例。' }
        ],
        gateAt: 0,
        button: '找一个公式',
        play: true,
        playAt: 1,
        tall: true,
        draw: COL.scene(D.lh, { holdUpTo: 0, label: '轻车撞重车，碰撞面装磁体' }),
        mount: guess('g6', LH, '记下了。看实测。')
      }
    ]
  });
})();
